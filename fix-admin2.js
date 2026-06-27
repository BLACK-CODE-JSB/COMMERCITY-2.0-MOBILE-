const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Add "Volver" button to Admin page
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

// 2. Hide profile icon in page-perfil (I already did this, but let's make sure it's completely gone or toggleNotifs works)
// The user says "haz que el icono de notificacion en perfil abra y muestre notificaciones asi como en inicio"
// The issue is probably z-index. Let's make sure #notifs-panel has a very high z-index and is positioned correctly.

fs.writeFileSync(indexFile, html, 'utf8');

const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');

// 3. Hide bottom nav on admin page
appJs = appJs.replace(
  /bnav\.classList\.toggle\('hidden', isAuth \|\| page === 'chat'\);/g,
  `bnav.classList.toggle('hidden', isAuth || page === 'chat' || page === 'admin');`
);

// Fix initial load
appJs = appJs.replace(
  /if \(adminStatus\) navigate\('admin'\);\s*else navigate\('home'\);/g,
  `navigate('home');` // always start at home, they can go to admin via menu
);

fs.writeFileSync(appFile, appJs, 'utf8');

const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');

// 4. Make top bar icons more visible
css = css.replace(
  /\.icon-btn svg \{\s*width: 24px !important;\s*height: 24px !important;\s*stroke-width: 2\.2 !important;\s*\}/g,
  `.icon-btn svg {
  width: 28px !important;
  height: 28px !important;
  stroke-width: 2.5 !important;
}`
);

// Fix notifs-panel z-index so it always shows on top
if (!css.includes('.notifs-panel { z-index: 9999 !important;')) {
  css += `\n.notifs-panel { z-index: 9999 !important; }\n`;
}

// Also hide the bottom nav explicitly if we are in admin just in case
if (!css.includes('#page-admin.active ~ #bottom-nav')) {
  css += `\n#page-admin.active ~ #bottom-nav { display: none !important; }\n`;
}

fs.writeFileSync(styleFile, css, 'utf8');
console.log('files updated');
