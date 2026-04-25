const https = require('https');

// Bucharest bbox roughly: south, west, north, east
const query = `
[out:json];
(
  way["waterway"="river"](44.38, 25.96, 44.50, 26.22);
  way["waterway"="canal"](44.38, 25.96, 44.50, 26.22);
  way["water"="lake"](44.38, 25.96, 44.50, 26.22);
  way["natural"="water"](44.38, 25.96, 44.50, 26.22);
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
    const json = JSON.parse(data);
    console.log('Found features:', json.elements ? json.elements.length : 0);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
