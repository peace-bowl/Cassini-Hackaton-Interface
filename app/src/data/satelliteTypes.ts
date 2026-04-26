/**
 * Satellite Layer Types & Configuration
 * ──────────────────────────────────────
 * Defines the available Copernicus Sentinel-2 derived indices
 * and their visual styling for the map overlay system.
 */

/** Available satellite layer IDs */
export type SatelliteLayerId = 'standard' | 'satellite' | 'ndwi' | 'ndvi' | 'swir';

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
 * NDWI — Dan's turbidity interpretation
 * Clear water (#003366) ↔ Turbid/sediment (#ADD8E6)
 */
function ndwiColor(value: number): string {
  if (value < 0.15) return 'rgba(0, 0, 0, 0)';
  if (value < 0.30) return 'rgba(210, 230, 255, 0.82)'; // turbid
  if (value < 0.50) return 'rgba(140, 195, 245, 0.85)'; // moderate
  if (value < 0.70) return 'rgba( 30, 100, 190, 0.88)'; // surface water
  if (value < 0.85) return 'rgba( 10,  60, 150, 0.90)'; // open water
  return 'rgba(  2,  30, 102, 0.93)';                    // deep water (#003366)
}

/**
 * NDVI — Dan's algae/silt interpretation using ndvi_water property
 * Silt/waste (brown #8B4513) ↔ Algae bloom (green #228B22)
 */
function ndviColor(value: number, _surfaceType?: string): string {
  // value here corresponds to ndvi_water (0–1)
  if (value < 0.15) return 'rgba(110,  55,  15, 0.80)'; // dark silt
  if (value < 0.30) return 'rgba(139,  69,  19, 0.78)'; // silt (#8B4513)
  if (value < 0.50) return 'rgba(160,  95,  40, 0.75)'; // mixed
  if (value < 0.65) return 'rgba( 80, 160,  50, 0.78)'; // emerging algae
  if (value < 0.80) return 'rgba( 44, 139,  40, 0.82)'; // algae (#228B22)
  return 'rgba( 20, 100,  10, 0.88)';                    // dense bloom
}


/**
 * SWIR — Dan's surface type categorical
 * Water (#000000/navy) | Vegetation (#32CD32) | Urban (#A52A2A)
 */
function swirColor(value: number, surfaceType?: string): string {
  switch (surfaceType) {
    case 'water':      return 'rgba(  5,  20,  80, 0.88)';
    case 'vegetation': return 'rgba( 50, 205,  50, 0.80)';
    case 'urban':      return 'rgba(165,  42,  42, 0.78)';
    default:
      if (value > 0.5) return 'rgba(  5,  20,  80, 0.85)';
      if (value > 0.3) return 'rgba( 50, 205,  50, 0.75)';
      return 'rgba(180, 120,  60, 0.70)';
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
    id: 'satellite',
    name: 'Satellite',
    fullName: 'True Color Imagery',
    description: 'Copernicus Sentinel-2 true color composite without analysis overlays',
    propertyKey: '',
    getColor: () => 'transparent',
    legendStops: [],
  },
  {
    id: 'ndwi',
    name: 'NDWI',
    fullName: 'Normalized Difference Water Index',
    description: 'Turbidity detection — identifies suspended sediments and clear water zones',
    propertyKey: 'ndwi',
    getColor: ndwiColor,
    legendStops: [
      { color: '#3ca85c', label: 'Land' },
      { color: '#d2e6ff', label: 'Turbid' },      // Dan: #ADD8E6
      { color: '#8cc3f5', label: 'Moderate' },
      { color: '#1e64be', label: 'Surface Water' },
      { color: '#0a3c96', label: 'Open Water' },
      { color: '#021e66', label: 'Clear' },       // Dan: #003366
    ],
  },
  {
    id: 'ndvi',
    name: 'NDVI',
    fullName: 'Silt & Algae Index (ndvi_water)',
    description: 'Silt/waste vs algae bloom detection in water bodies',
    propertyKey: 'ndvi_water',
    getColor: ndviColor,
    legendStops: [
      { color: '#6e370f', label: 'Silt/Waste' },  // Dan: #8B4513 brown
      { color: '#8b4513', label: 'Silt' },
      { color: '#a05f28', label: 'Mixed' },
      { color: '#50a032', label: 'Algae' },
      { color: '#2c8b28', label: 'Bloom' },       // Dan: #228B22 green
      { color: '#14640a', label: 'Dense' },
    ],
  },

  {
    id: 'swir',
    name: 'SWIR',
    fullName: 'Short-Wave Infrared Composite',
    description: 'Surface type classification — water, vegetation, and urban/soil zones',
    propertyKey: 'ndwi',
    getColor: swirColor,
    legendStops: [],
    legendCategories: [
      { color: '#05144f', label: 'Water' },          // Dan: #000000 → navy
      { color: '#32cd32', label: 'Vegetation' },     // Dan: #32CD32
      { color: '#a52a2a', label: 'Urban / Soil' },   // Dan: #A52A2A
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

    case 'swir':
      return 'False-Color Infrared Composite';
    default:
      return '';
  }
}
