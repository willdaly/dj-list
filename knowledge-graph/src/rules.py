"""
rules.py — Rule-Based Reasoning Engine for Vinyl Knowledge Graph

Implements a production rule system with both forward chaining (data-driven)
and backward chaining (goal-driven) inference over the knowledge graph.

Production Rules (DJ Domain):
    1. Genre + BPM → Set segment suitability
    2. Key compatibility → Harmonic mix recommendations
    3. Artist genre dominance → Artist classification
    4. Collection gap detection → Missing subgenre coverage
    5. Track energy classification → Energy tier assignment
    6. Era detection → Decade assignment from BPM/genre patterns
    7. Crate-dig priority → Value/rarity heuristic

The forward chainer fires all applicable rules given current facts,
adding inferred facts iteratively until no new facts emerge (fixed point).

The backward chainer starts from a goal and works backwards through
rules to determine what facts would need to be true (proof search).
"""

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Callable


# ---------------------------------------------------------------------------
# Fact representation
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class Fact:
    """A ground fact in the knowledge base: (subject, predicate, object)."""
    subject: str
    predicate: str
    obj: str

    def __str__(self) -> str:
        return f"({self.subject}, {self.predicate}, {self.obj})"


# ---------------------------------------------------------------------------
# Rule representation
# ---------------------------------------------------------------------------
@dataclass
class Rule:
    """
    A production rule with conditions and an action.

    Attributes:
        name: Human-readable rule identifier
        description: What this rule represents in the domain
        conditions: List of (predicate, obj_constraint) tuples that must match
                   the same subject for the rule to fire.  obj_constraint can
                   be a specific value or a set of acceptable values.
        conclusion_predicate: The predicate of the inferred fact
        conclusion_obj: The object of the inferred fact (or a callable)
        priority: Higher = fires first when multiple rules match
    """
    name: str
    description: str
    conditions: list[tuple[str, str | set[str]]]
    conclusion_predicate: str
    conclusion_obj: str | Callable
    priority: int = 0


# ---------------------------------------------------------------------------
# Knowledge Base
# ---------------------------------------------------------------------------
class KnowledgeBase:
    """
    Stores facts and supports queries with pattern matching.
    """

    def __init__(self):
        self.facts: set[Fact] = set()
        # Indexes for fast lookup
        self._by_subject: dict[str, set[Fact]] = defaultdict(set)
        self._by_predicate: dict[str, set[Fact]] = defaultdict(set)
        self._by_object: dict[str, set[Fact]] = defaultdict(set)

    def add(self, fact: Fact) -> bool:
        """Add a fact. Returns True if it was new."""
        if fact in self.facts:
            return False
        self.facts.add(fact)
        self._by_subject[fact.subject].add(fact)
        self._by_predicate[fact.predicate].add(fact)
        self._by_object[fact.obj].add(fact)
        return True

    def query(
        self,
        subject: str | None = None,
        predicate: str | None = None,
        obj: str | None = None,
    ) -> set[Fact]:
        """Retrieve facts matching the given pattern (None = wildcard)."""
        candidates = self.facts
        if subject is not None:
            candidates = candidates & self._by_subject.get(subject, set())
        if predicate is not None:
            candidates = candidates & self._by_predicate.get(predicate, set())
        if obj is not None:
            candidates = candidates & self._by_object.get(obj, set())
        return candidates

    def has(self, subject: str, predicate: str, obj: str) -> bool:
        """Check whether a specific fact exists."""
        return Fact(subject, predicate, obj) in self.facts

    def subjects_with(self, predicate: str, obj: str) -> set[str]:
        """Return all subjects that have (predicate, obj)."""
        return {f.subject for f in self.query(predicate=predicate, obj=obj)}

    def objects_of(self, subject: str, predicate: str) -> set[str]:
        """Return all objects for (subject, predicate, ?)."""
        return {f.obj for f in self.query(subject=subject, predicate=predicate)}

    def load_from_triples(self, triples: list[tuple[str, str, str]]) -> int:
        """Bulk-load triples into the knowledge base. Returns count added."""
        added = 0
        for h, r, t in triples:
            if self.add(Fact(h, r, t)):
                added += 1
        return added


