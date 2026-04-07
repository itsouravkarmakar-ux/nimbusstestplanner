import { Router, type Request, type Response } from 'express';
import Proposal from '../models/Proposal.js';
import { generateProposalPDF } from '../services/pdfService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Create new proposal and generate PDF
router.post('/', async (req, res) => {
  try {
    const proposalData = req.body;
    const proposal = new Proposal(proposalData);
    
    // Mongoose validation
    const validationError = proposal.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: 'Fill all required fields correctly', 
        errors: Object.keys((validationError as any).errors).map((key: string) => ({ 
          field: key, 
          message: (validationError as any).errors[key]?.message || 'Invalid value' 
        }))
      });
    }
    
    // Generate PDF to Buffer (Vercel Fix)
    console.log(`Generating serverless PDF for proposal: ${proposal.proposalRef}`);
    const pdfBuffer = await generateProposalPDF(proposalData);
    
    // We can't save files to Vercel disk, so we'll store a placeholder in DB
    // and regenerate on download for this basic version.
    proposal.pdfPath = `proposal_${proposal.proposalRef}_READY`;
    proposal.status = 'generated';
    await proposal.save();
    
    res.status(201).json(proposal);
  } catch (error: any) {
    console.error('PROPOSAL CREATION ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF in production. Check logs.', 
      details: error.message 
    });
  }
});

// Get proposal history
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const proposals = await Proposal.find()
      .select('_id clientName proposalRef date location pdfPath status createdAt')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching proposals', error });
  }
});

// Download PDF (Streamed Binary)
router.get('/:id/pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    // Regeneration Strategy for Serverless
    // In a full production app, you'd use AWS S3, but for this fix, we regenerate to buffer.
    console.log(`Regenerating PDF buffer for download: ${proposal.proposalRef}`);
    const pdfBuffer = await generateProposalPDF(proposal);
    
    const fileName = `proposal_${(proposal.proposalRef || 'solar').replace(/\//g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('PDF DOWNLOAD ERROR:', error);
    res.status(500).json({ message: 'Could not generate/download PDF. Vercel timeout or Memory limit reached.', details: error.message });
  }
});

export default router;
