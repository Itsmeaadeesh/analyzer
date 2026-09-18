import React from 'react';
import { REGIONS, getRegionHashtag, ALL_THEMES } from '../../themes';
import { useGsaSettings } from '../../context/GsaContext';
import { ShieldCheck, Tag, Hash } from 'lucide-react';

interface TopInputRowProps {
  showThemeSelector?: boolean;
}

export const TopInputRow: React.FC<TopInputRowProps> = ({ showThemeSelector = false }) => {
  const { gid, setGid, region, setRegion, themeId, setThemeId } = useGsaSettings();
  const regionHashtag = getRegionHashtag(region);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6 transition-all hover:border-slate-300">
      <div className={`grid grid-cols-1 ${showThemeSelector ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 sm:gap-5 items-start`}>
        {/* Column 1: GID Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>GID <span className="text-[#EA4335]">*</span></span>
            <span className="text-[10px] text-slate-400 font-normal">Auto-saved</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={gid}
              onChange={(e) => setGid(e.target.value)}
              placeholder="Enter your GID (e.g. 973)"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-[#EEF4FE]/70 border border-[#D2E3FC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Required in all GSA captions & submissions
          </p>
        </div>

        {/* Column 2: Region Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Region <span className="text-[#EA4335]">*</span>
          </label>
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all pr-9 cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Auto-determines your regional hashtag
          </p>
        </div>

        {/* Column 3: Regional Hashtag (Readonly) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Region Hashtag</span>
          </label>
          <div className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#F8FAFD] border border-slate-200/80 text-[#1A73E8]">
            {regionHashtag}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Required in your hashtag stack
          </p>
        </div>

        {/* Column 4: Theme Selector (Optional, for Reels) */}
        {showThemeSelector && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Pillar #2 Theme</span>
            </label>
            <div className="relative">
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all pr-9 cursor-pointer"
              >
                {Object.values(ALL_THEMES).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.displayName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Current active theme
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
