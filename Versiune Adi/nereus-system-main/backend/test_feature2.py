# -*- coding: utf-8 -*-
"""Test checklist for Feature 2 -- run against local backend on port 8000."""
import requests
import json
import sys

BASE = "http://localhost:8000"
PASS = 0
FAIL = 0

def test(name, fn):
    global PASS, FAIL
    try:
        fn()
        print(f"  [PASS] {name}")
        PASS += 1
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        FAIL += 1

def test_subscribe():
    res = requests.post(f"{BASE}/api/subscribe", json={
        "email": "test@nereus.dev",
        "name": "Test User",
        "home_city": "Timisoara",
        "home_lat": 45.752,
        "home_lon": 21.23,
        "notification_type": "immediate",
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert "unsubscribe_token" in data, f"Missing unsubscribe_token: {data}"
    assert data["email"] == "test@nereus.dev"
    return data

def test_subscriber_count():
    res = requests.get(f"{BASE}/api/subscribers/count")
    assert res.status_code == 200
    data = res.json()
    assert "count" in data
    assert data["count"] >= 1, f"Expected count >= 1, got {data['count']}"

def test_create_zone():
    polygon = {
        "type": "Polygon",
        "coordinates": [[[21.2, 45.7], [21.3, 45.7], [21.3, 45.8], [21.2, 45.8], [21.2, 45.7]]]
    }
    res = requests.post(f"{BASE}/api/zones/", json={
        "name": "Test Zone A",
        "geometry_geojson": json.dumps(polygon),
        "created_by_email": "test@nereus.dev",
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["name"] == "Test Zone A"
    assert data["active"] is True
    return data

def test_list_zones():
    res = requests.get(f"{BASE}/api/zones/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1, f"Expected at least 1 zone, got {len(data)}"

def test_scan_with_notifications():
    res = requests.post(f"{BASE}/api/scan/", json={
        "west": 21.20, "south": 45.74, "east": 21.30, "north": 45.77,
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "alert_ids" in data

def test_unsubscribe():
    sub_res = requests.post(f"{BASE}/api/subscribe", json={
        "email": "unsub-test@nereus.dev",
        "name": "Unsub Test",
        "home_city": "Timisoara",
        "home_lat": 45.752,
        "home_lon": 21.23,
    })
    token = sub_res.json()["unsubscribe_token"]
    res = requests.delete(f"{BASE}/api/subscribe/{token}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["message"] == "Unsubscribed successfully"

print("\n[TEST] Feature 2 -- API Test Checklist\n")
test("Test 2: POST /api/subscribe returns subscriber with token", test_subscribe)
test("Test 3: GET /api/subscribers/count returns count >= 1", test_subscriber_count)
test("Test 1: POST /api/zones creates monitoring zone", test_create_zone)
test("Test 1b: GET /api/zones lists active zones", test_list_zones)
test("Test 4: POST /api/scan triggers scan with email logic", test_scan_with_notifications)
test("Test 6: DELETE /api/subscribe/{token} unsubscribes", test_unsubscribe)

print(f"\n{'='*50}")
print(f"  Results: {PASS} passed, {FAIL} failed")
print(f"{'='*50}\n")

if FAIL > 0:
    sys.exit(1)
