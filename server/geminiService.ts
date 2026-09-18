import { ThemeConfig, AnalysisResponse, RequirementCheckResult } from '../src/themes/types';
import { getThemeById, getRegionHashtag } from '../src/themes/index';
import { monthlyHighlightsConfig } from '../src/themes/monthlyHighlights';

export interface AnalyzePayload {
  caption: string;
  idea?: string;
  reelUrl?: string;
  videoFileName?: string;
  gid: string;
  region: string;
  themeId: string;
}

export interface LinkedInAnalyzePayload {
  postText: string;
  postUrl?: string;
  gid: string;
  region: string;
}

export interface LinkedInRequirementCheck {
  id: number;
  title: string;
  passed: boolean;
  isMandatory: boolean;
  evidence: string;
  suggestion: string;
}

export interface LinkedInCategoryCheck {
  id: string;
  name: string;
  detected: boolean;
  snippet?: string;
}

export interface LinkedInAnalysisResponse {
  overallVerdict: 'PASS' | 'FAIL';
  hasAtLeastOneCategory: boolean;
  score: number;
  totalMandatoryChecks: number;
  detectedCategories: LinkedInCategoryCheck[];
  mandatoryChecks: LinkedInRequirementCheck[];
  summaryFeedback: string;
  coachingTips: string[];
  analyzedAt: string;
  mode: 'gemini-2.5-flash' | 'heuristic-engine';
}

export interface LinkedInGeneratePayload {
  selectedCategories: string[];
  categoryNotes: Record<string, string>;
  tone?: 'authentic' | 'professional' | 'casual';
  gid: string;
  region: string;
}

export interface LinkedInGenerateResponse {
  post: string;
  categoriesUsed: string[];
  mode: 'gemini-2.5-flash' | 'heuristic-engine';
  generatedAt: string;
}

/**
 * Heuristic compliance checker for Reels (10 official requirements)
 */
