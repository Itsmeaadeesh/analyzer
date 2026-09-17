import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenHowItsChecked: () => void;
  serverConnected: boolean;
  hasGeminiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItsChecked,
  serverConnected,
  hasGeminiKey
}) => {
  return (
    <header className="mb-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          {/* Small label */}
          <div className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-1 flex items-center gap-1.5">
            <span>Google Student Ambassador</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">S</span>
            <span className="text-[#FBBC05]">A</span>
            <span className="ml-1 text-slate-900 font-extrabold">Reels Studio</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
            Pillar #2 · Content Creation with Reels
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
              Powered by the GSA playbook
            </div>

            <button
              onClick={onOpenHowItsChecked}
              className="text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] hover:underline flex items-center gap-1 transition-colors"
            >
              How it's checked →
            </button>
          </div>
        </div>

        {/* System & AI Badge */}
        <div className="self-start md:self-auto flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${serverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-medium text-slate-700">
              {hasGeminiKey ? 'Gemini 2.5 Flash' : 'Compliance Engine'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-mono">v2026.2</span>
        </div>
      </div>
    </header>
  );
};
