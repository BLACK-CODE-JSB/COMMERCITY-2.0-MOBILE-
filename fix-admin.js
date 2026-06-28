const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

html = html.replace(/<div class="admin-card-right">\s*<div class="admin-card-sub" style="margin-right:12px;">(.*?)<\/div>\s*<span class="badge (.*?)" style="margin-right:12px;">(.*?)<\/span>\s*<button class="btn-ghost" style="padding:4px 8px;" onclick="event\.stopPropagation\(\);\s*(.*?)">(.*?)<\/button>\s*<\/div>/g,
function(match, date, badgeClass, badgeText, onclickAttr, btnText) {
    return `<div class="admin-card-right">
                <div class="admin-card-sub">${date}</div>
                <span class="badge ${badgeClass}">${badgeText}</span>
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card'); ${onclickAttr.replace('openAdminReportDetail', 'adminAction(\'' + btnText + '\', null); openAdminReportDetail')}">${btnText}</button>
              </div>`;
});

let reportsSectionRegex = /(<div class="admin-section" id="admin-sec-reportes">[\s\S]*?<\/div>\s*<\/div>)/;
let reportsSection = html.match(reportsSectionRegex);
if(reportsSection) {
    let repHtml = reportsSection[1];
    repHtml = repHtml.replace(/<div class="admin-card-left"(.*?)>\s*(<span class="badge.*?>.*?<\/span>)\s*<div class="admin-card-title">(.*?)<\/div>\s*<\/div>\s*<div class="admin-card-right">\s*<div class="admin-card-sub".*?>(.*?)<\/div>\s*(<span class="badge.*?>.*?<\/span>)\s*<button class="btn-ghost".*?onclick="event.stopPropagation\(\);\s*(.*?)">(.*?)<\/button>\s*<\/div>/g,
    `<div class="admin-card-left"$1>
                $2
                <div>
                  <div class="admin-card-title">$3</div>
                  <div class="admin-card-sub">$4</div>
                </div>
              </div>
              <div class="admin-card-right">
                $5
                <button class="btn-ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); currentAdminTarget=this.closest('.admin-list-card'); adminAction('$7', null);">$7</button>
              </div>`);
    html = html.replace(reportsSectionRegex, repHtml);
}

html = html.replace(/adminAction\('(.*?)', (.*?)\)/g, "currentAdminTarget=this.closest('.admin-list-card') || currentAdminTarget; adminAction('$1', $2)");

html = html.replace(/onclick="openAdminUserDetail\(/g, `onclick="currentAdminTarget=this; openAdminUserDetail(`);
html = html.replace(/onclick="openAdminProductDetail\(/g, `onclick="currentAdminTarget=this; openAdminProductDetail(`);
html = html.replace(/onclick="openAdminReportDetail\(/g, `onclick="currentAdminTarget=this; openAdminReportDetail(`);

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html updated');

const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');

if(!appJs.includes('let currentAdminTarget = null;')) {
    appJs = `let currentAdminTarget = null;\n` + appJs;
}

const adminActionRegex = /function adminAction\(action, modalId\) \{[\s\S]*?\}/;
const newAdminAction = `function adminAction(action, modalId) {
  toast(action + " realizado con éxito");

  if (currentAdminTarget) {
     let badge = currentAdminTarget.querySelector('.badge:not(.outline)');
     if (badge) {
        if (action.toLowerCase().includes('eliminar') || action.toLowerCase().includes('banear') || action.toLowerCase().includes('suspender')) {
           badge.textContent = action.toLowerCase().includes('eliminar') ? 'Eliminado' : (action.toLowerCase().includes('banear') ? 'Baneado' : 'Suspendido');
           badge.className = 'badge badge-red';
        } else if (action.toLowerCase().includes('activar')) {
           badge.textContent = 'Activo';
           badge.className = 'badge badge-green';
        } else if (action.toLowerCase().includes('responder') || action.toLowerCase().includes('resolver') || action.toLowerCase().includes('ver')) {
           badge.textContent = 'Resuelto';
           badge.className = 'badge badge-green';
        }
     }
  }

  if (modalId) {
    document.getElementById(modalId).classList.remove('open');
  }
}`;
if (appJs.match(adminActionRegex)) {
    appJs = appJs.replace(adminActionRegex, newAdminAction);
} else {
    appJs += '\n' + newAdminAction;
}

fs.writeFileSync(appFile, appJs, 'utf8');
console.log('app.js updated');
