import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Bot, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { LinkedInIcon } from '../components/Common/LinkedInIcon';
import { useGsaSettings } from '../context/GsaContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { gid, region, serverConnected, hasGeminiKey } = useGsaSettings();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-between selection:bg-[#4285F4] selection:text-white">
      {/* Top banner / Navigation */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 font-extrabold text-xl tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">S</span>
              <span className="text-[#FBBC05]">A</span>
              <span className="text-slate-900 font-bold ml-0.5">Studio</span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md">
              2026 Edition
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 shadow-sm text-slate-700">
              <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{hasGeminiKey ? 'Gemini 2.5 Flash' : 'Compliance Engine'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] mb-4">
            <ShieldCheck className="w-4 h-4 text-[#34A853]" />
            <span>Powered by the GSA Playbook</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4">
            Welcome to{' '}
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">S</span>
            <span className="text-[#FBBC05]">A</span>{' '}
            <span className="text-slate-900">Studio</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Your all-in-one compliance checker, writing coach, and submission hub for Google Student Ambassador content milestones.
          </p>
        </div>

        {/* Two Large Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Card 1: Task 2 — Reels Studio */}
          <div 
            onClick={() => navigate('/reels')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200/90 hover:border-[#4285F4] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
          >
            <div className="absolute -top-3 right-6 bg-[#4285F4] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
              Pillar #2
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#EEF4FE] border border-[#D2E3FC] flex items-center justify-center mb-5 text-[#1A73E8] group-hover:bg-[#1A73E8] group-hover:text-white transition-colors duration-300">
                <Film className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold text-[#1A73E8] uppercase tracking-wider mb-1">
                Instagram Reels
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#1A73E8] transition-colors">
                Task 2 — Reels Studio
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Check your Reel against Pillar #2 rules — GID, tags, hashtags, Gemini build process, Nano Banana reveal, and the free-for-students offer.
              </p>

              <div className="space-y-2 mb-6 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>10-point checklist & Critical Fail rule protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Theme: Idea to Brand & Nano Banana visual reveal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reel link auto-fetcher & submission receipt generator</span>
                </div>
              </div>
            </div>

            <button 
              type="button"
              className="w-full py-3 px-4 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Open Reels Studio</span>
              <ArrowRight className="w-4 h-4 transition-all" />
            </button>
          </div>

          {/* Card 2: Task 3 — LinkedIn Monthly Highlights */}
          <div 
            onClick={() => navigate('/linkedin')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200/90 hover:border-[#0A66C2] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
          >
            <div className="absolute -top-3 right-6 bg-[#0A66C2] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
              Pillar #3
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#E8F3FF] border border-[#CCE4FF] flex items-center justify-center mb-5 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-colors duration-300">
                <LinkedInIcon className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold text-[#0A66C2] uppercase tracking-wider mb-1">
                LinkedIn Monthly Highlights
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#0A66C2] transition-colors">
                Task 3 — LinkedIn Hub
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Check your LinkedIn post against Pillar #3 rules — GID, tags, hashtags, and at least one highlight category. Or generate a post from scratch.
              </p>

              <div className="space-y-2 mb-6 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>8 highlight categories (events, collaborations, wins, etc.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4 mandatory checks (GID, @GoogleIndia, tags & hashtags)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Post Generator powered by Gemini 2.5 Flash</span>
                </div>
              </div>
            </div>

            <button 
              type="button"
              className="w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Open LinkedIn Hub</span>
              <ArrowRight className="w-4 h-4 transition-all" />
            </button>
          </div>
        </div>

        {/* Playbook Info Strip */}
        <div className="mt-14 max-w-4xl mx-auto bg-[#EEF4FE]/50 border border-[#D2E3FC] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#D2E3FC] flex items-center justify-center text-[#1A73E8] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Active Ambassador Session
              </div>
              <div className="text-xs text-slate-600">
                GID: <span className="font-semibold text-slate-900">{gid || 'Not set'}</span> · Region: <span className="font-semibold text-slate-900">{region}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Settings persist across all Studio tools
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 Google Student Ambassador Program · GSA Studio
          </div>
          <div className="font-medium text-slate-400">
            Proprietary + Confidential
          </div>
        </div>
      </footer>
    </div>
  );
};
