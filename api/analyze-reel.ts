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

function resolveRegionHashtag(region: string): string {
  const r = (region || '').toLowerCase();
  if (r.includes('east') || r.includes('west') || r.includes('ping')) {
    return '#ping_mcn';
  }
  return '#CommuniqueIndia';
}

function runLocalCompliance(payload: { caption: string; idea?: string; gid: string; region: string }): AnalysisResponse {
  const caption = payload.caption || '';
  const idea = payload.idea || '';
  const captionLower = caption.toLowerCase();
  const ideaLower = idea.trim().toLowerCase();
  const cleanedGid = (payload.gid || '').trim();
  const expectedRegionHashtag = resolveRegionHashtag(payload.region);

  const results: RequirementCheckResult[] = [];

  // 1. Random idea → real, visualized brand clearly shown
  const brandKeywords = ['brand', 'concept', 'company', 'startup', 'product', 'merch', 'apparel', 'store', 'shop', 'label', 'logo', 'identity'];
  const hasBrandVisual = brandKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 1,
    title: "Random idea → real, visualized brand clearly shown",
    passed: hasBrandVisual,
    isCritical: false,
    evidence: hasBrandVisual ? "Brand concept and tangible identity referenced." : "No clear brand transformation or tangible product identity identified.",
    suggestion: "Show the journey from a raw concept into a finished brand identity."
  });

  // 2. Gemini chat/build process (CRITICAL)
  const buildKeywords = ['build', 'chat', 'chatted', 'gemini to build', 'name, tagline', 'brainstorm', 'prompt', 'selling', 'different', 'usp'];
  const hasBuildChat = buildKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 2,
    title: "The Gemini chat/build process is shown (name, tagline, what's being sold, what's different)",
    passed: hasBuildChat,
    isCritical: true,
    evidence: hasBuildChat ? "Gemini build/chat process referenced (name, tagline, USP)." : "Missing explicit evidence of the Gemini chat brainstorming process.",
    suggestion: "Show the screen recording or step-by-step chat where Gemini brainstormed your brand name, tagline, and value proposition."
  });

  // 3. Nano Banana visual reveal (CRITICAL)
  const hasNanoBanana = (captionLower.includes('nano banana') || captionLower.includes('nanobanana') || ideaLower.includes('nano banana'));
  results.push({
    id: 3,
    title: "Nano Banana visual reveal included (logo, poster, packaging, etc.)",
    passed: hasNanoBanana,
    isCritical: true,
    evidence: hasNanoBanana ? "Nano Banana visual reveal identified." : "Missing Nano Banana visual generation (logo, poster, or mockup).",
    suggestion: "Include the prompt and generation reveal in Nano Banana showing your logo, merchandise, or product mockup."
  });

  // 4. Free for students offer vocalized (CRITICAL)
  const offerKeywords = ['free for students', 'google ai plus is free', 'free right now', 'student offer', 'google ai plus'];
  const hasFreeOffer = offerKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 4,
    title: "\"Free for students\" / Google AI Plus offer said out loud, not buried",
    passed: hasFreeOffer,
    isCritical: true,
    evidence: hasFreeOffer ? "'Free for students' Google AI Plus offer included." : "Must state 'Google AI Plus is free for students' out loud in voiceover/audio and text.",
    suggestion: "Say out loud: 'Google AI Plus is free for students right now!' and reinforce it with text overlay."
  });

  // 5. Specific Gemini feature
  const featureKeywords = ['gemini', 'gemini 2.5', 'gemini 1.5', 'canvas', 'deep research', 'multimodal', 'nano banana', 'workspace', 'gemini live', 'flash'];
  const hasSpecificFeature = featureKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 5,
    title: "A specific Gemini feature is identifiable",
    passed: hasSpecificFeature,
    isCritical: false,
    evidence: hasSpecificFeature ? "Specific Gemini capability or tool identified." : "No identifiable Gemini feature mentioned.",
    suggestion: "Explicitly name and show the Gemini feature you used (e.g., Canvas, Fast brainstorming, Multimodal reasoning)."
  });

  // 6. Creative idea description is specific
  const isIdeaValid = idea.trim().length >= 25 && !['true', 'ai video', 'reel', 'cool', 'yes', 'good'].includes(ideaLower);
  results.push({
    id: 6,
    title: "Creative idea description is specific, not vague",
    passed: isIdeaValid,
    isCritical: false,
    evidence: isIdeaValid ? "Idea description provides clear context on the creative angle." : (idea.trim().length === 0 ? "No creative idea description provided." : "Creative idea description is too brief or vague."),
    suggestion: "Provide 1-2 detailed sentences explaining your exact brand concept and creative angle."
  });

  // 7. GID in caption
  const hasGidInCaption = Boolean(
    cleanedGid && cleanedGid !== 'YOUR-GID' && 
    (captionLower.includes(cleanedGid.toLowerCase()) || payload.caption.includes(cleanedGid))
  );
  results.push({
    id: 7,
    title: "GID appears in the caption",
    passed: hasGidInCaption,
    isCritical: false,
    evidence: hasGidInCaption ? `GID "${cleanedGid}" verified in caption.` : (cleanedGid ? `GID "${cleanedGid}" was not found in caption.` : "No GID entered in top settings."),
    suggestion: "Add 'GID - [Your ID]' clearly in the caption text."
  });

  // 8. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
  const requiredTags = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
  const missingTags = requiredTags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 8,
    title: "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
    passed: missingTags.length === 0,
    isCritical: false,
    evidence: missingTags.length === 0 ? "All 3 official handles tagged." : `Missing handles: ${missingTags.join(', ')}`,
    suggestion: "Ensure your caption includes: @GoogleIndia, @Googlegemini, and @GoogleGeminiIndia."
  });

  // 9. Core hashtags
  const requiredHashtags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 9,
    title: "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
    passed: missingHashtags.length === 0,
    isCritical: false,
    evidence: missingHashtags.length === 0 ? "Core campaign hashtags present." : `Missing core hashtags: ${missingHashtags.join(', ')}`,
    suggestion: "Include #GoogleStudentAmbassador #GSA2026 #TeamGemini in your caption."
  });

  // 10. Regional hashtag
  const hasRegional = captionLower.includes(expectedRegionHashtag.toLowerCase());
  results.push({
    id: 10,
    title: `Regional hashtag ${expectedRegionHashtag} present (${payload.region})`,
    passed: hasRegional,
    isCritical: false,
    evidence: hasRegional ? `Regional hashtag ${expectedRegionHashtag} verified.` : `Missing required regional hashtag ${expectedRegionHashtag}.`,
    suggestion: `Ensure your caption includes ${expectedRegionHashtag} for your selected region.`
  });

  const buildPassed = results.find(r => r.id === 2)?.passed;
  const nanoPassed = results.find(r => r.id === 3)?.passed;
  const freeOfferPassed = results.find(r => r.id === 4)?.passed;

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
  const overallVerdict = (!criticalFail && passedCount >= 8) ? 'PASS' : 'FAIL';

  return {
    overallVerdict,
    criticalFailTriggered: criticalFail,
    criticalFailReason: criticalFail ? criticalFailReason : undefined,
    score: passedCount,
    totalRequirements: 10,
    requirements: results,
    summaryFeedback: overallVerdict === 'PASS'
      ? "Awesome job! Your Reel submission satisfies all 10 GSA Content Creation guidelines and meets all critical pillar criteria."
      : (criticalFail ? criticalFailReason : "Reel does not meet minimum compliance standards. Review the itemized checklist below."),
    fixChecklist: results.filter(r => !r.passed).map(r => `[#${r.id}] ${r.title}: ${r.suggestion}`),
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
  if (!payload.caption && !payload.idea) {
    return res.status(400).json({ error: 'Please provide either a caption or a creative idea description to analyze.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    return res.status(200).json(runLocalCompliance(payload));
  }

  const expectedRegionHashtag = resolveRegionHashtag(payload.region);

  const systemPrompt = `You are the Official Compliance Checker and Coach for Google Student Ambassador (GSA) Instagram Reels submissions (Pillar #2: Content Creation with Reels).
Evaluate this Reel submission against the 10 official GSA requirements and enforce the CRITICAL FAIL RULE.

ACTIVE THEME: Idea to Brand
POV: "Show yourself turning a random idea into a real, visualized brand with Gemini and Nano Banana — then say the free part out loud: Google AI Plus is free for students right now."
CRITICAL FAIL RULE: "Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or saying the 'free for students' line out loud = FAIL."
AMBASSADOR GID: "${payload.gid || ''}"
SELECTED REGION: "${payload.region || ''}"
REQUIRED REGIONAL HASHTAG: "${expectedRegionHashtag}"

THE 10 REQUIREMENTS:
1. Random idea → real, visualized brand clearly shown
2. The Gemini chat/build process is shown (name, tagline, what's being sold, what's different) (CRITICAL)
3. Nano Banana visual reveal included (logo, poster, packaging, etc.) (CRITICAL)
4. "Free for students" / Google AI Plus offer said out loud, not buried (CRITICAL)
5. A specific Gemini feature is identifiable
6. Creative idea description is specific, not vague
7. GID appears in caption (must match "${payload.gid || 'entered GID'}")
8. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
9. Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present
10. Regional hashtag present (${expectedRegionHashtag})

CRITICAL RULE:
Missing Requirement 2, 3, or 4 = AUTOMATIC OVERALL VERDICT: FAIL!

Return JSON only:
{
  "overallVerdict": "PASS" | "FAIL",
  "criticalFailTriggered": boolean,
  "criticalFailReason": string,
  "score": number (0-10),
  "totalRequirements": 10,
  "requirements": [
    { "id": number, "title": string, "passed": boolean, "isCritical": boolean, "evidence": string, "suggestion": string }
  ],
  "summaryFeedback": string,
  "fixChecklist": string[]
}`;

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `${systemPrompt}\n\nSubmission Details:\nGID: ${payload.gid}\nRegion: ${payload.region} (${expectedRegionHashtag})\nIdea: """${payload.idea || ''}"""\nCaption:\n"""${payload.caption || ''}"""`
          }]
        }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });

    if (!geminiRes.ok) {
      return res.status(200).json(runLocalCompliance(payload));
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(200).json(runLocalCompliance(payload));
    }

    const parsed: AnalysisResponse = JSON.parse(rawText.trim());
    parsed.analyzedAt = new Date().toISOString();
    parsed.mode = 'gemini-2.5-flash';
    return res.status(200).json(parsed);
  } catch {
    return res.status(200).json(runLocalCompliance(payload));
  }
}
