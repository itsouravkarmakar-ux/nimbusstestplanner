import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper for coordinates (A4: 595.28 x 841.89 points)
const getX = (percent) => (percent / 100) * 595.28;
const getY = (percent) => 841.89 - (percent / 100) * 841.89;
/**
 * Generates the PDF using pdf-lib (Direct Drawing).
 */
export async function generateProposalPDF(data) {
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
    const drawPageBase = async (pageIdx) => {
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
    p1.drawText(data.companyName || '', {
        x: getX(9),
        y: getY(8),
        size: 14,
        font: montserratBold,
        color: rgb(0.1, 0.23, 0.35),
    });
    p1.drawText(data.clientName || 'CLIENT NAME', {
        x: getX(9),
        y: getY(11.5),
        size: 18,
        font: montserratBold,
        color: rgb(0.1, 0.23, 0.35),
    });
    p1.drawText(data.address || '', {
        x: getX(9),
        y: getY(14.5),
        size: 10,
        font: montserratRegular,
        color: rgb(0.1, 0.23, 0.35),
    });
    // --- Page 2 (Project Description) ---
    const p2 = await drawPageBase(2);
    p2.drawText(`${data.capacity || ''} KWp`, {
        x: getX(42),
        y: getY(33.4),
        size: 11,
        font: montserratBold,
        color: rgb(0, 0.29, 0.68),
    });
    const techText = `${data.installationType || ''} - ${data.moduleWp || ''} Wp`;
    p2.drawText(techText, {
        x: getX(42),
        y: getY(37.4),
        size: 11,
        font: montserratRegular,
        color: rgb(0, 0.29, 0.68),
    });
    const strucText = (data.structureType || []).join(', ');
    p2.drawText(strucText || 'N/A', {
        x: getX(42),
        y: getY(41.4),
        size: 11,
        font: montserratRegular,
        color: rgb(0, 0.29, 0.68),
    });
    p2.drawText(data.enableOpex ? 'Yes' : 'No', {
        x: getX(42),
        y: getY(45.4),
        size: 11,
        font: montserratRegular,
        color: rgb(0, 0.29, 0.68),
    });
    p2.drawText(`₹${data.perKwpCost || 0} (GST: ${data.gstPercentage || 0}%)`, {
        x: getX(42),
        y: getY(50.4),
        size: 11,
        font: montserratRegular,
        color: rgb(0, 0.29, 0.68),
    });
    // --- Page 3 (Project Calculation) ---
    const p3 = await drawPageBase(3);
    p3.drawText(`₹${(data.projectCost || 0).toLocaleString()}`, {
        x: getX(50),
        y: getY(45),
        size: 24,
        font: montserratBold,
        color: rgb(0, 0.29, 0.68),
    });
    // --- Page 4 (Payment Terms) ---
    const p4 = await drawPageBase(4);
    let termY = getY(25);
    (data.paymentTerms || []).forEach((term, i) => {
        const currentY = termY - (i * 35);
        p4.drawText(term.milestone || '', { x: getX(20), y: currentY, size: 10, font: montserratRegular });
        p4.drawText(`${term.percentage || 0}%`, { x: getX(70), y: currentY, size: 12, font: montserratBold });
    });
    // --- Page 5 (Carbon Footprint) ---
    const p5 = await drawPageBase(5);
    p5.drawText(`${(data.carbonFootprint || 0).toLocaleString()} Units/Year`, {
        x: getX(50),
        y: getY(45),
        size: 24,
        font: montserratBold,
        color: rgb(0.02, 0.58, 0.41), // Greenish
    });
    // --- Page 6 (Opex Details) ---
    const p6 = await drawPageBase(6);
    if (data.opexDetails) {
        p6.drawText(data.opexDetails, {
            x: getX(10),
            y: getY(20),
            size: 10,
            font: montserratRegular,
            maxWidth: getX(80),
            lineHeight: 14,
        });
    }
    // --- Page 7 (Array Image) ---
    const p7 = await drawPageBase(7);
    if (data.arrayAttachment) {
        try {
            const base64Data = data.arrayAttachment.split(',')[1];
            const imageBytes = Buffer.from(base64Data, 'base64');
            let embeddedImg;
            if (data.arrayAttachment.includes('image/png')) {
                embeddedImg = await pdfDoc.embedPng(imageBytes);
            }
            else {
                embeddedImg = await pdfDoc.embedJpg(imageBytes);
            }
            p7.drawImage(embeddedImg, {
                x: getX(10),
                y: getY(80),
                width: getX(80),
                height: getY(20) - getY(80), // Area from 20% to 80%? No, getY works differently.
            });
            // Correcting height/y for image:
            // If we want it in the middle:
            const imgDims = embeddedImg.scaleToFit(getX(80), 400);
            p7.drawImage(embeddedImg, {
                x: getX(50) - imgDims.width / 2,
                y: getY(50) - imgDims.height / 2,
                width: imgDims.width,
                height: imgDims.height,
            });
        }
        catch (err) {
            console.error('Error embedding array image:', err);
        }
    }
    // --- Page 8 (Feasibility) ---
    const p8 = await drawPageBase(8);
    // Header for Technical Data
    p8.drawText('Technical Feasibility Overview', { x: getX(10), y: getY(20), size: 14, font: montserratBold, color: rgb(0.1, 0.23, 0.35) });
    const feasYStart = 26;
    const feasLineHeight = 25;
    const feasFields = [
        { label: 'System Size:', value: `${data.feasibilitySystemSize || 0} kWp` },
        { label: 'Per kW Costing:', value: `₹${(data.feasibilityCosting || 0).toLocaleString()}` },
        { label: 'Electric Tariff (Current):', value: `₹${data.feasibilityTariff || 0}/Unit` },
        { label: 'Units Generated:', value: `${(data.feasibilityUnitGenerated || 0).toLocaleString()} Units` },
    ];
    feasFields.forEach((field, i) => {
        const yPos = getY(feasYStart + (i * 4)); // Using 4% vertical gap
        p8.drawText(field.label, { x: getX(10), y: yPos, size: 11, font: montserratBold });
        p8.drawText(field.value, { x: getX(40), y: yPos, size: 11, font: montserratRegular });
    });
    if (data.feasibilityDetails) {
        p8.drawText('Report Summary / Notes:', { x: getX(10), y: getY(50), size: 12, font: montserratBold });
        p8.drawText(data.feasibilityDetails, {
            x: getX(10),
            y: getY(54),
            size: 10,
            font: montserratRegular,
            maxWidth: getX(80),
            lineHeight: 14,
        });
    }
    // --- Pages 9 to 16 ---
    for (let i = 9; i <= 16; i++) {
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
//# sourceMappingURL=pdfService.js.map