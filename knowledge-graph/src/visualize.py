"""
visualize.py — Visualization for Vinyl Knowledge Graph

Generates publication-quality charts and diagrams for the assignment report:
    1. Genre distribution bar chart
    2. Tempo distribution across genres (stacked bar)
    3. Key distribution (circle of fifths style)
    4. Knowledge graph subgraph visualization
    5. Embedding training loss curve
    6. Evaluation metrics comparison across models
"""

import json
from collections import Counter, defaultdict
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for file output
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np


# Consistent color palette
COLORS = {
    "genre:soul": "#E07A3E",
    "genre:jazz": "#3E7AE0",
    "genre:hip_hop": "#7A3EE0",
    "genre:hip_hop_instrumental": "#9B6EE0",
    "genre:rock": "#E03E3E",
    "genre:pop": "#E0C13E",
    "genre:electronic": "#3EE0A0",
    "genre:battle": "#B03EE0",
    "genre:45_king": "#C060D0",
    "genre:ost": "#808080",
    "genre:melodiya": "#60A0A0",
}

TEMPO_COLORS = {
    "tempo:very_slow": "#1a237e",
    "tempo:slow": "#4a148c",
    "tempo:mid_tempo": "#e65100",
    "tempo:uptempo": "#f57f17",
    "tempo:fast": "#d50000",
    "tempo:very_fast": "#b71c1c",
}


