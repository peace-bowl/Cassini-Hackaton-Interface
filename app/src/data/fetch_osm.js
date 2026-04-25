const https = require('https');

const query = `
[out:json];
area["name"="Timișoara"]->.searchArea;
(
  way["waterway"="river"](area.searchArea);
  way["waterway"="canal"](area.searchArea);
  way["water"="lake"](area.searchArea);
  way["natural"="water"](area.searchArea);
  way["leisure"="park"](area.searchArea);
);
out geom;
`;

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'CassiniInterface-Bot/1.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    require('fs').writeFileSync('osm_data.json', data);
    console.log('Saved to osm_data.json');
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
