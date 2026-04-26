import sys
try:
    import scipy.ndimage
    print("scipy.ndimage imported successfully")
except ImportError as e:
    print(f"ImportError: {e}")
