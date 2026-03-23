"""
enrich_mongodb.py — Populate MongoDB song documents with KG-derived fields.

Connects to MongoDB, reads every song document, and writes back:
  - camelotCode:   Camelot wheel code (e.g. "5A", "8B") from the Key field
  - harmonicCodes: List of compatible Camelot codes for harmonic mixing
  - energyTier:    "high_energy", "mid_energy", or "low_energy"
  - setCategory:   "warm_up", "build", "peak_hour", or "cool_down"
  - similarSongIds: Top-10 most similar songs (by TransE embedding cosine sim)

Usage:
    cd knowledge-graph
    python -m scripts.enrich_mongodb            # uses DBNAME env var or "dj-list"
    DBNAME=my-db python -m scripts.enrich_mongodb
"""

import os
import re
import sys
from pathlib import Path

import numpy as np
from pymongo import MongoClient

# Make src importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from kg_builder import (
    CAMELOT_WHEEL,
    parse_key,
    camelot_compatible,
    categorize_bpm,
    assign_set_category,
)
from embeddings import SimpleTransE, build_index_maps, triples_to_indices


# ── Camelot helpers ──────────────────────────────────────────────────────────

ALL_CAMELOT_CODES = sorted(set(CAMELOT_WHEEL.values()), key=lambda c: (int(c[:-1]), c[-1]))


def get_camelot_code(key_str: str) -> str:
    """Derive the Camelot code from a raw Key string (e.g. 'AbM' → '4B')."""
    root, mode = parse_key(key_str)
    if not root:
        return ""
    return CAMELOT_WHEEL.get((root, mode), "")


def get_harmonic_codes(camelot_code: str) -> list[str]:
    """Return all Camelot codes compatible with the given code."""
    if not camelot_code:
        return []
    return [c for c in ALL_CAMELOT_CODES if camelot_compatible(camelot_code, c)]


# ── Energy tier (mirrors forward-chaining rules) ────────────────────────────

def derive_energy_tier(genre: str, bpm: int) -> str:
    """
    Assign an energy tier based on genre + BPM.

    Mirrors the 7 inference rules from rules.py:
      R1: peak-hour soul/funk (uptempo+)         → high_energy
      R2: warm-up jazz (slow)                     → low_energy
      R3: breakbeat / hip-hop (uptempo+)          → high_energy
      R4: mid-tempo any genre                     → mid_energy
      R5: soul ballads (very slow/slow)           → low_energy
      R6: electronic (uptempo+)                   → high_energy
      R7: major-key crowd-pleaser (not used here — requires mode info)
    """
    bpm_cat = categorize_bpm(bpm)
    g = (genre or "").lower()

    if bpm_cat in ("uptempo", "fast", "very_fast"):
        return "high_energy"
    if bpm_cat in ("very_slow",) and g in ("jazz", "soul"):
        return "low_energy"
    if bpm_cat == "slow":
        return "low_energy"
    if bpm_cat == "mid_tempo":
        return "mid_energy"
    return "mid_energy"


# ── KG entity ID construction (must match kg_builder._sanitize_id) ───────────

def sanitize_id(prefix: str, value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9]", "_", value.strip().lower())
    clean = re.sub(r"_+", "_", clean).strip("_")
    return f"{prefix}:{clean}" if clean else ""


# ── Embedding similarity ────────────────────────────────────────────────────

EMBEDDINGS_PATH = Path(__file__).resolve().parent.parent / "output" / "embeddings.npz"


def train_and_save_embeddings(collection_json: Path) -> tuple:
    """Build KG, train SimpleTransE, save arrays, return (model, entity2idx, idx2entity)."""
    from kg_builder import VinylKnowledgeGraph
    import random

    print("  Building knowledge graph from collection data...")
    kg = VinylKnowledgeGraph(str(collection_json))
    kg.load_data()
    kg.build_graph()

    entity2idx, relation2idx = build_index_maps(kg.triples)
    idx2entity = {v: k for k, v in entity2idx.items()}

    random.seed(42)
    all_indexed = triples_to_indices(kg.triples, entity2idx, relation2idx)
    random.shuffle(all_indexed)
    n = len(all_indexed)
    train_triples = all_indexed[: int(n * 0.8)]

    print(f"  Training SimpleTransE on {len(train_triples):,} triples (200 epochs)...")
    model = SimpleTransE(
        n_entities=len(entity2idx),
        n_relations=len(relation2idx),
        dim=100,
        lr=0.01,
    )
    model.train(train_triples, epochs=200, margin=1.0, n_neg=5)

    # Save embeddings + mappings
    entity_keys = [e for e, _ in sorted(entity2idx.items(), key=lambda x: x[1])]
    np.savez(
        EMBEDDINGS_PATH,
        ent_embeddings=model.ent_embeddings,
        rel_embeddings=model.rel_embeddings,
        entity_keys=np.array(entity_keys, dtype=object),
    )
    print(f"  Saved embeddings to {EMBEDDINGS_PATH}")
    return model, entity2idx, idx2entity


def load_embeddings() -> tuple:
    """Load saved embeddings. Returns (ent_embeddings, entity2idx, idx2entity)."""
    data = np.load(EMBEDDINGS_PATH, allow_pickle=True)
    ent_embeddings = data["ent_embeddings"]
    entity_keys = data["entity_keys"].tolist()
    entity2idx = {e: i for i, e in enumerate(entity_keys)}
    idx2entity = {i: e for i, e in enumerate(entity_keys)}
    return ent_embeddings, entity2idx, idx2entity


