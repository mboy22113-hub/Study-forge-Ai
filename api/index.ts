import express from 'express';
import { handleGeminiGeneration } from '../src/api-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Main Gemini Endpoint for Serverless Platform Environment
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Generation type is mandatory' });
    }
    const result = await handleGeminiGeneration(type, payload);
    return res.json(result);
  } catch (error: any) {
    console.error("Vercel Serverless Function error in /api/gemini/generate:", error);
    return res.status(500).json({ error: error.message || 'Internal serverless AI error' });
  }
});

// Fallback error response for general API routes setup
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Path ${req.path} not found` });
});

export default app;
