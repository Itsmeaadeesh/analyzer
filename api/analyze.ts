import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RequirementCheckResult {
  id: number;
  title: string;
  passed: boolean;
  isCritical?: boolean;
  evidence: string;
  suggestion: string;
}

interface AnalysisResponse {
  overallVerdict: 'PASS' | 'FAIL';
  criticalFailTriggered: boolean;
  criticalFailReason?: string;
  score: number;
  totalRequirements: number;
  requirements: RequirementCheckResult[];
  summaryFeedback: string;
  fixChecklist: string[];
  analyzedAt: string;
  mode: 'gemini-2.5-flash' | 'heuristic-engine';
}

function runLocalCompliance(payload: { caption: string; idea?: string; gid: string; region: string }): AnalysisResponse {
  const captionLower = (payload.caption || '').toLowerCase();
  const ideaLower = (payload.idea || '').trim().toLowerCase();
  const cleanedGid = (payload.gid || '').trim();

  const results: RequirementCheckResult[] = [];

  // 1. Gemini chat/build process (CRITICAL)
  const buildKeywords = ['build', 'chat', 'chatted', 'gemini to build', 'name, tagline', 'brainstorm', 'prompt', 'selling', 'different'];
  const hasBuildChat = buildKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 1,
    title: "Gemini chat/build process is shown (name, tagline, what's being sold, what's different)",
    passed: hasBuildChat,
    isCritical: true,
    evidence: hasBuildChat ? "Gemini build/chat process referenced (name, tagline, USP)." : "Missing explicit evidence of the Gemini chat brainstorming process.",
    suggestion: "Show the screen recording or step-by-step chat where Gemini brainstormed your brand name, tagline, and value proposition."
  });

  // 2. Nano Banana visual reveal (CRITICAL)
  const hasNanoBanana = (captionLower.includes('nano banana') || captionLower.includes('nanobanana') || ideaLower.includes('nano banana'));
  results.push({
    id: 2,
    title: "Nano Banana visual reveal included (logo, poster, packaging, etc.)",
    passed: hasNanoBanana,
    isCritical: true,
    evidence: hasNanoBanana ? "Nano Banana visual reveal identified." : "Missing Nano Banana visual generation (logo, poster, or mockup).",
    suggestion: "Include the prompt and generation reveal in Nano Banana showing your logo, merchandise, or product mockup."
  });

  // 3. Free for students offer vocalized (CRITICAL)
  const offerKeywords = ['free for students', 'google ai plus is free', 'free right now', 'student offer', 'google ai plus'];
  const hasFreeOffer = offerKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 3,
    title: "\"Free for students\" / Google AI Plus offer said out loud, not buried",
    passed: hasFreeOffer,
    isCritical: true,
    evidence: hasFreeOffer ? "'Free for students' Google AI Plus offer included." : "Must state 'Google AI Plus is free for students' out loud in voiceover/audio and text.",
    suggestion: "Say out loud: 'Google AI Plus is free for students right now!' and reinforce it with text overlay."
  });

  // 4. Specific Gemini feature
  const featureKeywords = ['gemini', 'gemini 2.5', 'gemini 1.5', 'canvas', 'deep research', 'multimodal', 'nano banana', 'workspace', 'gemini live'];
  const hasSpecificFeature = featureKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 4,
    title: "A specific Gemini feature is identifiable",
    passed: hasSpecificFeature,
    isCritical: false,
    evidence: hasSpecificFeature ? "Specific Gemini capability or tool identified." : "No identifiable Gemini feature mentioned.",
    suggestion: "Explicitly name and show the Gemini feature you used (e.g., Canvas, Fast brainstorming, Multimodal reasoning)."
  });

  // 5. GID in caption
  const hasGidInCaption = Boolean(
    cleanedGid && cleanedGid !== 'YOUR-GID' && 
    (captionLower.includes(cleanedGid.toLowerCase()) || payload.caption.includes(cleanedGid))
  );
  results.push({
    id: 5,
    title: "GID appears in the caption",
    passed: hasGidInCaption,
    isCritical: false,
    evidence: hasGidInCaption ? `GID "${cleanedGid}" verified in caption.` : (cleanedGid ? `GID "${cleanedGid}" was not found in caption.` : "No GID entered in top settings."),
    suggestion: "Add 'GID - [Your ID]' clearly in the caption text."
  });

  // 6. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
  const requiredTags = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
  const missingTags = requiredTags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 6,
    title: "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
    passed: missingTags.length === 0,
    isCritical: false,
    evidence: missingTags.length === 0 ? "All 3 official handles tagged." : `Missing handles: ${missingTags.join(', ')}`,
    suggestion: "Ensure your caption includes: @GoogleIndia, @Googlegemini, and @GoogleGeminiIndia."
  });

  // 7. Core hashtags
  const requiredHashtags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 7,
    title: "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
    passed: missingHashtags.length === 0,
    isCritical: false,
    evidence: missingHashtags.length === 0 ? "Core campaign hashtags present." : `Missing core hashtags: ${missingHashtags.join(', ')}`,
    suggestion: "Include #GoogleStudentAmbassador #GSA2026 #TeamGemini in your caption."
  });

  // 8. Regional hashtag #ping_mcn (East-West India)
  const hasPing = captionLower.includes('#ping_mcn');
  results.push({
    id: 8,
    title: "Regional hashtag #ping_mcn present (East-West India)",
    passed: hasPing,
    isCritical: false,
    evidence: hasPing ? "Regional hashtag #ping_mcn verified for East-West region." : "Missing required regional hashtag #ping_mcn.",
    suggestion: "Ensure your caption includes #ping_mcn for the East-West India (ping) region."
  });

  const buildPassed = results.find(r => r.id === 1)?.passed;
  const nanoPassed = results.find(r => r.id === 2)?.passed;
  const freeOfferPassed = results.find(r => r.id === 3)?.passed;

  let criticalFail = false;
  let criticalFailReason = '';

  if (!buildPassed || !nanoPassed || !freeOfferPassed) {
    criticalFail = true;
    const missing = [];
    if (!buildPassed) missing.push("Gemini build process");
    if (!nanoPassed) missing.push("Nano Banana visual reveal");
    if (!freeOfferPassed) missing.push("Google AI Plus 'free for students' vocalization");
    criticalFailReason = `CRITICAL FAIL RULE TRIGGERED: Mentioning Gemini or showing an AI output is not enough. You are missing: ${missing.join(' + ')}.`;
  }

  const passedCount = results.filter(r => r.passed).length;
  const overallVerdict = (!criticalFail && passedCount >= 6) ? 'PASS' : 'FAIL';

  return {
    overallVerdict,
    criticalFailTriggered: criticalFail,
    criticalFailReason: criticalFail ? criticalFailReason : undefined,
    score: passedCount,
    totalRequirements: 8,
    requirements: results,
    summaryFeedback: overallVerdict === 'PASS' 
      ? "Awesome job! Your Reel submission satisfies the GSA Content Creation guidelines and meets all critical pillar criteria."
      : (criticalFail ? criticalFailReason : "Reel does not meet minimum compliance standards. Review the itemized checklist below."),
    fixChecklist: results.filter(r => !r.passed).map(r => `[#${r.id}] ${r.title}: ${r.suggestion}`),
    analyzedAt: new Date().toISOString(),
    mode: 'heuristic-engine'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!payload || !payload.caption) {
      return res.status(400).json({ error: 'Please provide a caption to analyze.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim().length < 5) {
      const result = runLocalCompliance(payload);
      return res.status(200).json(result);
    }

    // Call Gemini 2.5 Flash API
    const systemPrompt = `You are the Official Compliance Checker for Google Student Ambassador Instagram Reels (Pillar #2).
Theme: Idea to Brand. Region: East-West India (ping) (#ping_mcn).
Evaluate the 8 requirements:
1. Gemini chat/build process (CRITICAL)
2. Nano Banana visual reveal (CRITICAL)
3. "Free for students" / Google AI Plus said out loud (CRITICAL)
4. Specific Gemini feature
5. GID "${payload.gid}" in caption
6. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
7. Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini
8. Regional hashtag #ping_mcn

Critical Fail: Missing 1, 2, or 3 = AUTOMATIC OVERALL VERDICT: FAIL!
Return valid JSON matching:
{
  "overallVerdict": "PASS" | "FAIL",
  "criticalFailTriggered": boolean,
  "criticalFailReason": string,
  "score": number,
  "totalRequirements": 8,
  "requirements": [{"id": number, "title": string, "passed": boolean, "isCritical": boolean, "evidence": string, "suggestion": string}],
  "summaryFeedback": string,
  "fixChecklist": string[]
}`;

    const userPrompt = `Caption: "${payload.caption || ''}"\nGID: "${payload.gid || ''}"`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });

    if (!geminiRes.ok) {
      const fallback = runLocalCompliance(payload);
      return res.status(200).json(fallback);
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed: AnalysisResponse = JSON.parse(rawText.trim());
      parsed.analyzedAt = new Date().toISOString();
      parsed.mode = 'gemini-2.5-flash';
      return res.status(200).json(parsed);
    }

    const fallback = runLocalCompliance(payload);
    return res.status(200).json(fallback);
  } catch (error: any) {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const fallback = runLocalCompliance(payload || { caption: '', gid: '', region: '' });
      return res.status(200).json(fallback);
    } catch {
      return res.status(500).json({ error: 'Analysis failed' });
    }
  }
}
