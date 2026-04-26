from app.ml.anomaly_detector import score_pixel_anomaly
import logging

logging.basicConfig(level=logging.DEBUG)

print("Testing score_pixel_anomaly")
try:
    result = score_pixel_anomaly(ndwi=0.5, ndci=0.2, turbidity=2.0)
    print("SUCCESS:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
