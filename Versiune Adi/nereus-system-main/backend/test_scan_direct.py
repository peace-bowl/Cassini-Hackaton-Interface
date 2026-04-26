from app.api.scan import run_scan, ScanRequest
from app.database import engine
from sqlmodel import Session
import logging

logging.basicConfig(level=logging.DEBUG)

def test():
    req = ScanRequest(west=21.2, south=45.7, east=21.3, north=45.8, start_date="2024-08-01", end_date="2024-08-31")
    with Session(engine) as session:
        result = run_scan(req, session)
        print("Success, created:", len(result.alert_ids), "alerts")

test()
