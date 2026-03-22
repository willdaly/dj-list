"""
embeddings.py — Knowledge Graph Embeddings with pykg2vec

Trains TransE, ComplEx, and DistMult models on the vinyl collection
knowledge graph triples and performs link prediction tasks relevant
to a DJ's workflow:

    1. Genre prediction: Given a track, predict its genre
    2. Set placement: Given a track, predict which set segment it fits
    3. Artist discovery: Given a genre, predict which artists belong
    4. Missing album links: Predict which album a track appears on

Evaluation uses standard KG embedding metrics:
    - Mean Rank (MR)
    - Mean Reciprocal Rank (MRR)
    - Hits@1, Hits@3, Hits@10
"""

import json
from pathlib import Path

import numpy as np

# pykg2vec imports (optional — only needed with --use-pykg2vec flag)
try:
    from pykg2vec.data.kgcontroller import KnowledgeGraph
    from pykg2vec.common import Importer, KGEArgParser
    from pykg2vec.config import KGEConfig
    from pykg2vec.trainer import Trainer
    from pykg2vec.utils.evaluator import Evaluator
    HAS_PYKG2VEC = True
except ImportError:
    HAS_PYKG2VEC = False


# ---------------------------------------------------------------------------
# Custom dataset loader for pykg2vec
# ---------------------------------------------------------------------------
class VinylKGDataset:
    """
    Adapter to load our TSV triples into pykg2vec's KnowledgeGraph format.

    pykg2vec expects files named: train.tsv, valid.tsv, test.tsv
    each with tab-separated (head, relation, tail) per line.
    """

    def __init__(self, data_dir: str | Path):
        self.data_dir = Path(data_dir)
        self._validate_files()

    def _validate_files(self) -> None:
        """Check that all required split files exist."""
        required = ["train.tsv", "valid.tsv", "test.tsv"]
        for fname in required:
            fpath = self.data_dir / fname
            if not fpath.exists():
                raise FileNotFoundError(
                    f"Missing required file: {fpath}\n"
                    f"Run kg_builder.py first to generate triple splits."
                )
        # Report sizes
        for fname in required:
            fpath = self.data_dir / fname
            n_lines = sum(1 for _ in open(fpath))
            print(f"  {fname}: {n_lines:,} triples")


# ---------------------------------------------------------------------------
# Model training
# ---------------------------------------------------------------------------
def train_model(
    data_dir: str | Path,  # Requires pykg2vec — call with --use-pykg2vec
    model_name: str = "TransE",
    epochs: int = 200,
    batch_size: int = 256,
    learning_rate: float = 0.01,
    hidden_size: int = 128,
    output_dir: str | Path = "output/models",
) -> dict:
    """
    Train a KG embedding model using pykg2vec.

    Args:
        data_dir: Path to directory containing train/valid/test.tsv
        model_name: One of 'TransE', 'ComplEx', 'DistMult', 'RotatE', etc.
        epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Optimizer learning rate
        hidden_size: Embedding dimension
        output_dir: Where to save trained model

    Returns:
        Dict with training results and evaluation metrics.
    """
    data_dir = Path(data_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*55}")
    print(f"Training {model_name} Model")
    print(f"{'='*55}")

    # Configure the knowledge graph
    knowledge_graph = KnowledgeGraph(dataset="custom", custom_dataset_path=str(data_dir))
    knowledge_graph.prepare_data()

    # Get model class
    model_class = Importer().import_model(model_name)

    # Configure hyperparameters
    config = KGEConfig(
        model_name=model_name,
        dataset="custom",
        custom_dataset_path=str(data_dir),
    )
    config.epochs = epochs
    config.batch_size = batch_size
    config.learning_rate = learning_rate
    config.hidden_size = hidden_size
    config.test_step = 50  # evaluate every N epochs
    config.save_model = True
    config.path_result = str(output_dir)
    config.debug = False

    # Build and train
    model = model_class(**config.__dict__)
    trainer = Trainer(model, config)
    trainer.build_model()
    trainer.train_model()

    # Evaluate
    evaluator = Evaluator(model, config)
    evaluator.test_step = config.test_step
    results = evaluator.evaluate()

    return {
        "model_name": model_name,
        "epochs": epochs,
        "hidden_size": hidden_size,
        "results": results,
    }


