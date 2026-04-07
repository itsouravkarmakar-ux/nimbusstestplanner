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
    
    // Use Mongoose's built-in validation before starting the expensive PDF process
    const validationError = proposal.validateSync();
    if (validationError) {
      console.error('Validation failed pre-PDF:', (validationError as any).errors);
      return res.status(400).json({ 
        message: 'Fill all required fields correctly', 
        errors: Object.keys((validationError as any).errors).map((key: string) => ({ 
          field: key, 
          message: (validationError as any).errors[key]?.message || 'Invalid value' 
        }))
      });
    }
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate PDF
    const proposalRefString = proposal.proposalRef || 'fallback';
    const pdfFileName = `proposal_${proposalRefString.replace(/\//g, '_')}_${Date.now()}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFileName);
    
    console.log(`Generating PDF for proposal: ${proposalRefString}`);
    await generateProposalPDF(proposalData, pdfPath);
    console.log(`PDF successfully generated: ${pdfFileName}`);
    
    proposal.pdfPath = pdfFileName;
    proposal.status = 'generated';
    await proposal.save();
    
    res.status(201).json(proposal);
  } catch (error) {
    console.error('CRITICAL Error in proposal creation:');
    console.error(error);
    
    // If it's a duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A proposal with this Reference Number already exists. Please use a unique one.' });
    }

    res.status(500).json({ 
      message: error.name === 'ValidationError' ? 'Data validation failed' : 'Internal server error during PDF generation', 
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals', error });
  }
});

// Download PDF
router.get('/:id/pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let filePath = proposal.pdfPath ? path.join(uploadsDir, proposal.pdfPath) : '';

    if (!filePath || !fs.existsSync(filePath)) {
      // Regenerate the PDF if missing
      const proposalRefString = proposal.proposalRef || 'fallback';
      const pdfFileName = `proposal_${proposalRefString.replace(/\//g, '_')}_${Date.now()}.pdf`;
      filePath = path.join(uploadsDir, pdfFileName);
      
      await generateProposalPDF(proposal, filePath);
      
      proposal.pdfPath = pdfFileName;
      await Proposal.updateOne({ _id: proposal._id }, {
        $set: { pdfPath: pdfFileName, status: 'generated' }
      });
      proposal.pdfPath = pdfFileName;
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Error downloading PDF', error });
  }
});

export default router;
