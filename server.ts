import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleGeminiGeneration } from './src/api-handlers.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Derive directories in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API Call] ${req.method} ${req.path}`);
  }
  next();
});

// Unified Gemini Generation Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Generation type is mandatory' });
    }
    const result = await handleGeminiGeneration(type, payload);
    res.json(result);
  } catch (error: any) {
    console.error("API error in /api/gemini/generate:", error);
    res.status(500).json({ error: error.message || 'Internal AI generator error' });
  }
});

// Serve static assets or mount Vite dev middleware
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  console.log("Mounting Vite Development Server Middleware...");
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  console.log("Serving Production Build files from /dist...");
  // Serve static build assets in production
  app.use(express.static(path.join(__dirname, 'dist')));

  // Fallback all secondary paths to index.html for React Router compatibility
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyForge AI Server running online at http://0.0.0.0:${PORT}`);
});
