import type { VercelRequest, VercelResponse } from '@vercel/node';

function resolveRegionHashtag(region: string): string {
  const r = (region || '').toLowerCase();
  if (r.includes('east') || r.includes('west') || r.includes('ping')) {
    return '#ping_mcn';
  }
  return '#CommuniqueIndia';
}

const CATEGORIES = [
  { id: 'events', name: 'Events or fund nights organised' },
  { id: 'collaborations', name: 'Collaborations or connections made' },
  { id: 'challenges', name: 'A challenge overcome' },
  { id: 'initiatives', name: 'A project or initiative kicked off' },
  { id: 'wins', name: 'Wins — big or small — from this month' },
  { id: 'learnings', name: 'Something new learned or explored' },
  { id: 'bts', name: 'A behind-the-scenes moment' },
  { id: 'growth', name: 'Personal growth as an ambassador' }
];

function runLocalLinkedInCompliance(payload: { postText: string; gid: string; region: string }) {
  const postText = payload.postText || '';
  const postLower = postText.toLowerCase();
  const cleanedGid = (payload.gid || '').trim();
  const expectedRegionHashtag = resolveRegionHashtag(payload.region);

  const categoryKeywords: Record<string, string[]> = {
    events: ['event', 'workshop', 'night', 'hackathon', 'session', 'demo day', 'study jam', 'attendee', 'hosted', 'organised', 'organized'],
    collaborations: ['collab', 'partner', 'chapter', 'faculty', 'professor', 'speaker', 'fellow gsa', 'community', 'joined forces'],
    challenges: ['challenge', 'hurdle', 'obstacle', 'difficult', 'pivot', 'low registration', 'bug', 'lesson', 'overcame', 'overcoming'],
    initiatives: ['launch', 'initiated', 'kicked off', 'started', 'group', 'sprint', 'newsletter', 'project', 'club'],
    wins: ['win', 'milestone', 'proud', 'breakthrough', 'success', 'record', 'achievement', 'first prototype', 'celebrate'],
    learnings: ['learned', 'learnt', 'insight', 'explored', 'discovered', 'deep research', 'canvas', 'multimodal', 'key takeaway'],
    bts: ['behind the scenes', 'bts', 'late night', 'prep', 'swag', 'stickers', 'setup', 'candid', 'hallway'],
    growth: ['growth', 'leadership', 'confidence', 'speaking', 'career', 'ambassador', 'journey', 'reflection', 'perspective']
  };

  const detectedCategories = CATEGORIES.map(cat => {
    const kws = categoryKeywords[cat.id] || [];
    const matched = kws.find(k => postLower.includes(k));
    return {
      id: cat.id,
      name: cat.name,
      detected: Boolean(matched),
      snippet: matched ? `Mentions "${matched}"` : undefined
    };
  });

  const hasAtLeastOneCategory = detectedCategories.some(c => c.detected);

  const mandatoryChecks = [];

  // Check 1: GID
  const hasGid = Boolean(
    cleanedGid && cleanedGid !== 'YOUR-GID' && 
    (postText.includes(cleanedGid) || postLower.includes(cleanedGid.toLowerCase()))
  );
  mandatoryChecks.push({
    id: 1,
    title: "GID appears in the post",
    passed: hasGid,
    isMandatory: true,
    evidence: hasGid ? `GID "${cleanedGid}" verified in post.` : (cleanedGid ? `GID "${cleanedGid}" missing from post text.` : "No GID entered."),
    suggestion: "Include 'GID - [Your ID]' near the end of your post."
  });

  // Check 2: Tags
  const requiredTags = ['@googleindia', '@googlegeminiindia'];
  const missingTags = requiredTags.filter(t => !postLower.includes(t));
  mandatoryChecks.push({
    id: 2,
    title: "Tags @GoogleIndia and @GoogleGeminiIndia present",
    passed: missingTags.length === 0,
    isMandatory: true,
    evidence: missingTags.length === 0 ? "Both @GoogleIndia and @GoogleGeminiIndia tagged." : `Missing tag(s): ${missingTags.join(', ')}`,
    suggestion: "Tag @GoogleIndia and @GoogleGeminiIndia in the post."
  });

  // Check 3: Mandatory hashtags
  const requiredHashtags = ['#googlestudentambassador', '#monthlyhighlights', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(h => !postLower.includes(h));
  mandatoryChecks.push({
    id: 3,
    title: "Mandatory campaign hashtags present",
    passed: missingHashtags.length === 0,
    isMandatory: true,
    evidence: missingHashtags.length === 0 ? "All 4 core campaign hashtags present." : `Missing hashtag(s): ${missingHashtags.join(', ')}`,
    suggestion: "Add #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini to the end of your post."
  });

  // Check 4: Regional hashtag
  const hasRegional = postLower.includes(expectedRegionHashtag.toLowerCase());
  mandatoryChecks.push({
    id: 4,
    title: `Regional hashtag ${expectedRegionHashtag} present (${payload.region})`,
    passed: hasRegional,
    isMandatory: true,
    evidence: hasRegional ? `Regional hashtag ${expectedRegionHashtag} verified.` : `Missing regional hashtag ${expectedRegionHashtag}.`,
    suggestion: `Include ${expectedRegionHashtag} in your hashtag list.`
  });

  const passedMandatory = mandatoryChecks.filter(c => c.passed).length;
  const overallVerdict = (passedMandatory === 4 && hasAtLeastOneCategory) ? 'PASS' : 'FAIL';

  const coachingTips: string[] = [];
  if (!hasAtLeastOneCategory) {
    coachingTips.push("Include at least one concrete monthly highlight (events, collaborations, challenges, initiatives, wins, learnings, bts, or growth).");
  }
  if (postText.length < 250) {
    coachingTips.push("Your post is quite brief. Expanding on personal impact and student reactions will drive deeper engagement.");
  }
  if (!postText.includes('?')) {
    coachingTips.push("Consider ending with a conversational question to boost comments and community dialogue.");
  }

  return {
    overallVerdict,
    hasAtLeastOneCategory,
    score: passedMandatory,
    totalMandatoryChecks: 4,
    detectedCategories,
    mandatoryChecks,
    summaryFeedback: overallVerdict === 'PASS'
      ? "Outstanding post! Meets all Pillar #3 monthly highlight requirements with active category storytelling."
      : (!hasAtLeastOneCategory ? "CRITICAL: You must feature at least one of the 8 monthly highlight categories." : "Post is missing one or more mandatory tags/hashtags or GID."),
    coachingTips,
    analyzedAt: new Date().toISOString(),
    mode: 'heuristic-engine'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = req.body || {};
  if (!payload.postText && !payload.postUrl) {
    return res.status(400).json({ error: 'Please provide post text or a post URL to analyze.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    return res.status(200).json(runLocalLinkedInCompliance(payload));
  }

  const expectedRegionHashtag = resolveRegionHashtag(payload.region);

  const systemPrompt = `You are the Official Compliance Checker and Writing Coach for Google Student Ambassador (GSA) LinkedIn Monthly Highlights (Pillar #3).
Evaluate the post against official rules:
1. Cover at least 1 of the 8 highlight categories: events, collaborations, challenges, initiatives, wins, learnings, bts, growth.
2. 4 Mandatory Checks:
   1) GID appears in post ("${payload.gid || 'entered GID'}")
   2) Tags @GoogleIndia and @GoogleGeminiIndia
   3) Mandatory hashtags: #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini
   4) Regional hashtag: "${expectedRegionHashtag}"

Return JSON only:
{
  "overallVerdict": "PASS" | "FAIL",
  "hasAtLeastOneCategory": boolean,
  "score": number (0-4),
  "totalMandatoryChecks": 4,
  "detectedCategories": [
    { "id": string, "name": string, "detected": boolean, "snippet": string }
  ],
  "mandatoryChecks": [
    { "id": number, "title": string, "passed": boolean, "isMandatory": true, "evidence": string, "suggestion": string }
  ],
  "summaryFeedback": string,
  "coachingTips": string[]
}`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nPOST TEXT:\n"""${payload.postText}"""\nGID: ${payload.gid}\nRegion: ${payload.region}` }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });

    if (!geminiRes.ok) {
      return res.status(200).json(runLocalLinkedInCompliance(payload));
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return res.status(200).json(runLocalLinkedInCompliance(payload));

    const parsed = JSON.parse(rawText.trim());
    parsed.analyzedAt = new Date().toISOString();
    parsed.mode = 'gemini-2.5-flash';
    return res.status(200).json(parsed);
  } catch {
    return res.status(200).json(runLocalLinkedInCompliance(payload));
  }
}
