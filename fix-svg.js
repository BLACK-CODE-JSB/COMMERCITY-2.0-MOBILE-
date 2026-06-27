const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');
html = html.replace(/<svg([^>]+)>/g, function(match, inner) {
  if (inner.includes('viewBox')) return match;
  return `<svg viewBox="0 0 24 24"${inner}>`;
});
fs.writeFileSync('www/index.html', html);
console.log('Done');
