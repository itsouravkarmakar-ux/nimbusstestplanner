import { generateProposalPDF } from './services/pdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dummyData = {
  clientName: 'Test Client Ltd',
  proposalRef: 'NIM-2026-001',
  date: new Date().toISOString(),
  location: 'Kolkata, West Bengal',
  capacity: '500',
  moduleTech: 'Monocrystalline PERC',
  completionTime: '90',
  bom: [
    { item: 'Solar Modules', description: '540Wp Mono PERC', quantity: 926, unit: 'Nos' },
    { item: 'Inverter', description: '100kW String Inverter', quantity: 5, unit: 'Nos' }
  ],
  commercials: [
    { milestone: 'Advance', percentage: 20, description: 'Along with PO' },
    { milestone: 'Material Delivery', percentage: 50, description: 'Pro-rata basis' }
  ]
};

async function run() {
  const outputPath = path.join(__dirname, '../test_proposal.pdf');
  await generateProposalPDF(dummyData, outputPath);
  console.log(`Generated test PDF at: ${outputPath}`);
}

run();
