import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CreativeIdeaInputProps {
  ideaDescription: string;
  onIdeaChange: (idea: string) => void;
}

const BANNED_VAGUE_TERMS = ['true', 'ai video', 'cool video', 'nice', 'good', 'my video', 'gemini video', 'video'];

export const CreativeIdeaInput: React.FC<CreativeIdeaInputProps> = ({
  ideaDescription,
  onIdeaChange,
}) => {
  const trimmed = ideaDescription.trim().toLowerCase();
  const isTooShort = trimmed.length > 0 && trimmed.length < 15;
  const isBannedVague = BANNED_VAGUE_TERMS.includes(trimmed);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-[#FBBC05]" />
          Creative idea description
        </label>
        <span className="text-[11px] font-mono text-slate-400">
          {ideaDescription.length} chars
        </span>
      </div>

      <textarea
        value={ideaDescription}
        onChange={(e) => onIdeaChange(e.target.value)}
        rows={4}
        placeholder="Example: Created a zero-waste campus snack brand called 'DormBites'. Chatted with Gemini 2.5 to brainstorm the catchy slogan 'Fuel Before The Bell', target pricing, and USP. Then used Nano Banana to generate aesthetic neon packaging and stickers, and voiced the student free offer..."
        className={`w-full p-3.5 rounded-xl text-sm border transition-all font-sans leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          isBannedVague || isTooShort
            ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/20'
            : 'border-slate-200 focus:ring-[#1A73E8]'
        }`}
      />

      <p className="text-xs text-slate-500 mt-2">
        <strong>Anti-rejection rule:</strong> Vague entries like "true" or "AI video" are rejected — describe the real output.
      </p>

      {/* Real-time warning for vague entries */}
      {isBannedVague && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Vague entry detected:</strong> "{ideaDescription}". The GSA playbook rejects generic entries like "{ideaDescription}". Please describe the actual brand, concept, and Gemini/Nano Banana workflow.
          </span>
        </div>
      )}

      {!isBannedVague && isTooShort && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Description is very short. Provide at least 1-2 descriptive sentences to guarantee passing the compliance check.</span>
        </div>
      )}
    </div>
  );
};
