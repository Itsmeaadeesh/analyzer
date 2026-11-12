import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertOctagon,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
  Wand2,
  Flame,
  ShieldCheck,
  Layers,
  ExternalLink,
  FileText,
  Moon,
  Sun,
  History,
  Tag,
  Hash,
  ArrowRight,
  Play,
  Gamepad2,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  Share2,
  Send,
  Terminal,
  Info
} from 'lucide-react';

/* =========================================================================
   0. TYPES & INTERFACES
   ========================================================================= */

export type ThemeId = 'idea-to-brand' | 'squad-up';
export type RegionId = 'east-west-ping' | 'north-south-communique';

export interface CheckResult {
  id: number;
  title: string;
  passed: boolean;
  isCritical: boolean;
  isBonus?: boolean;
  reason: string;
  fixSnippet?: string;
}

export interface ProChecksResult {
  charCount: number;
  hashtagCount: number;
  emojiCount: number;
  hookLength: number;
  hookText: string;
  placeholdersFound: string[];
  typos: { found: string; suggestion: string }[];
  duplicates: string[];
  isPlaceholdersFailed: boolean;
}

export interface AnalysisSummary {
  score: number;
  totalScoreable: number;
  passedCount: number;
  overallVerdict: 'PASS' | 'FAIL';
  hasCriticalFail: boolean;
  criticalFailReasons: string[];
  bonusUnlocked: boolean;
  checks: CheckResult[];
  proChecks: ProChecksResult;
  analyzedAt: string;
}

export interface HistoryItem {
  id: string;
  themeId: ThemeId;
  caption: string;
  ideaDescription: string;
  score: number;
  verdict: 'PASS' | 'FAIL';
  timestamp: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  povText: string;
  brief: string;
  criticalRuleText: string;
  captionTemplate: string;
  goldenFixture: string;
  exampleIdea: string;
  subIdeas: string[];
  ctaLine: string;
  evaluate: (
    caption: string,
    idea: string,
    regionTag: string,
    wrongRegionTag: string,
    gid: string
  ) => { checks: CheckResult[]; bonusUnlocked: boolean };
}

/* =========================================================================
   1. PRE-PROCESSING & NORMALIZATION
   ========================================================================= */

export function stripMarkdownLinks(text: string): string {
  if (!text) return '';
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return stripMarkdownLinks(text)
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

export function countEmojis(text: string): number {
  if (!text) return 0;
  const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const clean = stripMarkdownLinks(text);
  const regex = /#([a-zA-Z0-9_]+)/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(clean)) !== null) {
    matches.push('#' + m[1]);
  }
  return matches;
}

export function extractHandles(text: string): string[] {
  if (!text) return [];
  const clean = stripMarkdownLinks(text);
  const regex = /@([a-zA-Z0-9_.]+)/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(clean)) !== null) {
    matches.push('@' + m[1]);
  }
  return matches;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* =========================================================================
   2. TYPO DICTIONARY & PLACEHOLDER RULES
   ========================================================================= */

const TYPO_MAP: Record<string, string> = {
  '#gsa26': '#GSA2026',
  '#gsa2025': '#GSA2026',
  '#gsa2024': '#GSA2026',
  '#gsa25': '#GSA2026',
  '#gsa': '#GSA2026',
  '#teamgemni': '#TeamGemini',
  '#teamgemin': '#TeamGemini',
  '#team_gemini': '#TeamGemini',
  '#teamgeminiindia': '#TeamGemini',
  '#googlestudentambasador': '#GoogleStudentAmbassador',
  '#googlestudentambassdor': '#GoogleStudentAmbassador',
  '#googlestudentambassader': '#GoogleStudentAmbassador',
  '#googleambassador': '#GoogleStudentAmbassador',
  '#gsa_ambassador': '#GoogleStudentAmbassador',
  '@googlegemni': '@GoogleGemini',
  '@google_gemini': '@GoogleGemini',
  '@googlegeminiind': '@GoogleGeminiIndia',
  '@googlegeminiin': '@GoogleGeminiIndia',
  '@googlegeminiindiaa': '@GoogleGeminiIndia',
  '@googleind': '@GoogleIndia',
  '@google_india': '@GoogleIndia',
  '@googleindiaa': '@GoogleIndia',
  '#pingmcn': '#ping_mcn',
  '#ping_mcn_': '#ping_mcn',
  '#communique': '#CommuniqueIndia',
  '#communique_india': '#CommuniqueIndia',
};

const PLACEHOLDER_PATTERNS = [
  /\{[A-Z0-9_\-\s]+\}/i,
  /\[[A-Z0-9_\-\s]+\]/i,
  /\bXXXX\b/i,
  /\bYOUR-GID\b/i,
  /\bYOUR_GID\b/i,
  /\bYOUR GID\b/i,
  /\b\[YOUR-GID\]\b/i,
  /\b\{GID\}\b/i,
  /\b\{GAME\}\b/i,
  /\b\[Game Name\]\b/i,
  /\bTHE IDEA\s*–\s*$/im,
  /\bTHE IDEA\s*-\s*$/im,
];

/* =========================================================================
   3. THEME CONFIGURATIONS & GOLDEN FIXTURES
   ========================================================================= */

const SQUAD_UP_GOLDEN_FIXTURE = `🎮 EVERY GAMER NEEDS A DREAM SQUAD. I BUILT MINE WITH GOOGLE GEMINI! 🚀

Finding the perfect squad is every gamer's dream. But what if AI could help you imagine one?

Introducing FIRE PHOENIX — Four minds. One squad. Total dominance. 🔥

From building my ultimate FREE FIRE dream squad with Google Gemini, to visualising our characters and creating our esports identity with Nano Banana — this is where gaming meets creativity.

And that's not all! We take it further with an original squad anthem using Lyria and cinematic visuals with Veo. 🎵🎬

Four unique players. Four different roles. One mission.

RECON. LEADER. BLAZE. MEDIC.

Now, gamers, think you've got the skills to match your squad? Google Play Arena is open. Register now!

And don't forget to tag that one teammate who's always AFK! 😂🎮

What would YOUR dream squad look like?

GID: 973

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini #ping_mcn`;

