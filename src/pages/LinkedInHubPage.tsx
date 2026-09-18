import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  AlertCircle, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Send,
  HelpCircle,
  Hash,
  AtSign,
  Layers,
  Wand2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LinkedInIcon } from '../components/Common/LinkedInIcon';
import { useGsaSettings } from '../context/GsaContext';
import { TopInputRow } from '../components/Common/TopInputRow';
import { LinkFetchInput } from '../components/Common/LinkFetchInput';
import { 
  monthlyHighlightsConfig, 
  LinkedInAnalysisResponse, 
  LinkedInGenerateResponse 
} from '../themes/monthlyHighlights';
import { getRegionHashtag } from '../themes';

export const LinkedInHubPage: React.FC = () => {
  const { gid, region, serverConnected, hasGeminiKey } = useGsaSettings();
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');

  // Analyze Tab states
  const [postUrl, setPostUrl] = useState<string>('');
  const [postText, setPostText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<LinkedInAnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Generate Tab states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['events', 'wins']);
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({
    events: 'Hosted a Gemini prompt engineering workshop on campus for 90+ students',
    wins: 'Over 50 students activated Google AI Plus and built their first prototype'
  });
  const [tone, setTone] = useState<'authentic' | 'professional' | 'casual'>('authentic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const regionHashtag = getRegionHashtag(region);

  // Toggle category checkbox
  const handleToggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleNoteChange = (catId: string, value: string) => {
    setCategoryNotes(prev => ({
      ...prev,
      [catId]: value
    }));
  };

  // Analyze API Call
  const handleAnalyze = async () => {
    setAnalysisError(null);
    if (!postText.trim()) {
      setAnalysisError('Please enter your LinkedIn post text to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postText: postText.trim(),
          postUrl: postUrl.trim(),
          gid: gid.trim(),
          region
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: LinkedInAnalysisResponse = await res.json();
      setAnalysisResults(data);

      if (data.overallVerdict === 'PASS') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      const el = document.getElementById('linkedin-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Failed to analyze post.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate API Call
  const handleGenerate = async () => {
    setGenerateError(null);
    if (selectedCategories.length === 0) {
      setGenerateError('Please select at least one highlight category.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCategories,
          categoryNotes,
          tone,
          gid: gid.trim(),
          region
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: LinkedInGenerateResponse = await res.json();
      setGeneratedPost(data.post);
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || 'Failed to generate post.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPost = async () => {
    if (!generatedPost) return;
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToAnalyze = () => {
    setPostText(generatedPost);
    setActiveTab('analyze');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#0A66C2] selection:text-white pb-20">
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
            Google Student Ambassador · Pillar #3
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <LinkedInIcon className="w-8 h-8 text-[#0A66C2]" />
            <span>GSA LinkedIn Hub</span>
          </h1>
          <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
            Pillar #3 · Monthly Highlights & Community Impact
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3FF] text-[#0A66C2] border border-[#CCE4FF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A66C2]"></span>
              8 Highlight Categories Supported
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
              Powered by the GSA playbook
            </div>
          </div>
        </div>

        {/* Shared Top Settings Row */}
        <TopInputRow showThemeSelector={false} />

        {/* Dual Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'analyze'
                ? 'border-[#0A66C2] text-[#0A66C2]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Analyze My Post</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'border-[#0A66C2] text-[#0A66C2]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>Generate a Post with Gemini</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase">
              AI
            </span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'analyze' ? (
              /* ================= TAB 1: ANALYZE ================= */
              <>
                {/* Link Auto-Fetch */}
                <LinkFetchInput
                  url={postUrl}
                  onUrlChange={setPostUrl}
                  onCaptionFetched={(caption) => setPostText(caption)}
                  platformName="LinkedIn Post"
                  placeholder="https://www.linkedin.com/posts/..."
                />

                {/* Post Text Input */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800">
                      LinkedIn Post Text <span className="text-[#EA4335]">*</span>
                    </label>
                    <span className="text-xs font-semibold text-slate-500">
                      {postText.length} characters · {postText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder={`Paste your complete LinkedIn post text here...\n\nExample:\nWrapping up an exciting month as a Google Student Ambassador! 🚀\nHosted our campus Gemini AI workshop with 80+ attendees...\n\nGID - ${gid || 'YOUR-GID'}\n\n@GoogleIndia @GoogleGeminiIndia\n#GoogleStudentAmbassador #MonthlyHighlights #GSA2026 #TeamGemini ${regionHashtag}`}
                    className="w-full p-4 rounded-xl text-sm font-normal bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:bg-white transition-all resize-y"
                  />

                  {/* Detected mentions preview */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    <span className="text-slate-400 font-medium mr-1 py-0.5">Detected:</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${postText.toLowerCase().includes('@googleindia') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      @GoogleIndia
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${postText.toLowerCase().includes('@googlegeminiindia') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      @GoogleGeminiIndia
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${postText.includes(gid) && gid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      GID {gid || 'None'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${postText.toLowerCase().includes(regionHashtag.toLowerCase()) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {regionHashtag}
                    </span>
                  </div>
                </div>

                {analysisError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}

                {/* Analyze CTA */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 px-6 bg-[#0A66C2] hover:bg-[#084e96] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-700/20 hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Checking compliance with {hasGeminiKey ? 'Gemini 2.5 Flash' : 'Compliance Engine'}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>Analyze Post Compliance</span>
                    </>
                  )}
                </button>

                {/* Analysis Results Display */}
                <div id="linkedin-results">
                  {analysisResults && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                      {/* Overall Verdict Banner */}
                      <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                        analysisResults.overallVerdict === 'PASS'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}>
                        {analysisResults.overallVerdict === 'PASS' ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              analysisResults.overallVerdict === 'PASS'
                                ? 'bg-emerald-200/80 text-emerald-900'
                                : 'bg-rose-200/80 text-rose-900'
                            }`}>
                              Verdict: {analysisResults.overallVerdict}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              Score: {analysisResults.score} / {analysisResults.totalMandatoryChecks} mandatory checks passed
                            </span>
                          </div>
                          <p className="text-sm font-semibold mt-2">
                            {analysisResults.summaryFeedback}
                          </p>
                        </div>
                      </div>

                      {/* 1. Category Breakdown */}
                      <div className="border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-[#0A66C2]" />
                            <span>Monthly Highlight Categories (At least 1 required)</span>
                          </h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            analysisResults.hasAtLeastOneCategory
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {analysisResults.hasAtLeastOneCategory ? 'Passed Rule' : 'Fail: 0 Detected'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {analysisResults.detectedCategories.map(cat => (
                            <div
                              key={cat.id}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                cat.detected
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {cat.detected ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[10px] text-slate-400">·</span>
                                )}
                                <span className="truncate">{cat.name}</span>
                              </div>
                              {cat.snippet && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                                  {cat.snippet}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. 4 Mandatory Checks */}
                      <div className="border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>4 Mandatory Requirements</span>
                        </h4>

                        <div className="space-y-3">
                          {analysisResults.mandatoryChecks.map(check => (
                            <div
                              key={check.id}
                              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                                check.passed
                                  ? 'bg-white border-slate-200 text-slate-800'
                                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
                              }`}
                            >
                              {check.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-bold">{check.title}</div>
                                <div className="text-slate-600 mt-0.5">{check.evidence}</div>
                                {!check.passed && (
                                  <div className="text-rose-700 font-semibold mt-1">
                                    Fix: {check.suggestion}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Coaching Tips */}
                      {analysisResults.coachingTips && analysisResults.coachingTips.length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>Coaching & Polish Tips from Gemini</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-amber-950">
                            {analysisResults.coachingTips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-amber-600">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ================= TAB 2: GENERATE ================= */
              <>
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-amber-500" />
                      <span>Draft Your Monthly Highlights with Gemini</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Select 1 to 3 categories that best represent your milestones this month, add a few notes or numbers, and let Gemini write a high-impact post.
                    </p>
                  </div>

                  {/* 8 Categories Checkbox Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Select Highlight Categories ({selectedCategories.length} selected)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {monthlyHighlightsConfig.categories.map(cat => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => handleToggleCategory(cat.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-[#E8F3FF] border-[#0A66C2] shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by container
                              className="mt-1 w-4 h-4 text-[#0A66C2] rounded border-slate-300 focus:ring-[#0A66C2] cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {cat.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {cat.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes inputs for selected categories */}
                  {selectedCategories.length > 0 && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Add Context & Details for Selected Highlights
                      </label>

                      {selectedCategories.map(catId => {
                        const cat = monthlyHighlightsConfig.categories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                          <div key={cat.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                              <span>{cat.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Details / Metrics</span>
                            </label>
                            <input
                              type="text"
                              value={categoryNotes[cat.id] || ''}
                              onChange={(e) => handleNoteChange(cat.id, e.target.value)}
                              placeholder={cat.placeholderPrompt}
                              className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tone selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Tone & Voice
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'authentic', label: 'Authentic & Story-driven', desc: 'Humble, conversational, student-centric' },
                        { id: 'professional', label: 'Professional & Impactful', desc: 'Leadership, metrics, structured' },
                        { id: 'casual', label: 'Casual & Enthusiastic', desc: 'High-energy, emojis, hype' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTone(t.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            tone === t.id
                              ? 'bg-[#E8F3FF] border-[#0A66C2] text-[#0A66C2]'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{t.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {generateError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{generateError}</span>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || selectedCategories.length === 0}
                    className="w-full py-3.5 px-6 bg-[#0A66C2] hover:bg-[#084e96] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-700/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Crafting post with {hasGeminiKey ? 'Gemini 2.5 Flash' : 'AI Engine'}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Post with Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Output Generated Post Card */}
                {generatedPost && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#0A66C2]" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Generated LinkedIn Post
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyPost}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Post</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleSendToAnalyze}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to Analyze Tab</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {generatedPost}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Includes: GID - {gid || 'YOUR-GID'}, @GoogleIndia, @GoogleGeminiIndia & hashtags</span>
                      <span>{generatedPost.length} chars</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar Info Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Playbook Rules Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-slate-900">
                <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Pillar #3 Rules Overview
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Monthly Highlights showcase your ambassador leadership, campus workshops, and student prototypes.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Must include at least 1 of the 8 highlight categories.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Must tag both <strong className="text-slate-900">@GoogleIndia</strong> and <strong className="text-slate-900">@GoogleGeminiIndia</strong>.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Include mandatory campaign hashtags + your region hashtag.</span>
                </div>
              </div>
            </div>

            {/* 8 Categories Reference */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0A66C2]" />
                  <span>8 Highlight Categories</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0A66C2]">
                  1 Required
                </span>
              </div>
              <ol className="space-y-2 text-xs text-slate-700">
                {monthlyHighlightsConfig.categories.map((cat, i) => (
                  <li key={cat.id} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium">{cat.name}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Mandatory Hashtags card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-slate-900">
                <Hash className="w-4 h-4 text-[#1A73E8]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Mandatory Hashtags
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {monthlyHighlightsConfig.mandatoryHashtags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1A73E8] text-xs font-semibold">
                    {tag}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {regionHashtag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
