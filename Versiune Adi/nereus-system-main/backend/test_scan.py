import requests
import json
try:
    res = requests.post("http://localhost:8000/api/scan/", json={"west":21.2,"south":45.7,"east":21.3,"north":45.8,"start_date":"2024-08-01","end_date":"2024-08-31"})
    print("Status:", res.status_code)
    data = res.json()
    alerts = data.get("alerts", [])
    print("Found alerts:", len(alerts))
    for a in alerts:
        print("Alert ML:", a.get("ml_confidence"), a.get("ml_pollution_type"))
except Exception as e:
    print(e)
