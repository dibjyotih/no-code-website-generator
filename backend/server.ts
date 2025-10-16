import dotenv from 'dotenv';
// Load environment variables FIRST to ensure they are available for all imported modules.
dotenv.config({ path: 'backend/.env' });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import initializeRagSystem, { getRagStatus } from './rag-system/index.js';
import { generateEnhancedComponent } from './services/enhanced-generator.js';
import { generateSimpleComponent } from './services/simple-generator.js'; // Fallback generator

// Load environment variables
dotenv.config({ path: 'backend/.env' });

const app = express();
const port = process.env.PORT || 8000;
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// -- RAG-enhanced /generate endpoint --
app.post('/generate', upload.single('file'), async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    let generatedCode;
    if (getRagStatus()) {
      console.log('✅ RAG system is ready. Generating component with context...');
      generatedCode = await generateEnhancedComponent(prompt);
    } else {
      console.log('⚠️ RAG system not available. Falling back to simple generation...');
      generatedCode = await generateSimpleComponent(prompt);
    }
    res.json({ nextJsCode: generatedCode });
  } catch (error) {
    console.error('❌ Backend /generate endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate component.' });
  }
});

// Renaming the old /rag-generate endpoint to /generate for consistency
app.post('/rag-generate', (req, res) => {
  res.status(410).json({ message: 'This endpoint is deprecated. Please use /generate.' });
});

// Server Initialization
const startServer = async () => {
  try {
    // Initialize the RAG system but don't block server start if it fails
    await initializeRagSystem();

    app.listen(port, () => {
      if (getRagStatus()) {
        console.log(`✅ RAG-enhanced server running on http://localhost:${port}`);
      } else {
        console.log(`⚠️ Server running in fallback mode on http://localhost:${port} (RAG system failed to initialize)`);
      }
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

