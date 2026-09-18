import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  analyzeReelWithGemini, 
  analyzeLinkedInPostWithGemini, 
  generateLinkedInPostWithGemini, 
  AnalyzePayload, 
  LinkedInAnalyzePayload, 
  LinkedInGeneratePayload 
} from './geminiService';
import { fetchPostFromUrl } from './linkFetcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    status: 'ok',
    service: 'GSA Studio API',
    hasGeminiKey: hasKey,
    model: 'gemini-2.5-flash',
    supportedTasks: ['Task 2 (Reels)', 'Task 3 (LinkedIn)'],
    timestamp: new Date().toISOString()
  });
});

// Link auto-fetcher for Instagram Reels and LinkedIn posts
app.post('/api/fetch-link', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    const result = await fetchPostFromUrl(url);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/fetch-link:', error);
    return res.json({
      success: false,
      partial: true,
      platform: 'unknown',
      url: req.body?.url || '',
      message: error.message || "Couldn't fetch caption automatically. Please paste it manually."
    });
  }
});

// Reels analysis (Task 2)
const handleAnalyzeReel = async (req: express.Request, res: express.Response) => {
  try {
    const payload: AnalyzePayload = req.body;
    if (!payload.caption && !payload.idea) {
      return res.status(400).json({ error: 'Please provide either a caption or a creative idea description to analyze.' });
    }

    const result = await analyzeReelWithGemini(payload);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in analyze reel:', error);
    return res.status(500).json({
      error: 'Failed to analyze Reel submission',
      details: error.message || 'Internal server error'
    });
  }
};

app.post('/api/analyze', handleAnalyzeReel);
app.post('/api/analyze-reel', handleAnalyzeReel);

// LinkedIn analysis (Task 3)
app.post('/api/analyze-linkedin', async (req, res) => {
  try {
    const payload: LinkedInAnalyzePayload = req.body;
    if (!payload.postText && !payload.postUrl) {
      return res.status(400).json({ error: 'Please provide post text or a post URL to analyze.' });
    }

    const result = await analyzeLinkedInPostWithGemini(payload);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/analyze-linkedin:', error);
    return res.status(500).json({
      error: 'Failed to analyze LinkedIn post',
      details: error.message || 'Internal server error'
    });
  }
});

// LinkedIn post generator (Task 3)
app.post('/api/generate-linkedin', async (req, res) => {
  try {
    const payload: LinkedInGeneratePayload = req.body;
    if (!payload.selectedCategories || payload.selectedCategories.length === 0) {
      return res.status(400).json({ error: 'Please select at least one highlight category to generate a post.' });
    }

    const result = await generateLinkedInPostWithGemini(payload);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/generate-linkedin:', error);
    return res.status(500).json({
      error: 'Failed to generate LinkedIn post',
      details: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`[GSA Studio Server] Running on http://localhost:${PORT}`);
  console.log(`[GSA Studio Server] Gemini 2.5 Flash API Key status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT SET (using local fallback engine)'}`);
});