def compute_similar_songs(
    ent_embeddings: np.ndarray,
    entity2idx: dict,
    idx2entity: dict,
    song_entity_id: str,
    top_k: int = 10,
) -> list[str]:
    """
    Find the top-K most similar song entities by cosine similarity.

    Returns a list of KG entity IDs (e.g. 'song:james_brown_...').
    """
    if song_entity_id not in entity2idx:
        return []

    idx = entity2idx[song_entity_id]
    vec = ent_embeddings[idx]

    # Filter to only song entities
    song_indices = [i for eid, i in entity2idx.items() if eid.startswith("song:") and i != idx]
    if not song_indices:
        return []

    song_vecs = ent_embeddings[song_indices]
    # Cosine similarity
    norm_vec = vec / (np.linalg.norm(vec) + 1e-10)
    norms = np.linalg.norm(song_vecs, axis=1, keepdims=True) + 1e-10
    cos_sims = (song_vecs / norms) @ norm_vec
    top_local = np.argsort(cos_sims)[::-1][:top_k]

    return [idx2entity[song_indices[i]] for i in top_local]


# ── Main enrichment ─────────────────────────────────────────────────────────

def main():
    dbname = os.environ.get("DBNAME", "dj-list")
    mongo_url = f"mongodb://localhost/{dbname}"
    collection_json = Path(__file__).resolve().parent.parent / "data" / "collection.json"

    print(f"Connecting to MongoDB: {mongo_url}")
    client = MongoClient(mongo_url)
    db = client[dbname]
    songs_col = db["songs"]

    song_count = songs_col.count_documents({})
    print(f"Found {song_count} songs in '{dbname}.songs'")
    if song_count == 0:
        print("No songs to enrich. Exiting.")
        return

    # ── Load or train embeddings ─────────────────────────────────────────
    ent_embeddings = None
    entity2idx = {}
    idx2entity = {}

    if collection_json.exists():
        if EMBEDDINGS_PATH.exists():
            print("Loading saved embeddings...")
            ent_embeddings, entity2idx, idx2entity = load_embeddings()
            print(f"  Loaded {len(entity2idx):,} entity embeddings")
        else:
            print("No saved embeddings found — training from scratch...")
            _, entity2idx_full, idx2entity_full = train_and_save_embeddings(collection_json)
            ent_embeddings, entity2idx, idx2entity = load_embeddings()
    else:
        print(f"  collection.json not found at {collection_json}")
        print("  Skipping embedding similarity (Camelot/energy/set will still be computed)")

    # ── Build reverse lookup: KG song entity → MongoDB ObjectId ──────────
    kg_id_to_mongo_id: dict[str, str] = {}
    mongo_songs = list(songs_col.find({}))

    for doc in mongo_songs:
        artist = (doc.get("Artist") or "").strip()
        song_name = (doc.get("Song") or "").strip()
        kg_entity = sanitize_id("song", f"{artist}_{song_name}")
        if kg_entity:
            kg_id_to_mongo_id[kg_entity] = doc["_id"]

    # ── Enrich each song ─────────────────────────────────────────────────
    print(f"\nEnriching {len(mongo_songs)} songs...")
    updated = 0
    with_embeddings = 0

    for doc in mongo_songs:
        key_str = doc.get("Key", "")
        bpm = doc.get("BPM", 0) or 0
        genre = doc.get("genre", "")

        # Camelot code + harmonic codes
        camelot = get_camelot_code(key_str)
        harmonic = get_harmonic_codes(camelot)

        # Energy tier + set category
        energy = derive_energy_tier(genre, bpm)
        set_cat = assign_set_category(genre, bpm)

        update_fields = {
            "camelotCode": camelot,
            "harmonicCodes": harmonic,
            "energyTier": energy,
            "setCategory": set_cat,
        }

        # Embedding similarity
        if ent_embeddings is not None:
            artist = (doc.get("Artist") or "").strip()
            song_name = (doc.get("Song") or "").strip()
            kg_entity = sanitize_id("song", f"{artist}_{song_name}")
            similar_kg_ids = compute_similar_songs(
                ent_embeddings, entity2idx, idx2entity, kg_entity, top_k=10
            )
            # Map KG entity IDs → MongoDB ObjectIds
            similar_mongo_ids = [
                kg_id_to_mongo_id[sid] for sid in similar_kg_ids if sid in kg_id_to_mongo_id
            ]
            update_fields["similarSongIds"] = similar_mongo_ids
            if similar_mongo_ids:
                with_embeddings += 1

        songs_col.update_one({"_id": doc["_id"]}, {"$set": update_fields})
        updated += 1

    print(f"\nDone! Updated {updated} songs.")
    if ent_embeddings is not None:
        print(f"  {with_embeddings} songs matched to KG embeddings for similarity.")
    else:
        print("  (Embedding similarity skipped — no collection.json available)")

    # Verify
    sample = songs_col.find_one({"camelotCode": {"$exists": True, "$ne": ""}})
    if sample:
        print(f"\nSample enriched song:")
        for k in ("Artist", "Song", "Key", "camelotCode", "harmonicCodes", "energyTier", "setCategory"):
            print(f"  {k}: {sample.get(k)}")
        if "similarSongIds" in sample:
            print(f"  similarSongIds: {len(sample['similarSongIds'])} entries")

    client.close()


if __name__ == "__main__":
    main()
