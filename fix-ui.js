const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const notifsRegex = /<!-- NOTIFICACIONES -->\s*(<div class="notifs-panel" id="notifs-panel">[\s\S]*?<\/div>\s*<\/div>\s*)\s*<!-- HERO -->/;
const match = html.match(notifsRegex);
if (match) {
    const notifsHtml = `<!-- NOTIFICACIONES -->\n        ` + match[1].trim() + `\n\n`;
    html = html.replace(match[0], `<!-- HERO -->`);

    const drawerRegex = /(<div class="more-drawer" id="more-drawer">[\s\S]*?<\/div>)/;
    html = html.replace(drawerRegex, `$1\n\n  ${notifsHtml}`);
}

const moreDrawerAdmin = `<a class="more-item admin-only" onclick="closeMoreMenu();navigate('admin')"><span class="icon">🛡️</span><span>Panel de Administración</span></a>`;
if (!html.includes('Panel de Administración')) {
    html = html.replace(/(<a class="more-item more-logout" onclick="closeMoreMenu\(\);handleLogout\(\)">)/, `${moreDrawerAdmin}\n    $1`);
}

const profilePageRegex = /(<div class="page" id="page-perfil">[\s\S]*?<div class="inner-topbar-icons">[\s\S]*?onclick="toggleNotifs\(event\)">[\s\S]*?<\/button>\s*)(<button class="icon-btn">)/;
html = html.replace(profilePageRegex, `$1<button class="icon-btn" style="display:none;">`);

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html updated');

const styleFile = path.join(__dirname, 'www', 'style.css');
let css = fs.readFileSync(styleFile, 'utf8');
if (!css.includes('.icon-btn svg { width: 24px !important;')) {
    css += `\n\n\n.icon-btn svg {\n  width: 24px !important;\n  height: 24px !important;\n  stroke-width: 2.2 !important;\n}\n`;
    fs.writeFileSync(styleFile, css, 'utf8');
    console.log('style.css updated');
}
