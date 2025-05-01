import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import generateRouter from './routes/generate.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/generate', generateRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});