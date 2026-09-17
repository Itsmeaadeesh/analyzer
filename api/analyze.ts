import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeReelWithGemini, runHeuristicAnalysis, AnalyzePayload } from '../server/geminiService';
import { getThemeById } from '../src/themes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const payload: AnalyzePayload = req.body;
    if (!payload || (!payload.caption && !payload.idea)) {
      return res.status(400).json({ error: 'Please provide either a caption or a creative idea description.' });
    }

    // Default to East-West and Idea to Brand if not specified
    payload.region = 'East-West India (ping)';
    payload.themeId = 'idea-to-brand';

    const apiKey = process.env.GEMINI_API_KEY;
    let result;
    if (apiKey && apiKey.trim().length > 5) {
      result = await analyzeReelWithGemini(payload, apiKey);
    } else {
      const theme = getThemeById(payload.themeId);
      result = runHeuristicAnalysis(payload, theme);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel API error in /api/analyze:', error);
    try {
      const payload: AnalyzePayload = req.body;
      const theme = getThemeById(payload?.themeId || 'idea-to-brand');
      const fallback = runHeuristicAnalysis(payload, theme);
      return res.status(200).json(fallback);
    } catch {
      return res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
  }
}
