"""
main.py — Vinyl Collection Knowledge Representation System

Main entry point that orchestrates the full pipeline:
    1. Load raw JSON data and build the knowledge graph
    2. Export triples for pykg2vec training
    3. Train knowledge graph embeddings (TransE)
    4. Run forward chaining to infer new facts
    5. Run backward chaining demonstrations
    6. Execute competency questions
    7. Check consistency
    8. Generate visualizations
    9. Output results summary

Usage:
    cd knowledge-graph
    python -m src.main

    Or with pykg2vec (if installed):
    python -m src.main --use-pykg2vec
"""

import argparse
import json
import sys
from pathlib import Path

# Ensure src is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

from kg_builder import VinylKnowledgeGraph
from embeddings import SimpleTransE, build_index_maps, triples_to_indices
from rules import (
    KnowledgeBase, ForwardChainer, BackwardChainer,
    get_domain_rules, check_consistency,
)
from queries import run_all_queries
from visualize import generate_all_visualizations


def main(use_pykg2vec: bool = False):
    print("=" * 60)
    print("  Vinyl Collection Knowledge Representation System")
    print("=" * 60)

    # ------------------------------------------------------------------
    # 1. Build knowledge graph
    # ------------------------------------------------------------------
    print("\n[1/8] Building knowledge graph from collection data...")
    data_path = Path(__file__).resolve().parent.parent / "data" / "collection.json"
    kg = VinylKnowledgeGraph(str(data_path))
    kg.load_data()
    kg.build_graph()

    # Export for pykg2vec
    splits_dir = Path(__file__).resolve().parent.parent / "data" / "kg_splits"
    kg.export_triples(str(splits_dir))

    # ------------------------------------------------------------------
    # 2. Train embeddings
    # ------------------------------------------------------------------
    print("\n[2/8] Training knowledge graph embeddings...")

    entity2idx, relation2idx = build_index_maps(kg.triples)
    idx2entity = {v: k for k, v in entity2idx.items()}
    idx2relation = {v: k for k, v in relation2idx.items()}

    import random
    random.seed(42)
    all_indexed = triples_to_indices(kg.triples, entity2idx, relation2idx)
    random.shuffle(all_indexed)
    n = len(all_indexed)
    train_triples = all_indexed[:int(n * 0.8)]
    valid_triples = all_indexed[int(n * 0.8):int(n * 0.9)]
    test_triples = all_indexed[int(n * 0.9):]

    print(f"  Train: {len(train_triples):,}  Valid: {len(valid_triples):,}  "
          f"Test: {len(test_triples):,}")

    if use_pykg2vec:
        try:
            from embeddings import train_model
            results = train_model(
                data_dir=str(splits_dir),
                model_name="TransE",
                epochs=200,
                batch_size=256,
                hidden_size=128,
            )
            metrics = results.get("results", {})
            losses = []  # pykg2vec handles its own logging
            model = None  # pykg2vec model not directly accessible same way
            print("  pykg2vec training complete.")
        except ImportError:
            print("  pykg2vec not installed. Falling back to SimpleTransE.")
            use_pykg2vec = False

    if not use_pykg2vec:
        # Subsample for faster training in constrained environments
        # Use --fast flag or set FAST_MODE=1 for quick demo
        import os
        fast_mode = os.environ.get("FAST_MODE", "0") == "1"
        if fast_mode:
            train_sample = train_triples[:3000]
            epochs, n_neg, dim = 30, 2, 50
            print("  [FAST MODE] Using subsample for quick demo")
        else:
            train_sample = train_triples
            epochs, n_neg, dim = 200, 5, 100

        model = SimpleTransE(
            n_entities=len(entity2idx),
            n_relations=len(relation2idx),
            dim=dim,
            lr=0.01,
        )
        losses = model.train(train_sample, epochs=epochs, margin=1.0, n_neg=n_neg)

        # Evaluate
        print("\n  Evaluating on test set (sample of 500 triples)...")
        metrics = model.evaluate(test_triples[:500])
        print("  Evaluation Metrics:")
        for k, v in metrics.items():
            print(f"    {k:10s}: {v:.4f}")

    # ------------------------------------------------------------------
    # 3. Load facts into knowledge base for rule reasoning
    # ------------------------------------------------------------------
    print("\n[3/8] Loading facts into knowledge base...")
    kb = KnowledgeBase()
    n_loaded = kb.load_from_triples(kg.triples)
    print(f"  Loaded {n_loaded:,} facts")

    # ------------------------------------------------------------------
    # 4. Forward chaining
    # ------------------------------------------------------------------
    print("\n[4/8] Running forward chaining...")
    rules = get_domain_rules()
    fc = ForwardChainer(kb, rules)
    n_inferred = fc.run()
    print(f"  Inferred {n_inferred:,} new facts")
    print("  Sample inferences:")
    for line in fc.inference_log[:15]:
        print(f"    {line}")

    # ------------------------------------------------------------------
    # 5. Backward chaining demonstrations
    # ------------------------------------------------------------------
    print("\n[5/8] Backward chaining demonstrations...")
    bc = BackwardChainer(kb, rules)

    # Demo queries for backward chaining
    demo_queries = [
        ("song:james_brown_nothing_beats_a_try_but_a_fail", "energy_tier", "high_energy"),
        ("song:bobby_hutcherson_procession", "energy_tier", "low_energy"),
        ("song:marvin_gaye_distant_lover", "energy_tier", "cool_down"),
    ]

    for subj, pred, obj in demo_queries:
        if any(f.subject == subj for f in kb.facts):
            explanation = bc.explain(subj, pred, obj)
            print(f"\n{explanation}")
        else:
            print(f"\n  Skipping {subj} (not in KB)")

    # ------------------------------------------------------------------
    # 6. Competency questions
    # ------------------------------------------------------------------
    print("\n[6/8] Running competency questions...")
    cq_kwargs = {}
    if not use_pykg2vec and model:
        cq_kwargs = {
            "entity2idx": entity2idx,
            "idx2entity": idx2entity,
            "model": model,
            "relation2idx": relation2idx,
        }
    cq_results = run_all_queries(kb, **cq_kwargs)

    # ------------------------------------------------------------------
    # 7. Consistency check
    # ------------------------------------------------------------------
    print("\n[7/8] Checking knowledge base consistency...")
    issues = check_consistency(kb)
    for issue in issues[:20]:
        print(f"  {issue}")

    # ------------------------------------------------------------------
    # 8. Visualizations
    # ------------------------------------------------------------------
    print("\n[8/8] Generating visualizations...")
    output_dir = str(Path(__file__).resolve().parent.parent / "output")
    generate_all_visualizations(
        kb,
        losses=losses if not use_pykg2vec else None,
        metrics=metrics if isinstance(metrics, dict) else None,
        output_dir=output_dir,
    )

    # ------------------------------------------------------------------
    # Save results to JSON
    # ------------------------------------------------------------------
    results_path = Path(output_dir) / "results.json"

    # Link prediction demo
    link_pred_results = []
    if model and not use_pykg2vec:
        demo_songs = [
            "song:james_brown_nothing_beats_a_try_but_a_fail",
            "song:marvin_gaye_distant_lover",
            "song:bobby_hutcherson_procession",
            "song:ohio_players_the_reds",
            "song:gil_scott_heron_h20gate_blues",
        ]
        r_idx_genre = relation2idx.get("has_genre")
        r_idx_set = relation2idx.get("suitable_for")

        for song in demo_songs:
            if song not in entity2idx:
                continue
            h_idx = entity2idx[song]

            # Predict genre
            if r_idx_genre is not None:
                preds = model.predict_tail(h_idx, r_idx_genre, top_k=5)
                genre_preds = [
                    {"entity": idx2entity[i], "score": round(s, 4)}
                    for i, s in preds if idx2entity[i].startswith("genre:")
                ]
            else:
                genre_preds = []

            # Predict set category
            if r_idx_set is not None:
                preds = model.predict_tail(h_idx, r_idx_set, top_k=5)
                set_preds = [
                    {"entity": idx2entity[i], "score": round(s, 4)}
                    for i, s in preds if idx2entity[i].startswith("set:")
                ]
            else:
                set_preds = []

            link_pred_results.append({
                "song": song,
                "predicted_genres": genre_preds,
                "predicted_set_categories": set_preds,
            })

    # Serialize competency question results (convert sets to lists)
    def serialize(obj):
        if isinstance(obj, set):
            return sorted(obj)
        if isinstance(obj, dict):
            return {k: serialize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [serialize(i) for i in obj]
        if isinstance(obj, tuple):
            return list(obj)
        return obj

    output_data = {
        "graph_stats": {
            "total_triples": len(kg.triples),
            "entities": {k: len(v) for k, v in kg.entities.items()},
            "relations": sorted(kg.relations),
        },
        "embedding_metrics": metrics if isinstance(metrics, dict) else {},
        "forward_chaining": {
            "new_facts_inferred": n_inferred,
            "log_sample": fc.inference_log[:20],
        },
        "consistency_issues": issues[:20],
        "competency_questions": serialize(cq_results),
        "link_predictions": link_pred_results,
    }

    with open(results_path, "w") as f:
        json.dump(output_data, f, indent=2, default=str)
    print(f"\nResults saved to {results_path}")

    # Summary
    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE")
    print("=" * 60)
    print(f"  Knowledge graph:     {len(kg.triples):,} triples")
    print(f"  Entities:            {sum(len(v) for v in kg.entities.values()):,}")
    print(f"  Forward chaining:    {n_inferred:,} new facts")
    print(f"  Competency queries:  {len(cq_results)} answered")
    print(f"  Visualizations:      output/")
    print(f"  Full results:        {results_path}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vinyl Collection Knowledge Representation System")
    parser.add_argument("--use-pykg2vec", action="store_true",
                        help="Use pykg2vec library (requires torch). Default uses SimpleTransE.")
    args = parser.parse_args()
    main(use_pykg2vec=args.use_pykg2vec)
