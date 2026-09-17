import { ThemeConfig } from './types';

export const ideaToBrandTheme: ThemeConfig = {
  id: 'idea-to-brand',
  name: 'Idea to Brand',
  displayName: 'Idea to Brand (Current)',
  month: 'Current Month',
  isActive: true,
  pov: "Show yourself turning a random idea into a real, visualized brand with Gemini and Nano Banana — then say the free part out loud: Google AI Plus is free for students right now.",
  criticalFailRule: "Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, the Nano Banana reveal, or saying the 'free for students' line out loud = FAIL.",
  captionExplainer: "Use the Idea-to-Brand structure in the Analyze tab: Hook → The build (Gemini chat) → The reveal (Nano Banana visual) → CTA (free for students) → Challenge your crew → GID → tags/hashtags.",
  subIdeas: [
    "Visualise your ideas with Nano Banana",
    "Write, remix, reimagine with Gemini",
    "Highlight the Gemini and Google feature you're using in your reel!"
  ],
  captionTemplate: `🚨 THE IDEA –

💬 THE BUILD (with Gemini)
I chatted with Gemini to build out the name, tagline, what I'm selling, and what makes it different — from a random thought to a real brand concept, in one sitting.

🎨 THE REVEAL (Nano Banana)
Then I visualized it — logo, poster, packaging — using Nano Banana 🍌✨ to bring the brand to life.

💸 THE BEST PART?
Google AI Plus is free for students right now. No excuse not to try this.

🙋 YOUR TURN
Tag someone who's got an idea sitting in their notes app doing nothing. Bet you can't build yours faster.

GID - {GID}

@GoogleIndia @GoogleGeminiIndia @GoogleGemini

#GoogleStudentAmbassador #GSA2026 #TeamGemini {REGION_HASHTAG} #AI #Gemini #NanoBanana #Innovation`,
  requirements: [
    {
      id: 1,
      title: "Random idea → real, visualized brand clearly shown",
      description: "Demonstrates the complete journey from a raw concept into a tangible, distinct brand identity.",
      checkType: 'combined',
      isCritical: false,
      failMessage: "The brand transformation is incomplete or abstract. No clear final product/brand shown.",
      fixSuggestion: "Clearly show what the brand is (e.g. coffee brand, tech startup, apparel line) from concept to finished identity."
    },
    {
      id: 2,
      title: "Gemini chat/build process is shown (name, tagline, what's being sold, what's different)",
      description: "You must display the actual Gemini interaction crafting the name, tagline, product pitch, and USP.",
      checkType: 'combined',
      isCritical: true,
      failMessage: "Missing the Gemini build process on screen/in narrative. Only final output was mentioned.",
      fixSuggestion: "Show the screen recording or step-by-step chat where Gemini brainstormed your brand name, tagline, and value proposition."
    },
    {
      id: 3,
      title: "Nano Banana visual reveal included (logo, poster, packaging, etc.)",
      description: "Must feature Nano Banana generating the visual creative assets for the brand.",
      checkType: 'combined',
      isCritical: true,
      failMessage: "Nano Banana visual generation is missing or not prominently featured.",
      fixSuggestion: "Include the prompt and generation reveal in Nano Banana showing your logo, merchandise, or product mockup."
    },
    {
      id: 4,
      title: "\"Free for students\" / Google AI Plus offer said out loud, not buried",
      description: "The audio voiceover or on-camera speaker must clearly verbalize the Google AI Plus student offer.",
      checkType: 'combined',
      isCritical: true,
      failMessage: "Google AI Plus free student offer was not verbalized out loud or is hidden at the very end.",
      fixSuggestion: "Say out loud: 'Google AI Plus is free for students right now!' and reinforce it with text overlay."
    },
    {
      id: 5,
      title: "A specific Gemini feature is identifiable",
      description: "Highlight a named Gemini capability (e.g., Deep Research, Multi-modal analysis, Canvas, Image gen).",
      checkType: 'combined',
      isCritical: false,
      failMessage: "No specific Gemini tool or feature was spotlighted.",
      fixSuggestion: "Explicitly name and show the Gemini feature you used (e.g., Canvas, Fast brainstorming, Multimodal reasoning)."
    },
    {
      id: 6,
      title: "Creative idea description is specific, not vague",
      description: "Vague descriptions like 'true' or 'AI video' are strictly rejected.",
      checkType: 'idea',
      isCritical: false,
      failMessage: "The idea description is too vague or generic (e.g., 'made an AI video').",
      fixSuggestion: "Provide 1-2 detailed sentences explaining your exact brand concept, what problem it solves, and the creative spin."
    },
    {
      id: 7,
      title: "GID appears in the caption",
      description: "Your official Google Student Ambassador ID (GID) must be written in the caption.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "GID is missing or formatted incorrectly in the caption.",
      fixSuggestion: "Add 'GID - [Your ID]' clearly in the caption text."
    },
    {
      id: 8,
      title: "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
      description: "All three official handles must be accurately tagged in the caption.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Missing one or more required account tags in the caption.",
      fixSuggestion: "Ensure your caption includes: @GoogleIndia, @Googlegemini, and @GoogleGeminiIndia."
    },
    {
      id: 9,
      title: "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
      description: "All core GSA campaign hashtags must be present in the caption.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Core hashtags are missing or have typos.",
      fixSuggestion: "Include #GoogleStudentAmbassador #GSA2026 #TeamGemini in your caption."
    },
    {
      id: 10,
      title: "Regional hashtag #ping_mcn present (East-West India)",
      description: "Must include #ping_mcn for the designated East-West India (ping) region.",
      checkType: 'caption',
      isCritical: false,
      failMessage: "Required regional hashtag #ping_mcn is missing from your caption.",
      fixSuggestion: "Add the required region hashtag: #ping_mcn to your caption."
    }
  ],
  regionHashtagMap: {
    'East-West India (ping)': '#ping_mcn'
  },
  requiredTags: ['@GoogleIndia', '@Googlegemini', '@GoogleGeminiIndia'],
  requiredHashtags: ['#GoogleStudentAmbassador', '#GSA2026', '#TeamGemini']
};
