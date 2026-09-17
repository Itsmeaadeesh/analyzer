import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.status(200).json({
    status: 'ok',
    service: 'GSA Reels Studio Compliance API (Vercel Serverless)',
    hasGeminiKey: hasKey,
    model: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
}
