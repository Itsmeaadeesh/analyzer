import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { analyzeReelWithGemini, AnalyzePayload } from './geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    status: 'ok',
    service: 'GSA Reels Studio Compliance API',
    hasGeminiKey: hasKey,
    model: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const payload: AnalyzePayload = req.body;
    if (!payload.caption && !payload.idea) {
      return res.status(400).json({ error: 'Please provide either a caption or a creative idea description to analyze.' });
    }

    const result = await analyzeReelWithGemini(payload);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/analyze:', error);
    return res.status(500).json({
      error: 'Failed to analyze submission',
      details: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`[GSA Reels Studio Server] Running on http://localhost:${PORT}`);
  console.log(`[GSA Reels Studio Server] Gemini 2.5 Flash API Key status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT SET (using local fallback engine)'}`);
});
