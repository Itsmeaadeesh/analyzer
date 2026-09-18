import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck,
  Film
} from 'lucide-react';
import { useGsaSettings } from '../context/GsaContext';
import { TopInputRow } from '../components/Common/TopInputRow';
import { LinkFetchInput } from '../components/Common/LinkFetchInput';
import { TabNavigation } from '../components/TabNavigation';
import { VideoDropzone } from '../components/AnalyzeTab/VideoDropzone';
import { CreativeIdeaInput } from '../components/AnalyzeTab/CreativeIdeaInput';
import { CaptionTemplateCard } from '../components/AnalyzeTab/CaptionTemplateCard';
import { CaptionInput } from '../components/AnalyzeTab/CaptionInput';
import { AnalysisResults } from '../components/AnalyzeTab/AnalysisResults';
import { SubmissionForm } from '../components/SubmitTab/SubmissionForm';
import { RequirementsCard } from '../components/SidebarInfo/RequirementsCard';
import { CriticalFailCard } from '../components/SidebarInfo/CriticalFailCard';
import { POVCard } from '../components/SidebarInfo/POVCard';
import { CaptionExplainerCard } from '../components/SidebarInfo/CaptionExplainerCard';
import { SubIdeasChips } from '../components/SidebarInfo/SubIdeasChips';
import { HowItsCheckedModal } from '../components/Modals/HowItsCheckedModal';
import { AddThemeModal } from '../components/Modals/AddThemeModal';
import { getThemeById } from '../themes';
import { AnalysisResponse, ThemeConfig } from '../themes/types';

export const ReelsStudioPage: React.FC = () => {
  const { gid, region, themeId, setThemeId, serverConnected, hasGeminiKey } = useGsaSettings();
  const [activeTab, setActiveTab] = useState<'analyze' | 'submit'>('analyze');

  // Reel analyze states
  const [reelUrl, setReelUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [creativeIdea, setCreativeIdea] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modals
  const [isHowItsCheckedOpen, setIsHowItsCheckedOpen] = useState<boolean>(false);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState<boolean>(false);

  const activeTheme: ThemeConfig = getThemeById(themeId);

  const handleUseCaptionFromTemplate = (templateWithPlaceholders: string) => {
    setCaption(templateWithPlaceholders);
  };

  const handleAnalyze = async () => {
    setAnalysisError(null);

    if (!caption.trim() && !creativeIdea.trim()) {
      setAnalysisError('Please enter your reel caption or creative idea to analyze.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim(),
          idea: creativeIdea.trim(),
          reelUrl: reelUrl.trim(),
          videoFileName: videoFile ? videoFile.name : undefined,
          gid: gid.trim(),
          region,
          themeId,
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisResults(data);

      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err: any) {
      console.error('Error analyzing reel:', err);
      setAnalysisError(err.message || 'Failed to analyze reel. Check network or server status.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#4285F4] selection:text-white pb-20">
      {/* Top Navbar with Back button */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to GSA Studio</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm text-slate-700">
              <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{hasGeminiKey ? 'Gemini 2.5 Flash' : 'Compliance Engine'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Title & Subtitle */}
        <div className="mb-6">
          <div className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">
            Google Student Ambassador · Pillar #2
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">S</span>
            <span className="text-[#FBBC05]">A</span>
            <span className="ml-1 text-slate-900 font-extrabold">Reels Studio</span>
          </h1>
          <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
            Pillar #2 · Content Creation with Reels & Brand Transformation
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
              Powered by the GSA playbook
            </div>

            <button
              onClick={() => setIsHowItsCheckedOpen(true)}
              className="text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] hover:underline flex items-center gap-1 transition-colors"
            >
              How it's checked →
            </button>
          </div>
        </div>

        {/* Shared Top Settings Row */}
        <TopInputRow showThemeSelector={true} />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requirementsCount={activeTheme.requirements.length}
        />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left/Center Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'analyze' ? (
              <>
                {/* Reel Link Auto-Fetch */}
                <LinkFetchInput
                  url={reelUrl}
                  onUrlChange={setReelUrl}
                  onCaptionFetched={(fetchedCaption) => setCaption(fetchedCaption)}
                  platformName="Instagram Reel"
                  placeholder="https://www.instagram.com/reel/Cxxxx..."
                />

                {/* Video Dropzone */}
                <VideoDropzone
                  videoFile={videoFile}
                  onFileSelect={setVideoFile}
                />

                {/* Creative Idea Input */}
                <CreativeIdeaInput
                  ideaDescription={creativeIdea}
                  onIdeaChange={setCreativeIdea}
                />

                {/* Caption Template Card */}
                <CaptionTemplateCard
                  theme={activeTheme}
                  gid={gid}
                  region={region}
                  onUseCaption={handleUseCaptionFromTemplate}
                />

                {/* Caption Textarea Input */}
                <CaptionInput
                  caption={caption}
                  onCaptionChange={setCaption}
                  theme={activeTheme}
                  gid={gid}
                  region={region}
                />

                {/* Error Banner */}
                {analysisError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}

                {/* Primary CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-4 px-6 bg-[#1A73E8] hover:bg-[#1557B0] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing with {hasGeminiKey ? 'Gemini 2.5 Flash' : 'Compliance Engine'}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span>Analyze Reel Compliance</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-2">
                    Evaluates all 10 requirements including the Critical Fail rule before official scoring.
                  </p>
                </div>

                {/* Results Section */}
                <div id="results-section">
                  {analysisResults && (
                    <div className="mt-8">
                      <AnalysisResults
                        results={analysisResults}
                        onReAnalyze={handleAnalyze}
                        captionToCopy={caption}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Tab 2: Submit a Reel */
              <SubmissionForm
                gid={gid}
                region={region}
                theme={activeTheme}
                initialCaption={caption}
                initialReelUrl={reelUrl}
                initialVideoFileName={videoFile ? videoFile.name : ''}
                initialIdeaDescription={creativeIdea}
                analysisScore={analysisResults?.score}
                overallVerdict={analysisResults?.overallVerdict}
                onSubmissionSuccess={(sub) => {
                  console.log('Submission confirmed:', sub);
                }}
              />
            )}
          </div>

          {/* Right Sidebar Info Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <CriticalFailCard criticalRuleText={activeTheme.criticalFailRule} />
            <POVCard povText={activeTheme.pov} />
            <CaptionExplainerCard explainerText={activeTheme.captionExplainer} />
            <SubIdeasChips subIdeas={activeTheme.subIdeas} />
            <RequirementsCard
              requirements={activeTheme.requirements}
              activeThemeName={activeTheme.name}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HowItsCheckedModal
        isOpen={isHowItsCheckedOpen}
        onClose={() => setIsHowItsCheckedOpen(false)}
        theme={activeTheme}
      />

      <AddThemeModal
        isOpen={isAddThemeOpen}
        onClose={() => setIsAddThemeOpen(false)}
        activeThemeId={themeId}
        onSelectTheme={setThemeId}
      />
    </div>
  );
};
