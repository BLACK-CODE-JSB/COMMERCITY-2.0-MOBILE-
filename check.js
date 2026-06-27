const fs = require('fs');
const html = fs.readFileSync('www/index.html', 'utf8');
const count = (html.match(/id="notifs-panel"/g) || []).length;
console.log('notifs-panel count:', count);
