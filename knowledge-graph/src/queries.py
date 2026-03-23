"""
queries.py — Competency Questions for the Vinyl Knowledge Graph

Defines and answers eight domain-specific queries that demonstrate
the knowledge representation system's inference capabilities.

Each query exercises a different aspect of the ontology:
    CQ1: Classification — What set segment is a given track suited for?
    CQ2: Aggregation — Which artists have the most tracks in the collection?
    CQ3: Inference — What are the peak-hour soul tracks?
    CQ4: Relationship — Which albums contain tracks in multiple genres?
    CQ5: Prediction — What genre would a new unclassified track likely be?
    CQ6: Discovery — Which keys are underrepresented in the collection?
    CQ7: Harmonic — What tracks are harmonically compatible with a given track?
    CQ8: Pattern — What is the genre distribution across tempo categories?
"""

from collections import Counter, defaultdict
from typing import Any

from rules import Fact, KnowledgeBase


def cq1_set_segment(kb: KnowledgeBase, song_id: str) -> dict[str, Any]:
    """
    CQ1: What DJ set segment is this track suited for?

    Uses the inferred 'suitable_for' and 'energy_tier' predicates
    to classify a track into warm-up, build, peak-hour, or cool-down.
    """
    set_cats = kb.objects_of(song_id, "suitable_for")
    energy = kb.objects_of(song_id, "energy_tier")
    mood = kb.objects_of(song_id, "mood")
    genre = kb.objects_of(song_id, "has_genre")
    tempo = kb.objects_of(song_id, "has_tempo")

    return {
        "query": f"What set segment is {song_id} suited for?",
        "song": song_id,
        "set_category": set_cats,
        "energy_tier": energy,
        "mood": mood,
        "genre": genre,
        "tempo": tempo,
        "reasoning": (
            f"Track has genre(s) {genre} at tempo {tempo}. "
            f"Rules infer energy tier {energy}, so it is suited for {set_cats}."
        ),
    }


def cq2_top_artists(kb: KnowledgeBase, top_n: int = 15) -> dict[str, Any]:
    """
    CQ2: Which artists have the most tracks in the collection?

    Aggregates the 'performed_by' relation to find prolific artists.
    """
    artist_counts = Counter()
    for fact in kb.query(predicate="performed_by"):
        artist_counts[fact.obj] += 1

    top = artist_counts.most_common(top_n)
    return {
        "query": f"Top {top_n} artists by track count",
        "results": [{"artist": a, "tracks": c} for a, c in top],
        "total_artists": len(artist_counts),
    }


def cq3_peak_hour_soul(kb: KnowledgeBase) -> dict[str, Any]:
    """
    CQ3: What are the peak-hour soul tracks?

    Finds tracks that are classified as Soul AND have been inferred
    (via rules) to be high-energy or suitable for peak-hour sets.
    """
    # Songs with genre:soul
    soul_songs = kb.subjects_with("has_genre", "genre:soul")
    # Among those, which are peak-hour?
    peak_songs = kb.subjects_with("suitable_for", "set:peak_hour")
    high_energy = kb.subjects_with("energy_tier", "high_energy")

    peak_soul = soul_songs & (peak_songs | high_energy)

    # Get details for a sample
    sample = sorted(peak_soul)[:20]
    details = []
    for s in sample:
        tempo = kb.objects_of(s, "has_tempo")
        key = kb.objects_of(s, "in_key_root")
        details.append({"song": s, "tempo": tempo, "key": key})

    return {
        "query": "What are the peak-hour soul tracks?",
        "count": len(peak_soul),
        "total_soul": len(soul_songs),
        "sample": details,
        "reasoning": (
            f"Of {len(soul_songs)} soul tracks, {len(peak_soul)} are classified "
            f"as peak-hour based on tempo (uptempo/fast) and energy rules."
        ),
    }


def cq4_multi_genre_albums(kb: KnowledgeBase) -> dict[str, Any]:
    """
    CQ4: Which albums contain tracks in multiple genres?

    Joins 'appears_on' and 'has_genre' to find genre-diverse albums.
    """
    album_genres: dict[str, set[str]] = defaultdict(set)
    album_songs: dict[str, set[str]] = defaultdict(set)

    for fact in kb.query(predicate="appears_on"):
        song, album = fact.subject, fact.obj
        album_songs[album].add(song)
        genres = kb.objects_of(song, "has_genre")
        album_genres[album].update(genres)

    multi = {
        alb: genres
        for alb, genres in album_genres.items()
        if len(genres) > 1
    }

    return {
        "query": "Which albums contain tracks in multiple genres?",
        "count": len(multi),
        "results": [
            {"album": a, "genres": sorted(g), "track_count": len(album_songs[a])}
            for a, g in sorted(multi.items(), key=lambda x: -len(x[1]))[:15]
        ],
    }


