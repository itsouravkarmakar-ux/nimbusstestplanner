import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Launches a Chromium instance. 
 * Supports Vercel (Linux) and Local (Windows/Mac) environments.
 */
async function getBrowser() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  
  try {
    if (isProd) {
      console.log('[PDF] Initializing chromium for PRODUCTION (Vercel/Linux)...');
      const CHROMIUM_PACK_URL = "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";
      const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
      
      const binDir = path.dirname(executablePath);
      process.env.LD_LIBRARY_PATH = binDir;
      
      return await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
    } else {
      console.log('[PDF] Initializing chromium for LOCAL development...');
      
      // Fallback for Windows/Mac: Try to find local Chrome, Edge or Brave
      // On Windows, puppeteer-core needs a fixed path or regular 'puppeteer'
      // Since we use 'puppeteer-core', we'll try common Windows paths
      const platform = os.platform();
      let localPath = '';
      
      if (platform === 'win32') {
        const paths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
        ];
        localPath = paths.find(p => fs.existsSync(p)) || '';
      }
      
      return await puppeteer.launch({
        args: ['--no-sandbox'],
        executablePath: localPath || undefined, // undefined will let puppeteer-core try to find it
        headless: true
      });
    }
  } catch (error) {
    console.error('[PDF] FAILED TO LAUNCH BROWSER:', error);
    throw error;
  }
}

/**
 * Dummy function for compatibility
 */
export async function initBrowser() {
  return Promise.resolve();
}

/**
 * Helper to convert image to Base64 for 100% reliable embedding.
 */
function getBase64Image(filePath: string): string {
  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const extension = path.extname(filePath).replace('.', '');
      return `data:image/${extension};base64,${fileBuffer.toString('base64')}`;
    }
  } catch (e) {
    console.error(`[PDF] Failed to Base64 encode image: ${filePath}`, e);
  }
  return '';
}

/**
 * Generates the PDF and returns it as a Buffer.
 */
export async function generateProposalPDF(data: any): Promise<Buffer> {
  let browser = null;
  let page = null;
  const tempHtmlPath = path.join(os.tmpdir(), `proposal_${Date.now()}.html`);

  try {
    console.log('[PDF] Starting generation process...');
    browser = await getBrowser();
    page = await browser.newPage();
    console.log('[PDF] New page opened successfully.');

    page.setDefaultNavigationTimeout(30000);
    
    // Resolve template
    const templatePath = path.resolve(__dirname, '../templates/proposal_template.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }
    
    let html = fs.readFileSync(templatePath, 'utf8');

    // EMBED LOGO and BACKGROUND AS BASE64
    const logoPath = path.resolve(__dirname, '../templates/assets/logo.png');
    const logoBase64 = getBase64Image(logoPath);
    if (logoBase64) {
      html = html.replace(/src=["'][^"']*logo\.png["']/g, `src="${logoBase64}"`);
    }

    // Replace other placeholders
    html = html
      .replace(/{{clientName}}/g, data.clientName || '')
      .replace(/{{proposalRef}}/g, data.proposalRef || '')
      .replace(/{{date}}/g, data.date ? new Date(data.date).toLocaleDateString() : '')
      .replace(/{{location}}/g, data.location || '')
      .replace(/{{capacity}}/g, data.capacity || '')
      .replace(/{{moduleTech}}/g, data.moduleTech || '')
      .replace(/{{completionTime}}/g, data.completionTime || '');

    // BOM Rows
    const bomRows = (data.bom || []).map((item: any) => `
      <tr>
        <td>${item.item || ''}</td>
        <td>${item.description || ''}</td>
        <td>${item.quantity || ''} ${item.unit || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{bomRows}}', bomRows);

    // Commercial Rows
    const commercialRows = (data.commercials || []).map((item: any) => `
      <tr>
        <td>${item.milestone || ''}</td>
        <td>${item.percentage || ''}%</td>
        <td>${item.description || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{commercialRows}}', commercialRows);

    // Fallback basePath
    html = html.replace(/{{basePath}}/g, pathToFileURL(path.resolve(__dirname, '../templates/assets')).href);
    
    fs.writeFileSync(tempHtmlPath, html);
    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });
    console.log('[PDF] Template loaded.');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('[PDF] PDF generation complete.');

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('[PDF] GENERATION FAILED:', error);
    throw error;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (fs.existsSync(tempHtmlPath)) {
      try { fs.unlinkSync(tempHtmlPath); } catch (e) {}
    }
  }
}
