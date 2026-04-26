const fs = require('fs');
const data = JSON.parse(fs.readFileSync('osm_data.json'));
let river = data.elements.find(e => e.tags && e.tags.waterway === 'river');
let park = data.elements.find(e => e.tags && e.tags.leisure === 'park');
console.log('River:', river ? river.geometry.slice(0, 3) : 'none');
console.log('Park:', park ? park.geometry.slice(0, 3) : 'none');
