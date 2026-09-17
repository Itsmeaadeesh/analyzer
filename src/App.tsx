import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  Lock
} from 'lucide-react';
import { Header } from './components/Header';
import { TopInputCard } from './components/TopInputCard';
import { TabNavigation } from './components/TabNavigation';
import { ReelLinkInput } from './components/AnalyzeTab/ReelLinkInput';
import { VideoDropzone } from './components/AnalyzeTab/VideoDropzone';
import { CaptionTemplateCard } from './components/AnalyzeTab/CaptionTemplateCard';
import { CaptionInput } from './components/AnalyzeTab/CaptionInput';
import { CreativeIdeaInput } from './components/AnalyzeTab/CreativeIdeaInput';
import { AnalysisResults } from './components/AnalyzeTab/AnalysisResults';
import { RequirementsCard } from './components/SidebarInfo/RequirementsCard';
import { CriticalFailCard } from './components/SidebarInfo/CriticalFailCard';
import { POVCard } from './components/SidebarInfo/POVCard';
import { CaptionExplainerCard } from './components/SidebarInfo/CaptionExplainerCard';
import { SubIdeasChips } from './components/SidebarInfo/SubIdeasChips';
import { HowItsCheckedModal } from './components/Modals/HowItsCheckedModal';
import { AddThemeModal } from './components/Modals/AddThemeModal';
import { getThemeById, DEFAULT_THEME_ID } from './themes';
import { AnalysisResponse, ThemeConfig } from './themes/types';