# ---------------------------------------------------------------------------
# Lightweight fallback: manual TransE implementation
# ---------------------------------------------------------------------------
class SimpleTransE:
    """
    Minimal TransE implementation for environments where pykg2vec
    installation is problematic.

    TransE models entities and relations as vectors in the same space,
    with the scoring function: score(h, r, t) = -||h + r - t||

    Higher scores (less negative) indicate more plausible triples.
    """

    def __init__(self, n_entities: int, n_relations: int, dim: int = 100, lr: float = 0.01):
        self.dim = dim
        self.lr = lr
        self.n_entities = n_entities
        self.n_relations = n_relations
        # Xavier-style initialization
        bound = 6.0 / np.sqrt(dim)
        self.ent_embeddings = np.random.uniform(-bound, bound, (n_entities, dim))
        self.rel_embeddings = np.random.uniform(-bound, bound, (n_relations, dim))
        # Normalize entity embeddings to unit length
        norms = np.linalg.norm(self.ent_embeddings, axis=1, keepdims=True)
        self.ent_embeddings /= np.where(norms > 0, norms, 1)

    def _score(self, h_idx: int, r_idx: int, t_idx: int) -> float:
        """TransE score: -L2(h + r - t)."""
        h = self.ent_embeddings[h_idx]
        r = self.rel_embeddings[r_idx]
        t = self.ent_embeddings[t_idx]
        return -np.linalg.norm(h + r - t)

    def train(
        self,
        triples: list[tuple[int, int, int]],
        epochs: int = 200,
        margin: float = 1.0,
        n_neg: int = 5,
    ) -> list[float]:
        """
        Train with margin-based ranking loss.

        For each positive triple (h, r, t), generate negative samples
        by corrupting either head or tail, and push the positive score
        above the negative by at least `margin`.

        Returns list of average loss per epoch.
        """
        losses = []
        n_ent = self.n_entities
        triples_arr = np.array(triples)

        for epoch in range(epochs):
            epoch_loss = 0.0
            np.random.shuffle(triples_arr)

            for h, r, t in triples_arr:
                pos_score = self._score(h, r, t)

                for _ in range(n_neg):
                    # Corrupt head or tail with 50/50 chance
                    if np.random.random() < 0.5:
                        h_neg = np.random.randint(n_ent)
                        neg_score = self._score(h_neg, r, t)
                    else:
                        t_neg = np.random.randint(n_ent)
                        neg_score = self._score(h, r, t_neg)

                    # Margin ranking loss
                    loss = max(0, margin + neg_score - pos_score)
                    if loss > 0:
                        epoch_loss += loss
                        # Gradient step (simplified SGD)
                        h_vec = self.ent_embeddings[h]
                        r_vec = self.rel_embeddings[r]
                        t_vec = self.ent_embeddings[t]
                        diff = h_vec + r_vec - t_vec
                        grad = 2 * diff / (np.linalg.norm(diff) + 1e-8)

                        self.ent_embeddings[h] -= self.lr * grad
                        self.rel_embeddings[r] -= self.lr * grad
                        self.ent_embeddings[t] += self.lr * grad

            # Re-normalize entities
            norms = np.linalg.norm(self.ent_embeddings, axis=1, keepdims=True)
            self.ent_embeddings /= np.where(norms > 0, norms, 1)

            avg_loss = epoch_loss / len(triples_arr)
            losses.append(avg_loss)
            if (epoch + 1) % 50 == 0:
                print(f"  Epoch {epoch+1}/{epochs}  avg_loss={avg_loss:.4f}")

        return losses

    def predict_tail(
        self, h_idx: int, r_idx: int, top_k: int = 10
    ) -> list[tuple[int, float]]:
        """
        Predict the most likely tail entities for (h, r, ?).

        Returns list of (entity_idx, score) sorted by descending score.
        """
        h = self.ent_embeddings[h_idx]
        r = self.rel_embeddings[r_idx]
        # Score all possible tails
        diffs = h + r - self.ent_embeddings  # (n_entities, dim)
        scores = -np.linalg.norm(diffs, axis=1)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(int(idx), float(scores[idx])) for idx in top_indices]

    def predict_head(
        self, r_idx: int, t_idx: int, top_k: int = 10
    ) -> list[tuple[int, float]]:
        """
        Predict the most likely head entities for (?, r, t).

        Returns list of (entity_idx, score) sorted by descending score.
        """
        r = self.rel_embeddings[r_idx]
        t = self.ent_embeddings[t_idx]
        # h ≈ t - r
        target = t - r
        diffs = target - self.ent_embeddings
        scores = -np.linalg.norm(diffs, axis=1)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(int(idx), float(scores[idx])) for idx in top_indices]

    def evaluate(
        self, test_triples: list[tuple[int, int, int]]
    ) -> dict[str, float]:
        """
        Compute standard KG embedding metrics on test triples.

        Metrics: MR, MRR, Hits@1, Hits@3, Hits@10
        """
        ranks = []
        for h, r, t in test_triples:
            # Score all tails
            h_vec = self.ent_embeddings[h]
            r_vec = self.rel_embeddings[r]
            diffs = h_vec + r_vec - self.ent_embeddings
            scores = -np.linalg.norm(diffs, axis=1)
            # Rank of the correct tail
            rank = int((scores >= scores[t]).sum())
            ranks.append(rank)

        ranks = np.array(ranks, dtype=float)
        return {
            "mean_rank": float(np.mean(ranks)),
            "mrr": float(np.mean(1.0 / ranks)),
            "hits@1": float(np.mean(ranks <= 1)),
            "hits@3": float(np.mean(ranks <= 3)),
            "hits@10": float(np.mean(ranks <= 10)),
        }


