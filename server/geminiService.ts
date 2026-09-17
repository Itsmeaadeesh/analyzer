import { ThemeConfig, AnalysisResponse, RequirementCheckResult } from '../src/themes/types';
import { getThemeById, getRegionHashtag } from '../src/themes/index';

export interface AnalyzePayload {
  caption: string;
  idea: string;
  reelUrl?: string;
  videoFileName?: string;
  gid: string;
  region: string;
  themeId: string;
}

/**
 * Heuristic compliance checker used as fallback or local validator
 */
export function runHeuristicAnalysis(payload: AnalyzePayload, theme: ThemeConfig): AnalysisResponse {
  const { caption, idea, gid, region } = payload;
  const expectedRegionHashtag = getRegionHashtag(region, theme);
  const captionLower = (caption || '').toLowerCase();
  const ideaLower = (idea || '').trim().toLowerCase();

  const results: RequirementCheckResult[] = [];

  // Check 1: Random idea -> real brand clearly shown
  const brandKeywords = ['brand', 'concept', 'name', 'tagline', 'product', 'merch', 'logo', 'apparel', 'coffee', 'startup', 'store', 'shop'];
  const hasBrandContext = ideaLower.length > 20 && brandKeywords.some(k => ideaLower.includes(k) || captionLower.includes(k));
  results.push({
    id: 1,
    title: theme.requirements[0].title,
    passed: hasBrandContext,
    isCritical: false,
    evidence: hasBrandContext 
      ? "Idea conveys a distinct brand concept." 
      : "Idea or caption lacks a clear brand transformation narrative.",
    suggestion: theme.requirements[0].fixSuggestion
  });

  // Check 2: Gemini chat / build process shown (CRITICAL)
  const buildKeywords = ['build', 'chat', 'chatted', 'gemini to build', 'name, tagline', 'brainstorm', 'prompt', 'selling', 'different'];
  const hasBuildChat = buildKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 2,
    title: theme.requirements[1].title,
    passed: hasBuildChat,
    isCritical: true,
    evidence: hasBuildChat 
      ? "Gemini build/chat process referenced (name, tagline, USP)." 
      : "Missing explicit evidence of the Gemini chat brainstorming process.",
    suggestion: theme.requirements[1].fixSuggestion
  });

  // Check 3: Nano Banana visual reveal included (CRITICAL)
  const nanoBananaKeywords = ['nano banana', 'nanobanana', 'visualized', 'visualise', 'logo', 'poster', 'packaging'];
  const hasNanoBanana = (captionLower.includes('nano banana') || captionLower.includes('nanobanana') || ideaLower.includes('nano banana')) &&
    nanoBananaKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 3,
    title: theme.requirements[2].title,
    passed: hasNanoBanana,
    isCritical: true,
    evidence: hasNanoBanana 
      ? "Nano Banana visual reveal identified." 
      : "Missing Nano Banana visual generation (logo, poster, or mockup).",
    suggestion: theme.requirements[2].fixSuggestion
  });

  // Check 4: Free for students offer said out loud (CRITICAL)
  const offerKeywords = ['free for students', 'google ai plus is free', 'free right now', 'google ai plus offer', 'student offer', 'free'];
  const hasFreeOffer = offerKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 4,
    title: theme.requirements[3].title,
    passed: hasFreeOffer,
    isCritical: true,
    evidence: hasFreeOffer 
      ? "'Free for students' Google AI Plus offer included." 
      : "Must state 'Google AI Plus is free for students' out loud in voiceover/audio and text.",
    suggestion: theme.requirements[3].fixSuggestion
  });

  // Check 5: A specific Gemini feature is identifiable
  const featureKeywords = ['gemini', 'gemini 2.5', 'gemini 1.5', 'canvas', 'deep research', 'multimodal', 'nano banana', 'workspace', 'gemini live'];
  const hasSpecificFeature = featureKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 5,
    title: theme.requirements[4].title,
    passed: hasSpecificFeature,
    isCritical: false,
    evidence: hasSpecificFeature 
      ? "Specific Gemini capability or tool identified." 
      : "No identifiable Gemini feature mentioned.",
    suggestion: theme.requirements[4].fixSuggestion
  });

  // Check 6: Creative idea description is specific, not vague
  const vagueTerms = ['true', 'ai video', 'cool video', 'nice', 'good', 'my video', 'reel', 'gemini video', 'video'];
  const isVague = vagueTerms.includes(ideaLower) || ideaLower.length < 15;
  results.push({
    id: 6,
    title: theme.requirements[5].title,
    passed: !isVague,
    isCritical: false,
    evidence: !isVague 
      ? "Creative description contains concrete details." 
      : "Description is too brief or generic. Vague inputs like 'true' or 'AI video' are rejected.",
    suggestion: theme.requirements[5].fixSuggestion
  });

  // Check 7: GID appears in caption
  const cleanedGid = (gid || '').trim();
  const hasGidInCaption = Boolean(
    cleanedGid && cleanedGid !== 'YOUR-GID' && 
    (caption.includes(cleanedGid) || caption.match(new RegExp(`\\b${cleanedGid}\\b`, 'i')))
  );
  results.push({
    id: 7,
    title: theme.requirements[6].title,
    passed: hasGidInCaption,
    isCritical: false,
    evidence: hasGidInCaption 
      ? `GID "${cleanedGid}" verified in caption.` 
      : (cleanedGid ? `GID "${cleanedGid}" was not found in the caption.` : "No GID entered in top settings."),
    suggestion: theme.requirements[6].fixSuggestion
  });

  // Check 8: Required tags: @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
  const requiredTags = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
  const missingTags = requiredTags.filter(tag => !captionLower.includes(tag));
  const hasAllTags = missingTags.length === 0;
  results.push({
    id: 8,
    title: theme.requirements[7].title,
    passed: hasAllTags,
    isCritical: false,
    evidence: hasAllTags 
      ? "All 3 official handles tagged (@GoogleIndia, @Googlegemini, @GoogleGeminiIndia)." 
      : `Missing handles: ${missingTags.join(', ')}`,
    suggestion: theme.requirements[7].fixSuggestion
  });

  // Check 9: Core Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini
  const requiredHashtags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(tag => !captionLower.includes(tag));
  const hasCoreHashtags = missingHashtags.length === 0;
  results.push({
    id: 9,
    title: theme.requirements[8].title,
    passed: hasCoreHashtags,
    isCritical: false,
    evidence: hasCoreHashtags 
      ? "Core campaign hashtags present (#GoogleStudentAmbassador, #GSA2026, #TeamGemini)." 
      : `Missing core hashtags: ${missingHashtags.join(', ')}`,
    suggestion: theme.requirements[8].fixSuggestion
  });

  // Check 10: Regional hashtag present
  const hasRegionalHashtag = captionLower.includes(expectedRegionHashtag.toLowerCase());
  results.push({
    id: 10,
    title: theme.requirements[9].title,
    passed: hasRegionalHashtag,
    isCritical: false,
    evidence: hasRegionalHashtag 
      ? `Regional hashtag ${expectedRegionHashtag} verified for ${region}.` 
      : `Missing required regional hashtag ${expectedRegionHashtag} for ${region}.`,
    suggestion: `Ensure your caption has ${expectedRegionHashtag} for region "${region}".`
  });

  // Critical Fail Rule:
  // "Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or saying the 'free for students' line out loud = FAIL."
  const buildPassed = results.find(r => r.id === 2)?.passed;
  const nanoPassed = results.find(r => r.id === 3)?.passed;
  const freeOfferPassed = results.find(r => r.id === 4)?.passed;

  let criticalFail = false;
  let criticalFailReason = '';

  if (!buildPassed || !nanoPassed || !freeOfferPassed) {
    criticalFail = true;
    const missingCrucial = [];
    if (!buildPassed) missingCrucial.push("Gemini build process (chat conversation)");
    if (!nanoPassed) missingCrucial.push("Nano Banana visual reveal (logo/poster/merch)");
    if (!freeOfferPassed) missingCrucial.push("Google AI Plus 'free for students' vocalization");
    
    criticalFailReason = `CRITICAL FAIL RULE TRIGGERED: Mentioning Gemini or showing an AI output is not enough. You are missing: ${missingCrucial.join(' + ')}.`;
  }

  const passedCount = results.filter(r => r.passed).length;
  const overallVerdict = (!criticalFail && passedCount >= 8) ? 'PASS' : 'FAIL';

  const fixChecklist = results
    .filter(r => !r.passed)
    .map(r => `[#${r.id}] ${r.title}: ${r.suggestion}`);

  return {
    overallVerdict,
    criticalFailTriggered: criticalFail,
    criticalFailReason: criticalFail ? criticalFailReason : undefined,
    score: passedCount,
    totalRequirements: 10,
    requirements: results,
    summaryFeedback: overallVerdict === 'PASS' 
      ? "Awesome job! Your Reel submission satisfies the GSA Content Creation guidelines and meets all critical pillar criteria."
      : (criticalFail ? criticalFailReason : "Reel does not meet minimum compliance standards. Review the itemized checklist below."),
    fixChecklist,
    analyzedAt: new Date().toISOString(),
    mode: 'heuristic-engine'
  };
}

