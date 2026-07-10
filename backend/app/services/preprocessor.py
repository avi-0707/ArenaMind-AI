import math
import logging
from typing import Any, Dict, List

import pandas as pd

logger = logging.getLogger(__name__)

# Columns that should be treated as strings
STRING_COLS = ["timestamp", "gate", "incident_type", "language", "weather"]
# Columns that should be integers
INT_COLS = ["crowd_count", "volunteers_available"]
# All required columns (must exist after normalization)
REQUIRED_COLS = {"timestamp", "gate", "crowd_count", "volunteers_available"}
# Optional string columns and their defaults
OPTIONAL_STRING_DEFAULTS = {
    "incident_type": "None",
    "language": "Unknown",
    "weather": "Unknown",
}


def _is_nan(value: Any) -> bool:
    """Return True if the value is NaN, None, or NaT."""
    if value is None:
        return True
    try:
        return bool(pd.isna(value))
    except (TypeError, ValueError):
        return False


def clean_dataframe(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Fully clean and normalize a raw Pandas DataFrame before Pydantic validation.
    """
    # 1. Normalize column names
    df.columns = [str(c).strip().lower() for c in df.columns]
    logger.info(f"Detected columns: {list(df.columns)}")

    # 2. Check required columns
    missing_required = REQUIRED_COLS - set(df.columns)
    if missing_required:
        raise ValueError(
            f"Missing required columns: {sorted(missing_required)}. "
            f"File must contain: {sorted(REQUIRED_COLS)}"
        )

    # 3. Inject missing optional columns with defaults
    for col, default in OPTIONAL_STRING_DEFAULTS.items():
        if col not in df.columns:
            df[col] = default

    # 4. Coerce integer columns
    for col in INT_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    # 5. Clean string columns (replace NaN, None, NaT)
    for col in STRING_COLS:
        if col not in df.columns:
            continue
            
        default = OPTIONAL_STRING_DEFAULTS.get(col, "Unknown")
        
        # Replace Pandas missing values (NaN, None, NaT) with default
        df[col] = df[col].fillna(default)
        
        # Also replace empty strings or string representation of nulls
        def _clean_str(val: Any) -> str:
            s = str(val).strip()
            if s == "" or s.lower() in ("nan", "none", "nat", "<na>"):
                return default
            return s
            
        df[col] = df[col].apply(_clean_str)

    # 6. Convert timestamp to string safely
    if "timestamp" in df.columns:
        df["timestamp"] = df["timestamp"].apply(
            lambda v: v.isoformat() if hasattr(v, "isoformat") else str(v).strip()
        )

    # 7. Convert DataFrame to list of dicts directly
    # This avoids df.iterrows() which can coerce types into a single pd.Series dtype
    records = df.to_dict(orient="records")
    
    logger.info(f"Preprocessing complete: {len(records)} clean records ready for validation")
    return records