# ---------------------------------------------------------------------------
# Build entity/relation index mappings
# ---------------------------------------------------------------------------
def build_index_maps(triples: list[tuple[str, str, str]]) -> tuple[dict, dict]:
    """
    Create entity → int and relation → int mappings from string triples.

    Returns (entity2idx, relation2idx) dicts.
    """
    entities = set()
    relations = set()
    for h, r, t in triples:
        entities.add(h)
        entities.add(t)
        relations.add(r)
    entity2idx = {e: i for i, e in enumerate(sorted(entities))}
    relation2idx = {r: i for i, r in enumerate(sorted(relations))}
    return entity2idx, relation2idx


def triples_to_indices(
    triples: list[tuple[str, str, str]],
    entity2idx: dict[str, int],
    relation2idx: dict[str, int],
) -> list[tuple[int, int, int]]:
    """Convert string triples to integer-indexed triples."""
    indexed = []
    for h, r, t in triples:
        if h in entity2idx and r in relation2idx and t in entity2idx:
            indexed.append((entity2idx[h], relation2idx[r], entity2idx[t]))
    return indexed


# ---------------------------------------------------------------------------
# Standalone: train with the lightweight implementation
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from kg_builder import VinylKnowledgeGraph

    # Build graph
    kg = VinylKnowledgeGraph("data/collection.json")
    kg.load_data()
    kg.build_graph()

    # Index mappings
    entity2idx, relation2idx = build_index_maps(kg.triples)
    idx2entity = {v: k for k, v in entity2idx.items()}
    idx2relation = {v: k for k, v in relation2idx.items()}

    print(f"Entities: {len(entity2idx)}, Relations: {len(relation2idx)}")

    # Split triples
    import random
    random.seed(42)
    all_indexed = triples_to_indices(kg.triples, entity2idx, relation2idx)
    random.shuffle(all_indexed)
    n = len(all_indexed)
    train = all_indexed[:int(n * 0.8)]
    valid = all_indexed[int(n * 0.8):int(n * 0.9)]
    test = all_indexed[int(n * 0.9):]

    print(f"Train: {len(train)}, Valid: {len(valid)}, Test: {len(test)}")

    # Train
    model = SimpleTransE(
        n_entities=len(entity2idx),
        n_relations=len(relation2idx),
        dim=100,
        lr=0.01,
    )
    losses = model.train(train, epochs=200, margin=1.0, n_neg=5)

    # Evaluate
    metrics = model.evaluate(test[:500])  # subset for speed
    print("\nEvaluation Metrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}")

    # Demo: predict genre for a sample track
    sample_entity = "song:james_brown_nothing_beats_a_try_but_a_fail"
    if sample_entity in entity2idx:
        h_idx = entity2idx[sample_entity]
        r_idx = relation2idx["has_genre"]
        preds = model.predict_tail(h_idx, r_idx, top_k=5)
        print(f"\nPredicted genres for '{sample_entity}':")
        for ent_idx, score in preds:
            print(f"  {idx2entity[ent_idx]:30s} score={score:.4f}")
