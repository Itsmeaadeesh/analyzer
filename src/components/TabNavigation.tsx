import React from 'react';
import { Wand2 } from 'lucide-react';

export const TabNavigation: React.FC = () => {
  return (
    <div className="flex items-center mb-6">
      <div className="inline-flex">
        <div className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[#1A73E8] text-white shadow-sm">
          <Wand2 className="w-4 h-4" />
          <span>Analyze My Reel</span>
        </div>
      </div>
    </div>
  );
};
