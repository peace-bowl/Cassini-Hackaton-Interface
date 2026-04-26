import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml.anomaly_detector import score_pixel_anomaly

print("Testing direct model call:")
try:
    r1 = score_pixel_anomaly(ndwi=0.6, ndci=-0.15, turbidity=0.8)
    print("Clean water result:", r1)
    
    r2 = score_pixel_anomaly(ndwi=0.3, ndci=0.12, turbidity=2.5)
    print("Polluted water result:", r2)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
