const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const startMarker = '  <!-- NOTIFICACIONES -->';
const endMarker = '</div>\n\n\n';
const startIdx = html.indexOf(startMarker);

if (startIdx === -1) {
  console.log('ERROR: Could not find NOTIFICACIONES marker');
  process.exit(1);
}

const footerEnd = html.indexOf('</div>', html.indexOf('notifs-footer-lnk', startIdx));
const panelCloseDiv = html.indexOf('</div>', footerEnd + 6);
const extractEnd = panelCloseDiv + '</div>'.length;

const notifsBlock = html.substring(startIdx, extractEnd);
console.log('Extracted notifs block length:', notifsBlock.length);

html = html.substring(0, startIdx) + '\n' + html.substring(extractEnd);

const bodyClose = html.lastIndexOf('</body>');
if (bodyClose === -1) {
  const htmlClose = html.lastIndexOf('</html>');
  const insertPos = htmlClose !== -1 ? htmlClose : html.length;
  html = html.substring(0, insertPos) + '\n' + notifsBlock + '\n' + html.substring(insertPos);
} else {
  html = html.substring(0, bodyClose) + '\n' + notifsBlock + '\n' + html.substring(bodyClose);
}

fs.writeFileSync(indexFile, html, 'utf8');

const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');

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