export function runHeuristicAnalysis(payload: AnalyzePayload, theme: ThemeConfig): AnalysisResponse {
  const { caption = '', idea = '', gid = '', region = '' } = payload;
  const expectedRegionHashtag = getRegionHashtag(region, theme);
  const captionLower = caption.toLowerCase();
  const ideaLower = idea.trim().toLowerCase();

  const results: RequirementCheckResult[] = [];

  // Check 1: Random idea → real, visualized brand clearly shown
  const brandKeywords = ['brand', 'concept', 'company', 'startup', 'product', 'merch', 'apparel', 'store', 'shop', 'label', 'logo', 'identity'];
  const hasBrandVisual = brandKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 1,
    title: theme.requirements[0]?.title || "Random idea → real, visualized brand clearly shown",
    passed: hasBrandVisual,
    isCritical: false,
    evidence: hasBrandVisual 
      ? "Brand concept and tangible identity referenced." 
      : "No clear brand transformation or tangible product identity identified.",
    suggestion: theme.requirements[0]?.fixSuggestion || "Show the journey from a raw concept into a finished brand identity."
  });

  // Check 2: Gemini chat / build process shown (CRITICAL)
  const buildKeywords = ['build', 'chat', 'chatted', 'gemini to build', 'name, tagline', 'brainstorm', 'prompt', 'selling', 'different', 'usp'];
  const hasBuildChat = buildKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 2,
    title: theme.requirements[1]?.title || "The Gemini chat/build process is shown (name, tagline, what's being sold, what's different)",
    passed: hasBuildChat,
    isCritical: true,
    evidence: hasBuildChat 
      ? "Gemini build/chat process referenced (name, tagline, USP)." 
      : "Missing explicit evidence of the Gemini chat brainstorming process.",
    suggestion: theme.requirements[1]?.fixSuggestion || "Show the chat screen where Gemini brainstormed your brand name, tagline, and USP."
  });

  // Check 3: Nano Banana visual reveal included (CRITICAL)
  const hasNanoBanana = (captionLower.includes('nano banana') || captionLower.includes('nanobanana') || ideaLower.includes('nano banana'));
  results.push({
    id: 3,
    title: theme.requirements[2]?.title || "Nano Banana visual reveal included (logo, poster, packaging, etc.)",
    passed: hasNanoBanana,
    isCritical: true,
    evidence: hasNanoBanana 
      ? "Nano Banana visual reveal identified." 
      : "Missing Nano Banana visual generation (logo, poster, or mockup).",
    suggestion: theme.requirements[2]?.fixSuggestion || "Include visual creative assets generated with Nano Banana."
  });

  // Check 4: Free for students offer said out loud (CRITICAL)
  const offerKeywords = ['free for students', 'google ai plus is free', 'free right now', 'google ai plus offer', 'student offer', 'free'];
  const hasFreeOffer = offerKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 4,
    title: theme.requirements[3]?.title || "\"Free for students\" / Google AI Plus offer said out loud, not buried",
    passed: hasFreeOffer,
    isCritical: true,
    evidence: hasFreeOffer 
      ? "'Free for students' Google AI Plus offer included." 
      : "Must state 'Google AI Plus is free for students' out loud in voiceover/audio and text.",
    suggestion: theme.requirements[3]?.fixSuggestion || "Say out loud: 'Google AI Plus is free for students right now!' and show text overlay."
  });

  // Check 5: A specific Gemini feature is identifiable
  const featureKeywords = ['gemini', 'gemini 2.5', 'gemini 1.5', 'canvas', 'deep research', 'multimodal', 'nano banana', 'workspace', 'gemini live', 'flash'];
  const hasSpecificFeature = featureKeywords.some(k => captionLower.includes(k) || ideaLower.includes(k));
  results.push({
    id: 5,
    title: theme.requirements[4]?.title || "A specific Gemini feature is identifiable",
    passed: hasSpecificFeature,
    isCritical: false,
    evidence: hasSpecificFeature 
      ? "Specific Gemini capability or tool identified." 
      : "No identifiable Gemini feature mentioned.",
    suggestion: theme.requirements[4]?.fixSuggestion || "Explicitly name and show the Gemini feature you used."
  });

  // Check 6: Creative idea description is specific, not vague
  const isIdeaValid = idea.trim().length >= 25 && !['true', 'ai video', 'reel', 'cool', 'yes', 'good'].includes(ideaLower);
  results.push({
    id: 6,
    title: theme.requirements[5]?.title || "Creative idea description is specific, not vague",
    passed: isIdeaValid,
    isCritical: false,
    evidence: isIdeaValid 
      ? "Idea description provides clear context on the creative angle." 
      : (idea.trim().length === 0 ? "No creative idea description provided." : "Creative idea description is too brief or vague. Provide 1-2 descriptive sentences."),
    suggestion: theme.requirements[5]?.fixSuggestion || "Provide 1-2 detailed sentences explaining your exact brand concept and value proposition."
  });

  // Check 7: GID appears in caption
  const cleanedGid = gid.trim();
  const hasGidInCaption = Boolean(
    cleanedGid && cleanedGid !== 'YOUR-GID' && 
    (caption.includes(cleanedGid) || captionLower.includes(cleanedGid.toLowerCase()))
  );
  results.push({
    id: 7,
    title: theme.requirements[6]?.title || "GID appears in the caption",
    passed: hasGidInCaption,
    isCritical: false,
    evidence: hasGidInCaption 
      ? `GID "${cleanedGid}" verified in caption.` 
      : (cleanedGid ? `GID "${cleanedGid}" was not found in the caption.` : "No GID entered in top settings."),
    suggestion: theme.requirements[6]?.fixSuggestion || "Add 'GID - [Your ID]' clearly in the caption text."
  });

  // Check 8: Required tags: @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
  const requiredTags = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
  const missingTags = requiredTags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 8,
    title: theme.requirements[7]?.title || "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
    passed: missingTags.length === 0,
    isCritical: false,
    evidence: missingTags.length === 0 
      ? "All 3 official handles tagged (@GoogleIndia, @Googlegemini, @GoogleGeminiIndia)." 
      : `Missing handles: ${missingTags.join(', ')}`,
    suggestion: theme.requirements[7]?.fixSuggestion || "Ensure your caption includes: @GoogleIndia, @Googlegemini, and @GoogleGeminiIndia."
  });

  // Check 9: Core Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini
  const requiredHashtags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(tag => !captionLower.includes(tag));
  results.push({
    id: 9,
    title: theme.requirements[8]?.title || "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
    passed: missingHashtags.length === 0,
    isCritical: false,
    evidence: missingHashtags.length === 0 
      ? "Core campaign hashtags present (#GoogleStudentAmbassador, #GSA2026, #TeamGemini)." 
      : `Missing core hashtags: ${missingHashtags.join(', ')}`,
    suggestion: theme.requirements[8]?.fixSuggestion || "Include #GoogleStudentAmbassador #GSA2026 #TeamGemini in your caption."
  });

  // Check 10: Regional hashtag present
  const hasRegionalHashtag = captionLower.includes(expectedRegionHashtag.toLowerCase());
  results.push({
    id: 10,
    title: theme.requirements[9]?.title || "Regional hashtag present matching selected region",
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
      ? "Awesome job! Your Reel submission satisfies all GSA Content Creation guidelines and meets all critical pillar criteria."
      : (criticalFail ? criticalFailReason : "Reel does not meet minimum compliance standards. Review the itemized checklist below."),
    fixChecklist,
    analyzedAt: new Date().toISOString(),
    mode: 'heuristic-engine'
  };
}

