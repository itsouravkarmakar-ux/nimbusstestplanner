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
    
    const validationError = proposal.validateSync();
    if (validationError) {
      console.error('[PROPOSAL] Validation failed:', validationError.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: (validationError as any).errors 
      });
    }
    
    console.log(`[PROPOSAL] Creating proposal binary placeholder for: ${proposal.proposalRef}`);
    const pdfBuffer = await generateProposalPDF(proposalData);
    
    proposal.pdfPath = `proposal_${proposal.proposalRef}_STABLE`;
    proposal.status = 'generated';
    await proposal.save();
    
    res.status(201).json(proposal);
  } catch (error: any) {
    console.error('[PROPOSAL] POST FAILED:', error);
    res.status(500).json({ 
      message: 'Server failed to generate binary PDF Buffer.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Get proposal history with pagination and search
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { clientName: { $regex: search, $options: 'i' } },
          { proposalRef: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Proposal.countDocuments(query);
    const proposals = await Proposal.find(query)
      .select('_id clientName proposalRef date location pdfPath status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      proposals,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
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

    console.log(`[PROPOSAL] Re-generating PDF buffer for: ${proposal.proposalRef}`);
    const pdfBuffer = await generateProposalPDF(proposal);
    
    const fileName = `proposal_${(proposal.proposalRef || 'solar').replace(/\//g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('[PROPOSAL] DOWNLOAD FAILED:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF download.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

export default router;
