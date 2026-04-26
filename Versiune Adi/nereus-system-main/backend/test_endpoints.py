import time
import httpx

print("Test 1: /api/scan")
start = time.time()
res_scan = httpx.post("http://localhost:8000/api/scan/", json={
    "west": 21.20, "south": 45.74, "east": 21.30, "north": 45.77,
    "start_date": "2024-05-01", "end_date": "2024-05-10"
}, timeout=15.0)
duration = time.time() - start
print(f"Status: {res_scan.status_code}")
print(f"Duration: {duration:.2f}s")
data = res_scan.json()
print(f"Source: {data.get('scene_source')}, Alerts created: {len(data.get('alert_ids', []))}")

print("\nTest 2: /api/reports")
res_report = httpx.post("http://localhost:8000/api/reports/", json={
    "lat": 45.74,
    "lon": 21.59,
    "pollution_type": "ALGAL_BLOOM",
    "description": "Test"
})
print(f"Status: {res_report.status_code}")
print("Response:", res_report.json())
