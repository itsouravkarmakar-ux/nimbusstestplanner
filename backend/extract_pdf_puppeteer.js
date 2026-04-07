import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--allow-file-access-from-files'],
    protocolTimeout: 600000
  });
  const page = await browser.newPage();
  
  const htmlPath = `file:///${path.join(__dirname, 'extract.html').replace(/\\/g, '/')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  const pdfPath = `file:///${path.join(__dirname, '../template_new.pdf').replace(/\\/g, '/')}`;

  try {
    const totalPages = await page.evaluate(async (url) => {
      return await window.renderPage(url, 1);
    }, pdfPath);

    console.log(`Total PDF Pages: ${totalPages}`);

    const outputDir = path.join(__dirname, 'src/templates/assets');
    fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 1; i <= totalPages; i++) {
      console.log(`Rendering page ${i}...`);
      await page.evaluate(async (url, num) => {
        await window.renderPage(url, num);
      }, pdfPath, i);
      
      const canvasElement = await page.$('#pdf-canvas');
      await canvasElement.screenshot({ path: path.join(outputDir, `page${i}.png`) });
      console.log(`Saved page${i}.png`);
    }
  } catch (err) {
    console.error('Error during extraction:', err);
  } finally {
    await browser.close();
  }
})();
