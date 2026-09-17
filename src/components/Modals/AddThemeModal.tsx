import React from 'react';
import { X, Calendar, Check, Sparkles, FolderCode } from 'lucide-react';
import { ALL_THEMES } from '../../themes';
import { ThemeConfig } from '../../themes/types';

interface AddThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const AddThemeModal: React.FC<AddThemeModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Monthly Themes & Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Manage and switch active GSA pillar themes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700">
          <p className="text-xs text-slate-600 leading-relaxed">
            GSA Reels Studio features a modular theme configuration system. Select a theme below or inspect the architecture for adding upcoming months.
          </p>

          <div className="space-y-3">
            {Object.values(ALL_THEMES).map((theme) => {
              const isSelected = theme.id === activeThemeId;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#1A73E8] bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {theme.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          theme.isActive ? 'bg-emerald-100 text-[#137333]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {theme.month}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {theme.pov}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture note card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <FolderCode className="w-4 h-4 text-[#1A73E8]" />
              How to Add Future Month Themes:
            </h5>
            <p className="leading-relaxed">
              Theme configurations are strictly decoupled in <code className="text-blue-600 bg-white px-1 py-0.5 rounded border border-slate-200">src/themes/</code>. To add a new month's theme, simply create a new typed object adhering to <code className="text-blue-600 bg-white px-1 py-0.5 rounded border border-slate-200">ThemeConfig</code> and register it in <code className="text-blue-600 bg-white px-1 py-0.5 rounded border border-slate-200">src/themes/index.ts</code>. The entire UI and compliance rules update automatically!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
