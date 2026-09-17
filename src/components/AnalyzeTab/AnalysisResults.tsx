import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Send, 
  RefreshCw,
  Cpu,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResponse } from '../../themes/types';

interface AnalysisResultsProps {
  results: AnalysisResponse;
  onProceedToSubmit: () => void;
  onReAnalyze: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  onProceedToSubmit,
  onReAnalyze,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isPass = results.overallVerdict === 'PASS';

  // Trigger confetti on render if passed
  React.useEffect(() => {
    if (isPass) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPass]);

  return (
    <div className="mt-8 space-y-5 animate-in fade-in duration-300">
      {/* 1. Summary Verdict Banner */}
      {isPass ? (
        <div className="rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#34A853] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase bg-[#137333] text-white">
                    VERDICT: PASS
                  </span>
                  <span className="text-sm font-bold text-[#137333]">
                    Score: {results.score} / {results.totalRequirements} Requirements Met
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#137333] mt-1.5">
                  Submission Ready for Instagram! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-[#0D652D] mt-1 leading-relaxed max-w-2xl">
                  {results.summaryFeedback}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToSubmit}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-sm bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Submit this Reel Now →</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FCE8E6] border-2 border-[#EA4335] p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase bg-[#C5221F] text-white">
                  VERDICT: FAIL
                </span>
                <span className="text-sm font-bold text-[#C5221F]">
                  Score: {results.score} / {results.totalRequirements} Passed
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#C5221F] mt-1.5">
                Compliance Issues Found — Edits Required
              </h3>

              {/* Critical Fail rule reason callout */}
              {results.criticalFailTriggered && results.criticalFailReason && (
                <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-rose-300 text-xs sm:text-sm text-rose-950 font-medium">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#C5221F] uppercase tracking-wide block text-xs font-bold mb-0.5">
                        CRITICAL FAIL RULE VIOLATION:
                      </strong>
                      <span className="leading-relaxed">{results.criticalFailReason}</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-rose-800 mt-2 leading-relaxed">
                {results.summaryFeedback}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Engine badge */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#1A73E8]" />
          <span>
            Evaluated by: <strong>{results.mode === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash (Cloud API)' : 'GSA Playbook Heuristic Engine'}</strong>
          </span>
        </div>
        <span>Analyzed: {new Date(results.analyzedAt).toLocaleTimeString()}</span>
      </div>

      {/* 2. Detailed 10-Item Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Requirements Breakdown
            </h4>
            <p className="text-xs text-slate-500">
              Review each individual requirement check and apply the recommended fixes
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {results.requirements.filter(r => r.passed).length} of {results.requirements.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {results.requirements.map((req) => {
            const isExpanded = expandedItems[req.id] ?? !req.passed;

            return (
              <div
                key={req.id}
                className={`border rounded-xl transition-all ${
                  req.passed
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : req.isCritical
                    ? 'border-rose-300 bg-rose-50/40'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div
                  onClick={() => toggleExpand(req.id)}
                  className="p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-black/[0.01]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {req.passed ? (
                        <div className="w-5 h-5 rounded-full bg-[#34A853] text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#EA4335] text-white flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          #{req.id}
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900">
                          {req.title}
                        </h5>
                        {req.isCritical && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                            Critical
                          </span>
                        )}
                      </div>

                      <p className={`text-xs mt-1 leading-relaxed ${req.passed ? 'text-emerald-800' : 'text-slate-600'}`}>
                        {req.evidence}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Fix Guidance */}
                {isExpanded && req.suggestion && (
                  <div className={`px-3.5 pb-3.5 pt-1 text-xs border-t ${
                    req.passed ? 'border-emerald-100 text-emerald-900' : 'border-slate-200 text-slate-700'
                  }`}>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#1A73E8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 font-semibold">How to satisfy this rule:</strong>
                        <p className="text-slate-600 mt-0.5">{req.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