def cq5_genre_prediction(
    kb: KnowledgeBase,
    entity2idx: dict | None = None,
    idx2entity: dict | None = None,
    model: Any = None,
    relation2idx: dict | None = None,
) -> dict[str, Any]:
    """
    CQ5: What genre would a new unclassified track likely be?

    If a trained embedding model is available, uses link prediction.
    Otherwise falls back to KB-based heuristic (artist's primary genre).
    """
    # Find songs without genre (there shouldn't be many in this data)
    all_songs = {f.subject for f in kb.query(predicate="performed_by")}
    songs_with_genre = {f.subject for f in kb.query(predicate="has_genre")}
    songs_without_genre = all_songs - songs_with_genre

    predictions = []

    if model and entity2idx and idx2entity and relation2idx:
        # Use embedding model for link prediction
        r_idx = relation2idx.get("has_genre")
        if r_idx is not None:
            for song in sorted(songs_without_genre)[:10]:
                if song in entity2idx:
                    preds = model.predict_tail(entity2idx[song], r_idx, top_k=3)
                    pred_labels = [
                        (idx2entity[i], s) for i, s in preds
                        if idx2entity[i].startswith("genre:")
                    ]
                    predictions.append({"song": song, "predicted_genres": pred_labels})
    else:
        # Fallback: use artist's primary genre
        for song in sorted(songs_without_genre)[:10]:
            artists = kb.objects_of(song, "performed_by")
            for artist in artists:
                artist_genres = kb.objects_of(artist, "artist_genre")
                if artist_genres:
                    predictions.append({
                        "song": song,
                        "predicted_genres": list(artist_genres),
                        "method": "artist_primary_genre",
                    })

    return {
        "query": "Predict genre for unclassified tracks",
        "unclassified_count": len(songs_without_genre),
        "predictions": predictions,
    }


