import type { VercelRequest, VercelResponse } from '@vercel/node';
import analyzeReelHandler from './analyze-reel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return analyzeReelHandler(req, res);
}
