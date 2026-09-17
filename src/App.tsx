import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Header } from './components/Header';
import { TopInputCard } from './components/TopInputCard';
import { TabNavigation, ActiveTab } from './components/TabNavigation';
import { ReelLinkInput } from './components/AnalyzeTab/ReelLinkInput';
import { VideoDropzone } from './components/AnalyzeTab/VideoDropzone';
import { CaptionTemplateCard } from './components/AnalyzeTab/CaptionTemplateCard';
import { CaptionInput } from './components/AnalyzeTab/CaptionInput';
import { CreativeIdeaInput } from './components/AnalyzeTab/CreativeIdeaInput';
import { AnalysisResults } from './components/AnalyzeTab/AnalysisResults';
import { SubmissionForm } from './components/SubmitTab/SubmissionForm';
import { RequirementsCard } from './components/SidebarInfo/RequirementsCard';
import { CriticalFailCard } from './components/SidebarInfo/CriticalFailCard';
import { POVCard } from './components/SidebarInfo/POVCard';
import { CaptionExplainerCard } from './components/SidebarInfo/CaptionExplainerCard';
import { SubIdeasChips } from './components/SidebarInfo/SubIdeasChips';
import { HowItsCheckedModal } from './components/Modals/HowItsCheckedModal';
import { AddThemeModal } from './components/Modals/AddThemeModal';
import { getThemeById, DEFAULT_THEME_ID, REGIONS } from './themes';
import { AnalysisResponse, ThemeConfig } from './themes/types';
import { ReelSubmission } from './types';

export function App() {
  // Top input row state (matches user reference screenshot)
  const [gid, setGid] = useState<string>('973');
  const [selectedRegion, setSelectedRegion] = useState<string>('East-West India (ping)');
  const [selectedThemeId, setSelectedThemeId] = useState<string>(DEFAULT_THEME_ID);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyze');

  // Tab 1: Analyze states
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
  const [submissionCount, setSubmissionCount] = useState<number>(0);

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

  // Update submission count from storage
  useEffect(() => {
    try {
      const history = localStorage.getItem('gsa_reels_submissions_history');
      if (history) {
        setSubmissionCount(JSON.parse(history).length);
      }
    } catch (e) {
      console.error(e);
    }
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

      // Scroll to results
      setTimeout(() => {
        const element = document.getElementById('analysis-results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analyze failed', err);
      setAnalysisError(
        'Unable to connect to analysis service. Please check that the server is running on port 3001.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmissionSuccess = (submission: ReelSubmission) => {
    setSubmissionCount(prev => prev + 1);
  };

  const handleProceedToSubmit = () => {
    setActiveTab('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Top Input Row (always visible, feeds both tabs) */}
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

        {/* Tab Navigation Switcher */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          submissionCount={submissionCount}
        />

        {/* Main Content Layout: Two Columns (Main Work Area + Sidebar Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Work Area (Left 7 or 8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {activeTab === 'analyze' ? (
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
                      onProceedToSubmit={handleProceedToSubmit}
                      onReAnalyze={handleAnalyze}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Tab 2: Submit a Reel */
              <SubmissionForm
                gid={gid}
                region={selectedRegion}
                theme={activeTheme}
                initialCaption={caption}
                initialReelUrl={reelUrl}
                initialVideoFileName={videoFile ? videoFile.name : undefined}
                initialIdeaDescription={ideaDescription}
                analysisScore={analysisResults?.score}
                overallVerdict={analysisResults?.overallVerdict}
                onSubmissionSuccess={handleSubmissionSuccess}
              />
            )}
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
