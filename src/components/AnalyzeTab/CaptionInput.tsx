import React from 'react';
import { AlignLeft, CheckCircle2, AlertCircle, Hash, AtSign } from 'lucide-react';
import { ThemeConfig } from '../../themes/types';
import { getRegionHashtag } from '../../themes';

interface CaptionInputProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
  theme: ThemeConfig;
  gid: string;
  region: string;
}

export const CaptionInput: React.FC<CaptionInputProps> = ({
  caption,
  onCaptionChange,
  theme,
  gid,
  region,
}) => {
  const expectedRegionHashtag = getRegionHashtag(region, theme);
  const lowerCaption = caption.toLowerCase();

  // Quick visual tag indicator pills
  const hasGid = Boolean(gid.trim() && lowerCaption.includes(gid.trim().toLowerCase()));
  const hasTags = theme.requiredTags.every(t => lowerCaption.includes(t.toLowerCase()));
  const hasCoreHashtags = theme.requiredHashtags.every(h => lowerCaption.includes(h.toLowerCase()));
  const hasRegionalTag = lowerCaption.includes(expectedRegionHashtag.toLowerCase());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <AlignLeft className="w-4 h-4 text-[#1A73E8]" />
          Paste your Reel caption
        </label>
        <span className="text-[11px] font-mono text-slate-400">
          {caption.length} characters · {caption.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      <textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        rows={7}
        placeholder="Paste your Instagram Reel caption here (or click 'Use this caption' above)..."
        className="w-full p-3.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all font-sans leading-relaxed text-slate-800 placeholder:text-slate-400"
      />

      {/* Real-time caption tag detection preview */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Live tag detection:</span>

        {/* GID Tag */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] ${
          hasGid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {hasGid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-slate-400" />}
          GID: {gid || 'None'}
        </span>

        {/* Official Handles */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
          hasTags ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {hasTags ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AtSign className="w-3 h-3 text-slate-400" />}
          3 Google Handles
        </span>

        {/* Campaign Hashtags */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] ${
          hasCoreHashtags ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {hasCoreHashtags ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Hash className="w-3 h-3 text-slate-400" />}
          #GSA2026 Core Tags
        </span>

        {/* Region Hashtag */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono ${
          hasRegionalTag ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {hasRegionalTag ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Hash className="w-3 h-3 text-slate-400" />}
          {expectedRegionHashtag}
        </span>
      </div>
    </div>
  );
};
