import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for coordinates (A4: 595.28 x 841.89 points)
const getX = (percent: number) => (percent / 100) * 595.28;
const getY = (percent: number) => 841.89 - (percent / 100) * 841.89;

/**
 * Generates the PDF using pdf-lib (Direct Drawing).
 */
export async function generateProposalPDF(data: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load Montserrat Fonts
  const fontDir = path.resolve(__dirname, '../templates/assets/fonts');
  const regularFontBytes = fs.readFileSync(path.join(fontDir, 'Montserrat-Regular.ttf'));
  const boldFontBytes = fs.readFileSync(path.join(fontDir, 'Montserrat-Bold.ttf'));
  
  const montserratRegular = await pdfDoc.embedFont(regularFontBytes);
  const montserratBold = await pdfDoc.embedFont(boldFontBytes);

  const assetsDir = path.resolve(__dirname, '../templates/assets');

  // Helper to draw background and footers
  const drawPageBase = async (pageIdx: number) => {
    const page = pdfDoc.addPage([595.28, 841.89]);
    const imgBytes = fs.readFileSync(path.join(assetsDir, `page${pageIdx}.png`));
    const img = await pdfDoc.embedPng(imgBytes);
    
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });

    // Footers (Proposal Ref & Date) - Common for most pages
    if (pageIdx !== 16) { // Skip footer on last page if needed or adjust
      page.drawText(`Proposal Ref No.: ${data.proposalRef || ''}`, {
        x: getX(9),
        y: getY(93.5),
        size: 9,
        font: montserratBold,
        color: rgb(0, 0.29, 0.68), // #004aad
      });

      page.drawText(`Dated: ${data.date ? new Date(data.date).toLocaleDateString() : ''}`, {
        x: getX(75),
        y: getY(93.5),
        size: 9,
        font: montserratBold,
        color: rgb(0, 0.29, 0.68),
      });
    }

    return page;
  };

  // --- Page 1 (Cover) ---
  const p1 = await drawPageBase(1);
  p1.drawText(data.clientName || 'CLIENT NAME', {
    x: getX(9),
    y: getY(11.5),
    size: 18,
    font: montserratBold,
    color: rgb(0.1, 0.23, 0.35), // #1a3a5a
  });

  // --- Page 2 (Site Info) ---
  const p2 = await drawPageBase(2);
  p2.drawText(data.location || '', {
    x: getX(22),
    y: getY(33.4),
    size: 11,
    font: montserratRegular,
    color: rgb(0, 0.29, 0.68),
  });
  p2.drawText(`${data.capacity || ''} KWp Solar Power Plant using TOPCON modules.`, {
    x: getX(20),
    y: getY(37.4),
    size: 10,
    font: montserratRegular,
    color: rgb(0, 0.29, 0.68),
  });
  p2.drawText(data.completionTime || '', {
    x: getX(33),
    y: getY(45.1),
    size: 11,
    font: montserratRegular,
    color: rgb(0, 0.29, 0.68),
  });

  // --- Page 3 ---
  await drawPageBase(3);

  // --- Page 4 (BOM Table) ---
  const p4 = await drawPageBase(4);
  // Drawing rows manually since tables aren't native to pdf-lib
  let startY = getY(13.8);
  const rowHeight = 25.5; 
  (data.bom || []).slice(0, 18).forEach((item: any, i: number) => {
    const currentY = startY - (i * rowHeight);
    p4.drawText(item.item || '', { x: getX(10), y: currentY, size: 9, font: montserratRegular });
    p4.drawText(item.description || '', { x: getX(30), y: currentY, size: 8, font: montserratRegular });
    p4.drawText(`${item.quantity || ''} ${item.unit || ''}`, { x: getX(80), y: currentY, size: 9, font: montserratRegular });
  });

  // --- Pages 5 & 6 ---
  await drawPageBase(5);
  await drawPageBase(6);

  // --- Page 7 (Commercials) ---
  const p7 = await drawPageBase(7);
  let commY = getY(23.5);
  (data.commercials || []).slice(0, 8).forEach((item: any, i: number) => {
    const currentY = commY - (i * 30);
    p7.drawText(item.milestone || '', { x: getX(20), y: currentY, size: 10, font: montserratRegular });
    p7.drawText(`${item.percentage || ''}%`, { x: getX(50), y: currentY, size: 10, font: montserratBold });
    p7.drawText(item.description || '', { x: getX(65), y: currentY, size: 9, font: montserratRegular });
  });

  // --- Pages 8 to 16 ---
  for (let i = 8; i <= 16; i++) {
    await drawPageBase(i);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Compatibility export for startup scripts
 */
export async function initBrowser() {
  return Promise.resolve();
}
