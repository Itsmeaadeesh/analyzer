import React, { useState } from 'react';
import { Link2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface ReelLinkInputProps {
  reelUrl: string;
  onUrlChange: (url: string) => void;
  onCheckLink?: (url: string) => void;
}

export const ReelLinkInput: React.FC<ReelLinkInputProps> = ({
  reelUrl,
  onUrlChange,
  onCheckLink,
}) => {
  const [linkStatus, setLinkStatus] = useState<{
    type: 'valid' | 'invalid' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCheck = () => {
    if (!reelUrl.trim()) {
      setLinkStatus({
        type: 'invalid',
        message: 'Please paste an Instagram Reel link first.'
      });
      return;
    }

    try {
      const url = new URL(reelUrl);
      if (url.hostname.includes('instagram.com')) {
        setLinkStatus({
          type: 'valid',
          message: 'Public Instagram link detected. If captions are restricted by login, make sure your caption is also pasted below.'
        });
      } else {
        setLinkStatus({
          type: 'info',
          message: 'Link detected. Recommended format: https://www.instagram.com/reel/...'
        });
      }
    } catch {
      setLinkStatus({
        type: 'invalid',
        message: 'Invalid URL format. Please enter a valid URL (e.g., https://www.instagram.com/reel/Cxxxx).'
      });
    }

    if (onCheckLink) {
      onCheckLink(reelUrl);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
        <Link2 className="w-4 h-4 text-[#1A73E8]" />
        Paste your Reel link
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="url"
            value={reelUrl}
            onChange={(e) => {
              onUrlChange(e.target.value);
              if (linkStatus.type) setLinkStatus({ type: null, message: '' });
            }}
            placeholder="https://www.instagram.com/reel/..."
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleCheck}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Check link</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Works for public reels. If the platform hides captions behind login, paste caption below manually.
      </p>

      {linkStatus.type && (
        <div className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
          linkStatus.type === 'valid'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : linkStatus.type === 'invalid'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {linkStatus.type === 'valid' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          )}
          <span>{linkStatus.message}</span>
        </div>
      )}
    </div>
  );
};
