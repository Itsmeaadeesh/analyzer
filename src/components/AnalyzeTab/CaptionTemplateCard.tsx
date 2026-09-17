import React, { useState } from 'react';
import { Copy, Check, FileText, ArrowDownToLine, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../../themes/types';
import { formatCaptionWithPlaceholders, getRegionHashtag } from '../../themes';

interface CaptionTemplateCardProps {
  theme: ThemeConfig;
  gid: string;
  region: string;
  onUseCaption: (formattedCaption: string) => void;
}

export const CaptionTemplateCard: React.FC<CaptionTemplateCardProps> = ({
  theme,
  gid,
  region,
  onUseCaption,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute live template with GID and region hashtag
  const dynamicTemplate = formatCaptionWithPlaceholders(
    theme.captionTemplate,
    gid,
    region,
    theme
  );

  const regionHashtag = getRegionHashtag(region, theme);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dynamicTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleUseThis = () => {
    onUseCaption(dynamicTemplate);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#FBBC05]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ideal caption template
            </h3>
            <p className="text-[11px] text-slate-500">
              Formatted for {theme.name} · Auto-syncs with GID: <span className="font-mono text-slate-700">{gid || 'YOUR-GID'}</span> & Region: <span className="font-mono text-blue-600">{regionHashtag}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Copy formatted template to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleUseThis}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm transition-all"
            title="Insert this template into caption textarea below"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Use this caption</span>
          </button>
        </div>
      </div>

      {/* Code-block styled caption */}
      <div className="relative rounded-xl bg-[#0F172A] border border-slate-800 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-64 shadow-inner">
        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
          {dynamicTemplate}
        </pre>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>💡 Clicking <strong>Use this caption</strong> pre-fills the textarea below with your active GID and regional tag.</span>
      </div>
    </div>
  );
};
