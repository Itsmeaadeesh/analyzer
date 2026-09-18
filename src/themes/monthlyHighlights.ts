export interface HighlightCategory {
  id: string;
  name: string;
  description: string;
  placeholderPrompt: string;
}

export interface LinkedInThemeConfig {
  id: string;
  title: string;
  subtitle: string;
  categories: HighlightCategory[];
  mandatoryChecks: {
    id: number;
    title: string;
    description: string;
    fixSuggestion: string;
  }[];
  criticalFailRule: string;
  requiredTags: string[];
  mandatoryHashtags: string[];
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

export const monthlyHighlightsConfig: LinkedInThemeConfig = {
  id: 'monthly-highlights',
  title: 'Pillar #3: Monthly Highlights on LinkedIn',
  subtitle: 'Share your impact, learnings, and milestones as a Google Student Ambassador',
  categories: [
    {
      id: 'events',
      name: 'Events or fund nights organised',
      description: 'Workshops, study jams, demo days, campus watch parties, or hackathons you hosted or helped organize.',
      placeholderPrompt: 'E.g. Hosted a Gemini AI prompt engineering workshop on campus for 120+ first-year students...'
    },
    {
      id: 'collaborations',
      name: 'Collaborations or connections made',
      description: 'Partnerships with other campus clubs, faculty, fellow GSAs, or industry speakers.',
      placeholderPrompt: 'E.g. Partnered with the ACM student chapter and our CS department head to co-host an AI demo...'
    },
    {
      id: 'challenges',
      name: 'A challenge overcome',
      description: 'Logistics hiccup, low initial sign-ups, technical bug, or balancing ambassador duties with exams.',
      placeholderPrompt: 'E.g. Faced low early registrations, so we pivoted to quick classroom flash talks and filled the hall...'
    },
    {
      id: 'initiatives',
      name: 'A project or initiative kicked off',
      description: 'A student builder group, campus AI newsletter, mentor ring, or ongoing hack sprint.',
      placeholderPrompt: 'E.g. Launched a weekly "Build with Gemini" challenge group where 40 students are creating prototypes...'
    },
    {
      id: 'wins',
      name: 'Wins — big or small — from this month',
      description: 'Record attendance, memorable student feedback, breakthrough prototype, or personal achievement.',
      placeholderPrompt: 'E.g. Over 80 students created their first working AI prototype using Google AI Plus student access...'
    },
    {
      id: 'learnings',
      name: 'Something new learned or explored',
      description: 'A new Gemini feature (like Canvas or Deep Research), public speaking lesson, or community leadership insight.',
      placeholderPrompt: 'E.g. Learned how to break down multimodal prompt concepts into simple analogies that non-coders loved...'
    },
    {
      id: 'bts',
      name: 'A behind-the-scenes moment',
      description: 'Late-night planning, sticker distribution, prep chaos, or candid photos with your campus team.',
      placeholderPrompt: 'E.g. Spending 2 hours packing welcome swag bags and fine-tuning demo slides the night before...'
    },
    {
      id: 'growth',
      name: 'Personal growth as an ambassador',
      description: 'Reflections on leadership, communication, networking, or how this ambassadorship is shaping your career.',
      placeholderPrompt: 'E.g. This month pushed me out of my comfort zone to present on stage and coordinate with 4 teams...'
    }
  ],
  mandatoryChecks: [
    {
      id: 1,
      title: "GID appears in the caption",
      description: "Your official Google Student Ambassador ID (GID) must appear in the post.",
      fixSuggestion: "Include 'GID - [Your ID]' near the bottom of your post."
    },
    {
      id: 2,
      title: "Tags @GoogleIndia and @GoogleGeminiIndia present",
      description: "Both official accounts (@GoogleIndia and @GoogleGeminiIndia) must be tagged.",
      fixSuggestion: "Tag @GoogleIndia and @GoogleGeminiIndia in your post."
    },
    {
      id: 3,
      title: "Mandatory campaign hashtags present",
      description: "Must include #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini.",
      fixSuggestion: "Add #GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini."
    },
    {
      id: 4,
      title: "Regional hashtag present matching selected region",
      description: "Must include #ping_mcn (East-West) or #CommuniqueIndia (North-South).",
      fixSuggestion: "Ensure your caption includes the regional hashtag for your state/region."
    }
  ],
  criticalFailRule: "Missing GID, missing official tags (@GoogleIndia, @GoogleGeminiIndia), or missing all 8 highlight categories = FAIL.",
  requiredTags: ['@GoogleIndia', '@GoogleGeminiIndia'],
  mandatoryHashtags: [
    '#GoogleStudentAmbassador',
    '#MonthlyHighlights',
    '#GSA2026',
    '#TeamGemini'
  ]
};
