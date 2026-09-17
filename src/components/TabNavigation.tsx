import React from 'react';
import { Wand2, SendHorizontal } from 'lucide-react';

export type ActiveTab = 'analyze' | 'submit';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  submissionCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  submissionCount = 0
}) => {
  return (
    <div className="flex items-center mb-6">
      <div className="bg-slate-200/70 p-1 rounded-full inline-flex gap-1 border border-slate-200 shadow-inner">
        <button
          type="button"
          onClick={() => onTabChange('analyze')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
            activeTab === 'analyze'
              ? 'bg-[#1A73E8] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Analyze My Reel
        </button>

        <button
          type="button"
          onClick={() => onTabChange('submit')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
            activeTab === 'submit'
              ? 'bg-[#1A73E8] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <SendHorizontal className="w-4 h-4" />
          Submit a Reel
          {submissionCount > 0 && (
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'submit' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {submissionCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
