"""
kg_builder.py — Knowledge Graph Construction for Vinyl Collection

Transforms raw DJ collection data (JSON) into a knowledge graph represented
as (head, relation, tail) triples suitable for embedding with pykg2vec.

Entity types:
    - Song: Individual tracks (primary entity)
    - Artist: Performers/bands
    - Album: Releases containing tracks
    - Genre: Musical genre classification
    - BPMCategory: Tempo range buckets for DJ use
    - KeyRoot: Musical key root note (C, D, E, …)
    - KeyMode: Major or Minor tonality
    - SetCategory: DJ set segment suitability (warm-up, build, peak, cool-down)

Relations:
    - performed_by: Song → Artist
    - appears_on: Song → Album
    - has_genre: Song → Genre
    - has_tempo: Song → BPMCategory
    - in_key_root: Song → KeyRoot
    - has_mode: Song → KeyMode
    - suitable_for: Song → SetCategory
    - artist_genre: Artist → Genre (derived from track majority)
    - album_artist: Album → Artist (derived)
    - harmonic_mix: Song → Song (Camelot wheel compatibility)
"""

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# BPM categorisation for DJ context
# ---------------------------------------------------------------------------
BPM_CATEGORIES = {
    "very_slow":  (0, 70),
    "slow":       (70, 90),
    "mid_tempo":  (90, 110),
    "uptempo":    (110, 130),
    "fast":       (130, 160),
    "very_fast":  (160, 300),
}


def categorize_bpm(bpm: int) -> str:
    """Map a numeric BPM value to a named tempo category."""
    for name, (lo, hi) in BPM_CATEGORIES.items():
        if lo <= bpm < hi:
            return name
    return "unknown"


# ---------------------------------------------------------------------------
# Musical key parsing
# ---------------------------------------------------------------------------
# Keys in the data look like 'CM', 'am', 'BbM', 'ebm', 'F#m', etc.
KEY_PATTERN = re.compile(
    r"^([A-Ga-g][b#]?)"   # root note (possibly with sharp/flat)
    r"([Mm]?)$"            # mode indicator: M=major, m=minor, or absent
)


def parse_key(raw_key: str) -> tuple[str, str]:
    """
    Parse a musical key string into (root, mode).

    Returns ('', '') if the key cannot be parsed.
    """
    if not raw_key or not raw_key.strip():
        return ("", "")
    match = KEY_PATTERN.match(raw_key.strip())
    if not match:
        return ("", "")
    root = match.group(1)
    mode_char = match.group(2)
    # Normalise root to title case: 'bb' → 'Bb', 'c#' → 'C#'
    root = root[0].upper() + root[1:] if len(root) > 1 else root.upper()
    # Determine mode
    if mode_char == "M" or (mode_char == "" and root[0].isupper()):
        mode = "major"
    elif mode_char == "m":
        mode = "minor"
    else:
        mode = "major"  # default
    return (root, mode)


# ---------------------------------------------------------------------------
# Camelot wheel for harmonic mixing
# ---------------------------------------------------------------------------
# Maps (root, mode) → Camelot code.  Compatible mixes: same code,
# +/-1 on the number wheel, or same number across mode (inner/outer).
CAMELOT_WHEEL = {
    ("Ab", "minor"): "1A",  ("B",  "major"): "1B",
    ("Eb", "minor"): "2A",  ("F#", "major"): "2B",
    ("Bb", "minor"): "3A",  ("Db", "major"): "3B",
    ("F",  "minor"): "4A",  ("Ab", "major"): "4B",
    ("C",  "minor"): "5A",  ("Eb", "major"): "5B",
    ("G",  "minor"): "6A",  ("Bb", "major"): "6B",
    ("D",  "minor"): "7A",  ("F",  "major"): "7B",
    ("A",  "minor"): "8A",  ("C",  "major"): "8B",
    ("E",  "minor"): "9A",  ("G",  "major"): "9B",
    ("B",  "minor"): "10A", ("D",  "major"): "10B",
    ("F#", "minor"): "11A", ("A",  "major"): "11B",
    ("C#", "minor"): "12A", ("E",  "major"): "12B",
    # Enharmonic equivalents
    ("Db", "minor"): "12A", ("Fb", "major"): "12B",
    ("G#", "minor"): "1A",  ("Cb", "major"): "1B",
}


def camelot_compatible(code_a: str, code_b: str) -> bool:
    """Check whether two Camelot codes are harmonically compatible."""
    if not code_a or not code_b:
        return False
    if code_a == code_b:
        return True
    num_a, letter_a = int(code_a[:-1]), code_a[-1]
    num_b, letter_b = int(code_b[:-1]), code_b[-1]
    # Same number, different letter (inner/outer wheel swap)
    if num_a == num_b:
        return True
    # Adjacent numbers, same letter
    if letter_a == letter_b and abs(num_a - num_b) in (1, 11):
        return True
    return False


