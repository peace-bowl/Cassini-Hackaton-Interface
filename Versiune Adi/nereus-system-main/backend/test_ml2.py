from app.ml.anomaly_detector import score_pixel_anomaly
print("Testing score_pixel_anomaly for current synthetic dot")
try:
    result = score_pixel_anomaly(ndwi=0.5, ndci=0.21, turbidity=1.5)
    print("SUCCESS:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
