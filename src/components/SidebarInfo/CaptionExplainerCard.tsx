import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';

interface CaptionExplainerCardProps {
  explainerText: string;
}

export const CaptionExplainerCard: React.FC<CaptionExplainerCardProps> = ({ explainerText }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Ideal Caption Template Structure
        </h4>
      </div>
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {explainerText}
      </p>

      {/* Visual step badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Hook</span>
        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">The Build (Chat)</span>
        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">The Reveal</span>
        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Free Offer</span>
        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">GID & Tags</span>
      </div>
    </div>
  );
};
