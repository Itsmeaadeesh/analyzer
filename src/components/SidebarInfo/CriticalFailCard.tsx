import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface CriticalFailCardProps {
  criticalRuleText: string;
}

export const CriticalFailCard: React.FC<CriticalFailCardProps> = ({ criticalRuleText }) => {
  return (
    <div className="rounded-2xl border-2 border-[#EA4335] bg-[#FCE8E6]/60 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C5221F]">
            Critical Fail Rule
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-rose-950 mt-1 leading-relaxed">
            "{criticalRuleText}"
          </p>
        </div>
      </div>
    </div>
  );
};
