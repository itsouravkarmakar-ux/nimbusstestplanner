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
const MONGODB_URI = process.env.MONGODB_URI;

console.log('--- Server Starting ---');
console.log(`Node Environment: ${process.env.NODE_ENV}`);
console.log(`Target Port: ${PORT}`);

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  // Pre-warm the PDF browser
  initBrowser();
});

export default app;
