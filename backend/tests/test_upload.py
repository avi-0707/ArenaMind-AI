import pandas as pd
import json
import requests
import os

os.makedirs('test_files', exist_ok=True)

# Data with missing values, NaNs, empty cells
data = [
    {"timestamp": "2026-07-10 18:00", "gate": "Gate A", "crowd_count": 8500, "incident_type": "", "volunteers_available": 25, "weather": "Sunny", "language": "English"},
    {"timestamp": "2026-07-10 18:00", "gate": "Gate B", "crowd_count": None, "incident_type": "Medical Emergency", "volunteers_available": None, "weather": None, "language": ""},
    {"timestamp": "2026-07-10 18:00", "gate": "Gate C", "crowd_count": 4500, "incident_type": None, "volunteers_available": 15, "weather": "", "language": None},
]

df = pd.DataFrame(data)

df.to_csv('test_files/test.csv', index=False)
df.to_excel('test_files/test.xlsx', index=False)
df.to_json('test_files/test.json', orient='records')

print("Created test files with missing/empty values.")

BASE_URL = 'http://127.0.0.1:8000/api'

def test_upload(file_path):
    print(f"\n--- Testing {file_path} ---")
    url = f'{BASE_URL}/upload'
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        response = requests.post(url, files=files)
        print(f"Status: {response.status_code}")
        try:
            body = response.json()
            if response.status_code == 200:
                print(f"Success: {len(body)} records returned")
                for i, rec in enumerate(body):
                    print(f"  Row {i}: incident_type={rec.get('incident_type')!r}, weather={rec.get('weather')!r}, language={rec.get('language')!r}")
            else:
                print(f"Error: {json.dumps(body, indent=2)}")
        except Exception as e:
            print(f"Response text: {response.text}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

test_upload('test_files/test.csv')
test_upload('test_files/test.xlsx')
test_upload('test_files/test.json')
print("\n=== ALL UPLOAD TESTS PASSED ===")
