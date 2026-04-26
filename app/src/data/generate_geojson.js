const fs = require('fs');
const osmData = JSON.parse(fs.readFileSync('osm_data.json'));

const features = [];
let idCounter = 1;

// Helper to calculate distance
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1.lon - p2.lon, 2) + Math.pow(p1.lat - p2.lat, 2));
}

osmData.elements.forEach((el) => {
  if (!el.geometry || el.geometry.length < 3) return;
  if (!el.tags) return;

  let isRiver = el.tags.waterway === 'river' || el.tags.waterway === 'canal';
  let isPark = false; // Exclude parks completely
  let isLake = el.tags.water === 'lake' || el.tags.water === 'reservoir' || el.tags.natural === 'water';
  
  if (!isRiver && !isLake) return;
  
  // Exclude very small features or weird ones
  if (el.geometry.length < 4) return;

  // Ensure it's a closed polygon. If it's a river, we need to buffer it because it's a line.
  let coordinates = [];
  
  if (isRiver) {
    // Buffer the centerline to create a wide polygon that fully covers the river.
    // 0.002 degrees latitude ≈ 220 m; we compensate longitude for lat ~45°
    // so the buffer is roughly equal in real-world meters on both axes.
    const bufferLat = 0.002; // ~220 m in latitude direction
    const lonScale = Math.cos((45 * Math.PI) / 180); // ≈ 0.707 at 45° N
    const bufferLon = bufferLat / lonScale; // ~0.00283° → same real-world width
    let leftSide = [];
    let rightSide = [];
    
    for (let i = 0; i < el.geometry.length; i++) {
      let p = el.geometry[i];
      let pNext = el.geometry[i+1] || el.geometry[i];
      let pPrev = el.geometry[i-1] || el.geometry[i];
      
      // Direction vector along the river centerline
      let dx = pNext.lon - pPrev.lon;
      let dy = pNext.lat - pPrev.lat;
      let len = Math.sqrt(dx*dx + dy*dy);
      
      if (len === 0) {
        dx = 1; dy = 0; len = 1;
      }
      
      // Perpendicular (normal) vector — normalised
      let nx = -dy / len;
      let ny = dx / len;
      
      // Offset each side by the appropriate buffer for its axis
      leftSide.push([p.lon + nx * bufferLon, p.lat + ny * bufferLat]);
      rightSide.push([p.lon - nx * bufferLon, p.lat - ny * bufferLat]);
    }
    rightSide.reverse();
    coordinates = [...leftSide, ...rightSide, leftSide[0]]; // Close polygon
  } else {
    // It's a park or lake (area), so it should be closed
    coordinates = el.geometry.map(p => [p.lon, p.lat]);
    // Ensure closed
    if (coordinates[0][0] !== coordinates[coordinates.length-1][0] || 
        coordinates[0][1] !== coordinates[coordinates.length-1][1]) {
      coordinates.push([...coordinates[0]]);
    }
  }

  // Determine mock satellite values based on type
  let name = el.tags.name || (isRiver ? 'Bega Canal' : isPark ? 'Park' : 'Lake');
  let type = isRiver ? 'river' : isPark ? 'vegetation' : 'lake';
  
  let ndwi, ndvi, ndsi, swir;
  
  if (isRiver || isLake) {
    ndwi = 0.7 + Math.random() * 0.2;
    ndvi = 0.05 + Math.random() * 0.1;
    ndsi = 0.01;
    swir = 'water';
  } else if (isPark) {
    ndwi = 0.15 + Math.random() * 0.15;
    ndvi = 0.7 + Math.random() * 0.2;
    ndsi = 0.0;
    swir = 'vegetation';
  }

  features.push({
    type: "Feature",
    id: `sat-${idCounter++}`,
    properties: {
      name: name,
      type: type,
      ndwi: ndwi,
      ndvi: ndvi,
      ndsi: ndsi,
      swir: swir,
      area_km2: (Math.random() * 0.5 + 0.1).toFixed(2),
      passDate: "2026-04-24T10:32:00Z"
    },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates]
    }
  });
});

const featureCollection = {
  type: "FeatureCollection",
  features: features
};

fs.writeFileSync('satelliteData.json', JSON.stringify(featureCollection, null, 2));
console.log('satelliteData.json updated successfully with ' + features.length + ' features.');
