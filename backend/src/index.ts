import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import proposalRoutes from './routes/proposals.js';
import { initBrowser } from './services/pdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI;

// Production Fix: mongodb+srv URIs cannot have a port number. 
// Some users accidentally include :27017 which causes connection failure on Vercel.
if (MONGODB_URI && MONGODB_URI.startsWith('mongodb+srv://')) {
  const originalURI = MONGODB_URI;
  MONGODB_URI = MONGODB_URI.replace(/:[0-9]+(?=[/?]|$)/g, '');
  if (originalURI !== MONGODB_URI) {
    console.log('🔧 Sanitized MONGODB_URI (removed accidental port number)');
  }
}

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.1-diag', environment: process.env.NODE_ENV, vercel: !!process.env.VERCEL });
});
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);

// Database Connection and Server Start
console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Success: Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error: MongoDB connection failed:', error.message);
    // We keep the server running so we can see the errors on requests
  });

// ONLY run the server manually if NOT in production (Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    // Pre-warm the PDF browser in development
    initBrowser();
  });
}

export default app;