/**
 * Server-side Gemini 2.5 Flash analyzer for Reels
 */
export async function analyzeReelWithGemini(payload: AnalyzePayload, apiKey?: string): Promise<AnalysisResponse> {
  const theme = getThemeById(payload.themeId);
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
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
2. The Gemini chat/build process is shown (name, tagline, what's being sold, what's different) (CRITICAL)
3. Nano Banana visual reveal included (logo, poster, packaging, etc.) (CRITICAL)
4. "Free for students" / Google AI Plus offer said out loud, not buried (CRITICAL)
5. A specific Gemini feature is identifiable
6. Creative idea description is specific, not vague
7. GID appears in the caption (must match "${payload.gid || 'entered GID'}")
8. Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia
9. Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present
10. Regional hashtag present — matching "${expectedRegionHashtag}"

CRITICAL RULE:
Mentioning Gemini or showing an AI output is not enough.
Missing Requirement 2 (Gemini build process), Requirement 3 (Nano Banana reveal), OR Requirement 4 ("free for students" line) = AUTOMATIC OVERALL VERDICT: FAIL!

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
- Creative Idea: """${payload.idea || ''}"""
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
      const fallback = runHeuristicAnalysis(payload, theme);
      fallback.summaryFeedback += " (Evaluated via local heuristic engine).";
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

/**
 * Heuristic compliance checker for LinkedIn Monthly Highlights
 */
export function runHeuristicLinkedInAnalysis(payload: LinkedInAnalyzePayload): LinkedInAnalysisResponse {
  const { postText = '', gid = '', region = '' } = payload;
  const postLower = postText.toLowerCase();
  const cleanedGid = gid.trim();
  const expectedRegionHashtag = getRegionHashtag(region);

  // 1. Detect which of the 8 highlight categories are present
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

  const detectedCategories: LinkedInCategoryCheck[] = monthlyHighlightsConfig.categories.map(cat => {
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

  // 2. 4 Mandatory Checks
  const mandatoryChecks: LinkedInRequirementCheck[] = [];

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

  // Check 2: Tags @GoogleIndia and @GoogleGeminiIndia
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

  // Check 3: Mandatory campaign hashtags
  const requiredHashtags = ['#googlestudentambassador', '#monthlyhighlights', '#gsa2026', '#teamgemini'];
  const missingHashtags = requiredHashtags.filter(h => !postLower.includes(h));
  mandatoryChecks.push({
    id: 3,
    title: "Mandatory hashtags present (#GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini)",
    passed: missingHashtags.length === 0,
    isMandatory: true,
    evidence: missingHashtags.length === 0 ? "All 4 core campaign hashtags present." : `Missing hashtag(s): ${missingHashtags.join(', ')}`,
    suggestion: "Add #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini to the end of your post."
  });

  // Check 4: Regional hashtag
  const hasRegionalHashtag = postLower.includes(expectedRegionHashtag.toLowerCase());
  mandatoryChecks.push({
    id: 4,
    title: `Regional hashtag ${expectedRegionHashtag} present (${region})`,
    passed: hasRegionalHashtag,
    isMandatory: true,
    evidence: hasRegionalHashtag ? `Regional hashtag ${expectedRegionHashtag} verified.` : `Missing regional hashtag ${expectedRegionHashtag}.`,
    suggestion: `Include ${expectedRegionHashtag} in your hashtag list.`
  });

  const passedMandatory = mandatoryChecks.filter(c => c.passed).length;
  const allMandatoryPassed = passedMandatory === 4;
  const overallVerdict = (allMandatoryPassed && hasAtLeastOneCategory) ? 'PASS' : 'FAIL';

  const coachingTips: string[] = [];
  if (!hasAtLeastOneCategory) {
    coachingTips.push("Include at least one concrete monthly highlight (e.g. an event hosted, a challenge solved, or a student project).");
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

/**
 * Server-side Gemini 2.5 Flash analyzer for LinkedIn
 */
export async function analyzeLinkedInPostWithGemini(payload: LinkedInAnalyzePayload, apiKey?: string): Promise<LinkedInAnalysisResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return runHeuristicLinkedInAnalysis(payload);
  }

  const expectedRegionHashtag = getRegionHashtag(payload.region);

  const systemPrompt = `You are the Official Compliance Checker and Writing Coach for Google Student Ambassador (GSA) LinkedIn Monthly Highlights (Pillar #3).
Your goal is to evaluate the ambassador's LinkedIn post against official rules:
1. It MUST cover at least 1 of the 8 highlight categories:
   - events: Events or fund nights organised
   - collaborations: Collaborations or connections made
   - challenges: A challenge overcome
   - initiatives: A project or initiative kicked off
   - wins: Wins — big or small — from this month
   - learnings: Something new learned or explored
   - bts: A behind-the-scenes moment
   - growth: Personal growth as an ambassador
2. 4 Mandatory Checks:
   1) GID appears in post ("${payload.gid || 'entered GID'}")
   2) Tags @GoogleIndia and @GoogleGeminiIndia
   3) Mandatory hashtags: #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini
   4) Regional hashtag: "${expectedRegionHashtag}"

Overall verdict: PASS if at least 1 category is present AND all 4 mandatory checks pass. Otherwise FAIL.

Return a JSON object:
{
  "overallVerdict": "PASS" | "FAIL",
  "hasAtLeastOneCategory": boolean,
  "score": number (0 to 4),
  "totalMandatoryChecks": 4,
  "detectedCategories": [
    { "id": string, "name": string, "detected": boolean, "snippet": string }
  ],
  "mandatoryChecks": [
    { "id": number (1 to 4), "title": string, "passed": boolean, "isMandatory": true, "evidence": string, "suggestion": string }
  ],
  "summaryFeedback": string,
  "coachingTips": string[]
}
Raw JSON only.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nPOST TEXT:\n"""${payload.postText}"""\nGID: ${payload.gid}\nRegion: ${payload.region}` }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      return runHeuristicLinkedInAnalysis(payload);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return runHeuristicLinkedInAnalysis(payload);

    const parsed: LinkedInAnalysisResponse = JSON.parse(rawText.trim());
    parsed.analyzedAt = new Date().toISOString();
    parsed.mode = 'gemini-2.5-flash';
    return parsed;
  } catch {
    return runHeuristicLinkedInAnalysis(payload);
  }
}

/**
 * Server-side Gemini 2.5 Flash post generator for LinkedIn
 */
export async function generateLinkedInPostWithGemini(payload: LinkedInGeneratePayload, apiKey?: string): Promise<LinkedInGenerateResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  const expectedRegionHashtag = getRegionHashtag(payload.region);
  const formattedGid = payload.gid?.trim() || 'YOUR-GID';
  const tone = payload.tone || 'authentic';

  // Build local fallback post
  const buildFallbackPost = () => {
    const categoryEntries = payload.selectedCategories
      .map(id => {
        const cat = monthlyHighlightsConfig.categories.find(c => c.id === id);
        const note = payload.categoryNotes[id]?.trim();
        if (!cat) return null;
        return `🌟 ${cat.name.toUpperCase()}\n${note || cat.placeholderPrompt}`;
      })
      .filter(Boolean)
      .join('\n\n');

    return `Wrapping up another impactful month as a Google Student Ambassador! 🚀✨\n\nHere are some of the biggest milestones, learnings, and community highlights from our campus:\n\n${categoryEntries || 'Hosted collaborative student sessions exploring Gemini AI and building real-world prototypes.'}\n\nA huge thank you to everyone who joined, built, and supported our initiatives this month. Excited to keep empowering students with Google tools!\n\nWhat was your biggest breakthrough this month? Drop it below! 👇\n\nGID - ${formattedGid}\n\n@GoogleIndia @GoogleGeminiIndia\n\n#GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini ${expectedRegionHashtag}`;
  };

  if (!key) {
    return {
      post: buildFallbackPost(),
      categoriesUsed: payload.selectedCategories,
      mode: 'heuristic-engine',
      generatedAt: new Date().toISOString()
    };
  }

  const categoriesPrompt = payload.selectedCategories
    .map(id => {
      const cat = monthlyHighlightsConfig.categories.find(c => c.id === id);
      const notes = payload.categoryNotes[id] || 'General milestone';
      return `- Category: "${cat?.name}" | User details: "${notes}"`;
    })
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!response.ok) {
      return {
        post: buildFallbackPost(),
        categoriesUsed: payload.selectedCategories,
        mode: 'heuristic-engine',
        generatedAt: new Date().toISOString()
      };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        post: buildFallbackPost(),
        categoriesUsed: payload.selectedCategories,
        mode: 'heuristic-engine',
        generatedAt: new Date().toISOString()
      };
    }

    return {
      post: rawText.trim(),
      categoriesUsed: payload.selectedCategories,
      mode: 'gemini-2.5-flash',
      generatedAt: new Date().toISOString()
    };
  } catch {
    return {
      post: buildFallbackPost(),
      categoriesUsed: payload.selectedCategories,
      mode: 'heuristic-engine',
      generatedAt: new Date().toISOString()
    };
  }
}
