# Vinyl Collection Knowledge Representation System

A knowledge representation and reasoning system built over a 6,900+ track DJ vinyl collection. Uses knowledge graph embeddings (TransE) for link prediction and a rule-based inference engine for DJ-domain reasoning — classifying tracks into set segments, detecting harmonic mixing compatibility, and identifying collection gaps.

**Course:** AAI 5015 — Mathematical Concepts for Applied AI  
**Assignment:** 4.6 — Knowledge Representation System  
**Implementation:** Option B (pykg2vec / knowledge graph embeddings)

## Domain

The system models a working DJ's vinyl record collection with entities for tracks, artists, albums, genres, musical keys, tempo categories, and DJ set segments. The knowledge graph captures relationships between these entities, and a rule-based reasoning layer encodes domain expertise about how a DJ selects and sequences tracks for live sets.

## Architecture

```
collection.json  →  kg_builder.py  →  Knowledge Graph (triples)
                                          │
                    ┌─────────────────────┼───────────────────────┐
                    ▼                     ▼                       ▼
             embeddings.py          rules.py               queries.py
             (TransE model)    (Forward/Backward        (8 Competency
              Link prediction    Chaining)                Questions)
                    │                     │                       │
                    └─────────────────────┼───────────────────────┘
                                          ▼
                                    visualize.py
                                  (Report figures)
```

## Setup

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
cd knowledge-graph
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
```

### Optional: pykg2vec

For the full pykg2vec implementation (requires PyTorch):

```bash
pip install torch pykg2vec
```

## Running

### Default (SimpleTransE — no PyTorch required)

```bash
cd knowledge-graph
python -m src.main
```

### With pykg2vec

```bash
python -m src.main --use-pykg2vec
```

### Individual modules

```bash
# Build knowledge graph only
python -m src.kg_builder

# Train embeddings only
python -m src.embeddings

# Run rule engine only
python -m src.rules

# Run competency questions only
python -m src.queries
```

## Output

All outputs are written to `output/`:

| File | Description |
|------|-------------|
| `results.json` | Full pipeline results (metrics, queries, inferences) |
| `genre_distribution.png` | Bar chart of genre counts |
| `genre_tempo_heatmap.png` | Genre × tempo cross-tabulation |
| `key_distribution.png` | Musical key distribution (circle of fifths) |
| `set_categories.png` | DJ set segment classification distribution |
| `training_loss.png` | TransE training loss curve |
| `eval_metrics.png` | Embedding evaluation metrics |

## Knowledge Graph Schema

### Entity Types
- **Song** (6,926) — Individual tracks: `song:artist_name_song_title`
- **Artist** (962) — Performers: `artist:name`
- **Album** (729) — Releases: `album:artist_album`
- **Genre** (11) — Musical genres: `genre:soul`, `genre:jazz`, etc.
- **Tempo** (6) — BPM categories: `tempo:very_slow` through `tempo:very_fast`
- **Key** (12) — Musical key roots: `key:C`, `key:Ab`, etc.
- **Mode** (2) — Tonality: `mode:major`, `mode:minor`
- **Set Category** (4) — DJ set segments: `set:warm_up`, `set:build`, `set:peak_hour`, `set:cool_down`

### Relations
| Relation | Domain → Range | Description |
|----------|---------------|-------------|
| `performed_by` | Song → Artist | Track authorship |
| `appears_on` | Song → Album | Album membership |
| `has_genre` | Song → Genre | Genre classification |
| `has_tempo` | Song → Tempo | Tempo category |
| `in_key_root` | Song → Key | Musical key root |
| `has_mode` | Song → Mode | Major/minor tonality |
| `suitable_for` | Song → SetCategory | DJ set placement |
| `artist_genre` | Artist → Genre | Primary genre (derived) |
| `album_artist` | Album → Artist | Album authorship |
| `subgenre_of` | Genre → Genre | Genre hierarchy |
| `related_genre` | Genre → Genre | Genre affinity |

### Production Rules (7)
1. **R1** Peak-hour soul: Soul + uptempo/fast → high energy
2. **R2** Warm-up jazz: Jazz + slow → low energy
3. **R3** Breakbeat peak: Hip-hop/battle + uptempo → high energy
4. **R4** Mid-tempo builder: Soul + mid-tempo → mid energy
5. **R5** Soul ballad cool-down: Soul + very slow → cool-down
6. **R6** Electronic energy: Electronic + uptempo → high energy
7. **R7** Major key crowd-pleaser: Major key + uptempo → crowd pleaser mood

### Competency Questions
1. What set segment is a given track suited for?
2. Which artists have the most tracks in the collection?
3. What are the peak-hour soul tracks?
4. Which albums contain tracks in multiple genres?
5. What genre would a new unclassified track likely be? (link prediction)
6. Which musical keys are underrepresented?
7. What tracks are harmonically compatible with a given track?
8. What is the genre distribution across tempo categories?

## Data

Source: Personal vinyl collection database exported from [dj-list](https://github.com/willdaly/dj-list) — a web application for cataloging records with DJ-focused metadata (BPM, key, genre).

## References

See the accompanying report (PDF) for full citations.
