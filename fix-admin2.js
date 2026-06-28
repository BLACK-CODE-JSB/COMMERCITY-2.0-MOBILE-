const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

if (html.includes('<div class="page" id="page-admin">')) {
  if (!html.includes('id="btn-admin-volver"')) {
    html = html.replace(
      /(<div class="page" id="page-admin">\s*<div class="main-content">\s*)<div class="admin-header">/g,
      `$1<div class="inner-topbar" style="justify-content: flex-start; gap: 16px; margin-bottom: -10px;">
          <button id="btn-admin-volver" class="btn-ghost" style="padding: 4px 12px; width: auto; color: var(--text);" onclick="navigate('home')">← Volver al Inicio</button>
        </div>
        <div class="admin-header">`
    );
  }
}

fs.writeFileSync(indexFile, html, 'utf8');

const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');

appJs = appJs.replace(
  /bnav\.classList\.toggle\('hidden', isAuth \|\| page === 'chat'\);/g,
  `bnav.classList.toggle('hidden', isAuth || page === 'chat' || page === 'admin');`
);

appJs = appJs.replace(
  /if \(adminStatus\) navigate\('admin'\);\s*else navigate\('home'\);/g,
  `navigate('home');`
);

fs.writeFileSync(appFile, appJs, 'utf8');

const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');

css = css.replace(
  /\.icon-btn svg \{\s*width: 24px !important;\s*height: 24px !important;\s*stroke-width: 2\.2 !important;\s*\}/g,
  `.icon-btn svg {
  width: 28px !important;
  height: 28px !important;
  stroke-width: 2.5 !important;
}`
);

if (!css.includes('.notifs-panel { z-index: 9999 !important;')) {
  css += `\n.notifs-panel { z-index: 9999 !important; }\n`;
}

if (!css.includes('#page-admin.active ~ #bottom-nav')) {
  css += `\n#page-admin.active ~ #bottom-nav { display: none !important; }\n`;
}

fs.writeFileSync(styleFile, css, 'utf8');
console.log('files updated');