# ---------------------------------------------------------------------------
# DJ set category assignment (rule-based, used later in rules.py too)
# ---------------------------------------------------------------------------
def assign_set_category(genre: str, bpm: int) -> str:
    """
    Heuristic assignment of a track to a DJ-set segment.

    Rules:
        - Very slow / slow ballads → warm_up
        - Mid-tempo soul/jazz → build
        - Uptempo funk/soul → peak_hour
        - Fast tempo OR battle/hip-hop uptempo → peak_hour
        - Very slow jazz → cool_down
    """
    bpm_cat = categorize_bpm(bpm)
    genre_lower = genre.lower() if genre else ""

    if bpm_cat in ("very_slow",) and genre_lower in ("jazz", "soul"):
        return "cool_down"
    if bpm_cat in ("very_slow", "slow"):
        return "warm_up"
    if bpm_cat == "mid_tempo":
        return "build"
    if bpm_cat in ("uptempo", "fast", "very_fast"):
        return "peak_hour"
    return "warm_up"


# ---------------------------------------------------------------------------
# Main graph construction
# ---------------------------------------------------------------------------
class VinylKnowledgeGraph:
    """
    Builds a knowledge graph from the raw JSON vinyl collection.

    Attributes:
        triples: list of (head, relation, tail) string tuples
        entities: dict mapping entity type → set of entity IDs
        relations: set of relation names
    """

    def __init__(self, json_path: str | Path):
        self.json_path = Path(json_path)
        self.raw_data: list[dict[str, Any]] = []
        self.triples: list[tuple[str, str, str]] = []
        self.entities: dict[str, set[str]] = defaultdict(set)
        self.relations: set[str] = set()
        self._artist_genres: dict[str, Counter] = defaultdict(Counter)

    # ------------------------------------------------------------------
    def _sanitize_id(self, prefix: str, value: str) -> str:
        """Create a clean entity ID from a prefix and value."""
        clean = re.sub(r"[^a-zA-Z0-9]", "_", value.strip().lower())
        clean = re.sub(r"_+", "_", clean).strip("_")
        return f"{prefix}:{clean}" if clean else ""

    # ------------------------------------------------------------------
    def load_data(self) -> None:
        """Load raw JSON collection data."""
        with open(self.json_path, "r", encoding="utf-8") as f:
            self.raw_data = json.load(f)
        print(f"Loaded {len(self.raw_data)} tracks from {self.json_path.name}")

    # ------------------------------------------------------------------
    def build_graph(self) -> None:
        """
        Construct all triples from the raw data.

        This is the core method — it iterates every track and emits
        triples for each relation type, plus derived relations.
        """
        for idx, track in enumerate(self.raw_data):
            artist_name = track.get("Artist", "").strip()
            album_name = track.get("Album", "").strip()
            song_name = track.get("Song", "").strip()
            genre = track.get("genre", "").strip()
            bpm = track.get("BPM", 0)
            key_raw = track.get("Key", "").strip()

            # Create entity IDs
            song_id = self._sanitize_id("song", f"{artist_name}_{song_name}")
            artist_id = self._sanitize_id("artist", artist_name)
            album_id = self._sanitize_id("album", f"{artist_name}_{album_name}") if album_name else ""
            genre_id = self._sanitize_id("genre", genre) if genre else ""

            if not song_id or not artist_id:
                continue

            # Register entities
            self.entities["song"].add(song_id)
            self.entities["artist"].add(artist_id)

            # --- Core triples ---
            self._add_triple(song_id, "performed_by", artist_id)

            if album_id:
                self.entities["album"].add(album_id)
                self._add_triple(song_id, "appears_on", album_id)
                self._add_triple(album_id, "album_artist", artist_id)

            if genre_id:
                self.entities["genre"].add(genre_id)
                self._add_triple(song_id, "has_genre", genre_id)
                self._artist_genres[artist_id][genre_id] += 1

            # --- BPM category ---
            if bpm and bpm > 0:
                bpm_cat = categorize_bpm(bpm)
                bpm_cat_id = f"tempo:{bpm_cat}"
                self.entities["tempo"].add(bpm_cat_id)
                self._add_triple(song_id, "has_tempo", bpm_cat_id)

                # --- Set category ---
                set_cat = assign_set_category(genre, bpm)
                set_cat_id = f"set:{set_cat}"
                self.entities["set_category"].add(set_cat_id)
                self._add_triple(song_id, "suitable_for", set_cat_id)

            # --- Musical key ---
            root, mode = parse_key(key_raw)
            if root:
                root_id = f"key:{root}"
                mode_id = f"mode:{mode}"
                self.entities["key"].add(root_id)
                self.entities["mode"].add(mode_id)
                self._add_triple(song_id, "in_key_root", root_id)
                self._add_triple(song_id, "has_mode", mode_id)

        # --- Derived: artist primary genre ---
        for artist_id, genre_counts in self._artist_genres.items():
            primary_genre = genre_counts.most_common(1)[0][0]
            self._add_triple(artist_id, "artist_genre", primary_genre)

        # --- Derived: genre hierarchy (domain knowledge) ---
        genre_hierarchy = {
            "genre:hip_hop_instrumental": "genre:hip_hop",
            "genre:soul": "genre:soul",         # top-level
            "genre:jazz": "genre:jazz",          # top-level
            "genre:hip_hop": "genre:hip_hop",    # top-level
            "genre:electronic": "genre:electronic",
        }
        # Sub-genre relationships
        self._add_triple("genre:hip_hop_instrumental", "subgenre_of", "genre:hip_hop")
        self._add_triple("genre:battle", "subgenre_of", "genre:hip_hop")
        self._add_triple("genre:45_king", "subgenre_of", "genre:hip_hop")
        self._add_triple("genre:ost", "related_genre", "genre:soul")
        self._add_triple("genre:ost", "related_genre", "genre:jazz")
        self._add_triple("genre:melodiya", "related_genre", "genre:jazz")

        self._print_stats()

    # ------------------------------------------------------------------
    def _add_triple(self, head: str, relation: str, tail: str) -> None:
        """Add a triple and register the relation."""
        self.triples.append((head, relation, tail))
        self.relations.add(relation)

    # ------------------------------------------------------------------
    def _print_stats(self) -> None:
        """Print summary statistics for the constructed graph."""
        print(f"\n{'='*55}")
        print("Knowledge Graph Statistics")
        print(f"{'='*55}")
        print(f"  Total triples:    {len(self.triples):,}")
        print(f"  Unique entities:  {sum(len(v) for v in self.entities.values()):,}")
        for etype, eset in sorted(self.entities.items()):
            print(f"    {etype:15s}: {len(eset):,}")
        print(f"  Relation types:   {len(self.relations)}")
        for r in sorted(self.relations):
            count = sum(1 for t in self.triples if t[1] == r)
            print(f"    {r:20s}: {count:,}")
        print(f"{'='*55}\n")

    # ------------------------------------------------------------------
    def export_triples(self, output_dir: str | Path) -> dict[str, Path]:
        """
        Export triples in TSV format for pykg2vec.

        Splits data into train/valid/test (80/10/10) and also writes
        entity and relation ID mappings.

        Returns dict of file paths created.
        """
        import random
        random.seed(42)

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        # Shuffle and split
        shuffled = list(self.triples)
        random.shuffle(shuffled)
        n = len(shuffled)
        train_end = int(n * 0.8)
        valid_end = int(n * 0.9)

        splits = {
            "train": shuffled[:train_end],
            "valid": shuffled[train_end:valid_end],
            "test":  shuffled[valid_end:],
        }

        paths = {}
        for split_name, split_triples in splits.items():
            fpath = output_dir / f"{split_name}.tsv"
            with open(fpath, "w") as f:
                for h, r, t in split_triples:
                    f.write(f"{h}\t{r}\t{t}\n")
            paths[split_name] = fpath
            print(f"  Wrote {len(split_triples):,} triples → {fpath}")

        # Entity mapping
        all_entities = set()
        for h, r, t in self.triples:
            all_entities.add(h)
            all_entities.add(t)
        ent_path = output_dir / "entities.tsv"
        with open(ent_path, "w") as f:
            for i, ent in enumerate(sorted(all_entities)):
                f.write(f"{ent}\t{i}\n")
        paths["entities"] = ent_path

        # Relation mapping
        rel_path = output_dir / "relations.tsv"
        with open(rel_path, "w") as f:
            for i, rel in enumerate(sorted(self.relations)):
                f.write(f"{rel}\t{i}\n")
        paths["relations"] = rel_path

        print(f"  Entities: {len(all_entities):,}  Relations: {len(self.relations)}")
        return paths

    # ------------------------------------------------------------------
    def get_triples_for_entity(self, entity_id: str) -> list[tuple[str, str, str]]:
        """Return all triples involving a given entity (head or tail)."""
        return [t for t in self.triples if t[0] == entity_id or t[2] == entity_id]

    def get_entity_types(self) -> dict[str, str]:
        """Return a mapping of entity_id → entity_type."""
        mapping = {}
        for etype, entities in self.entities.items():
            for eid in entities:
                mapping[eid] = etype
        return mapping


# ---------------------------------------------------------------------------
# Standalone execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    kg = VinylKnowledgeGraph("data/collection.json")
    kg.load_data()
    kg.build_graph()
    kg.export_triples("data/kg_splits")
