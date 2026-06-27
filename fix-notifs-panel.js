const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Extract the notifs-panel from inside the more-drawer
// Find the notifs panel block
const startMarker = '  <!-- NOTIFICACIONES -->';
const endMarker = '</div>\n\n\n';
const startIdx = html.indexOf(startMarker);

if (startIdx === -1) {
  console.log('ERROR: Could not find NOTIFICACIONES marker');
  process.exit(1);
}

// Find end: the closing </div> of notifs-panel (after notifs-footer-lnk)
const footerEnd = html.indexOf('</div>', html.indexOf('notifs-footer-lnk', startIdx));
// The notifs-panel closing tag is right after the footer link's closing div
const panelCloseDiv = html.indexOf('</div>', footerEnd + 6); // skip footer </div>
const extractEnd = panelCloseDiv + '</div>'.length;

const notifsBlock = html.substring(startIdx, extractEnd);
console.log('Extracted notifs block length:', notifsBlock.length);

// Remove it from its current location inside more-drawer
html = html.substring(0, startIdx) + '\n' + html.substring(extractEnd);

// 2. Insert it right before the closing </body> tag as a top-level element
const bodyClose = html.lastIndexOf('</body>');
if (bodyClose === -1) {
  // No </body>? Insert before </html> or at the end
  const htmlClose = html.lastIndexOf('</html>');
  const insertPos = htmlClose !== -1 ? htmlClose : html.length;
  html = html.substring(0, insertPos) + '\n' + notifsBlock + '\n' + html.substring(insertPos);
} else {
  html = html.substring(0, bodyClose) + '\n' + notifsBlock + '\n' + html.substring(bodyClose);
}

fs.writeFileSync(indexFile, html, 'utf8');

// 3. Update CSS: make notifs-panel fixed position so it works from any page
const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');

// Replace the existing notifs-panel styles
css = css.replace(
  /\.notifs-panel \{[^}]*\}/,
  `.notifs-panel {
  display: none; position: fixed; top: 60px; right: 16px; z-index: 10000;
  width: min(340px, calc(100vw - 32px));
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
}`
);

fs.writeFileSync(styleFile, css, 'utf8');

console.log('DONE: Moved notifs-panel to top level with fixed positioning.');
