from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class ExplainRequest:
    payload: Dict[str, Any]


@dataclass
class ExplainResponse:
    decision: str
    shap_values: Dict[str, float] = field(default_factory=dict)
    base_value: Optional[float] = None
    probability: Optional[float] = None

