const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'www', 'app.js');
let appJs = fs.readFileSync(appFile, 'utf8');

// Fix document click listener to allow any button that toggles notifs
appJs = appJs.replace(
  /const btn = e\.target\.closest\('#bell-btn'\);/g,
  `const btn = e.target.closest('button[onclick*="toggleNotifs"]');`
);

fs.writeFileSync(appFile, appJs, 'utf8');

// Also update index.html to make the notification icon in profile exactly the same
const indexFile = path.join(__dirname, 'www', 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

// Ensure all toggleNotifs buttons have the same effect
// The profile page has:
// <button class="icon-btn" onclick="toggleNotifs(event)"><svg width="18" height="18" viewBox="0 0 24 24" ...

fs.writeFileSync(indexFile, html, 'utf8');
console.log('files updated');
