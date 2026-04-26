# -*- coding: utf-8 -*-
"""Live production test against Render backend."""
import requests
import json

BASE = "https://nereus-system.onrender.com"

print("[LIVE TEST] Feature 2 on Render\n")

# Test 1: Subscriber count
print("1. GET /api/subscribers/count")
r = requests.get(f"{BASE}/api/subscribers/count")
print(f"   Status: {r.status_code} -> {r.json()}")

# Test 2: Subscribe
print("\n2. POST /api/subscribe")
r = requests.post(f"{BASE}/api/subscribe", json={
    "email": "hackathon-demo@nereus.dev",
    "name": "CASSINI Demo",
    "home_city": "Timisoara",
    "home_lat": 45.752,
    "home_lon": 21.23,
    "notification_type": "immediate",
})
print(f"   Status: {r.status_code}")
sub = r.json()
print(f"   Token: {sub.get('unsubscribe_token', 'N/A')}")

# Test 3: Subscriber count again
print("\n3. GET /api/subscribers/count (after subscribe)")
r = requests.get(f"{BASE}/api/subscribers/count")
print(f"   Status: {r.status_code} -> {r.json()}")

# Test 4: Create zone
print("\n4. POST /api/zones/")
polygon = {
    "type": "Polygon",
    "coordinates": [[[21.2, 45.7], [21.3, 45.7], [21.3, 45.8], [21.2, 45.8], [21.2, 45.7]]]
}
r = requests.post(f"{BASE}/api/zones/", json={
    "name": "Bega River Monitor",
    "geometry_geojson": json.dumps(polygon),
})
print(f"   Status: {r.status_code} -> {r.json().get('name', 'error')}")

# Test 5: List zones
print("\n5. GET /api/zones/")
r = requests.get(f"{BASE}/api/zones/")
print(f"   Status: {r.status_code} -> {len(r.json())} zones")

# Test 6: Unsubscribe
print("\n6. DELETE /api/subscribe/{token}")
token = sub.get("unsubscribe_token")
if token:
    r = requests.delete(f"{BASE}/api/subscribe/{token}")
    print(f"   Status: {r.status_code} -> {r.json()}")

print("\n[DONE] All live tests complete.")