/**
 * Server-side Gemini 2.5 Flash analyzer
 */
export async function analyzeReelWithGemini(payload: AnalyzePayload, apiKey?: string): Promise<AnalysisResponse> {
  const theme = getThemeById(payload.themeId);
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    console.log('[GeminiService] GEMINI_API_KEY not found in environment, using heuristic analyzer engine.');
    return runHeuristicAnalysis(payload, theme);
  }

  const expectedRegionHashtag = getRegionHashtag(payload.region, theme);

  const systemPrompt = `You are the Official Compliance Checker and Coach for Google Student Ambassador (GSA) Instagram Reels submissions (Pillar #2: Content Creation with Reels).
Your mission is to rigorously evaluate an ambassador's Reel submission against the 10 official GSA requirements and enforce the CRITICAL FAIL RULE.

ACTIVE THEME: ${theme.name}
POV: "${theme.pov}"
CRITICAL FAIL RULE: "${theme.criticalFailRule}"
AMBASSADOR GID: "${payload.gid}"
SELECTED REGION: "${payload.region}"
REQUIRED REGIONAL HASHTAG: "${expectedRegionHashtag}"
REQUIRED MENTIONS: @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
REQUIRED CORE HASHTAGS: #GoogleStudentAmbassador, #GSA2026, #TeamGemini

THE 10 OFFICIAL REQUIREMENTS:
1. Random idea → real, visualized brand clearly shown
2. The Gemini chat/build process is shown (name, tagline, what's being sold, what's different)
3. Nano Banana visual reveal included (logo, poster, packaging, etc.)
4. "Free for students" / Google AI Plus offer said out loud, not buried
5. A specific Gemini feature is identifiable
6. Creative idea description is specific, not vague (vague entries like 'true' or 'AI video' are REJECTED)
7. GID appears in the caption (must match "${payload.gid || 'entered GID'}")
8. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
9. Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present
10. Regional hashtag present — matching "${expectedRegionHashtag}"

CRITICAL RULE:
Mentioning Gemini or showing an AI output is not enough.
Missing Requirement 2 (Gemini build process), Requirement 3 (Nano Banana reveal), OR Requirement 4 ("free for students" line) = AUTOMATIC OVERALL VERDICT: FAIL!

Evaluate the submitted caption, creative idea description, and context.
Return a valid, well-formed JSON object strictly matching this schema:
{
  "overallVerdict": "PASS" | "FAIL",
  "criticalFailTriggered": boolean,
  "criticalFailReason": string (or empty if not triggered),
  "score": number (count of passed items, 0 to 10),
  "totalRequirements": 10,
  "requirements": [
    {
      "id": number (1 to 10),
      "title": string,
      "passed": boolean,
      "isCritical": boolean,
      "evidence": string,
      "suggestion": string
    }
  ],
  "summaryFeedback": string,
  "fixChecklist": string[]
}
DO NOT wrap in markdown fences or backticks. Return raw JSON only.`;

  const userPrompt = `Submission Details to Analyze:
- GID: ${payload.gid}
- Region: ${payload.region} (Expected hashtag: ${expectedRegionHashtag})
- Monthly Theme: ${theme.name}
- Reel URL: ${payload.reelUrl || 'Not provided (analyzing text & metadata)'}
- Video File: ${payload.videoFileName || 'Not uploaded'}
- Creative Idea Description:
"""
${payload.idea || '[No description provided]'}
"""
- Reel Caption:
"""
${payload.caption || '[No caption provided]'}
"""`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[GeminiService] Gemini API returned ${response.status}: ${errText}. Falling back to heuristic analysis.`);
      const fallback = runHeuristicAnalysis(payload, theme);
      fallback.summaryFeedback += " (Evaluated via local heuristic engine due to API quota or key configuration).";
      return fallback;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("No response text from Gemini");
    }

    const parsed: AnalysisResponse = JSON.parse(rawText.trim());
    parsed.analyzedAt = new Date().toISOString();
    parsed.mode = 'gemini-2.5-flash';
    return parsed;
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini 2.5 Flash:', error);
    const fallback = runHeuristicAnalysis(payload, theme);
    fallback.summaryFeedback += " (Evaluated via local heuristic engine).";
    return fallback;
  }
}
