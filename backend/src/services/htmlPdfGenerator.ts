import puppeteerLocal from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a professional PDF from an HTML template using Puppeteer.
 */
export async function generateHtmlProposalPDF(data: any): Promise<Buffer> {
  let browser;
  try {
    const templatePath = path.join(__dirname, '../templates/proposal_v2.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    // Prepare data for template
    const templateData = {
      ...data,
      projectCost: (data.projectCost || 0).toLocaleString(),
      perKwpCost: (data.perKwpCost || 0).toLocaleString(),
      carbonFootprint: (data.carbonFootprint || 0).toLocaleString(),
      opexRate: (data.opexRate || 0).toLocaleString(),
      opexCarbonRate: (data.opexCarbonRate || 0).toLocaleString(),
      feasibilityCosting: (data.feasibilityCosting || 0).toLocaleString(),
      feasibilityUnitGenerated: (data.feasibilityUnitGenerated || 0).toLocaleString(),
      logoBase64: await getLogoBase64(),
      staticPages: getStaticPagesContent()
    };

    // Compile template
    const template = handlebars.compile(templateHtml);
    const html = template(templateData);

    // Launch Puppeteer (Vercel vs Local)
    if (process.env.VERCEL) {
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar'),
        headless: true,
      });
    } else {
      browser = await puppeteerLocal.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }

    const page = await browser.newPage();
    
    // Set viewport to A4 size for consistent rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    // Set HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('[PDF_GENERATOR_V2] Failed:', error);
    throw error;
  }
}

async function getLogoBase64(): Promise<string> {
  try {
    const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
    if (fs.existsSync(logoPath)) {
      const bitmap = fs.readFileSync(logoPath);
      const base64 = Buffer.from(bitmap).toString('base64');
      return `data:image/png;base64,${base64}`;
    }
    return '';
  } catch (err) {
    console.warn('Could not load logo for PDF:', err);
    return '';
  }
}

function getStaticPagesContent() {
  return [
    {
      pageNumber: 8,
      title: '07. SOLAR PV MODULES',
      content: '<p>Our high-efficiency TOPCON modules utilize N-type ribbon technology for superior performance in low-light conditions. With a 25-year performance warranty, they ensure long-term reliability for your solar investment.</p><ul><li>Higher Power Output</li><li>Lower Temperature Coefficient</li><li>Enhanced Durability</li></ul>'
    },
    {
      pageNumber: 9,
      title: '08. GRID TIED INVERTERS',
      content: '<p>The heart of your solar system. Our intelligent inverters convert DC power to clean AC power with up to 98.9% efficiency. Features built-in surge protection and real-time remote monitoring.</p>'
    },
    {
      pageNumber: 10,
      title: '09. MOUNTING STRUCTURE',
      content: '<p>Heavy-duty Hot Dip Galvanized (HDG) or Aluminum structures designed to withstand wind speeds up to 150 km/h. Custom-engineered for your specific roof type to ensure zero leakage and maximum stability.</p>'
    },
    {
      pageNumber: 11,
      title: '10. MONITORING SYSTEM',
      content: '<p>Track your energy production in real-time using our mobile app. Get daily reports, maintenance alerts, and historical data to optimize your consumption patterns.</p>'
    }
    // Add more as needed to reach 16 pages if required
  ];
}
