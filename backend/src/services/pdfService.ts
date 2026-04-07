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
 */
async function getBrowser() {
  console.log('Launching serverless browser...');
  
  // Vercel-specific executable path or local fallback
  const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar');
  
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
}

/**
 * Dummy function for compatibility with existing calls
 */
export async function initBrowser() {
  return Promise.resolve();
}

/**
 * Generates the PDF and returns it as a Buffer to avoid filesystem issues in production.
 */
export async function generateProposalPDF(data: any): Promise<Buffer> {
  let browser = null;
  let page = null;
  // Use OS tmp directory for the temporary HTML file (writable in Vercel)
  const tempHtmlPath = path.join(os.tmpdir(), `proposal_${Date.now()}.html`);

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);
    
    // Read the template
    const templatePath = path.resolve(__dirname, '../templates/proposal_template.html');
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

    // Asset paths for production
    html = html.replace(/{{basePath}}/g, pathToFileURL(path.resolve(__dirname, '../templates/assets')).href);
    
    // Write to tmp
    fs.writeFileSync(tempHtmlPath, html);

    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });

    // Generate PDF to Buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('SERVERLESS PDF ERROR:', error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    if (fs.existsSync(tempHtmlPath)) {
      try { fs.unlinkSync(tempHtmlPath); } catch (e) {}
    }
  }
}
