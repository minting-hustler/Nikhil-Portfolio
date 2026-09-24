// Regenerates sites/vending/index.html from the component files.
//   node source/vending/build-site.js
const fs = require('fs');
const path = require('path');
require('./proto/build.js'); // writes proto/vending.html
const v = fs.readFileSync(path.join(__dirname, 'proto', 'vending.html'), 'utf8');
const i = v.indexOf('<div class="room"');
const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${v.slice(0, i).trim()}
</head>
<body>
${v.slice(i).trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, '..', '..', 'sites', 'vending', 'index.html'), out);
fs.unlinkSync(path.join(__dirname, 'proto', 'vending.html'));
console.log('wrote sites/vending/index.html');
