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
 * Uses a remote binary pack to avoid missing libnss3 system libraries.
 */
async function getBrowser() {
  console.log('[PDF] Initializing chromium launch (REMOTE PACK)...');
  
  try {
    // This specific version of the pack includes the necessary shared libraries 
    // and is highly compatible with the current Vercel Amazon Linux environment.
    const CHROMIUM_PACK_URL = "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";
    
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
    console.log('[PDF] Remote Chromium executable path resolved.');
    
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  } catch (error) {
    console.error('[PDF] FAILED TO LAUNCH BROWSER WITH REMOTE PACK:', error);
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
    console.log('[PDF] New page opened.');

    page.setDefaultNavigationTimeout(30000);
    
    // Find the template
    const templatePath = path.resolve(__dirname, '../templates/proposal_template.html');
    console.log(`[PDF] Reading template from: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}.`);
    }
    
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    html = html
      .replace(/{{clientName}}/g, data.clientName || '')
      .replace(/{{proposalRef}}/g, data.proposalRef || '')
      .replace(/{{date}}/g, data.date ? new Date(data.date).toLocaleDateString() : '')
      .replace(/{{location}}/g, data.location || '')
      .replace(/{{capacity}}/g, data.capacity || '')
      .replace(/{{moduleTech}}/g, data.moduleTech || '')
      .replace(/{{completionTime}}/g, data.completionTime || '');

    // BOM and Commercials
    const bomRows = (data.bom || []).map((item: any) => `
      <tr>
        <td>${item.item || ''}</td>
        <td>${item.description || ''}</td>
        <td>${item.quantity || ''} ${item.unit || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{bomRows}}', bomRows);

    const commercialRows = (data.commercials || []).map((item: any) => `
      <tr>
        <td>${item.milestone || ''}</td>
        <td>${item.percentage || ''}%</td>
        <td>${item.description || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{commercialRows}}', commercialRows);

    // Resolve asset path
    const assetsPath = path.resolve(__dirname, '../templates/assets');
    html = html.replace(/{{basePath}}/g, pathToFileURL(assetsPath).href);
    
    fs.writeFileSync(tempHtmlPath, html);
    console.log(`[PDF] Temporary HTML written to: ${tempHtmlPath}`);

    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });
    console.log('[PDF] Page loaded.');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('[PDF] PDF Buffer generated successfully.');

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('[PDF] FATAL ERROR during generation:', error);
    throw error;
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (fs.existsSync(tempHtmlPath)) {
      try { fs.unlinkSync(tempHtmlPath); } catch (e) {}
    }
  }
}
