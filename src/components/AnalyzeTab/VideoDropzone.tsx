import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Film, X, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

interface VideoDropzoneProps {
  videoFile: File | null;
  onFileSelect: (file: File | null) => void;
}

const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  videoFile,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    const isVideo = file.type.startsWith('video/') || 
      file.name.toLowerCase().endsWith('.mp4') || 
      file.name.toLowerCase().endsWith('.mov');

    if (!isVideo) {
      setErrorMessage('Invalid file format. Please upload an MP4 or MOV video file.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Film className="w-4 h-4 text-[#EA4335]" />
          Upload your Reel video
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          MP4 or MOV · Up to 200MB
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mp4,.mov"
        onChange={handleInputChange}
        className="hidden"
      />

      {!videoFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#1A73E8] bg-blue-50/70 scale-[0.99]'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1A73E8] flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-700 mb-1">
            <span className="text-[#1A73E8] hover:underline">Click to browse</span> or drag and drop your reel video
          </p>
          <p className="text-xs text-slate-400">
            Supports MP4, MOV (max 200MB) for audio & visual compliance checking
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {videoPreviewUrl && (
                <div className="w-20 h-20 bg-black rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                  <video
                    src={videoPreviewUrl}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <Play className="w-5 h-5 text-white/90 drop-shadow" />
                  </div>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                  <p className="text-sm font-bold text-slate-800 truncate" title={videoFile.name}>
                    {videoFile.name}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB · {videoFile.type || 'Video'}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  Ready for AI audio/visual compliance verification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Change video
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Remove video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