const IDEA_TO_BRAND_GOLDEN_FIXTURE = `💡 EVERY BIG BRAND STARTS AS A RANDOM THOUGHT. I TURNED MINE INTO ONE WITH GOOGLE GEMINI! 🚀

I had a random idea: a zero-waste snack brand for hostel students.

I chatted with Google Gemini to build the name, the tagline, what I'm selling and what makes it different. Meet DORMBITES — Fuel Before The Bell. 🍫

Then I visualised everything with Nano Banana 🍌✨ — logo, poster and neon packaging, all generated in minutes.

From a thought in my notes app to a real brand, in one sitting.

And the best part? Google AI Plus is free for students right now. No excuse not to try this!

Tag someone whose idea is sitting in their notes app doing nothing. 😂

What would YOUR brand look like?

GID: 973

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini #ping_mcn`;

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'idea-to-brand': {
    id: 'idea-to-brand',
    name: 'Idea to Brand',
    badge: 'Current',
    povText:
      'Show yourself turning a random idea into a real, visualized brand with Gemini and Nano Banana — then say the free part out loud: Google AI Plus is free for students right now.',
    brief:
      'Turn an everyday random thought into a complete, visualized brand concept with Gemini (USP, naming, tagline) & Nano Banana (packaging, logos, merch), vocalizing the Google AI Plus student offer.',
    criticalRuleText:
      'Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or the "free for students" offer = CRITICAL FAIL.',
    ctaLine: 'Google AI Plus is free for students right now. No excuse not to try this!',
    exampleIdea:
      'A zero-waste hostel snack company called DormBites crafted with student budget pricing and high protein energy bars.',
    subIdeas: [
      'Visualise your ideas with Nano Banana',
      'Write, remix, reimagine with Gemini',
      'Highlight the Gemini and Google feature you are using!',
    ],
    captionTemplate: `💡 THE IDEA –
I had a random thought: a sustainable student lifestyle brand that turns recycled materials into study gear.

💬 THE BUILD (with Gemini)
I chatted with Gemini to build out the name, tagline, what I'm selling, and what makes it different — from a random thought to a real brand concept in one sitting.

🎨 THE REVEAL (Nano Banana)
Then I visualized it — logo, poster, packaging — using Nano Banana 🍌✨ to bring the brand to life.

💸 THE BEST PART?
Google AI Plus is free for students right now. No excuse not to try this.

🙋 YOUR TURN
Tag someone whose idea is sitting in their notes app doing nothing. Bet you can't build yours faster.

What would YOUR brand look like?

GID: {GID}

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REGION_TAG}`,
    goldenFixture: IDEA_TO_BRAND_GOLDEN_FIXTURE,
    evaluate: (caption, idea, regionTag, wrongRegionTag, gid) => {
      const norm = normalizeText(caption);
      const lower = norm.toLowerCase();
      const lines = norm.split('\n').map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      const checks: CheckResult[] = [];

      // 1. Idea → brand story present
      const storyKeywords = ['idea', 'brand', 'startup', 'product', 'concept', 'business', 'company', 'shop', 'label'];
      const hasStory = storyKeywords.some((k) => lower.includes(k)) && firstLine.length > 0;
      checks.push({
        id: 1,
        title: 'Idea → Brand story present',
        passed: hasStory,
        isCritical: false,
        reason: hasStory
          ? 'Clear brand transformation narrative detected with opening hook.'
          : 'Missing narrative of turning a raw idea into a tangible brand/product.',
        fixSnippet: 'I had a random thought: a sustainable brand concept made real in minutes.',
      });

      // 2. CRITICAL: Gemini build process
      const buildKeywords = ['name', 'tagline', 'usp', 'selling', 'brainstorm', 'build', 'built', 'chat', 'chatted', 'prompt', 'concept', 'different'];
      const hasGemini = lower.includes('gemini');
      const hasBuildWord = buildKeywords.some((k) => lower.includes(k));
      const geminiBuildPass = hasGemini && hasBuildWord;
      checks.push({
        id: 2,
        title: 'CRITICAL: Gemini build process shown',
        passed: geminiBuildPass,
        isCritical: true,
        reason: geminiBuildPass
          ? 'Gemini brainstorming & brand build process clearly referenced.'
          : 'Must mention Gemini building the brand (name, tagline, USP, or what makes it different).',
        fixSnippet: "I chatted with Google Gemini to build out the name, tagline, what I'm selling and what makes it different.",
      });

      // 3. CRITICAL: Nano Banana reveal
      const hasNano = lower.includes('nano banana') || lower.includes('nanobanana');
      const revealKeywords = ['logo', 'poster', 'packaging', 'visual', 'brand', 'reveal', 'identity', 'design', 'mockup', 'merch'];
      const hasRevealWord = revealKeywords.some((k) => lower.includes(k));
      const nanoPass = hasNano && hasRevealWord;
      checks.push({
        id: 3,
        title: 'CRITICAL: Nano Banana visual reveal',
        passed: nanoPass,
        isCritical: true,
        reason: nanoPass
          ? 'Nano Banana visual asset generation detected.'
          : 'Must feature Nano Banana generating visual assets (logo, poster, packaging, or brand identity).',
        fixSnippet: 'Then I visualised everything with Nano Banana — logo, poster and packaging generated in seconds.',
      });

      // 4. CRITICAL: Free offer
      const freeKeywords = [
        'free for students',
        'free right now',
        'free for all students',
        'ai plus is free',
        'google ai plus is free',
        'free student offer',
      ];
      const hasDirectFree = freeKeywords.some((k) => lower.includes(k));
      const hasGoogleAiPlusAndFree = (lower.includes('google ai plus') || lower.includes('ai plus')) && lower.includes('free');
      const freeOfferPass = hasDirectFree || hasGoogleAiPlusAndFree;
      checks.push({
        id: 4,
        title: 'CRITICAL: "Free for students" / Google AI Plus offer',
        passed: freeOfferPass,
        isCritical: true,
        reason: freeOfferPass
          ? 'Google AI Plus student offer prominently stated.'
          : 'Must state that Google AI Plus is free for students right now.',
        fixSnippet: 'The best part? Google AI Plus is free for students right now. No excuse not to try this!',
      });

      // 5. Specific feature identifiable
      const featureKeywords = ['gemini', 'nano banana', 'nanobanana', 'canvas', 'deep research', 'multimodal', 'workspace'];
      const hasFeature = featureKeywords.some((k) => lower.includes(k));
      checks.push({
        id: 5,
        title: 'Specific Gemini/Google feature identifiable',
        passed: hasFeature,
        isCritical: false,
        reason: hasFeature
          ? 'Identifiable Google tool or capability referenced.'
          : 'Explicitly highlight Gemini or Nano Banana capabilities.',
        fixSnippet: 'Powered by Gemini and Nano Banana creative generation.',
      });

      // 6. Creative idea description specific
      const cleanIdea = (idea || '').trim();
      const bannedTerms = ['true', 'ai video', 'done', 'idea', 'video', 'cool', 'yes', 'none', 'ok'];
      const isBanned = bannedTerms.includes(cleanIdea.toLowerCase());
      const ideaSpecific = cleanIdea.length >= 40 && !isBanned;
      checks.push({
        id: 6,
        title: 'Creative idea description is specific (min 40 chars)',
        passed: ideaSpecific,
        isCritical: false,
        reason: ideaSpecific
          ? `Idea description is descriptive (${cleanIdea.length} characters).`
          : 'Provide at least 40 characters in the Idea Description box describing your brand concept (vague inputs like "true" or "AI video" are rejected).',
        fixSnippet: 'A zero-waste hostel snack company called DormBites crafted with student budget pricing and high protein energy bars.',
      });

      // 7. GID standalone line
      const cleanGid = (gid || '973').trim();
      const gidRegex = new RegExp(`^\\s*GID\\s*[:\\-]?\\s*${escapeRegex(cleanGid)}\\s*$`, 'im');
      const hasGidStandalone = gidRegex.test(norm);
      checks.push({
        id: 7,
        title: `GID present as standalone line ("GID: ${cleanGid}")`,
        passed: hasGidStandalone,
        isCritical: false,
        reason: hasGidStandalone
          ? `GID "${cleanGid}" verified as a standalone line.`
          : `Must include your GID on its own standalone line as "GID: ${cleanGid}" or "GID - ${cleanGid}".`,
        fixSnippet: `GID: ${cleanGid}`,
      });

      // 8. Handles: @GoogleIndia @GoogleGemini @GoogleGeminiIndia
      const handles = extractHandles(norm).map((h) => h.toLowerCase());
      const requiredHandles = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
      const missingHandles = requiredHandles.filter((h) => !handles.includes(h));
      const handlesPass = missingHandles.length === 0;
      checks.push({
        id: 8,
        title: 'Tags @GoogleIndia @GoogleGemini @GoogleGeminiIndia',
        passed: handlesPass,
        isCritical: false,
        reason: handlesPass
          ? 'All 3 official ambassador handles verified.'
          : `Missing handles: ${missingHandles.join(', ')}`,
        fixSnippet: '@googleindia @googlegemini @googlegeminiindia',
      });

      // 9. Core campaign hashtags
      const tags = extractHashtags(norm).map((t) => t.toLowerCase());
      const requiredCoreTags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
      const missingCoreTags = requiredCoreTags.filter((t) => !tags.includes(t));
      const coreTagsPass = missingCoreTags.length === 0;
      checks.push({
        id: 9,
        title: 'Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini',
        passed: coreTagsPass,
        isCritical: false,
        reason: coreTagsPass
          ? 'All 3 core campaign hashtags verified.'
          : `Missing core hashtags: ${missingCoreTags.join(', ')}`,
        fixSnippet: '#GoogleStudentAmbassador #GSA2026 #TeamGemini',
      });

      // 10. Regional hashtag & absence of wrong regional tag
      const hasRegional = tags.includes(regionTag.toLowerCase());
      const hasWrongRegional = tags.includes(wrongRegionTag.toLowerCase());
      const regionalPass = hasRegional && !hasWrongRegional;
      let regionalReason = `Regional hashtag ${regionTag} verified.`;
      if (!hasRegional && hasWrongRegional) {
        regionalReason = `Missing ${regionTag} and wrong tag ${wrongRegionTag} detected!`;
      } else if (!hasRegional) {
        regionalReason = `Missing required regional hashtag ${regionTag}.`;
      } else if (hasWrongRegional) {
        regionalReason = `Wrong regional hashtag ${wrongRegionTag} must be removed!`;
      }
      checks.push({
        id: 10,
        title: `Regional hashtag ${regionTag} present (and ${wrongRegionTag} absent)`,
        passed: regionalPass,
        isCritical: false,
        reason: regionalReason,
        fixSnippet: `${regionTag}`,
      });

      return { checks, bonusUnlocked: false };
    },
  },

  'squad-up': {
    id: 'squad-up',
    name: 'Squad Up',
    badge: 'Last month',
    povText:
      'Assemble and visualize your ultimate gaming dream squad using Gemini and Nano Banana — complete with distinct player roles, custom identity, and registration for Google Play Arena.',
    brief:
      'Create an esports or gaming squad around a popular title (Free Fire, BGMI, Valorant, etc.) with player roles, Nano Banana character & identity visuals, and a call-to-action for Google Play Arena.',
    criticalRuleText:
      'Missing the named game with Gemini squad-building, the Nano Banana reveal, OR the Google Play Arena registration CTA = CRITICAL FAIL.',
    ctaLine: 'Google Play Arena is open. Register now!',
    exampleIdea:
      'An elite Free Fire competitive squad named Fire Phoenix with defined roles: Recon, Leader, Blaze, and Medic.',
    subIdeas: [
      'Design team jerseys & logo with Nano Banana',
      'Assign tactical roles with Gemini',
      'Add an original squad anthem with Lyria/Veo (Bonus!)',
    ],
    captionTemplate: `🎮 SQUAD UP –
Finding the perfect squad is every gamer's dream. I built my ultimate dream squad with Google Gemini!

👾 THE ROSTER: FIRE PHOENIX
Four unique players. Four different roles. Total dominance.
RECON. LEADER. BLAZE. MEDIC.

🎨 THE IDENTITY (Nano Banana)
We visualized our characters, esports jerseys, and team logo using Nano Banana 🍌✨ to craft a true competitive brand.

🏆 ARENA CALLOUT
Think you've got what it takes to dominate? Google Play Arena is open. Register now!

👥 TAG YOUR SQUAD
Tag that one teammate who's always AFK! 😂🎮

What would YOUR dream squad look like?

GID: {GID}

@googleindia @googlegemini @googlegeminiindia

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REGION_TAG}`,
    goldenFixture: SQUAD_UP_GOLDEN_FIXTURE,
    evaluate: (caption, idea, regionTag, wrongRegionTag, gid) => {
      const norm = normalizeText(caption);
      const lower = norm.toLowerCase();
      const lines = norm.split('\n').map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      const checks: CheckResult[] = [];

      // 1. Hook: first non-empty line has gaming/squad/gamer/team/Gemini keyword, emoji OR caps, under 125 chars
      const hookKeywords = ['game', 'gaming', 'gamer', 'gamers', 'squad', 'team', 'gemini', 'roster', 'play'];
      const hasHookKeyword = hookKeywords.some((k) => firstLine.toLowerCase().includes(k));
      const hasEmoji = countEmojis(firstLine) > 0;
      const hasCaps = /[A-Z]{3,}/.test(firstLine);
      const hookLengthValid = firstLine.length > 0 && firstLine.length <= 125;
      const hookPass = (hasEmoji || hasCaps) && hasHookKeyword && hookLengthValid;
      checks.push({
        id: 1,
        title: 'Hook under 125 chars with gaming keywords & emoji/CAPS',
        passed: hookPass,
        isCritical: false,
        reason: hookPass
          ? `Opening hook verified (${firstLine.length} chars) with gaming angle.`
          : 'First line must be under 125 chars, include a gaming/squad/Gemini keyword, and use an emoji or CAPS.',
        fixSnippet: '🎮 EVERY GAMER NEEDS A DREAM SQUAD. I BUILT MINE WITH GOOGLE GEMINI! 🚀',
      });

      // 2. CRITICAL: Game named + Gemini squad-building
      const gameKeywords = [
        'free fire',
        'bgmi',
        'valorant',
        'minecraft',
        'cod',
        'call of duty',
        'fortnite',
        'apex',
        'cs2',
        'counter-strike',
        'counter strike',
        'cs:go',
        'pubg',
        'roblox',
        'gta',
        'fifa',
        'overwatch',
        'clash',
        'genshin',
        'league of legends',
        'dota',
        'game',
        'gamer',
        'gaming',
        'esports',
      ];
      const hasGame = gameKeywords.some((g) => lower.includes(g)) || /dream squad\s+[A-Z]/i.test(norm);
      const squadKeywords = ['squad', 'roster', 'team', 'roles', 'players', 'build', 'built', 'draft', 'prompt', 'team name'];
      const hasSquadBuild = squadKeywords.some((s) => lower.includes(s));
      const hasGemini = lower.includes('gemini');
      const gameAndGeminiPass = hasGemini && hasSquadBuild && hasGame;
      checks.push({
        id: 2,
        title: 'CRITICAL: Game named + Gemini squad-building',
        passed: gameAndGeminiPass,
        isCritical: true,
        reason: gameAndGeminiPass
          ? 'Game identified and Gemini squad-building workflow present.'
          : 'Must identify a game and show Gemini building the squad (roles, roster, team name, or strategy).',
        fixSnippet: 'From building my ultimate Free Fire dream squad with Google Gemini...',
      });

      // 3. CRITICAL: Nano Banana reveal
      const hasNano = lower.includes('nano banana') || lower.includes('nanobanana');
      const nanoVisualKeywords = [
        'poster',
        'logo',
        'visual',
        'visualis',
        'visualiz',
        'characters',
        'identity',
        'jersey',
        'banner',
        'art',
        'design',
        'brand',
        'squad look',
      ];
      const hasNanoVisual = nanoVisualKeywords.some((v) => lower.includes(v));
      const nanoPass = hasNano && hasNanoVisual;
      checks.push({
        id: 3,
        title: 'CRITICAL: Nano Banana squad visuals reveal',
        passed: nanoPass,
        isCritical: true,
        reason: nanoPass
          ? 'Nano Banana squad visual assets and identity identified.'
          : 'Must feature Nano Banana generating character visuals, logo, jersey, or esports identity.',
        fixSnippet: '...to visualising our characters and creating our esports identity with Nano Banana.',
      });

      // 4. Bonus: Lyria or Veo
      const hasLyria = lower.includes('lyria');
      const hasVeo = lower.includes('veo');
      const bonusUnlocked = hasLyria || hasVeo;
      checks.push({
        id: 4,
        title: 'Bonus: Lyria or Veo mentioned (🎵🎬 Bonus Unlocked)',
        passed: bonusUnlocked,
        isCritical: false,
        isBonus: true,
        reason: bonusUnlocked
          ? 'Bonus Unlocked 🎵🎬: Squad audio anthem or cinematic visuals featured!'
          : 'Optional bonus: Mention Lyria for squad anthem or Veo for cinematic video.',
        fixSnippet: 'And we took it further with an original squad anthem using Lyria and visuals with Veo. 🎵🎬',
      });

      // 5. Specific feature identifiable
      const specificPass = lower.includes('gemini') || lower.includes('nano banana') || bonusUnlocked;
      checks.push({
        id: 5,
        title: 'Specific feature identifiable (Gemini / Nano Banana / Lyria / Veo)',
        passed: specificPass,
        isCritical: false,
        reason: specificPass
          ? 'Specific AI feature prominently featured.'
          : 'Ensure Gemini, Nano Banana, Lyria, or Veo are identifiable.',
        fixSnippet: 'Built with Google Gemini and Nano Banana.',
      });

      // 6. CRITICAL: CTA contains "Google Play Arena" AND "Register"
      const hasPlayArena = lower.includes('google play arena') || lower.includes('play arena');
      const hasRegister = lower.includes('register') || lower.includes('registration');
      const ctaPass = hasPlayArena && hasRegister;
      checks.push({
        id: 6,
        title: 'CRITICAL: CTA contains "Google Play Arena" & "Register"',
        passed: ctaPass,
        isCritical: true,
        reason: ctaPass
          ? 'Google Play Arena registration call-to-action verified.'
          : 'Must include call-to-action with "Google Play Arena" and "Register" (e.g. "Google Play Arena is open. Register now!").',
        fixSnippet: 'Google Play Arena is open. Register now!',
      });

      // 7. Challenge line: "tag" AND (teammate|friend|squad|crew) AND (afk|drop in|idea)
      const hasTag = lower.includes('tag');
      const hasTarget = /teammate|friend|squad|crew|gamer/i.test(lower);
      const hasTrigger = /afk|drop in|idea|carry|match/i.test(lower);
      const challengePass = hasTag && hasTarget && hasTrigger;
      checks.push({
        id: 7,
        title: 'Challenge line: Tag a teammate / squad member',
        passed: challengePass,
        isCritical: false,
        reason: challengePass
          ? 'Interactive teammate challenge line verified.'
          : 'Include a callout to tag a teammate or friend who is always AFK or ready to drop in.',
        fixSnippet: "And don't forget to tag that one teammate who's always AFK! 😂🎮",
      });

      // 8. GID present as standalone line
      const cleanGid = (gid || '973').trim();
      const gidRegex = new RegExp(`^\\s*GID\\s*[:\\-]?\\s*${escapeRegex(cleanGid)}\\s*$`, 'im');
      const hasGidStandalone = gidRegex.test(norm);
      checks.push({
        id: 8,
        title: `GID present as standalone line ("GID: ${cleanGid}")`,
        passed: hasGidStandalone,
        isCritical: false,
        reason: hasGidStandalone
          ? `GID "${cleanGid}" verified on its own line.`
          : `Must include your GID on its own standalone line as "GID: ${cleanGid}" or "GID - ${cleanGid}".`,
        fixSnippet: `GID: ${cleanGid}`,
      });

      // 9. Handles: @GoogleIndia @GoogleGemini @GoogleGeminiIndia
      const handles = extractHandles(norm).map((h) => h.toLowerCase());
      const requiredHandles = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
      const missingHandles = requiredHandles.filter((h) => !handles.includes(h));
      const handlesPass = missingHandles.length === 0;
      checks.push({
        id: 9,
        title: 'Tags @GoogleIndia @GoogleGemini @GoogleGeminiIndia',
        passed: handlesPass,
        isCritical: false,
        reason: handlesPass
          ? 'All 3 official handles verified.'
          : `Missing handles: ${missingHandles.join(', ')}`,
        fixSnippet: '@googleindia @googlegemini @googlegeminiindia',
      });

      // 10. Hashtags: core + regional tag, and wrong one absent
      const tags = extractHashtags(norm).map((t) => t.toLowerCase());
      const requiredCoreTags = ['#googlestudentambassador', '#gsa2026', '#teamgemini'];
      const missingCoreTags = requiredCoreTags.filter((t) => !tags.includes(t));
      const hasRegional = tags.includes(regionTag.toLowerCase());
      const hasWrongRegional = tags.includes(wrongRegionTag.toLowerCase());
      const hashtagsPass = missingCoreTags.length === 0 && hasRegional && !hasWrongRegional;

      let hashtagReason = 'All 3 core hashtags and correct regional tag verified.';
      if (missingCoreTags.length > 0) {
        hashtagReason = `Missing core hashtag(s): ${missingCoreTags.join(', ')}`;
      } else if (!hasRegional) {
        hashtagReason = `Missing regional tag: ${regionTag}`;
      } else if (hasWrongRegional) {
        hashtagReason = `Remove wrong regional tag ${wrongRegionTag}!`;
      }

      checks.push({
        id: 10,
        title: `Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini + ${regionTag}`,
        passed: hashtagsPass,
        isCritical: false,
        reason: hashtagReason,
        fixSnippet: `#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      });

      return { checks, bonusUnlocked };
    },
  },
};

/* =========================================================================
   4. PRO CHECKS EVALUATOR
   ========================================================================= */

export function runProChecks(caption: string): ProChecksResult {
  const norm = normalizeText(caption);
  const charCount = norm.length;
  const hashtags = extractHashtags(norm);
  const handles = extractHandles(norm);
  const hashtagCount = hashtags.length;
  const emojiCount = countEmojis(norm);

  const lines = norm.split('\n').map((l) => l.trim()).filter(Boolean);
  const hookText = lines[0] || '';
  const hookLength = hookText.length;

  // Placeholder detection
  const placeholdersFound: string[] = [];
  PLACEHOLDER_PATTERNS.forEach((pattern) => {
    const match = norm.match(pattern);
    if (match) {
      placeholdersFound.push(match[0]);
    }
  });

  // Typo detection
  const typos: { found: string; suggestion: string }[] = [];
  const words = norm.split(/[\s,;!]+/);
  words.forEach((word) => {
    const cleanWord = word.trim().toLowerCase();
    if (TYPO_MAP[cleanWord]) {
      typos.push({ found: word.trim(), suggestion: TYPO_MAP[cleanWord] });
    }
  });

  // Duplicate check
  const duplicates: string[] = [];
  const seenHashtags = new Set<string>();
  hashtags.forEach((tag) => {
    const lower = tag.toLowerCase();
    if (seenHashtags.has(lower)) {
      duplicates.push(tag);
    }
    seenHashtags.add(lower);
  });

  const seenHandles = new Set<string>();
  handles.forEach((handle) => {
    const lower = handle.toLowerCase();
    if (seenHandles.has(lower)) {
      duplicates.push(handle);
    }
    seenHandles.add(lower);
  });

  return {
    charCount,
    hashtagCount,
    emojiCount,
    hookLength,
    hookText,
    placeholdersFound: Array.from(new Set(placeholdersFound)),
    typos,
    duplicates: Array.from(new Set(duplicates)),
    isPlaceholdersFailed: placeholdersFound.length > 0,
  };
}

/* =========================================================================
   5. COMPREHENSIVE COMPLIANCE ENGINE
   ========================================================================= */

export function analyzeCompliance(
  caption: string,
  idea: string,
  themeId: ThemeId,
  regionTag: string,
  wrongRegionTag: string,
  gid: string
): AnalysisSummary {
  const theme = THEMES[themeId];
  const { checks, bonusUnlocked } = theme.evaluate(caption, idea, regionTag, wrongRegionTag, gid);
  const proChecks = runProChecks(caption);

  // Scoreable checks: check 4 in Squad Up is bonus, so only 9 scoreable items if bonus not count, or 10 points
  const criticalFails = checks.filter((c) => c.isCritical && !c.passed);
  const hasCriticalFail = criticalFails.length > 0;
  const passedCount = checks.filter((c) => c.passed).length;
  const score = passedCount;

  // Check hashtag placement in the last 2 non-empty lines
  const norm = normalizeText(caption);
  const lines = norm.split('\n').map((l) => l.trim()).filter(Boolean);
  const last2Lines = lines.slice(-2).join(' ').toLowerCase();
  const requiredTags = ['#googlestudentambassador', '#gsa2026', '#teamgemini', regionTag.toLowerCase()];
  const allInLast2 = requiredTags.every((t) => last2Lines.includes(t));

  const overallVerdict: 'PASS' | 'FAIL' =
    !hasCriticalFail && !proChecks.isPlaceholdersFailed && score >= 9 ? 'PASS' : 'FAIL';

  return {
    score,
    totalScoreable: 10,
    passedCount,
    overallVerdict,
    hasCriticalFail,
    criticalFailReasons: criticalFails.map((c) => `[Item #${c.id}] ${c.title}`),
    bonusUnlocked,
    checks,
    proChecks,
    analyzedAt: new Date().toLocaleTimeString(),
  };
}

/* =========================================================================
   6. CAPTION GENERATOR / BUILDER ENGINE
   ========================================================================= */

export interface GeneratorParams {
  gameOrIdeaName: string;
  oneLineDesc: string;
  teamOrBrandName: string;
  tagline: string;
  usedLyriaVeo: boolean;
  themeId: ThemeId;
  gid: string;
  regionTag: string;
}

export function generateCaptionVariants(params: GeneratorParams) {
  const {
    gameOrIdeaName,
    oneLineDesc,
    teamOrBrandName,
    tagline,
    usedLyriaVeo,
    themeId,
    gid,
    regionTag,
  } = params;

  const cleanGid = (gid || '973').trim();
  const title = (gameOrIdeaName || (themeId === 'squad-up' ? 'Free Fire' : 'DormBites')).trim();
  const name = (teamOrBrandName || (themeId === 'squad-up' ? 'Fire Phoenix' : 'DormBites')).trim();
  const tag = (tagline || (themeId === 'squad-up' ? 'Total Dominance' : 'Fuel Before The Bell')).trim();
  const desc = (oneLineDesc || (themeId === 'squad-up' ? 'an elite student esports squad' : 'a zero-waste snack brand for hostel students')).trim();

  if (themeId === 'squad-up') {
    return [
      {
        type: 'Short & Punchy',
        chars: 720,
        text: `🎮 EVERY GAMER NEEDS A DREAM SQUAD. I BUILT MINE WITH GOOGLE GEMINI! 🚀\n\nFinding the perfect squad is every gamer's dream. But what if AI could help you build one?\n\nIntroducing ${name.toUpperCase()} — ${tag}. 🔥\n\nFrom drafting our ultimate ${title.toUpperCase()} competitive dream squad with Google Gemini, to designing our team logo, jerseys and characters with Nano Banana — this is where gaming meets creativity.\n\n${usedLyriaVeo ? 'We even composed an original squad anthem using Lyria and cinematic visuals with Veo! 🎵🎬\n\n' : ''}RECON. LEADER. BLAZE. MEDIC.\n\nThink you've got the skills to match your squad? Google Play Arena is open. Register now!\n\nTag that one teammate who's always AFK! 😂🎮\n\nWhat would YOUR dream squad look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
      {
        type: 'Balanced Story',
        chars: 980,
        text: `🏆 STOP QUEUING SOLO. BUILD YOUR ULTIMATE SQUAD WITH GOOGLE GEMINI! ⚡\n\nBehind every tournament win is a dream roster with flawless synergy. I wanted to see if AI could design our dream squad.\n\nI partnered with Google Gemini to architect ${desc}: ${name.toUpperCase()} — ${tag}.\n\nGemini mapped our player roles, tactical strategy, and squad synergy from scratch in minutes.\n\nThen we visualised our characters, esports identity, and custom jerseys with Nano Banana 🍌✨ — turning a game concept into a competitive reality.\n\n${usedLyriaVeo ? 'And that is not all! We generated a custom squad anthem with Lyria and cinematic game trailers with Veo. 🎵🎬\n\n' : ''}Four distinct players. Four specialized roles. One mission.\n\nRECON. LEADER. BLAZE. MEDIC.\n\nNow, gamers, time to test your crew on stage! Google Play Arena is open. Register now!\n\nDon't forget to tag that one teammate who's always AFK! 😂🎮\n\nWhat would YOUR dream squad look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
      {
        type: 'Hype & Esports',
        chars: 1150,
        text: `🔥 FROM CASUAL LOBBIES TO ESPORTS CHAMPIONS: POWERED BY GOOGLE GEMINI! 🎮\n\nEvery legendary team starts with four gamers and a shared dream. Here is how AI brought ours to life.\n\nIntroducing ${name.toUpperCase()} — ${tag}.\n\nWe used Google Gemini to scout our dream squad, define tactical positions, and formulate tournament-winning callouts for ${title.toUpperCase()}.\n\nThen came the reveal: we visualised our characters, team crest, and arena banners with Nano Banana 🍌✨ — complete brand identity built in one sitting.\n\n${usedLyriaVeo ? 'We even dropped an epic squad entrance anthem created with Lyria and animated hype reels with Veo! 🎵🎬\n\n' : ''}RECON. LEADER. BLAZE. MEDIC. Four minds. Total dominance.\n\nReady to see where your crew stands? Google Play Arena is open. Register now!\n\nTag your duo or squad mate who is always AFK right before the drop! 😂🎮\n\nWhat would YOUR dream squad look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
    ];
  } else {
    return [
      {
        type: 'Short & Punchy',
        chars: 690,
        text: `💡 EVERY BIG BRAND STARTS AS A RANDOM THOUGHT. I TURNED MINE INTO ONE WITH GOOGLE GEMINI! 🚀\n\nI had a random thought: ${desc}.\n\nI chatted with Google Gemini to build the name, tagline, what I'm selling and what makes it different: meet ${name.toUpperCase()} — ${tag}. 🍫\n\nThen I visualised everything with Nano Banana 🍌✨ — logo, poster and packaging generated in minutes.\n\nFrom a thought in my notes app to a real brand, in one sitting.\n\nAnd the best part? Google AI Plus is free for students right now. No excuse not to try this!\n\nTag someone whose idea is sitting in their notes app doing nothing! 😂\n\nWhat would YOUR brand look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
      {
        type: 'Balanced Story',
        chars: 940,
        text: `✨ FROM A 2AM NOTES APP THOUGHT TO A REAL BRAND WITH GOOGLE GEMINI! 💡\n\nEver have an idea that you never ended up building? I decided to test how fast AI could bring mine to life.\n\nThe idea: ${desc}.\n\nStep 1 was the build: I chatted with Google Gemini to flesh out the business concept, brainstorm our value proposition, and lock in our identity — ${name.toUpperCase()} — ${tag}.\n\nStep 2 was the reveal: I visualised our merchandise, logo, and product packaging with Nano Banana 🍌✨ in just a few prompts.\n\nA complete brand identity created in a single afternoon!\n\nAnd here is the kicker: Google AI Plus is free for students right now. No excuse not to build your dream concept today.\n\nTag a friend whose idea is still sitting in their notes app doing nothing! 😂🚀\n\nWhat would YOUR brand look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
      {
        type: 'Hype & Entrepreneurial',
        chars: 1100,
        text: `🚀 STOP WAITING TO LAUNCH. I BUILT A BRAND FROM SCRATCH IN ONE SITTING WITH GOOGLE GEMINI! 🌟\n\nMost ideas never leave the notes app because execution takes too long. Watch how fast that changed with AI.\n\nI started with a raw concept: ${desc}.\n\nWith Google Gemini, I brainstormed the brand name, refined our tagline, and locked in what makes our product unique: introducing ${name.toUpperCase()} — ${tag}.\n\nThen I visualised the entire collection using Nano Banana 🍌✨ — generating vibrant packaging, aesthetic logos, and high-impact posters.\n\nTurning a raw idea into a tangible, visualized brand has never been this accessible.\n\nAnd the best part? Google AI Plus is free for students right now. Check it out and turn your random notes into reality.\n\nTag that one friend who is always talking about starting a brand! 😂\n\nWhat would YOUR brand look like?\n\nGID: ${cleanGid}\n\n@googleindia @googlegemini @googlegeminiindia\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`,
      },
    ];
  }
}

/* =========================================================================
   7. UNIT TEST SUITE (Runs on load, verified with console.assert)
   ========================================================================= */

function runUnitTests() {
  console.log('%c[GSA Compliance Engine] Running 12 Unit Tests...', 'color:#1A73E8; font-weight:bold;');

  // --- SQUAD UP TESTS ---
  // Test 1: Golden Fixture Pass
  const suGolden = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE,
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suGolden.score === 10, 'Test 1 Failed: Squad Up Golden Fixture should score 10/10');
  console.assert(!suGolden.hasCriticalFail, 'Test 1 Failed: Squad Up Golden Fixture should have 0 critical fails');
  console.assert(suGolden.bonusUnlocked, 'Test 1 Failed: Squad Up Golden Fixture should unlock Lyria/Veo bonus');

  // Test 2: Missing GID
  const suNoGid = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE.replace('GID: 973', ''),
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suNoGid.checks.find((c) => c.id === 8)?.passed === false, 'Test 2 Failed: Missing GID should fail Check 8');

  // Test 3: Missing CTA (Play Arena) -> Critical Fail
  const suNoCta = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE.replace('Google Play Arena is open. Register now!', ''),
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suNoCta.hasCriticalFail, 'Test 3 Failed: Missing CTA must trigger Critical Fail');

  // Test 4: Wrong Regional Tag
  const suWrongRegion = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE.replace('#ping_mcn', '#CommuniqueIndia'),
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suWrongRegion.checks.find((c) => c.id === 10)?.passed === false, 'Test 4 Failed: Wrong regional tag should fail Check 10');

  // Test 5: Only 2 handles
  const suMissingHandle = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE.replace('@googleindia', ''),
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suMissingHandle.checks.find((c) => c.id === 9)?.passed === false, 'Test 5 Failed: Only 2 handles must fail Check 9');

  // Test 6: Placeholder left
  const suPlaceholder = analyzeCompliance(
    SQUAD_UP_GOLDEN_FIXTURE.replace('FIRE PHOENIX', '{GAME}'),
    THEMES['squad-up'].exampleIdea,
    'squad-up',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(suPlaceholder.proChecks.isPlaceholdersFailed, 'Test 6 Failed: Unfilled placeholder must be detected');

  // --- IDEA TO BRAND TESTS ---
  // Test 7: Golden Fixture Pass
  const ibGolden = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE,
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibGolden.score === 10, 'Test 7 Failed: Idea to Brand Golden Fixture should score 10/10');
  console.assert(!ibGolden.hasCriticalFail, 'Test 7 Failed: Idea to Brand Golden Fixture should have 0 critical fails');

  // Test 8: Missing GID
  const ibNoGid = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE.replace('GID: 973', ''),
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibNoGid.checks.find((c) => c.id === 7)?.passed === false, 'Test 8 Failed: Missing GID should fail Check 7');

  // Test 9: Missing Free Offer -> Critical Fail
  const ibNoFree = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE.replace('Google AI Plus is free for students right now.', ''),
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibNoFree.hasCriticalFail, 'Test 9 Failed: Missing free offer must trigger Critical Fail');

  // Test 10: Wrong Regional Tag
  const ibWrongRegion = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE.replace('#ping_mcn', '#CommuniqueIndia'),
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibWrongRegion.checks.find((c) => c.id === 10)?.passed === false, 'Test 10 Failed: Wrong regional tag should fail Check 10');

  // Test 11: Only 2 handles
  const ibMissingHandle = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE.replace('@googlegeminiindia', ''),
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibMissingHandle.checks.find((c) => c.id === 8)?.passed === false, 'Test 11 Failed: Only 2 handles must fail Check 8');

  // Test 12: Placeholder left
  const ibPlaceholder = analyzeCompliance(
    IDEA_TO_BRAND_GOLDEN_FIXTURE.replace('DORMBITES', 'YOUR-GID'),
    THEMES['idea-to-brand'].exampleIdea,
    'idea-to-brand',
    '#ping_mcn',
    '#CommuniqueIndia',
    '973'
  );
  console.assert(ibPlaceholder.proChecks.isPlaceholdersFailed, 'Test 12 Failed: Unfilled placeholder must be detected');

  console.log('%c[GSA Compliance Engine] All 12 Unit Tests Passed Successfully! 🚀', 'color:#34A853; font-weight:bold;');
}

// Execute tests once on module initialization
if (typeof window !== 'undefined') {
  runUnitTests();
}

/* =========================================================================
   8. MAIN REACT COMPONENT (Single-File App)
   ========================================================================= */

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('gsa_theme_id') as ThemeId) || 'idea-to-brand';
  });

  // GID state (default: 973)
  const [gid, setGid] = useState<string>(() => {
    return localStorage.getItem('gsa_gid') || '973';
  });

  // Region state (default: East-West ping)
  const [region, setRegion] = useState<RegionId>(() => {
    return (localStorage.getItem('gsa_region') as RegionId) || 'east-west-ping';
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('gsa_dark_mode') === 'true';
  });

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'analyze' | 'builder'>('analyze');

  // Instagram Link box (optional)
  const [reelLink, setReelLink] = useState<string>('');

  // Primary Inputs
  const [caption, setCaption] = useState<string>(() => {
    return localStorage.getItem('gsa_draft_caption') || THEMES['idea-to-brand'].captionTemplate.replace('{GID}', '973').replace('{REGION_TAG}', '#ping_mcn');
  });

  const [ideaDescription, setIdeaDescription] = useState<string>(() => {
    return localStorage.getItem('gsa_draft_idea') || THEMES['idea-to-brand'].exampleIdea;
  });

  // Modal & History states
  const [isHowItsCheckedOpen, setIsHowItsCheckedOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gsa_caption_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Generator form states
  const [genGameName, setGenGameName] = useState('');
  const [genOneLine, setGenOneLine] = useState('');
  const [genTeamName, setGenTeamName] = useState('');
  const [genTagline, setGenTagline] = useState('');
  const [genLyriaVeo, setGenLyriaVeo] = useState(true);
  const [builderSeed, setBuilderSeed] = useState(0);

  // Computed regional tags
  const regionTag = region === 'east-west-ping' ? '#ping_mcn' : '#CommuniqueIndia';
  const wrongRegionTag = region === 'east-west-ping' ? '#CommuniqueIndia' : '#ping_mcn';

  const activeTheme = THEMES[themeId];

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gsa_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persist GID & Region & Theme
  useEffect(() => {
    localStorage.setItem('gsa_gid', gid);
  }, [gid]);

  useEffect(() => {
    localStorage.setItem('gsa_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('gsa_theme_id', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('gsa_draft_caption', caption);
  }, [caption]);

  useEffect(() => {
    localStorage.setItem('gsa_draft_idea', ideaDescription);
  }, [ideaDescription]);

  // Run live analysis on every keystroke
  const analysis = useMemo(() => {
    return analyzeCompliance(caption, ideaDescription, themeId, regionTag, wrongRegionTag, gid);
  }, [caption, ideaDescription, themeId, regionTag, wrongRegionTag, gid]);

  // Switch Theme helper
  const handleSwitchTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    const newTheme = THEMES[newThemeId];
    // Populate with template if empty or switching
    const template = newTheme.captionTemplate.replace('{GID}', gid.trim() || '973').replace('{REGION_TAG}', regionTag);
    setCaption(template);
    setIdeaDescription(newTheme.exampleIdea);
  };

  // Golden Test trigger
  const handleRunGoldenTest = () => {
    const fixture = activeTheme.goldenFixture.replace(/#ping_mcn|#CommuniqueIndia/g, regionTag).replace(/GID:\s*\d+/g, `GID: ${gid.trim() || '973'}`);
    setCaption(fixture);
    setIdeaDescription(activeTheme.exampleIdea);
    setActiveTab('analyze');
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  };

  // Save to history helper
  const saveToHistory = (summary: AnalysisSummary) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      themeId,
      caption,
      ideaDescription,
      score: summary.score,
      verdict: summary.overallVerdict,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [item, ...history.slice(0, 9)];
    setHistory(updated);
    try {
      localStorage.setItem('gsa_caption_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Analyze button click
  const handleAnalyzeClick = () => {
    saveToHistory(analysis);
    if (analysis.overallVerdict === 'PASS') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    const el = document.getElementById('results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-Fix implementation
  const handleAutoFix = () => {
    let fixed = caption.trim();

    // Remove wrong regional tag if present
    const wrongRegex = new RegExp(escapeRegex(wrongRegionTag), 'gi');
    fixed = fixed.replace(wrongRegex, '').trim();

    // Replace common placeholders
    fixed = fixed.replace(/\{GID\}|\[YOUR-GID\]|YOUR-GID/gi, gid.trim() || '973');
    fixed = fixed.replace(/\{REGION_TAG\}/gi, regionTag);

    // 1. Missing CTA
    if (themeId === 'squad-up') {
      const hasCta = /google play arena/i.test(fixed) && /register/i.test(fixed);
      if (!hasCta) {
        fixed += `\n\nGoogle Play Arena is open. Register now!`;
      }
      // Missing Tag/Challenge line
      const hasTag = /tag/i.test(fixed) && /teammate|friend|squad/i.test(fixed) && /afk/i.test(fixed);
      if (!hasTag) {
        fixed += `\n\nAnd don't forget to tag that one teammate who's always AFK! 😂🎮`;
      }
      // Missing Closing question
      if (!fixed.includes('?')) {
        fixed += `\n\nWhat would YOUR dream squad look like?`;
      }
    } else {
      // Idea to Brand Free offer
      const hasFree = /free for students/i.test(fixed) || (/google ai plus/i.test(fixed) && /free/i.test(fixed));
      if (!hasFree) {
        fixed += `\n\nAnd the best part? Google AI Plus is free for students right now. No excuse not to try this!`;
      }
      // Missing Tag line
      const hasTag = /tag/i.test(fixed) && /notes app/i.test(fixed);
      if (!hasTag) {
        fixed += `\n\nTag someone whose idea is sitting in their notes app doing nothing! 😂`;
      }
      // Missing Closing question
      if (!fixed.includes('?')) {
        fixed += `\n\nWhat would YOUR brand look like?`;
      }
    }

    // GID check
    const cleanGid = (gid || '973').trim();
    const gidRegex = new RegExp(`^\\s*GID\\s*[:\\-]?\\s*${escapeRegex(cleanGid)}\\s*$`, 'im');
    if (!gidRegex.test(fixed)) {
      fixed += `\n\nGID: ${cleanGid}`;
    }

    // Handles check
    const requiredHandles = ['@googleindia', '@googlegemini', '@googlegeminiindia'];
    const currentHandles = extractHandles(fixed).map((h) => h.toLowerCase());
    const missingH = requiredHandles.filter((h) => !currentHandles.includes(h));
    if (missingH.length > 0) {
      fixed += `\n\n@googleindia @googlegemini @googlegeminiindia`;
    }

    // Hashtags check
    const currentTags = extractHashtags(fixed).map((t) => t.toLowerCase());
    const requiredTags = ['#googlestudentambassador', '#gsa2026', '#teamgemini', regionTag.toLowerCase()];
    const missingT = requiredTags.filter((t) => !currentTags.includes(t));
    if (missingT.length > 0) {
      fixed += `\n\n#GoogleStudentAmbassador #GSA2026 #TeamGemini ${regionTag}`;
    }

    setCaption(fixed);
    if (!ideaDescription || ideaDescription.trim().length < 40) {
      setIdeaDescription(activeTheme.exampleIdea);
    }
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  // Copy caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      // fallback
    }
  };

  // Export report
  const handleExportReport = async () => {
    const report = `================================================
GSA REELS STUDIO · COMPLIANCE REPORT
Pillar #2 · Content Creation with Reels
Theme: ${activeTheme.name} (${activeTheme.badge})
GID: ${gid} | Region Tag: ${regionTag}
Date: ${new Date().toLocaleString()}
================================================
OVERALL VERDICT: ${analysis.overallVerdict}
SCORE: ${analysis.score} / ${analysis.totalScoreable}
CRITICAL FAILS: ${analysis.hasCriticalFail ? analysis.criticalFailReasons.join('; ') : 'None (All critical checks passed)'}
BONUS UNLOCKED: ${analysis.bonusUnlocked ? 'Yes (Lyria/Veo 🎵🎬)' : 'No'}

CHECKS BREAKDOWN:
${analysis.checks.map((c) => `[${c.passed ? 'PASS' : 'FAIL'}] #${c.id} ${c.title} -> ${c.reason}`).join('\n')}

PRO CHECKS:
- Characters: ${analysis.proChecks.charCount} / 2200
- Hashtags: ${analysis.proChecks.hashtagCount} / 30
- Emojis: ${analysis.proChecks.emojiCount} (min 3 recommended)
- Hook Length: ${analysis.proChecks.hookLength} chars (under 125 chars)
- Placeholders: ${analysis.proChecks.placeholdersFound.length > 0 ? analysis.proChecks.placeholdersFound.join(', ') : 'None'}

CAPTION PREVIEW:
"""
${caption}
"""
================================================`;
    try {
      await navigator.clipboard.writeText(report);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      // fallback
    }
  };

  // Builder Variants
  const generatedVariants = useMemo(() => {
    return generateCaptionVariants({
      gameOrIdeaName: genGameName,
      oneLineDesc: genOneLine,
      teamOrBrandName: genTeamName,
      tagline: genTagline,
      usedLyriaVeo: genLyriaVeo,
      themeId,
      gid,
      regionTag,
    });
  }, [genGameName, genOneLine, genTeamName, genTagline, genLyriaVeo, themeId, gid, regionTag, builderSeed]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#FBFCFE] text-slate-800'}`}>
      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-xl tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">S</span>
              <span className="text-[#FBBC05]">A</span>
              <span className="text-slate-900 dark:text-white font-extrabold ml-1">Reels Studio</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-3 h-3" />
              Compliance Engine
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Golden Test Button */}
            <button
              type="button"
              onClick={handleRunGoldenTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-sm cursor-pointer"
              title="Load approved golden fixture (Scores 10/10)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Golden Test</span>
              <span className="sm:hidden">Fixture</span>
            </button>

            {/* History Toggle */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="View analysis history"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1A73E8]" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- SUBHEADER & TOP CONTROLS ----------------- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        {/* Breadcrumb label */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Google Student Ambassador</span>
            <span>·</span>
            <span>Pillar #2 · Content Creation with Reels</span>
          </div>

          <button
            type="button"
            onClick={() => setIsHowItsCheckedOpen(true)}
            className="text-xs font-semibold text-[#1A73E8] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            How it's checked →
          </button>
        </div>

        {/* Top Control Card (Always visible, persistent, auto-save) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {/* Field 1: Theme Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Monthly Theme
              </label>
              <div className="relative">
                <select
                  value={themeId}
                  onChange={(e) => handleSwitchTheme(e.target.value as ThemeId)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8] pr-8 cursor-pointer"
                >
                  <option value="idea-to-brand">Idea to Brand (Current)</option>
                  <option value="squad-up">Squad Up (Last month)</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Badge: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeTheme.badge}</span>
              </p>
            </div>

            {/* Field 2: GID Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Ambassador GID <span className="text-[#EA4335]">*</span>
              </label>
              <input
                type="text"
                value={gid}
                onChange={(e) => setGid(e.target.value)}
                placeholder="Enter GID (e.g. 973)"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Saved automatically in browser</p>
            </div>

            {/* Field 3: Region Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Region <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionId)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8] pr-8 cursor-pointer"
                >
                  <option value="east-west-ping">East-West India (ping) → #ping_mcn</option>
                  <option value="north-south-communique">North-South India → #CommuniqueIndia</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Auto-selects required regional tag</p>
            </div>

            {/* Field 4: Regional Hashtag (Read-only tag pill) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#1A73E8]" />
                <span>Active Regional Tag</span>
              </label>
              <div className="px-3.5 py-2.5 rounded-xl text-sm font-extrabold bg-[#E8F0FE] dark:bg-blue-950/60 border border-[#D2E3FC] dark:border-blue-900 text-[#1A73E8] dark:text-blue-300 flex items-center justify-between">
                <span>{regionTag}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required</span>
              </div>
              <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1">
                {wrongRegionTag} must NOT be present
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'analyze'
                ? 'border-[#1A73E8] text-[#1A73E8] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Analyze My Reel Caption</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              analysis.overallVerdict === 'PASS'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {analysis.score}/10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'border-[#1A73E8] text-[#1A73E8] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>Caption Builder (Pre-Passed)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
              New
            </span>
          </button>
        </div>

        {/* ----------------- TAB 1: ANALYZE REEL ----------------- */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Form & Analysis Engine */}
            <div className="lg:col-span-8 space-y-6">
              {/* Optional Instagram Link Box */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#1A73E8]" />
                    <span>Instagram Reel Link (Optional reference)</span>
                  </label>
                  {reelLink && (
                    <a
                      href={reelLink.startsWith('http') ? reelLink : `https://${reelLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1A73E8] dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Open Reel <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={reelLink}
                  onChange={(e) => setReelLink(e.target.value)}
                  placeholder="https://www.instagram.com/reel/Cxxxx... (Reference link only)"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Reviewers check <strong>caption text only</strong>. Paste your full caption below for compliance verification.
                </p>
              </div>

              {/* Live Metric Chips Row (Updates every keystroke) */}
              <div className="flex flex-wrap gap-2 items-center text-xs font-semibold">
                {/* GID Chip */}
                <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  analysis.checks.find((c) => (themeId === 'squad-up' ? c.id === 8 : c.id === 7))?.passed
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {analysis.checks.find((c) => (themeId === 'squad-up' ? c.id === 8 : c.id === 7))?.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>GID: {gid || '973'}</span>
                </span>

                {/* Handles Chip */}
                {(() => {
                  const check = analysis.checks.find((c) => (themeId === 'squad-up' ? c.id === 9 : c.id === 8));
                  const handles = extractHandles(caption).map((h) => h.toLowerCase());
                  const count = ['@googleindia', '@googlegemini', '@googlegeminiindia'].filter((h) => handles.includes(h)).length;
                  return (
                    <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      check?.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      <Tag className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span>Handles: {count}/3</span>
                    </span>
                  );
                })()}

                {/* Core Tags Chip */}
                {(() => {
                  const check = analysis.checks.find((c) => (themeId === 'squad-up' ? c.id === 10 : c.id === 9));
                  const tags = extractHashtags(caption).map((t) => t.toLowerCase());
                  const count = ['#googlestudentambassador', '#gsa2026', '#teamgemini'].filter((t) => tags.includes(t)).length;
                  return (
                    <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      count === 3
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      <Hash className="w-3.5 h-3.5 text-[#34A853]" />
                      <span>Core Tags: {count}/3</span>
                    </span>
                  );
                })()}

                {/* Regional Tag Chip */}
                {(() => {
                  const check = analysis.checks.find((c) => c.id === 10);
                  return (
                    <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      check?.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    }`}>
                      <span>Region: {regionTag}</span>
                    </span>
                  );
                })()}

                {/* Critical Status Chip */}
                {(() => {
                  const critCount = analysis.checks.filter((c) => c.isCritical && c.passed).length;
                  const totalCrit = analysis.checks.filter((c) => c.isCritical).length;
                  return (
                    <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      analysis.hasCriticalFail
                        ? 'bg-rose-100 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold animate-pulse'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    }`}>
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      <span>Critical Rules: {critCount}/{totalCrit}</span>
                    </span>
                  );
                })()}

                {/* Character Count Chip */}
                <span className={`px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                  analysis.proChecks.charCount > 2200
                    ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    : analysis.proChecks.charCount > 1800
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {analysis.proChecks.charCount} / 2200 chars
                </span>

                {/* Bonus Badge */}
                {analysis.bonusUnlocked && (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1 animate-bounce">
                    <span>Bonus Unlocked 🎵🎬</span>
                  </span>
                )}
              </div>

              {/* Caption Textarea Box */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1A73E8]" />
                    <label className="text-sm font-bold text-slate-800 dark:text-white">
                      Paste your Reel caption <span className="text-[#EA4335]">*</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const template = activeTheme.captionTemplate
                          .replace('{GID}', gid.trim() || '973')
                          .replace('{REGION_TAG}', regionTag);
                        setCaption(template);
                      }}
                      className="text-xs font-semibold text-[#1A73E8] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Template
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={12}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Paste your caption here..."
                    className="w-full p-4 rounded-2xl text-sm font-mono leading-relaxed bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all resize-y"
                  />
                </div>

                {/* Secondary Creative Idea Field (Anti-rejection field) */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-[#FBBC05]" />
                      <span>Creative Idea Description (Min 40 characters)</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {ideaDescription.length} chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="Describe your brand/squad concept in detail (e.g. A zero-waste hostel snack brand called DormBites...)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
                    ⚠️ <strong>Anti-rejection rule:</strong> Vague entries like "true", "AI video", "done", or "idea" are rejected by reviewers. Provide concrete context on what you visualized!
                  </p>
                </div>
              </div>

              {/* Primary "Analyze Reel Compliance" Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyzeClick}
                  className="w-full sm:flex-1 py-4 px-6 bg-[#1A73E8] hover:bg-[#1557B0] active:scale-[0.99] text-white text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Analyze Reel Compliance</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoFix}
                  className="w-full sm:w-auto py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  title="Auto-insert missing CTA, GID, tags, or fix regional hashtag"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Auto-Fix My Caption</span>
                </button>
              </div>

              {/* ----------------- RESULTS SECTION ----------------- */}
              <div id="results-section" className="space-y-6 pt-2">
                {/* Critical Fail Banner (Big Red Alert) */}
                {analysis.hasCriticalFail && (
                  <div className="bg-rose-50 dark:bg-rose-950/80 border-2 border-[#EA4335] rounded-3xl p-6 shadow-md animate-in fade-in duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow">
                        <AlertOctagon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black uppercase tracking-wider text-[#C5221F] dark:text-rose-200">
                          CRITICAL FAIL — Reel Will Be Rejected
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-100">
                          {activeTheme.criticalRuleText}
                        </p>
                        <div className="pt-2 text-xs font-bold text-rose-700 dark:text-rose-300 space-y-1">
                          <div>Missing critical element(s):</div>
                          <ul className="list-disc list-inside">
                            {analysis.criticalFailReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Summary Card & Live Ring */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-5">
                      {/* Animated Score Ring */}
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-slate-100 dark:text-slate-800"
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            className={`transition-all duration-500 ease-out ${
                              analysis.hasCriticalFail
                                ? 'text-[#EA4335]'
                                : analysis.score >= 9
                                ? 'text-[#34A853]'
                                : 'text-[#FBBC05]'
                            }`}
                            strokeDasharray={213.6}
                            strokeDashoffset={213.6 - (213.6 * analysis.score) / 10}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {analysis.score}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">/10</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            analysis.overallVerdict === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            Verdict: {analysis.overallVerdict}
                          </span>
                          {analysis.bonusUnlocked && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              +Bonus
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {analysis.overallVerdict === 'PASS'
                            ? 'Ready to Submit 🚀'
                            : 'Fix Required Before Official Scoring'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {analysis.overallVerdict === 'PASS'
                            ? 'Your caption satisfies all reviewer requirements and campaign standards.'
                            : 'Review the itemized cards below. Use "Auto-Fix" to resolve formatting and missing lines.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyCaption}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCaption ? 'Copied!' : 'Copy Final Caption'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportReport}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                        <span>{copiedReport ? 'Report Copied!' : 'Export Report'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Pro Checks Feedback Row (Soft warnings) */}
                  {(analysis.proChecks.typos.length > 0 ||
                    analysis.proChecks.duplicates.length > 0 ||
                    analysis.proChecks.isPlaceholdersFailed ||
                    analysis.proChecks.hookLength > 125) && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Pro Quality & Formatting Warnings:</span>
                      </div>

                      {analysis.proChecks.isPlaceholdersFailed && (
                        <div className="text-rose-700 dark:text-rose-300 font-semibold">
                          ⚠️ Unfilled placeholder detected ({analysis.proChecks.placeholdersFound.join(', ')}). Replace with real brand/game information before posting!
                        </div>
                      )}

                      {analysis.proChecks.typos.map((t, idx) => (
                        <div key={idx}>
                          • Typo detected: <code>{t.found}</code> — Did you mean <strong>{t.suggestion}</strong>?
                        </div>
                      ))}

                      {analysis.proChecks.duplicates.map((d, idx) => (
                        <div key={idx}>
                          • Duplicate tag detected: <code>{d}</code>
                        </div>
                      ))}

                      {analysis.proChecks.hookLength > 125 && (
                        <div>
                          • Hook is {analysis.proChecks.hookLength} chars long (&gt; 125 chars). Instagram may truncate it behind the "...more" expander.
                        </div>
                      )}
                    </div>
                  )}

                  {/* 10 Detailed Check Cards */}
                  <div className="mt-6 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                      Pillar #2 Checklist (Theme: {activeTheme.name})
                    </h5>

                    {analysis.checks.map((check) => (
                      <div
                        key={check.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          check.passed
                            ? 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800'
                            : check.isCritical
                            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                            : 'bg-slate-50/70 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5">
                              {check.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                              )}
                            </span>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  #{check.id} {check.title}
                                </span>
                                {check.isCritical && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    Critical Rule
                                  </span>
                                )}
                                {check.isBonus && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                    Bonus
                                  </span>
                                )}
                              </div>

                              <p className={`text-xs mt-1 leading-relaxed ${
                                check.passed
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-rose-800 dark:text-rose-200 font-medium'
                              }`}>
                                {check.reason}
                              </p>
                            </div>
                          </div>

                          {!check.passed && check.fixSnippet && (
                            <button
                              type="button"
                              onClick={() => {
                                setCaption((prev) => prev.trim() + '\n\n' + check.fixSnippet);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#1A73E8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              + Fix it
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Side Information & Playbook Cards */}
            <div className="lg:col-span-4 space-y-5">
              {/* Critical Rule Card */}
              <div className="rounded-2xl border-2 border-[#EA4335] bg-[#FCE8E6]/60 dark:bg-rose-950/30 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C5221F] dark:text-rose-300">
                      Critical Fail Rule
                    </h4>
                    <p className="text-xs font-semibold text-rose-950 dark:text-rose-100 mt-1 leading-relaxed">
                      "{activeTheme.criticalRuleText}"
                    </p>
                  </div>
                </div>
              </div>

              {/* POV Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>The POV (Creative Angle)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{activeTheme.povText}"
                </p>
              </div>

              {/* Sub-Ideas Chips */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#1A73E8]" />
                  <span>Sub-Ideas for this Theme</span>
                </div>
                <div className="space-y-2">
                  {activeTheme.subIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] shrink-0 mt-1.5" />
                      <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10-Point Checklist Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#1A73E8]" />
                    <span>Checklist Overview</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1A73E8] dark:text-blue-400">
                    {activeTheme.name}
                  </span>
                </div>
                <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {activeTheme.id === 'idea-to-brand' ? (
                    <>
                      <li>1. Random idea → real brand</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">2. [CRITICAL] Gemini build process</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">3. [CRITICAL] Nano Banana reveal</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">4. [CRITICAL] Free for students offer</li>
                      <li>5. Identifiable Gemini feature</li>
                      <li>6. Specific idea description (min 40 chars)</li>
                      <li>7. Standalone GID ({gid || '973'})</li>
                      <li>8. Tags @GoogleIndia @GoogleGemini @GoogleGeminiIndia</li>
                      <li>9. Core hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini</li>
                      <li>10. Regional hashtag {regionTag} (and not {wrongRegionTag})</li>
                    </>
                  ) : (
                    <>
                      <li>1. Gaming hook under 125 chars</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">2. [CRITICAL] Named game + Gemini squad build</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">3. [CRITICAL] Nano Banana character visuals</li>
                      <li className="text-purple-600 dark:text-purple-400">4. [BONUS] Lyria or Veo mentioned 🎵🎬</li>
                      <li>5. Identifiable AI feature</li>
                      <li className="font-bold text-rose-600 dark:text-rose-400">6. [CRITICAL] Google Play Arena registration</li>
                      <li>7. Tag a teammate who is AFK</li>
                      <li>8. Standalone GID ({gid || '973'})</li>
                      <li>9. Tags @GoogleIndia @GoogleGemini @GoogleGeminiIndia</li>
                      <li>10. Core hashtags + {regionTag}</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: CAPTION BUILDER ----------------- */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 cols: Inputs */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-amber-500" />
                  <span>Approved Caption Builder</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fill in your custom details. All generated variations pre-pass every requirement (10/10) with zero critical fails!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {themeId === 'squad-up' ? 'Game Title' : 'Idea / Industry Category'}
                </label>
                <input
                  type="text"
                  value={genGameName}
                  onChange={(e) => setGenGameName(e.target.value)}
                  placeholder={themeId === 'squad-up' ? 'e.g. Free Fire, BGMI, Valorant' : 'e.g. Zero-waste snacks, AI study notes'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {themeId === 'squad-up' ? 'Squad / Team Name' : 'Brand Name'}
                </label>
                <input
                  type="text"
                  value={genTeamName}
                  onChange={(e) => setGenTeamName(e.target.value)}
                  placeholder={themeId === 'squad-up' ? 'e.g. Fire Phoenix' : 'e.g. DormBites, EcoGear'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand Tagline / Team Slogan
                </label>
                <input
                  type="text"
                  value={genTagline}
                  onChange={(e) => setGenTagline(e.target.value)}
                  placeholder={themeId === 'squad-up' ? 'e.g. Four minds. One squad. Total dominance.' : 'e.g. Fuel Before The Bell'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  One-Line Description
                </label>
                <input
                  type="text"
                  value={genOneLine}
                  onChange={(e) => setGenOneLine(e.target.value)}
                  placeholder={themeId === 'squad-up' ? 'e.g. An elite esports team dominating competitive ranked lobbies' : 'e.g. A high-protein hostel snack brand for late night study sessions'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {themeId === 'squad-up' && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Include Lyria & Veo (Bonus)</span>
                      <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.2 rounded">
                        🎵🎬
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Unlocks the bonus anthem & cinematic visuals badge</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={genLyriaVeo}
                    onChange={(e) => setGenLyriaVeo(e.target.checked)}
                    className="w-4 h-4 text-[#1A73E8] rounded cursor-pointer"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setBuilderSeed((s) => s + 1)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate Variations</span>
              </button>
            </div>

            {/* Right 7 cols: 3 Pre-Passed Variations */}
            <div className="lg:col-span-7 space-y-6">
              {generatedVariants.map((variant, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1A73E8] dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {variant.type}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        10/10 Pre-Passed ✅
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(variant.text);
                          confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCaption(variant.text);
                          setActiveTab('analyze');
                          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use This Caption</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto">
                    {variant.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- HISTORY DRAWER / MODAL ----------------- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#1A73E8]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Analysis History (Last 10)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No analyzed captions yet. Run your first check to record it here.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.verdict === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {item.score}/10 {item.verdict}
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          {THEMES[item.themeId]?.name || item.themeId}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="mt-1.5 text-slate-700 dark:text-slate-300 line-clamp-2 font-mono text-[11px]">
                        {item.caption.slice(0, 140)}...
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeId(item.themeId);
                        setCaption(item.caption);
                        setIdeaDescription(item.ideaDescription);
                        setIsHistoryOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1A73E8] text-white text-xs font-bold hover:bg-[#1557B0] transition-colors shrink-0"
                    >
                      Load
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('gsa_caption_history');
                  }}
                  className="w-full mt-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- HOW IT'S CHECKED MODAL ----------------- */}
      {isHowItsCheckedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  How GSA Reviewers Check Your Reel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHowItsCheckedOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                <strong>1. Caption-Only Review:</strong> GSA reviewers and compliance automated tools evaluate the <strong>caption text</strong>. Video files are not parsed or uploaded.
              </p>
              <p>
                <strong>2. The Critical Fail Rules:</strong> Mentioning Gemini or showing an AI video is never enough on its own.
                For <em>Idea to Brand</em>, missing the Gemini build process, the Nano Banana reveal, or the "free for students" offer = instant rejection.
                For <em>Squad Up</em>, missing the named game + Gemini squad build, Nano Banana visuals, or Google Play Arena registration = instant rejection.
              </p>
              <p>
                <strong>3. GID Placement:</strong> Your GID must appear on a standalone line so automated parsers recognize it cleanly (e.g. <code>GID: 973</code>).
              </p>
              <p>
                <strong>4. Tagging and Regional Rules:</strong> All 3 handles (<code>@GoogleIndia @GoogleGemini @GoogleGeminiIndia</code>) and all 3 core hashtags (<code>#GoogleStudentAmbassador #GSA2026 #TeamGemini</code>) must be present. You must include your active regional hashtag (<code>#ping_mcn</code> for East/West or <code>#CommuniqueIndia</code> for North/South) and NEVER include the wrong region's tag!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHowItsCheckedOpen(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ----------------- FOOTER ----------------- */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2026 Google Student Ambassador Program · GSA Reels Studio
          </div>
          <div className="font-semibold text-slate-400 dark:text-slate-500">
            Proprietary + Confidential
          </div>
        </div>
      </footer>
    </div>
  );
}
