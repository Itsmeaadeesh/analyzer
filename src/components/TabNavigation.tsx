import React from 'react';
import { Wand2, SendHorizontal } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'analyze' | 'submit';
  onTabChange: (tab: 'analyze' | 'submit') => void;
  requirementsCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  requirementsCount = 10,
}) => {
  return (
    <div className="flex items-center mb-6">
      <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200 shadow-inner">
        <button
          type="button"
          onClick={() => onTabChange('analyze')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'analyze'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wand2 className="w-4 h-4 text-[#1A73E8]" />
          <span>Analyze My Reel</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EEF4FE] text-[#1A73E8]">
            {requirementsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('submit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SendHorizontal className="w-4 h-4 text-[#34A853]" />
          <span>Submit a Reel</span>
        </button>
      </div>
    </div>
  );
};
