const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// 1. Add Volver button to Admin
if (!html.includes('id="btn-admin-volver"')) {
  // Find admin inner-topbar
  const adminRegex = /(<div class="page" id="page-admin">[\s\S]*?<div class="inner-topbar">)(\s*)(<div><\/div>)/;
  html = html.replace(adminRegex, `$1$2<div style="flex: 1;"><button id="btn-admin-volver" class="btn-ghost" style="padding: 4px 12px; color: var(--text);" onclick="navigate('home')">← Volver</button></div>`);
}

// 2. Add icon-white class to notification and profile buttons in home and perfil
html = html.replace(/<button class="icon-btn" onclick="toggleNotifs/g, '<button class="icon-btn icon-white" onclick="toggleNotifs');
html = html.replace(/<button class="icon-btn" onclick="navigate\('perfil'\)/g, '<button class="icon-btn icon-white" onclick="navigate(\\'perfil\\')');
html = html.replace(/<button class="icon-btn" id="bell-btn" onclick="toggleNotifs/g, '<button class="icon-btn icon-white" id="bell-btn" onclick="toggleNotifs');

fs.writeFileSync(indexFile, html, 'utf8');

// 3. Fix app.js closest('#bell-btn')
const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');
appJs = appJs.replace(/!e\.target\.closest\('#bell-btn'\)/g, `!e.target.closest('button[onclick*="toggleNotifs"]')`);
fs.writeFileSync(appFile, appJs, 'utf8');

// 4. Add .icon-white to style.css
const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');
if (!css.includes('.icon-white svg')) {
  css += `\n.icon-white svg { stroke: #ffffff !important; }\n`;
}
fs.writeFileSync(styleFile, css, 'utf8');

console.log('Fixed admin button, notifs icon, and white icons.');
