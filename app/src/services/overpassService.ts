export interface BoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

export async function fetchCityWaterData(bbox: BoundingBox): Promise<GeoJSON.FeatureCollection> {
  const query = `
    [out:json];
    (
      way["waterway"="river"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["waterway"="canal"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["water"="lake"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["natural"="water"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out geom;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  const features: GeoJSON.Feature[] = [];
  let idCounter = 1;

  if (!data.elements) {
    return { type: 'FeatureCollection', features: [] };
  }

  data.elements.forEach((el: any) => {
    if (!el.geometry || el.geometry.length < 3) return;
    if (!el.tags) return;

    const isRiver = el.tags.waterway === 'river' || el.tags.waterway === 'canal';
    const isLake = el.tags.water === 'lake' || el.tags.water === 'reservoir' || el.tags.natural === 'water';
    
    if (!isRiver && !isLake) return;

    let coordinates: number[][] = [];
    
    if (isRiver) {
      // Buffer the centerline to create a wide polygon that fully covers the river.
      // 0.002 degrees latitude ≈ 220 m; we compensate longitude for lat ~45°
      // so the buffer is roughly equal in real-world meters on both axes.
      const bufferLat = 0.002; // ~220 m in latitude direction
      const lonScale = Math.cos((45 * Math.PI) / 180); // ≈ 0.707 at 45° N
      const bufferLon = bufferLat / lonScale; // ~0.00283°  → same real-world width
      const leftSide: number[][] = [];
      const rightSide: number[][] = [];
      
      for (let i = 0; i < el.geometry.length; i++) {
        const p = el.geometry[i];
        const pNext = el.geometry[i+1] || el.geometry[i];
        const pPrev = el.geometry[i-1] || el.geometry[i];
        
        // Direction vector along the river centerline
        let dx = pNext.lon - pPrev.lon;
        let dy = pNext.lat - pPrev.lat;
        let len = Math.sqrt(dx*dx + dy*dy);
        
        if (len === 0) {
          dx = 1; dy = 0; len = 1;
        }
        
        // Perpendicular (normal) vector — normalised
        const nx = -dy / len;
        const ny =  dx / len;
        
        // Offset each side by the appropriate buffer for its axis
        leftSide.push([p.lon + nx * bufferLon, p.lat + ny * bufferLat]);
        rightSide.push([p.lon - nx * bufferLon, p.lat - ny * bufferLat]);
      }
      rightSide.reverse();
      coordinates = [...leftSide, ...rightSide, leftSide[0]]; // Close polygon
    } else {
      // It's a lake (area), so it should be closed
      coordinates = el.geometry.map((p: any) => [p.lon, p.lat]);
      // Ensure closed
      if (coordinates[0][0] !== coordinates[coordinates.length-1][0] || 
          coordinates[0][1] !== coordinates[coordinates.length-1][1]) {
        coordinates.push([...coordinates[0]]);
      }
    }

    const name = el.tags.name || (isRiver ? 'River/Canal' : 'Lake/Waterbody');
    const type = isRiver ? 'river' : 'lake';

    // ── NDWI: turbidity detection (Dan's interpretation) ─────────────────
    //   Rivers: ~35% chance of turbid section (suspended sediments / runoff)
    //   Lakes:  mostly clear, occasional turbid shore area
    let ndwi: number;
    if (isRiver) {
      ndwi = Math.random() < 0.35
        ? 0.18 + Math.random() * 0.28   // turbid: 0.18–0.46 → white/light-blue
        : 0.52 + Math.random() * 0.32;  // clear:  0.52–0.84 → blue
    } else {
      ndwi = Math.random() < 0.15
        ? 0.22 + Math.random() * 0.22   // turbid edge: 0.22–0.44
        : 0.58 + Math.random() * 0.32;  // clear lake: 0.58–0.90
    }

    // ── NDVI (standard): very low for open water ──────────────────────────
    const ndvi = 0.02 + Math.random() * 0.08;

    // ── ndvi_water: algae/silt index (Dan's NDVI layer) ──────────────────
    //   Rivers: higher chance of silt (brown), occasional algae bloom (green)
    //   Lakes:  more algae possible in shallow/warm conditions
    const ndvi_water = isRiver
      ? (Math.random() < 0.35
          ? 0.55 + Math.random() * 0.35   // algae bloom: 0.55–0.90
          : 0.10 + Math.random() * 0.35)  // silt/waste:  0.10–0.45
      : (Math.random() < 0.50
          ? 0.50 + Math.random() * 0.40   // algae in lake: 0.50–0.90
          : 0.05 + Math.random() * 0.40); // clear/silt lake: 0.05–0.45

    // ── SWIR categorical: surface material type (Dan's SWIR layer) ───────
    //   Vegetation polygons only appear if OSM data has nearby parks / wetland
    //   Water is the default for all river/lake features
    //   Urban occasionally appears at river edges (bridges, embankments)
    const swirCandidates: Array<'water' | 'vegetation' | 'urban'> = isRiver
      ? ['water', 'water', 'water', 'urban']          // mostly water, some urban edge
      : ['water', 'water', 'vegetation', 'vegetation']; // lakes can have vegetation zones
    const swir_type = swirCandidates[Math.floor(Math.random() * swirCandidates.length)];

    const ndsi = 0.01;

    features.push({
      type: 'Feature',
      id: `sat-${idCounter++}`,
      properties: {
        name,
        type,
        ndwi,
        ndvi,
        ndvi_water,
        ndsi,
        swir: swir_type,       // kept as 'swir' for the existing SWIR layer
        swir_type,             // Dan's property name also stored
        area_km2: (Math.random() * 0.5 + 0.1).toFixed(2),
        passDate: new Date().toISOString()
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    });
  });

  return {
    type: 'FeatureCollection',
    features
  };
}
