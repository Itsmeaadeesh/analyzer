import React from 'react';
import { Sparkles, Palette, PenTool, Zap } from 'lucide-react';

interface SubIdeasChipsProps {
  subIdeas: string[];
}

export const SubIdeasChips: React.FC<SubIdeasChipsProps> = ({ subIdeas }) => {
  const icons = [
    <Palette key="1" className="w-3.5 h-3.5 text-amber-600" />,
    <PenTool key="2" className="w-3.5 h-3.5 text-blue-600" />,
    <Zap key="3" className="w-3.5 h-3.5 text-emerald-600" />,
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" />
        Sub-Ideas to Spark Your Reel
      </h4>
      <div className="flex flex-col gap-2">
        {subIdeas.map((idea, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
          >
            {icons[idx % icons.length]}
            <span>{idea}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
