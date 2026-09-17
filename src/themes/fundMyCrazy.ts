import { ThemeConfig } from './types';

export const fundMyCrazyTheme: ThemeConfig = {
  id: 'fund-my-crazy',
  name: 'Fund My Crazy',
  displayName: 'Fund My Crazy (Previous Month)',
  month: 'Previous Month',
  isActive: false,
  pov: "Pitch an audacious, unconventional idea powered by Google Gemini that solves a real student or campus problem — and show the prompt that ignited it.",
  criticalFailRule: "Failing to explain how Gemini enabled the execution of the wild idea, or omitting the student ambassador credentials = FAIL.",
  captionExplainer: "Use the Crazy Pitch structure: Wild Hook → The Problem → Gemini Hack/Prompt → The Pilot Execution → Ambassador Call to Action → GID & Tags.",
  subIdeas: [
    "Pitch your craziest dorm-room invention",
    "Show Gemini building a project road map in 30 seconds",
    "Turn campus complaints into functional AI prototypes"
  ],
  captionTemplate: `🚀 THE AUDACIOUS IDEA –
What if we solved dorm laundry queues using Gemini real-time camera alerts?

💡 THE GEMINI BREAKTHROUGH
I prompted Gemini 2.5 Flash to write a lightweight vision script and scheduling bot in under 5 minutes.

✨ THE OUTCOME
Tested it across 3 floors. Wait times dropped by 70%.

🔥 WHY THIS MATTERS
Google AI empowers student builders to test crazy ideas before anyone else.

GID - {GID}

@GoogleIndia @GoogleGeminiIndia @GoogleGemini

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REGION_HASHTAG} #FundMyCrazy #GeminiAI`,
  requirements: [
    {
      id: 1,
      title: "Audacious idea clearly stated in first 3 seconds",
      description: "Hook must capture an eccentric, unconventional, yet impactful idea.",
      checkType: 'combined',
      isCritical: false,
      failMessage: "Hook is slow or describes an ordinary school project.",
      fixSuggestion: "Start with an arresting visual and immediate problem statement."
    },
    {
      id: 2,
      title: "Gemini prompting & logic breakdown demonstrated",
      description: "Must show the Gemini prompt that unblocked the technical challenge.",
      checkType: 'combined',
      isCritical: true,
      failMessage: "Prompting screen or Gemini interaction not shown.",
      fixSuggestion: "Insert a screen capture of the actual prompt and response."
    },
    {
      id: 3,
      title: "Proof of prototype or campus reaction",
      description: "Include footage of friends, peers, or campus testing the concept.",
      checkType: 'combined',
      isCritical: false,
      failMessage: "No prototype execution shown.",
      fixSuggestion: "Show a quick demo or student reactions."
    },
    {
      id: 4,
      title: "Call to action for student builders included",
      description: "Direct students to try Gemini for their own projects.",
      checkType: 'combined',
      isCritical: true,
      failMessage: "Missing builder CTA.",
      fixSuggestion: "Add a clear CTA encouraging peers to build with Gemini."
    },
    {
      id: 5,
      title: "Specific Gemini capability highlighted",
      description: "Name features like Code Assist, Reasoning, or Multimodal.",
      checkType: 'combined',
      isCritical: false,
      failMessage: "No specific capability named.",
      fixSuggestion: "Mention Gemini's advanced coding or analytical tools."
    },
    {
      id: 6,
      title: "Idea description is concrete",
      description: "Avoid vague phrases like 'smart app'.",
      checkType: 'idea',
      isCritical: false,
      failMessage: "Idea description lacked specifics.",
      fixSuggestion: "Detail the problem, architecture, and benefit."
    },
    {
      id: 7,
      title: "GID appears in the caption",
      description: "Official ambassador ID.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Missing GID in caption.",
      fixSuggestion: "Add GID - [Your ID]."
    },
    {
      id: 8,
      title: "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
      description: "All three official handles tagged.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Missing required handle tags.",
      fixSuggestion: "Add @GoogleIndia @GoogleGemini @GoogleGeminiIndia."
    },
    {
      id: 9,
      title: "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
      description: "Required campaign hashtags.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Campaign hashtags missing.",
      fixSuggestion: "Add #GoogleStudentAmbassador #GSA2026 #TeamGemini."
    },
    {
      id: 10,
      title: "Regional hashtag present matching selected region",
      description: "#CommuniqueIndia or #ping_mcn based on region.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Missing regional hashtag.",
      fixSuggestion: "Add #ping_mcn or #CommuniqueIndia."
    }
  ],
  regionHashtagMap: {
    'East-West India (ping)': '#ping_mcn',
    'North India': '#CommuniqueIndia',
    'South India': '#CommuniqueIndia',
    'North-South India (Communique)': '#CommuniqueIndia',
    'East India': '#ping_mcn',
    'West India': '#ping_mcn'
  },
  requiredTags: ['@GoogleIndia', '@Googlegemini', '@GoogleGeminiIndia'],
  requiredHashtags: ['#GoogleStudentAmbassador', '#GSA2026', '#TeamGemini']
};
