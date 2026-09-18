import React, { useState } from 'react';
import { Link2, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LinkFetchInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onCaptionFetched?: (caption: string) => void;
  platformName: 'Instagram Reel' | 'LinkedIn Post';
  placeholder?: string;
}

export const LinkFetchInput: React.FC<LinkFetchInputProps> = ({
  url,
  onUrlChange,
  onCaptionFetched,
  platformName,
  placeholder
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: `Please paste a valid ${platformName} link first.`
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: '' });

    try {
      const res = await fetch('/api/fetch-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed })
      });

      const data = await res.json();

      if (data.success && data.caption) {
        setFeedback({
          type: 'success',
          message: `Successfully fetched post text! Auto-filled below.`
        });
        if (onCaptionFetched) {
          onCaptionFetched(data.caption);
        }
      } else if (data.partial || data.message) {
        setFeedback({
          type: 'warning',
          message: data.message || `Direct preview is login-restricted by ${platformName.split(' ')[0]}. Please paste your caption below manually.`
        });
      } else {
        setFeedback({
          type: 'warning',
          message: `Couldn't fetch caption automatically. Please paste your text below manually.`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'warning',
        message: `Connection issue: ${err.message || 'Network error'}. You can still paste your caption manually below.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
        <Link2 className="w-4 h-4 text-[#1A73E8]" />
        <span>Paste your {platformName} link</span>
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onUrlChange(e.target.value);
              if (feedback.type) setFeedback({ type: null, message: '' });
            }}
            placeholder={placeholder || `https://${platformName.toLowerCase().includes('instagram') ? 'www.instagram.com/reel/...' : 'www.linkedin.com/posts/...'}`}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Check link</span>
            </>
          )}
        </button>
      </div>

      {feedback.type && (
        <div className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : feedback.type === 'warning'
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
          {feedback.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
          {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-500 mt-2">
        We'll attempt to auto-extract your public caption. If private or login-walled, simply paste it in the box below.
      </p>
    </div>
  );
};
