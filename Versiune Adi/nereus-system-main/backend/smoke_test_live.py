# -*- coding: utf-8 -*-
import time
import httpx

BASE = "https://nereus-system.onrender.com"

print("=" * 60)
print("NEREUS SYSTEM - LIVE SMOKE TESTS")
print("=" * 60)

client = httpx.Client(follow_redirects=True, timeout=90.0)

# Test 1
print("\nTest 1: Backend Health")
print(f"  GET {BASE}/api/health/")
start = time.time()
try:
    r = client.get(f"{BASE}/api/health/")
    dur = time.time() - start
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.text[:200]}")
    print(f"  Duration: {dur:.1f}s")
    if dur > 60:
        print("  WARNING: Cold start took >60s")
    else:
        print("  PASS")
except Exception as e:
    print(f"  FAIL: {e}")

# Test 2
print("\nTest 2: Backend Alerts (seed data)")
print(f"  GET {BASE}/api/alerts/")
try:
    r = client.get(f"{BASE}/api/alerts/")
    data = r.json()
    print(f"  Status: {r.status_code}")
    print(f"  Alert count: {len(data)}")
    if len(data) >= 1:
        print(f"  First alert: {data[0].get('pollution_type', 'N/A')} at ({data[0].get('lat')}, {data[0].get('lon')})")
        print("  PASS")
    else:
        print("  WARNING: No alerts found (seed data may not have run)")
except Exception as e:
    print(f"  FAIL: {e}")

# Test 3
print("\nTest 3: Scan Endpoint (DEMO_MODE)")
print(f"  POST {BASE}/api/scan/")
start = time.time()
try:
    r = client.post(f"{BASE}/api/scan/", json={
        "west": 21.20, "south": 45.74, "east": 21.30, "north": 45.77,
        "start_date": "2024-05-01", "end_date": "2024-05-10"
    })
    dur = time.time() - start
    print(f"  Status: {r.status_code}")
    data = r.json()
    print(f"  Source: {data.get('scene_source')}")
    print(f"  Alerts created: {len(data.get('alert_ids', []))}")
    print(f"  Duration: {dur:.1f}s")
    if r.status_code == 200 and dur < 10:
        print("  PASS")
    else:
        print(f"  WARNING: status={r.status_code}, duration={dur:.1f}s")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n" + "=" * 60)
print("SMOKE TESTS COMPLETE")
print("=" * 60)
