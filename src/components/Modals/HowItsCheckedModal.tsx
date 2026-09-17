import React from 'react';
import { X, ShieldCheck, AlertOctagon, CheckCircle2, Cpu, HelpCircle } from 'lucide-react';
import { ThemeConfig } from '../../themes/types';

interface HowItsCheckedModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export const HowItsCheckedModal: React.FC<HowItsCheckedModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#137333] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                How GSA Reels are Checked
              </h3>
              <p className="text-xs text-slate-500">
                Official Compliance Scoring Rubric · Pillar #2
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
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: The Critical Fail Rule */}
          <div className="p-4 rounded-2xl bg-[#FCE8E6] border border-[#EA4335]/30">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-[#EA4335] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5221F]">
                  The Golden Rule: Critical Fail Conditions
                </h4>
                <p className="text-xs font-semibold text-rose-950 mt-1">
                  "{theme.criticalFailRule}"
                </p>
                <p className="text-xs text-rose-800 mt-2">
                  Even if your caption has all hashtags and your GID is present, missing the <strong>Gemini chat build process</strong>, <strong>Nano Banana visual reveal</strong>, or <strong>saying the student offer out loud</strong> will cause an automatic FAIL verdict.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: How AI Analyzes Your Reel */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#1A73E8]" />
              Gemini 2.5 Flash Server-Side Evaluation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you click <strong>Analyze Reel</strong>, your submission is evaluated against the 10 Pillar #2 requirements via a secure server endpoint using Google's Gemini 2.5 Flash model:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
              <li><strong>Content Verification:</strong> Confirms your creative concept describes a tangible brand rather than a generic summary.</li>
              <li><strong>Chat & Prompt Verification:</strong> Checks for evidence of interactive Gemini brainstorming (naming, tagline, value proposition).</li>
              <li><strong>Visual Reveal Verification:</strong> Confirms the Nano Banana design reveal is integrated.</li>
              <li><strong>Audio/Vocal Check:</strong> Confirms the "Free for students" Google AI Plus benefit is clearly vocalized.</li>
              <li><strong>Metadata & Regional Formatting:</strong> Verifies GID, the 3 official handles (@GoogleIndia, @Googlegemini, @GoogleGeminiIndia), core hashtags, and your exact regional hashtag.</li>
            </ul>
          </div>

          {/* Section 3: Regional Hashtags */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Regional Hashtag Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block">East & West India</span>
                <span className="font-mono text-[#1A73E8] font-bold text-sm">#ping_mcn</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block">North & South India</span>
                <span className="font-mono text-[#1A73E8] font-bold text-sm">#CommuniqueIndia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