def cq6_key_distribution(kb: KnowledgeBase) -> dict[str, Any]:
    """
    CQ6: Which musical keys are underrepresented in the collection?

    Identifies gaps in harmonic coverage that could limit mixing options.
    """
    key_counts = Counter()
    for fact in kb.query(predicate="in_key_root"):
        key_counts[fact.obj] += 1

    # All possible keys
    all_keys = {
        f"key:{k}" for k in [
            "C", "C#", "Db", "D", "Eb", "E", "F",
            "F#", "Gb", "G", "Ab", "A", "Bb", "B"
        ]
    }
    present_keys = set(key_counts.keys())
    missing_keys = all_keys - present_keys

    sorted_counts = key_counts.most_common()
    median_count = sorted_counts[len(sorted_counts) // 2][1] if sorted_counts else 0
    underrepresented = [
        (k, c) for k, c in sorted_counts
        if c < median_count * 0.5
    ]

    return {
        "query": "Which keys are underrepresented?",
        "missing_keys": sorted(missing_keys),
        "underrepresented": underrepresented,
        "distribution": dict(sorted_counts),
        "reasoning": (
            f"Keys completely absent: {sorted(missing_keys)}. "
            f"Keys with fewer than half the median ({median_count // 2}): "
            f"{[k for k, c in underrepresented]}"
        ),
    }


def cq7_harmonic_compatible(
    kb: KnowledgeBase, song_id: str, bpm_tolerance: int = 5
) -> dict[str, Any]:
    """
    CQ7: What tracks are harmonically compatible with a given track?

    Uses key root and mode to find Camelot-wheel compatible tracks,
    optionally filtered by similar BPM for practical mixing.
    """
    from kg_builder import CAMELOT_WHEEL, camelot_compatible

    # Get the source track's key and mode
    roots = kb.objects_of(song_id, "in_key_root")
    modes = kb.objects_of(song_id, "has_mode")
    tempos = kb.objects_of(song_id, "has_tempo")

    if not roots or not modes:
        return {"query": f"Harmonic matches for {song_id}", "error": "No key data"}

    root = list(roots)[0].replace("key:", "")
    mode = list(modes)[0].replace("mode:", "")
    source_camelot = CAMELOT_WHEEL.get((root, mode), "")

    if not source_camelot:
        return {"query": f"Harmonic matches for {song_id}", "error": "Key not in Camelot wheel"}

    # Find all songs with compatible keys
    compatible = []
    for fact in kb.query(predicate="in_key_root"):
        other_song = fact.subject
        if other_song == song_id:
            continue
        other_roots = kb.objects_of(other_song, "in_key_root")
        other_modes = kb.objects_of(other_song, "has_mode")
        if not other_roots or not other_modes:
            continue
        other_root = list(other_roots)[0].replace("key:", "")
        other_mode = list(other_modes)[0].replace("mode:", "")
        other_camelot = CAMELOT_WHEEL.get((other_root, other_mode), "")

        if other_camelot and camelot_compatible(source_camelot, other_camelot):
            # Check tempo compatibility
            other_tempos = kb.objects_of(other_song, "has_tempo")
            same_tempo = bool(tempos & other_tempos)
            compatible.append({
                "song": other_song,
                "key": f"{other_root} {other_mode}",
                "camelot": other_camelot,
                "same_tempo_range": same_tempo,
            })

    # Prioritise same-tempo matches
    compatible.sort(key=lambda x: (not x["same_tempo_range"], x["song"]))

    return {
        "query": f"Harmonic matches for {song_id}",
        "source_key": f"{root} {mode}",
        "source_camelot": source_camelot,
        "compatible_count": len(compatible),
        "sample": compatible[:20],
    }


def cq8_genre_tempo_matrix(kb: KnowledgeBase) -> dict[str, Any]:
    """
    CQ8: What is the genre distribution across tempo categories?

    Builds a cross-tabulation of genre × tempo, revealing collection
    strengths and gaps useful for DJ set planning.
    """
    matrix: dict[str, Counter] = defaultdict(Counter)

    # Get all songs with both genre and tempo
    genre_facts = {f.subject: f.obj for f in kb.query(predicate="has_genre")}
    tempo_facts = {f.subject: f.obj for f in kb.query(predicate="has_tempo")}

    for song in genre_facts:
        if song in tempo_facts:
            genre = genre_facts[song]
            tempo = tempo_facts[song]
            matrix[genre][tempo] += 1

    # Convert to serializable format
    all_tempos = sorted({t for counts in matrix.values() for t in counts})
    table = []
    for genre in sorted(matrix.keys()):
        row = {"genre": genre}
        for tempo in all_tempos:
            row[tempo] = matrix[genre].get(tempo, 0)
        row["total"] = sum(matrix[genre].values())
        table.append(row)

    return {
        "query": "Genre × Tempo cross-tabulation",
        "tempo_columns": all_tempos,
        "table": table,
        "reasoning": (
            "This matrix reveals which genre-tempo combinations are well "
            "covered (deep crates) vs. sparse (potential gaps to fill)."
        ),
    }


# ---------------------------------------------------------------------------
# Run all queries
# ---------------------------------------------------------------------------
def run_all_queries(kb: KnowledgeBase, **kwargs) -> list[dict[str, Any]]:
    """Execute all eight competency questions and return results."""
    results = []

    # CQ1: pick a sample track
    sample_songs = sorted(kb.subjects_with("has_genre", "genre:soul"))
    sample_song = sample_songs[len(sample_songs) // 2] if sample_songs else ""

    print("Running CQ1: Set segment classification...")
    results.append(cq1_set_segment(kb, sample_song))

    print("Running CQ2: Top artists...")
    results.append(cq2_top_artists(kb))

    print("Running CQ3: Peak-hour soul tracks...")
    results.append(cq3_peak_hour_soul(kb))

    print("Running CQ4: Multi-genre albums...")
    results.append(cq4_multi_genre_albums(kb))

    print("Running CQ5: Genre prediction...")
    results.append(cq5_genre_prediction(kb, **kwargs))

    print("Running CQ6: Key distribution...")
    results.append(cq6_key_distribution(kb))

    print("Running CQ7: Harmonic compatibility...")
    results.append(cq7_harmonic_compatible(kb, sample_song))

    print("Running CQ8: Genre × Tempo matrix...")
    results.append(cq8_genre_tempo_matrix(kb))

    return results


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import json
    from kg_builder import VinylKnowledgeGraph
    from rules import ForwardChainer, get_domain_rules

    kg = VinylKnowledgeGraph("data/collection.json")
    kg.load_data()
    kg.build_graph()

    kb = KnowledgeBase()
    kb.load_from_triples(kg.triples)

    # Run forward chaining first to populate inferred facts
    rules = get_domain_rules()
    fc = ForwardChainer(kb, rules)
    fc.run()

    results = run_all_queries(kb)

    # Pretty print
    for r in results:
        print(f"\n{'='*60}")
        print(f"QUERY: {r.get('query', 'N/A')}")
        print(f"{'='*60}")
        # Print selected fields
        for k, v in r.items():
            if k in ("query",):
                continue
            if isinstance(v, list) and len(v) > 5:
                print(f"  {k}: [{len(v)} items, showing first 5]")
                for item in v[:5]:
                    print(f"    {item}")
            else:
                print(f"  {k}: {v}")
