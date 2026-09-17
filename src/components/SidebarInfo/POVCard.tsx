import React from 'react';
import { Video, Quote } from 'lucide-react';

interface POVCardProps {
  povText: string;
}

export const POVCard: React.FC<POVCardProps> = ({ povText }) => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-blue-200/80 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1A73E8] flex items-center justify-center">
          <Video className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          POV (Point of View)
        </h4>
      </div>
      <blockquote className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic relative pl-3 border-l-2 border-[#1A73E8]">
        "{povText}"
      </blockquote>
    </div>
  );
};