# ---------------------------------------------------------------------------
# Domain rules for the vinyl / DJ knowledge graph
# ---------------------------------------------------------------------------
def get_domain_rules() -> list[Rule]:
    """
    Define the production rules for DJ vinyl collection reasoning.

    Each rule encodes domain expertise about how a DJ selects and
    sequences tracks for a live set.
    """
    rules = []

    # Rule 1: Peak-hour soul classifier
    # IF genre is Soul AND tempo is uptempo or fast THEN suitable for peak hour
    rules.append(Rule(
        name="R1_peak_hour_soul",
        description=(
            "Uptempo and fast soul tracks are suitable for the peak hour "
            "of a DJ set, when energy is highest on the dance floor."
        ),
        conditions=[
            ("has_genre", {"genre:soul"}),
            ("has_tempo", {"tempo:uptempo", "tempo:fast"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="high_energy",
        priority=10,
    ))

    # Rule 2: Warm-up jazz classifier
    # IF genre is Jazz AND tempo is slow or very_slow THEN warm-up material
    rules.append(Rule(
        name="R2_warmup_jazz",
        description=(
            "Slow jazz tracks serve as warm-up material, setting an "
            "intimate atmosphere before the energy builds."
        ),
        conditions=[
            ("has_genre", {"genre:jazz"}),
            ("has_tempo", {"tempo:very_slow", "tempo:slow"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="low_energy",
        priority=8,
    ))

    # Rule 3: Breakbeat / battle track → peak energy
    # IF genre is Battle or Hip-Hop AND tempo is uptempo THEN peak energy
    rules.append(Rule(
        name="R3_breakbeat_peak",
        description=(
            "Uptempo hip-hop and battle breaks are high-energy selections "
            "used for climactic moments and crowd engagement."
        ),
        conditions=[
            ("has_genre", {"genre:hip_hop", "genre:battle", "genre:45_king"}),
            ("has_tempo", {"tempo:uptempo", "tempo:fast", "tempo:very_fast"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="high_energy",
        priority=9,
    ))

    # Rule 4: Mid-tempo soul/funk → build segment
    # IF genre is Soul AND tempo is mid_tempo THEN build segment
    rules.append(Rule(
        name="R4_midtempo_builder",
        description=(
            "Mid-tempo soul and funk tracks are ideal for the 'build' "
            "segment of a set — groovy enough to move but not yet peak intensity."
        ),
        conditions=[
            ("has_genre", {"genre:soul"}),
            ("has_tempo", {"tempo:mid_tempo"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="mid_energy",
        priority=7,
    ))

    # Rule 5: Slow soul ballad → cool-down
    # IF genre is Soul AND tempo is very_slow THEN cool-down
    rules.append(Rule(
        name="R5_soul_ballad_cooldown",
        description=(
            "Very slow soul ballads are cool-down tracks, used to wind "
            "down a set or create emotional contrast."
        ),
        conditions=[
            ("has_genre", {"genre:soul"}),
            ("has_tempo", {"tempo:very_slow"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="cool_down",
        priority=6,
    ))

    # Rule 6: Electronic → high energy (most electronic in collection is uptempo)
    rules.append(Rule(
        name="R6_electronic_energy",
        description=(
            "Electronic tracks in this collection tend toward high energy, "
            "suitable for peak-hour or transition moments."
        ),
        conditions=[
            ("has_genre", {"genre:electronic"}),
            ("has_tempo", {"tempo:uptempo", "tempo:fast", "tempo:very_fast"}),
        ],
        conclusion_predicate="energy_tier",
        conclusion_obj="high_energy",
        priority=7,
    ))

    # Rule 7: Major key + uptempo → crowd-pleaser classification
    rules.append(Rule(
        name="R7_major_key_crowd_pleaser",
        description=(
            "Tracks in a major key at uptempo or faster BPMs tend to "
            "have an uplifting feel — crowd-pleasers for any set."
        ),
        conditions=[
            ("has_mode", {"mode:major"}),
            ("has_tempo", {"tempo:uptempo", "tempo:fast"}),
        ],
        conclusion_predicate="mood",
        conclusion_obj="crowd_pleaser",
        priority=5,
    ))

    return rules


# ---------------------------------------------------------------------------
# Forward chaining engine
# ---------------------------------------------------------------------------
class ForwardChainer:
    """
    Data-driven inference: repeatedly applies rules to known facts
    until no new facts can be derived (fixed-point reached).
    """

    def __init__(self, kb: KnowledgeBase, rules: list[Rule]):
        self.kb = kb
        self.rules = sorted(rules, key=lambda r: -r.priority)
        self.inference_log: list[str] = []

    def run(self, max_iterations: int = 100) -> int:
        """
        Execute forward chaining.

        Returns the total number of new facts inferred.
        """
        total_new = 0
        for iteration in range(max_iterations):
            new_facts = self._apply_all_rules()
            if not new_facts:
                self.inference_log.append(
                    f"Fixed point reached after {iteration + 1} iterations. "
                    f"Total new facts: {total_new}"
                )
                break
            total_new += new_facts
            self.inference_log.append(
                f"Iteration {iteration + 1}: inferred {new_facts} new facts"
            )
        return total_new

    def _apply_all_rules(self) -> int:
        """Apply every rule once; return count of new facts added."""
        new_count = 0
        for rule in self.rules:
            new_count += self._apply_rule(rule)
        return new_count

    def _apply_rule(self, rule: Rule) -> int:
        """
        Find all subjects satisfying all conditions of a rule and
        add the conclusion fact for each.
        """
        # Start with subjects matching the first condition
        first_pred, first_objs = rule.conditions[0]
        if isinstance(first_objs, str):
            first_objs = {first_objs}

        candidates = set()
        for obj_val in first_objs:
            candidates |= self.kb.subjects_with(first_pred, obj_val)

        # Filter by remaining conditions
        for pred, objs in rule.conditions[1:]:
            if isinstance(objs, str):
                objs = {objs}
            filtered = set()
            for subj in candidates:
                subj_objs = self.kb.objects_of(subj, pred)
                if subj_objs & objs:
                    filtered.add(subj)
            candidates = filtered

        # Add conclusions
        new_count = 0
        conclusion_obj = rule.conclusion_obj
        for subj in candidates:
            obj_val = conclusion_obj if isinstance(conclusion_obj, str) else conclusion_obj(subj)
            fact = Fact(subj, rule.conclusion_predicate, obj_val)
            if self.kb.add(fact):
                new_count += 1
                if new_count <= 3:  # Log first few per rule
                    self.inference_log.append(
                        f"  [{rule.name}] {subj} → {rule.conclusion_predicate} = {obj_val}"
                    )

        if new_count > 3:
            self.inference_log.append(
                f"  [{rule.name}] ... and {new_count - 3} more"
            )
        return new_count


# ---------------------------------------------------------------------------
# Backward chaining engine
# ---------------------------------------------------------------------------
class BackwardChainer:
    """
    Goal-driven inference: given a query, determines whether it can
    be proved from known facts and rules, building an explanation trace.
    """

    def __init__(self, kb: KnowledgeBase, rules: list[Rule]):
        self.kb = kb
        self.rules = rules
        self.proof_trace: list[str] = []

    def prove(self, subject: str, predicate: str, obj: str) -> bool:
        """
        Attempt to prove that (subject, predicate, obj) holds.

        First checks direct facts, then attempts to satisfy via rules.
        Returns True if proved, False otherwise.
        """
        self.proof_trace = []
        return self._prove_recursive(subject, predicate, obj, depth=0)

    def _prove_recursive(
        self, subject: str, predicate: str, obj: str, depth: int
    ) -> bool:
        indent = "  " * depth

        # Base case: fact already in KB
        if self.kb.has(subject, predicate, obj):
            self.proof_trace.append(f"{indent}FACT: ({subject}, {predicate}, {obj})")
            return True

        # Try each rule whose conclusion matches the query
        for rule in self.rules:
            if rule.conclusion_predicate != predicate:
                continue
            expected_obj = rule.conclusion_obj
            if isinstance(expected_obj, str) and expected_obj != obj:
                continue

            self.proof_trace.append(
                f"{indent}TRY RULE [{rule.name}]: "
                f"to prove ({subject}, {predicate}, {obj})"
            )

            # Check all conditions
            all_met = True
            for cond_pred, cond_objs in rule.conditions:
                if isinstance(cond_objs, str):
                    cond_objs = {cond_objs}
                subj_objs = self.kb.objects_of(subject, cond_pred)
                if subj_objs & cond_objs:
                    matched = (subj_objs & cond_objs).pop()
                    self.proof_trace.append(
                        f"{indent}  CONDITION MET: ({subject}, {cond_pred}, {matched})"
                    )
                else:
                    self.proof_trace.append(
                        f"{indent}  CONDITION FAILED: ({subject}, {cond_pred}, ?)"
                        f" — has {subj_objs}, need one of {cond_objs}"
                    )
                    all_met = False
                    break

            if all_met:
                self.proof_trace.append(
                    f"{indent}PROVED via [{rule.name}]: "
                    f"({subject}, {predicate}, {obj})"
                )
                # Add the derived fact to the KB
                self.kb.add(Fact(subject, predicate, obj))
                return True

        self.proof_trace.append(
            f"{indent}CANNOT PROVE: ({subject}, {predicate}, {obj})"
        )
        return False

    def explain(self, subject: str, predicate: str, obj: str) -> str:
        """Prove a goal and return a human-readable explanation."""
        result = self.prove(subject, predicate, obj)
        status = "PROVED" if result else "NOT PROVED"
        lines = [
            f"Goal: ({subject}, {predicate}, {obj}) — {status}",
            "Proof trace:",
        ]
        lines.extend(self.proof_trace)
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Consistency checker
# ---------------------------------------------------------------------------
def check_consistency(kb: KnowledgeBase) -> list[str]:
    """
    Check the knowledge base for logical inconsistencies.

    Checks:
        1. No entity is both high_energy and low_energy
        2. No entity is both cool_down and high_energy
        3. No song has contradictory genre assignments
        4. Every song with a set category also has a tempo
    """
    issues = []

    # Check 1 & 2: Conflicting energy tiers
    for fact in kb.query(predicate="energy_tier"):
        subj = fact.subject
        tiers = kb.objects_of(subj, "energy_tier")
        if "high_energy" in tiers and "low_energy" in tiers:
            issues.append(f"CONFLICT: {subj} classified as both high and low energy")
        if "high_energy" in tiers and "cool_down" in tiers:
            issues.append(f"CONFLICT: {subj} classified as both high energy and cool-down")

    # Check 3: Song with multiple genres (warning, not necessarily error)
    for fact in kb.query(predicate="has_genre"):
        subj = fact.subject
        genres = kb.objects_of(subj, "has_genre")
        if len(genres) > 1:
            issues.append(f"WARNING: {subj} has multiple genres: {genres}")

    # Check 4: Set category requires tempo
    for fact in kb.query(predicate="suitable_for"):
        subj = fact.subject
        tempos = kb.objects_of(subj, "has_tempo")
        if not tempos:
            issues.append(f"INCOMPLETE: {subj} has set category but no tempo")

    if not issues:
        issues.append("No consistency issues detected.")

    return issues


# ---------------------------------------------------------------------------
# Standalone demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from kg_builder import VinylKnowledgeGraph

    # Build the KG
    kg = VinylKnowledgeGraph("data/collection.json")
    kg.load_data()
    kg.build_graph()

    # Load into KB
    kb = KnowledgeBase()
    n_loaded = kb.load_from_triples(kg.triples)
    print(f"Loaded {n_loaded} facts into knowledge base")

    # Forward chaining
    rules = get_domain_rules()
    fc = ForwardChainer(kb, rules)
    n_inferred = fc.run()
    print(f"\nForward chaining inferred {n_inferred} new facts")
    print("\nInference log:")
    for line in fc.inference_log[:20]:
        print(f"  {line}")

    # Backward chaining demo
    bc = BackwardChainer(kb, rules)
    test_song = "song:james_brown_nothing_beats_a_try_but_a_fail"
    explanation = bc.explain(test_song, "energy_tier", "high_energy")
    print(f"\n{explanation}")

    # Consistency check
    issues = check_consistency(kb)
    print("\nConsistency Check:")
    for issue in issues[:10]:
        print(f"  {issue}")
