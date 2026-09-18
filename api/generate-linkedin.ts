import type { VercelRequest, VercelResponse } from '@vercel/node';

function resolveRegionHashtag(region: string): string {
  const r = (region || '').toLowerCase();
  if (r.includes('east') || r.includes('west') || r.includes('ping')) {
    return '#ping_mcn';
  }
  return '#CommuniqueIndia';
}

const CATEGORY_MAP: Record<string, string> = {
  events: 'Events or fund nights organised',
  collaborations: 'Collaborations or connections made',
  challenges: 'A challenge overcome',
  initiatives: 'A project or initiative kicked off',
  wins: 'Wins — big or small — from this month',
  learnings: 'Something new learned or explored',
  bts: 'A behind-the-scenes moment',
  growth: 'Personal growth as an ambassador'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = req.body || {};
  const selectedCategories: string[] = payload.selectedCategories || [];
  const categoryNotes: Record<string, string> = payload.categoryNotes || {};
  const tone = payload.tone || 'authentic';
  const formattedGid = (payload.gid || '').trim() || 'YOUR-GID';
  const expectedRegionHashtag = resolveRegionHashtag(payload.region);

  if (selectedCategories.length === 0) {
    return res.status(400).json({ error: 'Please select at least one highlight category.' });
  }

  const buildFallbackPost = () => {
    const highlights = selectedCategories.map(catId => {
      const name = CATEGORY_MAP[catId] || 'Monthly Highlight';
      const detail = categoryNotes[catId] || 'Explored Gemini AI capabilities with students on campus.';
      return `✨ ${name.toUpperCase()}:\n${detail}`;
    }).join('\n\n');

    return `Wrapping up another impactful month as a Google Student Ambassador! 🚀\n\nHere are some of the key milestones, learnings, and community highlights from our campus:\n\n${highlights}\n\nA huge thank you to everyone who participated, built, and supported our initiatives this month. Excited to continue empowering students with Google tools and AI innovations!\n\nWhat was your biggest breakthrough this month? Drop your thoughts below! 👇\n\nGID - ${formattedGid}\n\n@GoogleIndia @GoogleGeminiIndia\n\n#GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini ${expectedRegionHashtag}`;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    return res.status(200).json({
      post: buildFallbackPost(),
      categoriesUsed: selectedCategories,
      mode: 'heuristic-engine',
      generatedAt: new Date().toISOString()
    });
  }

  const categoriesPrompt = selectedCategories
    .map(id => `- ${CATEGORY_MAP[id] || id}: "${categoryNotes[id] || 'General milestone'}"`)
    .join('\n');

  const prompt = `You are an elite LinkedIn content creator and storyteller for Google Student Ambassadors (GSA).
Draft a high-impact, authentic, and engaging LinkedIn Monthly Highlights post (Pillar #3) based on the user's selected highlights.

TONE: ${tone === 'authentic' ? 'Authentic, story-driven, and humble' : tone === 'professional' ? 'Professional, leadership-focused, and metrics-driven' : 'Casual, high-energy, and enthusiastic'}

SELECTED MONTHLY HIGHLIGHTS:
${categoriesPrompt}

MANDATORY REQUIREMENTS:
1. Naturally weave the highlights into a cohesive, compelling LinkedIn post with a strong hook, well-spaced paragraphs, and emojis.
2. End with an engaging question to foster comments.
3. Automatically append the compliance footer at the very bottom:
   GID - ${formattedGid}

   @GoogleIndia @GoogleGeminiIndia

   #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini ${expectedRegionHashtag}

Return ONLY the complete post text. Do not wrap in quotes or JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!response.ok) {
      return res.status(200).json({
        post: buildFallbackPost(),
        categoriesUsed: selectedCategories,
        mode: 'heuristic-engine',
        generatedAt: new Date().toISOString()
      });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(200).json({
        post: buildFallbackPost(),
        categoriesUsed: selectedCategories,
        mode: 'heuristic-engine',
        generatedAt: new Date().toISOString()
      });
    }

    return res.status(200).json({
      post: rawText.trim(),
      categoriesUsed: selectedCategories,
      mode: 'gemini-2.5-flash',
      generatedAt: new Date().toISOString()
    });
  } catch {
    return res.status(200).json({
      post: buildFallbackPost(),
      categoriesUsed: selectedCategories,
      mode: 'heuristic-engine',
      generatedAt: new Date().toISOString()
    });
  }
}
