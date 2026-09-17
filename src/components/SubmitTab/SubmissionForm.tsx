import React, { useState, useEffect } from 'react';
import { 
  SendHorizontal, 
  CheckCircle2, 
  Link2, 
  Film, 
  AlignLeft, 
  Hash, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw,
  Clock,
  History,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../../themes/types';
import { getRegionHashtag } from '../../themes';
import { ReelSubmission } from '../../types';

interface SubmissionFormProps {
  gid: string;
  region: string;
  theme: ThemeConfig;
  initialCaption?: string;
  initialReelUrl?: string;
  initialVideoFileName?: string;
  initialIdeaDescription?: string;
  analysisScore?: number;
  overallVerdict?: 'PASS' | 'FAIL';
  onSubmissionSuccess: (submission: ReelSubmission) => void;
}

const STORAGE_KEY = 'gsa_reels_submissions_history';

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  gid,
  region,
  theme,
  initialCaption = '',
  initialReelUrl = '',
  initialVideoFileName = '',
  initialIdeaDescription = '',
  analysisScore,
  overallVerdict,
  onSubmissionSuccess,
}) => {
  const [reelUrl, setReelUrl] = useState(initialReelUrl);
  const [caption, setCaption] = useState(initialCaption);
  const [ideaDescription, setIdeaDescription] = useState(initialIdeaDescription);
  const [videoFileName, setVideoFileName] = useState(initialVideoFileName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<ReelSubmission | null>(null);
  const [history, setHistory] = useState<ReelSubmission[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const regionHashtag = getRegionHashtag(region, theme);

  // Sync props if initialCaption or initialUrl changes
  useEffect(() => {
    if (initialCaption) setCaption(initialCaption);
    if (initialReelUrl) setReelUrl(initialReelUrl);
    if (initialVideoFileName) setVideoFileName(initialVideoFileName);
    if (initialIdeaDescription) setIdeaDescription(initialIdeaDescription);
  }, [initialCaption, initialReelUrl, initialVideoFileName, initialIdeaDescription]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to parse submission history', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!gid.trim()) {
      setErrorMessage('GID is required. Please fill in your GID in the top input.');
      return;
    }

    if (!caption.trim()) {
      setErrorMessage('Final caption is required before submitting.');
      return;
    }

    if (!reelUrl.trim() && !videoFileName) {
      setErrorMessage('Please provide either your Instagram Reel link or an uploaded video file.');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable submission process
    setTimeout(() => {
      const submissionId = `GSA-REEL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newSubmission: ReelSubmission = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        submissionId,
        gid: gid.trim(),
        region,
        themeId: theme.id,
        themeName: theme.name,
        reelUrl: reelUrl.trim(),
        videoFileName: videoFileName || undefined,
        caption: caption.trim(),
        ideaDescription: ideaDescription.trim(),
        analysisScore,
        verdict: overallVerdict || 'PASS',
        submittedAt: new Date().toISOString()
      };

      const updatedHistory = [newSubmission, ...history];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (err) {
        console.warn('LocalStorage save failed', err);
      }

      setSubmittedReceipt(newSubmission);
      setIsSubmitting(false);
      onSubmissionSuccess(newSubmission);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 700);
  };

  const handleCopyReceipt = async () => {
    if (!submittedReceipt) return;
    const text = `Google Student Ambassador Reel Submission Receipt
Receipt ID: ${submittedReceipt.submissionId}
GID: ${submittedReceipt.gid}
Theme: ${submittedReceipt.themeName}
Region: ${submittedReceipt.region} (${regionHashtag})
Reel URL: ${submittedReceipt.reelUrl || 'Attached video: ' + submittedReceipt.videoFileName}
Submitted At: ${new Date(submittedReceipt.submittedAt).toLocaleString()}
Compliance Status: ${submittedReceipt.verdict || 'VERIFIED'}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const resetForNewSubmission = () => {
    setSubmittedReceipt(null);
    setCaption('');
    setReelUrl('');
    setVideoFileName('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Confirmation State when submitted */}
      {submittedReceipt ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-[#E6F4EA] text-[#34A853] flex items-center justify-center mx-auto mb-4 border border-[#CEEAD6]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-[#137333] mb-2">
              Submission Confirmed
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Reel Recorded in GSA Register!
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Your Reel submission for Pillar #2 ({submittedReceipt.themeName}) has been successfully submitted under ambassador GID <strong>{submittedReceipt.gid}</strong>.
            </p>
          </div>

          {/* Submission Receipt Card */}
          <div className="mt-6 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 space-y-2">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Submission ID:</span>
              <span className="font-bold text-[#1A73E8]">{submittedReceipt.submissionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ambassador GID:</span>
              <span className="font-bold">{submittedReceipt.gid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Region:</span>
              <span>{submittedReceipt.region} ({regionHashtag})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Theme:</span>
              <span>{submittedReceipt.themeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date / Time:</span>
              <span>{new Date(submittedReceipt.submittedAt).toLocaleString()}</span>
            </div>
            {submittedReceipt.reelUrl && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Reel Link:</span>
                <span className="break-all text-blue-600 font-sans">{submittedReceipt.reelUrl}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId ? 'Receipt Copied!' : 'Copy Submission Receipt'}</span>
            </button>

            <button
              type="button"
              onClick={resetForNewSubmission}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1A73E8] hover:bg-[#1557B0] text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Reel</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. Submission Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <SendHorizontal className="w-5 h-5 text-[#1A73E8]" />
                Official Reel Submission
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit your final Instagram Reel link and verified caption for Pillar #2 credit.
              </p>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-semibold text-slate-600 hover:text-[#1A73E8] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 bg-slate-50 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>
            )}
          </div>

          {/* Active Context Banner */}
          <div className="bg-[#EEF4FE]/60 border border-[#D2E3FC] rounded-xl p-3.5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Ambassador GID:</span>
              <strong className="text-slate-900 text-sm font-mono">{gid || 'Not set in top input'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Selected Region:</span>
              <strong className="text-slate-900">{region}</strong>
              <span className="text-blue-600 font-mono ml-1">({regionHashtag})</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Active Theme:</span>
              <strong className="text-slate-900">{theme.name}</strong>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-4">
            {/* Reel Link Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-[#1A73E8]" />
                Instagram Reel Public Link
              </label>
              <input
                type="url"
                value={reelUrl}
                onChange={(e) => setReelUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Must be an active, public Instagram Reel URL.
              </p>
            </div>

            {/* Video file indicator if uploaded */}
            {videoFileName && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#EA4335]" />
                  <span className="font-medium text-slate-800">Attached Video: {videoFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFileName('')}
                  className="text-slate-400 hover:text-rose-600 text-xs font-medium"
                >
                  Detach
                </button>
              </div>
            )}

            {/* Final Caption */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-[#1A73E8]" />
                Final Submitted Caption <span className="text-[#EA4335]">*</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={6}
                placeholder="Paste your final caption that went live with the reel (including GID, @Google handles, and hashtags)..."
                className="w-full p-3.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] leading-relaxed"
                required
              />
            </div>

            {/* Creative Idea Context (Optional note) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Creative Idea Summary / Context
              </label>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of your brand concept and Gemini build..."
                className="w-full p-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              By submitting, you certify that this Reel adheres to the Google Community & Ambassador guidelines.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-[#1A73E8] hover:bg-[#1557B0] disabled:bg-slate-300 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting Reel...</span>
                </>
              ) : (
                <>
                  <SendHorizontal className="w-4 h-4" />
                  <span>Submit Reel for Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 3. Local Submission History Drawer / Card */}
      {showHistory && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-[#1A73E8]" />
              Your Previous Submissions
            </h4>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {history.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1A73E8]">{sub.submissionId}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {sub.verdict || 'SUBMITTED'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 font-medium">
                    Theme: {sub.themeName} · GID: {sub.gid} · {sub.region}
                  </p>
                  {sub.reelUrl && (
                    <a
                      href={sub.reelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1A73E8] hover:underline truncate block max-w-sm mt-0.5"
                    >
                      {sub.reelUrl}
                    </a>
                  )}
                </div>

                <div className="text-right shrink-0 text-slate-400 text-[11px] flex items-center gap-1 sm:block">
                  <Calendar className="w-3 h-3 inline sm:hidden" />
                  <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                  <span className="hidden sm:inline"> · </span>
                  <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