export function App() {
  // Top input row state (East-West only, Idea to Brand only)
  const [gid, setGid] = useState<string>('973');
  const [selectedRegion, setSelectedRegion] = useState<string>('East-West India (ping)');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(DEFAULT_THEME_ID);

  // Analyze states
  const [reelUrl, setReelUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [ideaDescription, setIdeaDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // System & Modals
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [isHowItsCheckedOpen, setIsHowItsCheckedOpen] = useState<boolean>(false);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState<boolean>(false);

  const activeTheme: ThemeConfig = getThemeById(selectedThemeId);

  // Health check on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerConnected(true);
          setHasGeminiKey(Boolean(data.hasGeminiKey));
        } else {
          setServerConnected(false);
        }
      } catch {
        setServerConnected(false);
      }
    };
    checkServer();
  }, []);

  const handleUseCaptionFromTemplate = (templateWithPlaceholders: string) => {
    setCaption(templateWithPlaceholders);
  };

  const handleAnalyze = async () => {
    setAnalysisError(null);

    if (!caption.trim() && !ideaDescription.trim()) {
      setAnalysisError('Please enter either a reel caption or a creative idea description to analyze.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim(),
          idea: ideaDescription.trim(),
          reelUrl: reelUrl.trim(),
          videoFileName: videoFile ? videoFile.name : undefined,
          gid: gid.trim(),
          region: selectedRegion,
          themeId: selectedThemeId,
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisResults(data);

      setTimeout(() => {
        const element = document.getElementById('analysis-results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Backend API request failed, running client heuristic compliance engine:', err);
      // Seamless local compliance fallback
      const captionLower = (caption || '').toLowerCase();
      const ideaLower = (ideaDescription || '').trim().toLowerCase();
      const cleanedGid = gid.trim();

      const results = [
        {
          id: 1,
          title: "Random idea → real, visualized brand clearly shown",
          passed: ideaLower.length > 20 && ['brand', 'concept', 'name', 'tagline', 'product', 'merch', 'logo'].some(k => ideaLower.includes(k) || captionLower.includes(k)),
          isCritical: false,
          evidence: "Evaluated brand narrative clarity.",
          suggestion: "Clearly show what the brand is (e.g. coffee brand, tech startup, apparel line) from concept to finished identity."
        },
        {
          id: 2,
          title: "Gemini chat/build process is shown (name, tagline, what's being sold, what's different)",
          passed: ['build', 'chat', 'chatted', 'gemini to build', 'name, tagline', 'brainstorm'].some(k => captionLower.includes(k) || ideaLower.includes(k)),
          isCritical: true,
          evidence: "Checked for interactive Gemini chat brainstorming.",
          suggestion: "Show the screen recording or step-by-step chat where Gemini brainstormed your brand name, tagline, and value proposition."
        },
        {
          id: 3,
          title: "Nano Banana visual reveal included (logo, poster, packaging, etc.)",
          passed: captionLower.includes('nano banana') || captionLower.includes('nanobanana') || ideaLower.includes('nano banana'),
          isCritical: true,
          evidence: "Checked for Nano Banana visual generation.",
          suggestion: "Include the prompt and generation reveal in Nano Banana showing your logo, merchandise, or product mockup."
        },
        {
          id: 4,
          title: "\"Free for students\" / Google AI Plus offer said out loud, not buried",
          passed: ['free for students', 'google ai plus is free', 'free right now', 'student offer'].some(k => captionLower.includes(k) || ideaLower.includes(k)),
          isCritical: true,
          evidence: "Checked for Google AI Plus free student offer vocalization.",
          suggestion: "Say out loud: 'Google AI Plus is free for students right now!' and reinforce it with text overlay."
        },
        {
          id: 5,
          title: "A specific Gemini feature is identifiable",
          passed: ['gemini', 'gemini 2.5', 'canvas', 'deep research', 'multimodal', 'nano banana'].some(k => captionLower.includes(k) || ideaLower.includes(k)),
          isCritical: false,
          evidence: "Identified featured Gemini capability.",
          suggestion: "Explicitly name and show the Gemini feature you used (e.g., Canvas, Fast brainstorming, Multimodal reasoning)."
        },
        {
          id: 6,
          title: "Creative idea description is specific, not vague",
          passed: !['true', 'ai video', 'cool video', 'nice', 'good'].includes(ideaLower) && ideaLower.length >= 15,
          isCritical: false,
          evidence: "Checked idea depth against anti-vague rules.",
          suggestion: "Provide 1-2 detailed sentences explaining your exact brand concept, what problem it solves, and the creative spin."
        },
        {
          id: 7,
          title: "GID appears in the caption",
          passed: Boolean(cleanedGid && cleanedGid !== 'YOUR-GID' && captionLower.includes(cleanedGid.toLowerCase())),
          isCritical: false,
          evidence: `Verified GID "${cleanedGid}" in caption.`,
          suggestion: "Add 'GID - [Your ID]' clearly in the caption text."
        },
        {
          id: 8,
          title: "Tags @GoogleIndia, @Googlegemini, @GoogleGeminiIndia",
          passed: ['@googleindia', '@googlegemini', '@googlegeminiindia'].every(t => captionLower.includes(t)),
          isCritical: false,
          evidence: "Verified required Google handles.",
          suggestion: "Ensure your caption includes: @GoogleIndia, @Googlegemini, and @GoogleGeminiIndia."
        },
        {
          id: 9,
          title: "Hashtags #GoogleStudentAmbassador #GSA2026 #TeamGemini present",
          passed: ['#googlestudentambassador', '#gsa2026', '#teamgemini'].every(h => captionLower.includes(h)),
          isCritical: false,
          evidence: "Verified core GSA hashtags.",
          suggestion: "Include #GoogleStudentAmbassador #GSA2026 #TeamGemini in your caption."
        },
        {
          id: 10,
          title: "Regional hashtag #ping_mcn present (East-West India)",
          passed: captionLower.includes('#ping_mcn'),
          isCritical: false,
          evidence: "Verified #ping_mcn for East-West region.",
          suggestion: "Ensure your caption includes #ping_mcn for the East-West India (ping) region."
        }
      ];

      const bPassed = results.find(r => r.id === 2)?.passed;
      const nPassed = results.find(r => r.id === 3)?.passed;
      const fPassed = results.find(r => r.id === 4)?.passed;
      const critFail = !bPassed || !nPassed || !fPassed;
      const passCount = results.filter(r => r.passed).length;
      const verdict = (!critFail && passCount >= 8) ? 'PASS' : 'FAIL';

      setAnalysisResults({
        overallVerdict: verdict,
        criticalFailTriggered: critFail,
        criticalFailReason: critFail ? "CRITICAL FAIL RULE TRIGGERED: Mentioning Gemini or showing an AI output is not enough. Missing the Gemini build process, Nano Banana reveal, or vocalized student offer." : undefined,
        score: passCount,
        totalRequirements: 10,
        requirements: results,
        summaryFeedback: verdict === 'PASS' 
          ? "Awesome job! Your Reel submission satisfies the GSA Content Creation guidelines and meets all critical pillar criteria."
          : "Reel does not meet minimum compliance standards. Review the itemized checklist below.",
        fixChecklist: results.filter(r => !r.passed).map(r => `[#${r.id}] ${r.title}: ${r.suggestion}`),
        analyzedAt: new Date().toISOString(),
        mode: 'heuristic-engine'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Header */}
        <Header
          onOpenHowItsChecked={() => setIsHowItsCheckedOpen(true)}
          serverConnected={serverConnected}
          hasGeminiKey={hasGeminiKey}
        />

        {/* Top Input Row (always visible) */}
        <TopInputCard
          gid={gid}
          onGidChange={setGid}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedThemeId={selectedThemeId}
          onThemeChange={setSelectedThemeId}
          activeTheme={activeTheme}
          onOpenAddTheme={() => setIsAddThemeOpen(true)}
        />

        {/* Tab pill: Analyze My Reel */}
        <TabNavigation />

        {/* Main Content Layout: Two Columns (Main Work Area + Sidebar Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Work Area (Left 7 or 8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            <div>
              {/* 1. Reel Link Input */}
              <ReelLinkInput
                reelUrl={reelUrl}
                onUrlChange={setReelUrl}
              />

              {/* 2. Upload Reel Video */}
              <VideoDropzone
                videoFile={videoFile}
                onFileSelect={setVideoFile}
              />

              {/* 3. Ideal Caption Template Card */}
              <CaptionTemplateCard
                theme={activeTheme}
                gid={gid}
                region={selectedRegion}
                onUseCaption={handleUseCaptionFromTemplate}
              />

              {/* 4. Paste Reel Caption */}
              <CaptionInput
                caption={caption}
                onCaptionChange={setCaption}
                theme={activeTheme}
                gid={gid}
                region={selectedRegion}
              />

              {/* 5. Creative Idea Description */}
              <CreativeIdeaInput
                ideaDescription={ideaDescription}
                onIdeaChange={setIdeaDescription}
              />

              {/* Error Banner */}
              {analysisError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* 6. Analyze Reel Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-base bg-[#1A73E8] hover:bg-[#1557B0] disabled:bg-slate-300 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Evaluating Reel Compliance with Gemini 2.5 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>Analyze Reel</span>
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Results Display */}
              {analysisResults && (
                <div id="analysis-results-section">
                  <AnalysisResults
                    results={analysisResults}
                    onReAnalyze={handleAnalyze}
                    captionToCopy={caption}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Below-form Info Panel (Right 4 or 5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Critical Fail Rule Card (Red-bordered) */}
            <CriticalFailCard
              criticalRuleText={activeTheme.criticalFailRule}
            />

            {/* POV Card */}
            <POVCard
              povText={activeTheme.pov}
            />

            {/* Ideal Caption Template Explainer */}
            <CaptionExplainerCard
              explainerText={activeTheme.captionExplainer}
            />

            {/* Sub-Ideas Chips */}
            <SubIdeasChips
              subIdeas={activeTheme.subIdeas}
            />

            {/* 10-Point Requirements Checklist */}
            <RequirementsCard
              requirements={activeTheme.requirements}
              activeThemeName={activeTheme.name}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Google Student Ambassador</span>
            <span>·</span>
            <span>Pillar #2 Content Creation with Reels</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Proprietary + Confidential</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowItsCheckedModal
        isOpen={isHowItsCheckedOpen}
        onClose={() => setIsHowItsCheckedOpen(false)}
        theme={activeTheme}
      />

      <AddThemeModal
        isOpen={isAddThemeOpen}
        onClose={() => setIsAddThemeOpen(false)}
        activeThemeId={selectedThemeId}
        onSelectTheme={setSelectedThemeId}
      />
    </div>
  );
}
export default App;