def plot_genre_distribution(kb, output_path: str = "output/genre_distribution.png"):
    """Bar chart of track counts per genre."""
    genre_counts = Counter()
    for fact in kb.query(predicate="has_genre"):
        genre_counts[fact.obj] += 1

    genres = sorted(genre_counts.keys(), key=lambda g: -genre_counts[g])
    counts = [genre_counts[g] for g in genres]
    colors = [COLORS.get(g, "#999999") for g in genres]
    labels = [g.replace("genre:", "").replace("_", " ").title() for g in genres]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.barh(labels[::-1], counts[::-1], color=colors[::-1], edgecolor="white")
    ax.set_xlabel("Number of Tracks", fontsize=12)
    ax.set_title("Genre Distribution in Vinyl Collection", fontsize=14, fontweight="bold")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # Add count labels
    for bar, count in zip(bars, counts[::-1]):
        ax.text(bar.get_width() + 10, bar.get_y() + bar.get_height() / 2,
                str(count), va="center", fontsize=10)

    plt.tight_layout()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def plot_genre_tempo_heatmap(kb, output_path: str = "output/genre_tempo_heatmap.png"):
    """Heatmap of genre × tempo cross-tabulation."""
    matrix = defaultdict(Counter)
    genre_facts = {f.subject: f.obj for f in kb.query(predicate="has_genre")}
    tempo_facts = {f.subject: f.obj for f in kb.query(predicate="has_tempo")}

    for song in genre_facts:
        if song in tempo_facts:
            matrix[genre_facts[song]][tempo_facts[song]] += 1

    genres = sorted(matrix.keys())
    tempos = ["tempo:very_slow", "tempo:slow", "tempo:mid_tempo",
              "tempo:uptempo", "tempo:fast", "tempo:very_fast"]

    data = np.zeros((len(genres), len(tempos)))
    for i, g in enumerate(genres):
        for j, t in enumerate(tempos):
            data[i, j] = matrix[g].get(t, 0)

    genre_labels = [g.replace("genre:", "").replace("_", " ").title() for g in genres]
    tempo_labels = [t.replace("tempo:", "").replace("_", " ").title() for t in tempos]

    fig, ax = plt.subplots(figsize=(10, 6))
    im = ax.imshow(data, cmap="YlOrRd", aspect="auto")
    ax.set_xticks(range(len(tempos)))
    ax.set_xticklabels(tempo_labels, rotation=45, ha="right")
    ax.set_yticks(range(len(genres)))
    ax.set_yticklabels(genre_labels)
    ax.set_title("Genre × Tempo Distribution", fontsize=14, fontweight="bold")

    # Add text annotations
    for i in range(len(genres)):
        for j in range(len(tempos)):
            val = int(data[i, j])
            if val > 0:
                color = "white" if val > data.max() * 0.6 else "black"
                ax.text(j, i, str(val), ha="center", va="center",
                        fontsize=8, color=color)

    plt.colorbar(im, ax=ax, label="Track Count")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def plot_key_distribution(kb, output_path: str = "output/key_distribution.png"):
    """Polar/radial chart of musical key distribution."""
    key_counts = Counter()
    for fact in kb.query(predicate="in_key_root"):
        key_counts[fact.obj] += 1

    # Order by circle of fifths
    circle_of_fifths = ["C", "G", "D", "A", "E", "B",
                        "F#", "Db", "Ab", "Eb", "Bb", "F"]
    counts = [key_counts.get(f"key:{k}", 0) for k in circle_of_fifths]

    angles = np.linspace(0, 2 * np.pi, len(circle_of_fifths), endpoint=False)
    # Close the polygon
    counts_closed = counts + [counts[0]]
    angles_closed = np.append(angles, angles[0])

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    ax.fill(angles_closed, counts_closed, alpha=0.25, color="#E07A3E")
    ax.plot(angles_closed, counts_closed, color="#E07A3E", linewidth=2)
    ax.scatter(angles, counts, color="#E07A3E", s=50, zorder=5)
    ax.set_xticks(angles)
    ax.set_xticklabels(circle_of_fifths, fontsize=12, fontweight="bold")
    ax.set_title("Key Distribution (Circle of Fifths)\n", fontsize=14, fontweight="bold")

    # Add count labels
    for angle, count, key in zip(angles, counts, circle_of_fifths):
        ax.annotate(str(count), xy=(angle, count), fontsize=9,
                    ha="center", va="bottom", color="#333")

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def plot_training_loss(losses: list[float], model_name: str = "TransE",
                       output_path: str = "output/training_loss.png"):
    """Line chart of embedding training loss over epochs."""
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(range(1, len(losses) + 1), losses, color="#3E7AE0", linewidth=1.5)
    ax.set_xlabel("Epoch", fontsize=12)
    ax.set_ylabel("Average Loss", fontsize=12)
    ax.set_title(f"{model_name} Training Loss", fontsize=14, fontweight="bold")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def plot_eval_metrics(metrics: dict[str, float], model_name: str = "TransE",
                      output_path: str = "output/eval_metrics.png"):
    """Bar chart of evaluation metrics (MR, MRR, Hits@K)."""
    names = list(metrics.keys())
    values = list(metrics.values())

    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.bar(names, values, color=["#3E7AE0", "#E07A3E", "#3EE0A0", "#E0C13E", "#7A3EE0"])
    ax.set_ylabel("Score", fontsize=12)
    ax.set_title(f"{model_name} Evaluation Metrics", fontsize=14, fontweight="bold")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                f"{val:.3f}", ha="center", fontsize=10)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def plot_set_category_distribution(kb, output_path: str = "output/set_categories.png"):
    """Pie chart of DJ set category distribution after rule inference."""
    cat_counts = Counter()
    for fact in kb.query(predicate="suitable_for"):
        cat_counts[fact.obj] += 1

    # Also show energy tier distribution
    energy_counts = Counter()
    for fact in kb.query(predicate="energy_tier"):
        energy_counts[fact.obj] += 1

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Set categories
    labels1 = [c.replace("set:", "").replace("_", " ").title() for c in cat_counts]
    ax1.pie(cat_counts.values(), labels=labels1, autopct="%1.1f%%",
            colors=["#3EE0A0", "#E0C13E", "#E07A3E", "#3E7AE0"],
            startangle=90)
    ax1.set_title("Set Category Distribution", fontsize=13, fontweight="bold")

    # Energy tiers
    if energy_counts:
        labels2 = [c.replace("_", " ").title() for c in energy_counts]
        ax2.pie(energy_counts.values(), labels=labels2, autopct="%1.1f%%",
                colors=["#d50000", "#f57f17", "#e65100", "#1a237e"],
                startangle=90)
        ax2.set_title("Energy Tier Distribution (Rule-Inferred)", fontsize=13, fontweight="bold")
    else:
        ax2.text(0.5, 0.5, "Run forward chaining first",
                 ha="center", va="center", fontsize=12)
        ax2.set_title("Energy Tier Distribution", fontsize=13, fontweight="bold")

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {output_path}")


def generate_all_visualizations(kb, losses=None, metrics=None,
                                 output_dir: str = "output"):
    """Generate all visualizations for the report."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    print("\nGenerating visualizations...")
    plot_genre_distribution(kb, f"{output_dir}/genre_distribution.png")
    plot_genre_tempo_heatmap(kb, f"{output_dir}/genre_tempo_heatmap.png")
    plot_key_distribution(kb, f"{output_dir}/key_distribution.png")
    plot_set_category_distribution(kb, f"{output_dir}/set_categories.png")
    if losses:
        plot_training_loss(losses, output_path=f"{output_dir}/training_loss.png")
    if metrics:
        plot_eval_metrics(metrics, output_path=f"{output_dir}/eval_metrics.png")
    print("All visualizations generated.\n")
