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
      // Buffer the line by a small amount to make it a polygon
      const buffer = 0.0003; // approx 30 meters
      const leftSide: number[][] = [];
      const rightSide: number[][] = [];
      
      for (let i = 0; i < el.geometry.length; i++) {
        const p = el.geometry[i];
        const pNext = el.geometry[i+1] || el.geometry[i];
        const pPrev = el.geometry[i-1] || el.geometry[i];
        
        let dx = pNext.lon - pPrev.lon;
        let dy = pNext.lat - pPrev.lat;
        let len = Math.sqrt(dx*dx + dy*dy);
        
        if (len === 0) {
          dx = 1; dy = 0; len = 1;
        }
        
        const nx = -dy / len;
        const ny = dx / len;
        
        leftSide.push([p.lon + nx * buffer, p.lat + ny * buffer]);
        rightSide.push([p.lon - nx * buffer, p.lat - ny * buffer]);
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
    
    const ndwi = 0.7 + Math.random() * 0.2;
    const ndvi = 0.05 + Math.random() * 0.1;
    const ndsi = 0.01;
    const swir = 'water';

    features.push({
      type: 'Feature',
      id: `sat-${idCounter++}`,
      properties: {
        name,
        type,
        ndwi,
        ndvi,
        ndsi,
        swir,
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
