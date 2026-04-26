import uvicorn
from app.main import app
import threading
import time
import requests

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="error")

t = threading.Thread(target=run_server, daemon=True)
t.start()

time.sleep(3) # Wait for server to start

print("Test 1: Clean water")
r1 = requests.post("http://127.0.0.1:8001/api/ml/analyze", json={"ndwi": 0.6, "ndci": -0.15, "turbidity": 0.8})
print(r1.json())

print("\nTest 2: Polluted water")
r2 = requests.post("http://127.0.0.1:8001/api/ml/analyze", json={"ndwi": 0.3, "ndci": 0.12, "turbidity": 2.5})
print(r2.json())

print("\nTest 3: Scan pipeline integration")
r3 = requests.post("http://127.0.0.1:8001/api/scan", json={"west": 21.20, "south": 45.74, "east": 21.30, "north": 45.77})
res3 = r3.json()
print("Scan response keys:", res3.keys())
print("Number of alerts:", len(res3.get("alert_ids", [])))

r4 = requests.get("http://127.0.0.1:8001/api/alerts")
alerts = r4.json()
if alerts:
    print("\nFirst alert details:")
    a = alerts[0]
    print(f"ID: {a['id']}, ML Conf: {a.get('ml_confidence')}, ML Type: {a.get('ml_pollution_type')}")
else:
    print("\nNo alerts found.")
