"""
Spectral index computation for Sentinel-2 L2A bands.

Band reference (Sentinel-2 L2A, 10-20 m resolution):
  B03 — Green  (560 nm)
  B04 — Red    (665 nm)
  B05 — Red-Edge (705 nm)  [20 m]
  B08 — NIR    (842 nm)   [10 m]
"""
from __future__ import annotations

import numpy as np
from numpy.typing import NDArray


def compute_ndwi(b03: NDArray, b08: NDArray) -> NDArray:
    """
    Normalised Difference Water Index (McFeeters 1996).
    NDWI = (Green - NIR) / (Green + NIR)
    Positive values indicate open water.
    """
    denom = b03 + b08
    # Avoid division by zero
    return np.where(denom != 0, (b03 - b08) / denom, 0.0)


def water_mask(ndwi: NDArray, threshold: float = 0.1) -> NDArray:
    """Return boolean mask: True where pixels are water (NDWI > threshold)."""
    return ndwi > threshold


def compute_ndci(b05: NDArray, b04: NDArray) -> NDArray:
    """
    Normalised Difference Chlorophyll Index (Mishra & Mishra 2012).
    NDCI = (RedEdge - Red) / (RedEdge + Red)
    Positive values indicate elevated chlorophyll / algal bloom.
    """
    denom = b05 + b04
    return np.where(denom != 0, (b05 - b04) / denom, 0.0)


def compute_turbidity(b04: NDArray, b03: NDArray) -> NDArray:
    """
    Simple turbidity proxy: Red / Green ratio.
    Higher ratio indicates increased suspended sediment / turbidity.
    """
    denom = b03.astype(float)
    return np.where(denom != 0, b04 / denom, 1.0)
