import pandas as pd
import io
import sys
sys.path.insert(0, '.')
from app.services.preprocessor import clean_dataframe

data = [
    {"timestamp": "2026-07-10 18:00", "gate": "Gate A", "crowd_count": 8500, "incident_type": "", "volunteers_available": 25, "weather": "Sunny", "language": "English"},
    {"timestamp": "2026-07-10 18:00", "gate": "Gate B", "crowd_count": None, "incident_type": "Medical Emergency", "volunteers_available": None, "weather": None, "language": ""},
    {"timestamp": "2026-07-10 18:00", "gate": "Gate C", "crowd_count": 4500, "incident_type": None, "volunteers_available": 15, "weather": "", "language": None},
]

df = pd.DataFrame(data)
print("=== Raw DataFrame ===")
print(df)
print()
print("=== DataFrame dtypes ===")
print(df.dtypes)
print()

records = clean_dataframe(df)
print("=== Cleaned Records ===")
for i, r in enumerate(records):
    print(f"Row {i}: {r}")
    for k, v in r.items():
        if v is None or (isinstance(v, float) and pd.isna(v)):
            print(f"  WARNING: {k} = {v!r} (type={type(v).__name__})")

print()
print("=== Pydantic Test ===")
from app.schemas import StadiumDataRow
for i, r in enumerate(records):
    try:
        obj = StadiumDataRow(**r)
        print(f"Row {i}: OK")
    except Exception as e:
        print(f"Row {i}: FAIL - {e}")
