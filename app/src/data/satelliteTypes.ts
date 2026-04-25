/**
 * Satellite Layer Types & Configuration
 * ──────────────────────────────────────
 * Defines the available Copernicus Sentinel-2 derived indices
 * and their visual styling for the map overlay system.
 */

/** Available satellite layer IDs */
export type SatelliteLayerId = 'standard' | 'ndwi' | 'ndvi' | 'ndsi' | 'swir';

/** Configuration for a single satellite layer */
export interface SatelliteLayerConfig {
  id: SatelliteLayerId;
  name: string;
  fullName: string;
  description: string;
  /** Property key in GeoJSON feature properties to read the index value */
  propertyKey: string;
  /** Color function: given a normalized value (0–1), returns a CSS color */
  getColor: (value: number, surfaceType?: string) => string;
  /** Legend gradient stops */
  legendStops: { color: string; label: string }[];
  /** For SWIR categorical legend */
  legendCategories?: { color: string; label: string }[];
}

/**
 * NDWI color ramp — matches Copernicus Browser NDWI palette
 * Dry land (brown) → moist soil (grey-green) → surface water (blue) → deep water (navy)
 */
function ndwiColor(value: number): string {
  if (value < 0.0)  return 'rgba(138,  97,  46, 0.75)';
  if (value < 0.15) return 'rgba(186, 148,  80, 0.70)';
  if (value < 0.30) return 'rgba(112, 168, 137, 0.72)';
  if (value < 0.50) return 'rgba( 38, 139, 210, 0.78)';
  if (value < 0.70) return 'rgba(  3,  93, 186, 0.85)';
  return                    'rgba(  3,  53, 140, 0.90)';
}

/**
 * NDVI color ramp — Copernicus red→yellow→green palette
 */
function ndviColor(value: number): string {
  if (value < 0.1)  return 'rgba(215,  48,  39, 0.75)';
  if (value < 0.2)  return 'rgba(244, 109,  67, 0.72)';
  if (value < 0.3)  return 'rgba(253, 174,  97, 0.72)';
  if (value < 0.5)  return 'rgba(166, 217, 106, 0.75)';
  if (value < 0.7)  return 'rgba( 82, 188, 144, 0.78)';
  return                    'rgba( 26, 152,  80, 0.85)';
}

/**
 * NDSI color ramp — dark → pale-blue → white
 */
function ndsiColor(value: number): string {
  if (value < 0.1)  return 'rgba( 30,  30,  50, 0.20)';
  if (value < 0.3)  return 'rgba( 74, 113, 168, 0.55)';
  if (value < 0.5)  return 'rgba(116, 169, 207, 0.65)';
  if (value < 0.7)  return 'rgba(166, 217, 247, 0.75)';
  return                    'rgba(215, 240, 255, 0.85)';
}

/**
 * SWIR false-colour — categorical based on surface type
 */
function swirColor(value: number, surfaceType?: string): string {
  switch (surfaceType) {
    case 'water':      return 'rgba(  3,  30, 100, 0.85)';
    case 'vegetation': return 'rgba( 44, 188,  66, 0.75)';
    case 'soil':       return 'rgba(180, 100, 120, 0.72)';
    default:
      if (value > 0.5) return 'rgba(  3,  30, 100, 0.80)';
      if (value > 0.3) return 'rgba( 44, 188,  66, 0.70)';
      return                  'rgba(180, 100, 120, 0.65)';
  }
}

/** Full configuration for all satellite layers */
export const SATELLITE_LAYERS: SatelliteLayerConfig[] = [
  {
    id: 'standard',
    name: 'Standard',
    fullName: 'Standard Map',
    description: 'Default base map without satellite overlays',
    propertyKey: '',
    getColor: () => 'transparent',
    legendStops: [],
  },
  {
    id: 'ndwi',
    name: 'NDWI',
    fullName: 'Normalized Difference Water Index',
    description: 'Maps water bodies and surface moisture content',
    propertyKey: 'ndwi',
    getColor: ndwiColor,
    legendStops: [
      { color: '#8a612e', label: 'Dry' },
      { color: '#ba9450', label: 'Moist Soil' },
      { color: '#70a889', label: 'Wetland' },
      { color: '#268bd2', label: 'Surface Water' },
      { color: '#035dba', label: 'Open Water' },
      { color: '#03358c', label: 'Deep Water' },
    ],
  },
  {
    id: 'ndvi',
    name: 'NDVI',
    fullName: 'Normalized Difference Vegetation Index',
    description: 'Vegetation health and density near water bodies',
    propertyKey: 'ndvi',
    getColor: ndviColor,
    legendStops: [
      { color: '#d73027', label: 'Bare' },
      { color: '#f46d43', label: 'Sparse' },
      { color: '#fdae61', label: 'Low' },
      { color: '#a6d96a', label: 'Moderate' },
      { color: '#52bc90', label: 'Healthy' },
      { color: '#1a9850', label: 'Dense' },
    ],
  },
  {
    id: 'ndsi',
    name: 'NDSI',
    fullName: 'Normalized Difference Snow Index',
    description: 'Snow cover and ice detection',
    propertyKey: 'ndsi',
    getColor: ndsiColor,
    legendStops: [
      { color: '#1e1e32', label: 'None' },
      { color: '#4a71a8', label: 'Trace' },
      { color: '#74a9cf', label: 'Light' },
      { color: '#a6d9f7', label: 'Heavy' },
      { color: '#d7f0ff', label: 'Ice' },
    ],
  },
  {
    id: 'swir',
    name: 'SWIR',
    fullName: 'Short-Wave Infrared Composite',
    description: 'False-color highlighting soil moisture and saturation',
    propertyKey: 'ndwi', // uses ndwi value for fallback gradient
    getColor: swirColor,
    legendStops: [],
    legendCategories: [
      { color: '#031e64', label: 'Water' },
      { color: '#2cbc42', label: 'Vegetation' },
      { color: '#b46478', label: 'Bare Soil' },
    ],
  },
];

/** Get a satellite layer config by ID */
export function getSatelliteLayer(id: SatelliteLayerId): SatelliteLayerConfig {
  return SATELLITE_LAYERS.find((l) => l.id === id) ?? SATELLITE_LAYERS[0];
}

/** Get tooltip text for an index value */
export function getIndexDescription(layerId: SatelliteLayerId, value: number): string {
  switch (layerId) {
    case 'ndwi':
      if (value >= 0.7) return 'Open Water Body';
      if (value >= 0.5) return 'High Water Content';
      if (value >= 0.3) return 'Moderate Moisture';
      if (value >= 0.1) return 'Low Moisture';
      return 'Dry Surface';
    case 'ndvi':
      if (value >= 0.7) return 'Dense, Healthy Vegetation';
      if (value >= 0.5) return 'Moderate Vegetation';
      if (value >= 0.3) return 'Sparse Vegetation';
      if (value >= 0.1) return 'Stressed Vegetation';
      return 'Bare Soil / No Vegetation';
    case 'ndsi':
      if (value >= 0.7) return 'Dense Snow / Ice Cover';
      if (value >= 0.5) return 'Heavy Snow';
      if (value >= 0.3) return 'Moderate Snow';
      if (value >= 0.1) return 'Trace Snow';
      return 'No Snow Detected';
    case 'swir':
      return 'False-Color Infrared Composite';
    default:
      return '';
  }
}
