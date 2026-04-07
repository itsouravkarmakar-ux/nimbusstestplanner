import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Launches a Chromium instance compatible with Vercel serverless environment.
 * Uses Single-Process mode and No-Zygote to bypass system library requirements.
 * Injects LD_LIBRARY_PATH so system libraries like libnss3.so can be found.
 */
async function getBrowser() {
  console.log('[PDF] Initializing chromium launch (SINGLE-PROCESS + ZYGOTE-LESS)...');
  
  try {
    const CHROMIUM_PACK_URL = "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";
    
    // Resolve the executable path
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
    
    // Point the system to where the chromium libraries are extracted
    const binDir = path.dirname(executablePath);
    process.env.LD_LIBRARY_PATH = binDir;
    console.log(`[PDF] Vercel environment path injected: ${binDir}`);
    
    return await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process', // Bypass many library threading requirements
        '--no-zygote'       // Stop extra process initialization
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  } catch (error) {
    console.error('[PDF] FAILED TO LAUNCH BROWSER IN SERVERLESS MODE:', error);
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
 * Helper to convert image to Base64 for 100% reliable serverless embedding.
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
    console.log('[PDF] Page successfully opened in serverless browser.');

    page.setDefaultNavigationTimeout(30000);
    
    // Resolve template
    const templatePath = path.resolve(__dirname, '../templates/proposal_template.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }
    
    let html = fs.readFileSync(templatePath, 'utf8');

    // EMBED LOGO and BACKGROUND AS BASE64 (Removes filesystem dependency)
    const logoPath = path.resolve(__dirname, '../templates/assets/logo.png');
    const logoBase64 = getBase64Image(logoPath);
    if (logoBase64) {
      // Look for any image tags with the logo placeholder
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

    // Fallback basePath for any other relative assets
    html = html.replace(/{{basePath}}/g, pathToFileURL(path.resolve(__dirname, '../templates/assets')).href);
    
    fs.writeFileSync(tempHtmlPath, html);
    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });
    console.log('[PDF] Proposal HTML loaded.');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('[PDF] Binary PDF Buffer generated.');

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('[PDF] GENERATION PROCESS FAILED:', error);
    throw error;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (fs.existsSync(tempHtmlPath)) {
      try { fs.unlinkSync(tempHtmlPath); } catch (e) {}
    }
  }
}
