import numpy as np
import rasterio
from rasterio.transform import from_origin

rows, cols = np.mgrid[0:2, 0:2]
transform = from_origin(0, 0, 10, 10)
xs, ys = rasterio.transform.xy(transform, rows, cols)
print(np.array(xs).shape)
