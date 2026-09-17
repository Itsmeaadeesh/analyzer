import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { REGIONS, getRegionHashtag, ALL_THEMES } from '../themes';
import { ThemeConfig } from '../themes/types';

interface TopInputCardProps {
  gid: string;
  onGidChange: (gid: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedThemeId: string;
  onThemeChange: (themeId: string) => void;
  activeTheme: ThemeConfig;
  onOpenAddTheme: () => void;
}

export const TopInputCard: React.FC<TopInputCardProps> = ({
  gid,
  onGidChange,
  selectedRegion,
  onRegionChange,
  selectedThemeId,
  onThemeChange,
  activeTheme,
  onOpenAddTheme,
}) => {
  const regionHashtag = getRegionHashtag(selectedRegion, activeTheme);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Column 1: GID Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            GID <span className="text-[#EA4335]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={gid}
              onChange={(e) => onGidChange(e.target.value)}
              placeholder="Enter your GID"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-[#EEF4FE]/70 border border-[#D2E3FC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            Required for compliance verification & submission
          </p>
        </div>

        {/* Column 2: Region Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Region
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all pr-9 cursor-pointer"
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.label}>
                  {region.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Region hashtag: <strong className="text-[#1A73E8] font-mono">{regionHashtag}</strong>
            </span>
          </div>
        </div>

        {/* Column 3: Monthly Theme */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Monthly Theme
          </label>
          <div className="relative">
            <select
              value={selectedThemeId}
              onChange={(e) => onThemeChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all pr-9 cursor-pointer"
            >
              {Object.values(ALL_THEMES).map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} {theme.isActive ? '' : `(${theme.month})`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <button
              type="button"
              onClick={onOpenAddTheme}
              className="text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add a theme
            </button>
            <span className="text-[11px] text-slate-400">
              {activeTheme.month}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
