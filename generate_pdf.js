const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Iniciando generación del PDF...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Cargar el HTML del SRS
  const htmlPath = path.resolve(__dirname, 'SRS_CommerCity_Mobile_v3_FULL.html');
  await page.goto(`file:///${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Esperar a que los estilos se apliquen
  await new Promise(resolve => setTimeout(resolve, 2000));

  const outputPath = path.resolve(__dirname, 'SRS_CommerCity_Mobile_v3_COMPLETO.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width:100%; font-size:8px; font-family:Arial,sans-serif; 
                  display:flex; justify-content:space-between; 
                  padding:0 20px; color:#666; border-bottom:1px solid #ddd; 
                  padding-bottom:4px; box-sizing:border-box;">
        <span>CommerCity Mobile v2.0 — SRS-CCM-2026-V3</span>
        <span>THE BLACK CODE JSB | Jhon Jairo Parra Obando</span>
      </div>
    `,
    footerTemplate: `
      <div style="width:100%; font-size:8px; font-family:Arial,sans-serif; 
                  display:flex; justify-content:space-between; 
                  padding:0 20px; color:#666; border-top:1px solid #ddd;
                  padding-top:4px; box-sizing:border-box;">
        <span>Documento Confidencial — Uso Interno</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '30px',
      bottom: '30px',
      left: '0',
      right: '0'
    },
    preferCSSPageSize: false
  });

  await browser.close();

  console.log(`✅ PDF generado exitosamente en:\n   ${outputPath}`);
})().catch(err => {
  console.error('❌ Error generando PDF:', err.message);
  process.exit(1);
});
