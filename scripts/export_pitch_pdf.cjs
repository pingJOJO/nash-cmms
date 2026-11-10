/**
 * NexCMMS Pitch Deck — HTML to PDF Exporter
 * Uses Playwright + Chrome to render the pitch deck and export to PDF
 * Run from: g:\oooo سيرفر\
 * Command: node scripts/export_pitch_pdf.cjs
 */
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const WORKSPACE = 'G:/oooo \u0633\u064a\u0631\u0641\u0631';
const HTML_FILE = path.join(WORKSPACE.replace(/\//g, '\\'), 'NexCMMS_Pitch_Deck_Ar.html');
const PDF_FILE = path.join(WORKSPACE.replace(/\//g, '\\'), 'NexCMMS_Pitch_Deck_Ar.pdf');

// Encode path for file:// URL
const htmlUrl = 'file:///' + HTML_FILE.replace(/\\/g, '/').replace(/ /g, '%20');

// Try to find Chrome executable
const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  for (const p of chromePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

(async () => {
  console.log('[NexCMMS PDF Export] Starting...');
  console.log('[NexCMMS PDF Export] HTML:', HTML_FILE);
  console.log('[NexCMMS PDF Export] PDF:', PDF_FILE);

  const chromePath = findChrome();
  if (!chromePath) {
    console.error('[ERROR] Chrome not found. Install Google Chrome and retry.');
    process.exit(1);
  }
  console.log('[NexCMMS PDF Export] Chrome found at:', chromePath);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  // Increase timeout for fonts and screenshots
  page.setDefaultTimeout(30000);

  console.log('[NexCMMS PDF Export] Loading HTML...');
  await page.goto(htmlUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for Google Fonts and animations to settle
  await page.waitForTimeout(3000);

  console.log('[NexCMMS PDF Export] Exporting PDF...');
  await page.pdf({
    path: PDF_FILE,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();

  const stats = fs.statSync(PDF_FILE);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`[NexCMMS PDF Export] SUCCESS! PDF exported: ${PDF_FILE}`);
  console.log(`[NexCMMS PDF Export] File size: ${sizeMB} MB`);
})().catch((err) => {
  console.error('[NexCMMS PDF Export] FAILED:', err.message);
  process.exit(1);
});
