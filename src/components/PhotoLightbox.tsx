import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Loader2 } from 'lucide-react';

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
  const [downloading, setDownloading] = useState(false);
  const handleClose = useCallback(() => onClose(), [onClose]);

  // ESC 키 닫기 + iOS 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);

    // iOS Safari: body 고정으로 스크롤 방지
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [handleClose]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // fetch → blob → 로컬 다운로드
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const filename = `${(caption || 'photo').replace(/[·\s]+/g, '_')}.${ext}`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch {
      // iOS Safari 등 fetch 실패 시 새 탭에서 열기
      window.open(url, '_blank', 'noopener');
    } finally {
      setDownloading(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ WebkitOverflowScrolling: 'touch' }}
      onClick={handleClose}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

      {/* 상단 바 */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        <div className="flex-1 min-w-0 mr-3">
          {caption && (
            <p className="text-white font-bold text-sm leading-tight truncate">{caption}</p>
          )}
          {subCaption && (
            <p className="text-white/55 text-xs mt-0.5 truncate">{subCaption}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showDownload && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 active:bg-white/30 text-white text-xs font-bold border border-white/20 transition-all disabled:opacity-60"
            >
              {downloading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              {downloading ? '저장 중…' : '다운로드'}
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 이미지 영역 — 탭하면 닫힘, 이미지 자체는 전파 막음 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8 overflow-hidden">
        <img
          src={url}
          alt={alt}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
          style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
