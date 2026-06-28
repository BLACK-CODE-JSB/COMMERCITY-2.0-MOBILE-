const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');

appJs = appJs.replace(
  /const btn = e\.target\.closest\('#bell-btn'\);/g,
  `const btn = e.target.closest('button[onclick*="toggleNotifs"]');`
);

fs.writeFileSync(appFile, appJs, 'utf8');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

fs.writeFileSync(indexFile, html, 'utf8');
console.log('files updated');
