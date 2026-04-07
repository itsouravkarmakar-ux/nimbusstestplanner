import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browserInstance: Browser | null = null;

async function getBrowser() {
  if (browserInstance) {
    try {
      // Check if browser is still responsive
      await browserInstance.version();
    } catch (e) {
      console.log('Browser unresponsive or closed. Resetting instance...');
      browserInstance = null;
    }
  }

  if (!browserInstance) {
    console.log('Launching new browser instance...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--disable-dev-shm-usage', // Recommended for Docker/Restricted environments
        '--disable-gpu'
      ],
    });
    
    // Handle browser disconnection
    browserInstance.on('disconnected', () => {
      console.log('Browser disconnected signal received.');
      browserInstance = null;
    });
  }
  return browserInstance;
}

/**
 * Pre-warms the browser to speed up the first PDF generation
 */
export async function initBrowser() {
  try {
    await getBrowser();
    console.log('PDF Browser initialized and ready.');
  } catch (error) {
    console.error('Failed to initialize PDF browser:', error);
  }
}

export async function generateProposalPDF(data: any, outputPath: string) {
  let browser: Browser | null = null;
  let page = null;
  const tempHtmlPath = path.join(__dirname, `../temp_${Date.now()}.html`);

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    // Set a reasonable timeout for all operations
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    page.on('error', err => {
      console.error('Page crashed or errored:', err);
    });

    // Optimize page for speed
    await page.setCacheEnabled(true);

    const templatePath = path.resolve(__dirname, '../templates/proposal_template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace all placeholders
    html = html
      .replace(/{{clientName}}/g, data.clientName || '')
      .replace(/{{proposalRef}}/g, data.proposalRef || '')
      .replace(/{{date}}/g, data.date ? new Date(data.date).toLocaleDateString() : '')
      .replace(/{{location}}/g, data.location || '')
      .replace(/{{capacity}}/g, data.capacity || '')
      .replace(/{{moduleTech}}/g, data.moduleTech || '')
      .replace(/{{completionTime}}/g, data.completionTime || '');

    // BOM Table
    const bomRows = (data.bom || []).map((item: any) => `
      <tr>
        <td>${item.item || ''}</td>
        <td>${item.description || ''}</td>
        <td>${item.quantity || ''} ${item.unit || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{bomRows}}', bomRows);

    // Commercials Table
    const commercialRows = (data.commercials || []).map((item: any) => `
      <tr>
        <td>${item.milestone || ''}</td>
        <td>${item.percentage || ''}%</td>
        <td>${item.description || ''}</td>
      </tr>
    `).join('');
    html = html.replace('{{commercialRows}}', commercialRows);

    // Use relative path for assets in the HTML
    html = html.replace(/{{basePath}}/g, './templates/assets');
    
    fs.writeFileSync(tempHtmlPath, html);

    // Faster wait strategy: 'load' instead of 'networkidle0' if assets are local
    // Actually, since we use local PNGs, 'load' should be sufficient and faster.
    await page.goto(pathToFileURL(tempHtmlPath).href, { waitUntil: 'load' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (page) {
      await page.close().catch(e => console.error('Error closing page:', e));
    }
    if (fs.existsSync(tempHtmlPath)) {
      try {
        fs.unlinkSync(tempHtmlPath);
      } catch (e) {
        console.error('Error deleting temp HTML:', e);
      }
    }
    // We DON'T close the browser here because it's a singleton
  }
}
