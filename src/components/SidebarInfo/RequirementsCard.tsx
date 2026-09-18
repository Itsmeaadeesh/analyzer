import React from 'react';
import { ListChecks, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RequirementItem } from '../../themes/types';

interface RequirementsCardProps {
  requirements: RequirementItem[];
  activeThemeName: string;
}

export const RequirementsCard: React.FC<RequirementsCardProps> = ({
  requirements,
  activeThemeName,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center">
            <ListChecks className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Reel Requirements ({requirements.length}-Point Checklist)
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1A73E8] border border-blue-100">
          {activeThemeName}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Every reel submitted must check all {requirements.length} requirements to qualify for ambassador scoring.
      </p>

      <ol className="space-y-2.5">
        {requirements.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug group"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
              item.isCritical
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {item.id}
            </span>
            <div className="min-w-0">
              <span className="font-medium group-hover:text-slate-900">
                {item.title}
              </span>
              {item.isCritical && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide bg-rose-50 text-[#C5221F] border border-rose-200">
                  Critical
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
