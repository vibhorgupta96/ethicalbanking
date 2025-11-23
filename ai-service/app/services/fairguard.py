from __future__ import annotations

from collections import Counter, defaultdict, deque
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, List, Optional
import random


class FairGuardMonitor:
    """
    Tracks live production decisions to surface parity gaps, drift, and SHAP outliers.

    This is the Layer-2 guardian described in the hackathon brief. It maintains a
    rolling window of decisions, calculates demographic parity differences, estimates
    probability drift, and highlights the SHAP features that consistently depress
    approvals. Whenever a guardrail is exceeded the monitor toggles a circuit breaker
    so the gateway can route decisions to human review.
    """

    def __init__(
        self,
        protected_attributes: Optional[List[str]] = None,
        parity_threshold: float = 0.15,
        drift_threshold: float = 0.2,
        window_size: int = 200,
        min_samples: int = 5,
    ):
        self.protected_attributes = protected_attributes or [
            "GENDER",
            "MARITALSTATUS",
            "EDUCATION",
        ]
        self.parity_threshold = parity_threshold
        self.drift_threshold = drift_threshold
        self.window_size = window_size
        self.min_samples = min_samples

        self._lock = Lock()
        self._events = deque(maxlen=window_size)
        self._dimension_stats: Dict[str, Any] = {
            attr: defaultdict(lambda: {"count": 0, "approved": 0})
            for attr in self.protected_attributes
        }
        self._shap_counter: Counter[str] = Counter()
        
        # Seed initial data for demo purposes
        # self.seed_simulation_data()

    def seed_simulation_data(self):
        """
        Populates the monitor with synthetic data to demonstrate:
        1. Probability Drift (High -> Low probability)
        2. Demographic Parity Alert (Gender bias)
        """
        half_window = self.window_size // 2

        # Phase 1: Stable period (High probability, balanced approvals)
        # Fills the first half of the window (the "oldest" events)
        for _ in range(half_window):
            gender = random.choice(["M", "F"])
            prob = random.uniform(0.75, 0.95)
            # High approval rate for everyone
            decision = "Approved" if random.random() > 0.1 else "Rejected"
            
            payload = {
                "GENDER": gender,
                "MARITALSTATUS": random.choice(["Married", "Single"]),
                "EDUCATION": random.choice(["Graduate", "Undergrad"])
            }
            self.record_event(payload, decision, prob)

        # Phase 2: Drift period (Lower probability, biased approvals)
        # Fills the second half of the window (the "newest" events)
        for _ in range(half_window):
            gender = random.choice(["M", "F"])
            prob = random.uniform(0.35, 0.55)
            
            if gender == "M":
                # Males still get approved often despite lower probability
                decision = "Approved" if random.random() > 0.3 else "Rejected"
            else:
                # Females get rejected almost always
                decision = "Rejected" if random.random() > 0.1 else "Approved"
                
            payload = {
                "GENDER": gender,
                "MARITALSTATUS": random.choice(["Married", "Single"]),
                "EDUCATION": random.choice(["Graduate", "Undergrad"])
            }
            self.record_event(payload, decision, prob)

    def record_event(
        self,
        payload: Dict[str, Any],
        decision: str,
        probability: float,
        shap_values: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        normalized_payload = payload or {}
        approved = str(decision).lower() == "approved"
        protected_snapshot = {
            attr: normalized_payload.get(attr) for attr in self.protected_attributes
        }

        with self._lock:
            self._events.append(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "probability": float(probability),
                    "approved": approved,
                    "protected": protected_snapshot,
                }
            )

            for attr, value in protected_snapshot.items():
                bucket = self._dimension_stats[attr][value or "UNDECLARED"]
                bucket["count"] += 1
                if approved:
                    bucket["approved"] += 1

            if shap_values:
                for feature, weight in shap_values.items():
                    if weight < 0:
                        self._shap_counter[feature] += abs(weight)

            snapshot = self._build_summary_locked()
            return {
                "status": "ALERT"
                if snapshot["circuitBreaker"]["active"]
                else "NORMAL",
                "circuitBreakerActive": snapshot["circuitBreaker"]["active"],
                "reason": snapshot["circuitBreaker"]["reason"],
                "alerts": snapshot["alerts"],
                "driftScore": snapshot["drift"]["score"],
                "windowSize": snapshot["windowSize"],
            }

    def summary(self) -> Dict[str, Any]:
        with self._lock:
            return self._build_summary_locked()

    def _build_summary_locked(self) -> Dict[str, Any]:
        window_size = len(self._events)
        alerts: List[str] = []
        dimensions = []

        for attr, buckets in self._dimension_stats.items():
            groups = []
            rates = []
            total = 0
            for value, stats in buckets.items():
                count = stats["count"]
                approved = stats["approved"]
                total += count
                rate = (approved / count) if count else 0.0
                rates.append(rate)
                groups.append(
                    {
                        "value": value,
                        "count": count,
                        "approvalRate": round(rate, 3),
                    }
                )

            parity_gap = round(
                (max(rates) - min(rates)) if len(rates) >= 2 else 0.0, 3
            )
            status = (
                "ALERT"
                if (total >= self.min_samples and parity_gap > self.parity_threshold)
                else "NORMAL"
            )
            if status == "ALERT":
                alerts.append(
                    f"{attr} parity gap {parity_gap:.2f} exceeds {self.parity_threshold:.2f}"
                )

            dimensions.append(
                {
                    "attribute": attr,
                    "parityGap": parity_gap,
                    "threshold": self.parity_threshold,
                    "status": status,
                    "sampleSize": total,
                    "groups": groups,
                }
            )

        drift_score = self._drift_score_locked()
        drift_status = "ALERT" if drift_score > self.drift_threshold else "NORMAL"
        if drift_status == "ALERT":
            alerts.append(
                f"Drift score {drift_score:.2f} exceeds {self.drift_threshold:.2f}"
            )

        circuit_active = bool(alerts)
        shap_watchlist = [
            {"feature": feature, "weight": round(weight, 4)}
            for feature, weight in self._shap_counter.most_common(5)
        ]

        return {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "windowSize": window_size,
            "dimensions": dimensions,
            "drift": {
                "score": drift_score,
                "threshold": self.drift_threshold,
                "status": drift_status,
            },
            "alerts": alerts,
            "circuitBreaker": {
                "active": circuit_active,
                "reason": alerts[0] if alerts else None,
            },
            "shapWatchlist": shap_watchlist,
        }

    def _drift_score_locked(self) -> float:
        total_events = len(self._events)
        if total_events < 5:
            return 0.0

        midpoint = total_events // 2
        first_half = list(self._events)[:midpoint]
        second_half = list(self._events)[midpoint:]
        if not first_half or not second_half:
            return 0.0

        avg_first = sum(event["probability"] for event in first_half) / len(first_half)
        avg_second = sum(event["probability"] for event in second_half) / len(
            second_half
        )
        return round(abs(avg_second - avg_first), 3)

