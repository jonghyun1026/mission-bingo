import React, { useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';

interface PhotoLightboxProps {
  url: string;
  alt?: string;
  caption?: string;
  subCaption?: string;
  showDownload?: boolean;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  url,
  alt = '',
  caption,
  subCaption,
  showDownload = false,
  onClose,
}) => {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const filename = `${caption || 'photo'}_${Date.now()}.${ext}`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // 직접 다운로드 fallback
      const a = document.createElement('a');
      a.href = url;
      a.download = `${caption || 'photo'}.jpg`;
      a.target = '_blank';
      a.click();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* 컨텐츠 */}
      <div className="relative flex flex-col items-center max-w-3xl w-full max-h-[90vh]" style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* 상단 버튼 */}
        <div className="flex items-center justify-between w-full mb-2 px-1">
          <div className="flex-1">
            {caption && (
              <p className="text-white font-bold text-sm truncate">{caption}</p>
            )}
            {subCaption && (
              <p className="text-white/60 text-xs truncate">{subCaption}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {showDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* 이미지 */}
        <div className="w-full flex items-center justify-center overflow-hidden rounded-2xl">
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};
