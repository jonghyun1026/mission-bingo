import React, { useRef, useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { BingoCell } from '@/types/game';
import { Button } from '@/components/ui/button';
import { X, ImagePlus, Upload, Trash2, Plus, Edit2, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPhotoToStorage } from '@/lib/gameApi';

interface PhotoUploadModalProps {
  cell: BingoCell;
  onClose: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ cell, onClose }) => {
  const { uploadPhoto, removePhoto, deleteUserPhoto, user, syncCellCompletion } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'syncing' | 'done' | 'error'>('idle');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const isBonusMission = !!cell.mission.isBonus;

  // 미리보기 URL 메모리 해제 (컴포넌트 언마운트 또는 URL 변경 시)
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const existingPhotos = cell.photos.filter((p) => p !== 'free');
  const existingMeta = cell.photoMeta ?? [];

  const handleDeleteExistingPhoto = async (index: number) => {
    const meta = existingMeta[index];
    if (!meta) {
      removePhoto(cell.id, index);
      return;
    }
    setDeletingIndex(index);
    try {
      await deleteUserPhoto(cell.id, meta.id, meta.storagePath);
    } catch (e) {
      console.error('사진 삭제 실패:', e);
      alert('사진 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeletingIndex(null);
      setPendingDeleteIndex(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    const newUrls: string[] = [];
    Array.from(files).forEach((file) => {
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    });
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = '';
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || replaceIndex === null) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    removePhoto(cell.id, replaceIndex);
    uploadPhoto(cell.id, [url]);
    setReplaceIndex(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !user) return;
    setIsUploading(true);
    setUploadStage('uploading');
    setUploadedCount(0);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadPhotoToStorage(file, user.teamDbId, cell.dbCellId || cell.id.toString());
        uploadedUrls.push(url);
        setUploadedCount((prev) => prev + 1);
      }

      if (cell.dbCellId) {
        setUploadStage('syncing');
        await syncCellCompletion(cell.id, cell.dbCellId, uploadedUrls);
      } else {
        uploadPhoto(cell.id, uploadedUrls);
      }
      setUploadStage('done');
      setSelectedFiles([]);
      setPreviewUrls([]);
      window.setTimeout(() => onClose(), 550);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStage('error');
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`업로드에 실패했습니다.\n${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const getCollageLayout = (count: number, index: number): string => {
    if (count === 1) return "col-span-3 row-span-2";
    if (count === 2) return "col-span-3 row-span-1";
    if (count === 3) {
      if (index === 0) return "col-span-2 row-span-2";
      return "col-span-1 row-span-1";
    }
    if (count === 4) return "col-span-1 row-span-1";
    return "col-span-1 row-span-1";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isUploading || deletingIndex !== null ? undefined : onClose}
      />

      <div className={cn(
        "relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden",
        isBonusMission
          ? "bg-gradient-to-b from-[#FFF5D6] via-[#FFF8E8] to-white border-2 border-[#F6C24A]"
          : "bg-card"
      )}>
        {isBonusMission && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#FFD466]/40 blur-2xl animate-ping" />
            <div className="absolute -top-8 right-6 w-20 h-20 rounded-full bg-[#FFC04D]/35 blur-2xl animate-pulse" />
            <div className="absolute top-14 left-8 text-[#FFB000] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.8s' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute top-20 right-10 text-[#FF9A00] animate-pulse" style={{ animationDelay: '200ms' }}>
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div className="absolute top-28 left-1/2 text-[#FFB000] animate-bounce" style={{ animationDelay: '450ms', animationDuration: '2.2s' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute top-36 right-1/3 text-[#FF9A00] animate-pulse" style={{ animationDelay: '700ms' }}>
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        )}
        {/* Header */}
        <div className={cn(
          "p-4 border-b relative z-10",
          isBonusMission
            ? "border-[#F3D17A] bg-gradient-to-r from-[#FFEEB7] to-[#FFE3A0]"
            : "border-border"
        )}>
          {isBonusMission && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#FF9F1A] px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              BONUS MISSION
            </div>
          )}
          <div className="flex items-center justify-between">
          <div>
            <h2 className={cn(
              "text-body-lg font-bold",
              isBonusMission ? "text-[#7A3E00]" : "text-foreground"
            )}>
              {isBonusMission ? "보너스 미션!" : "미션 사진 업로드"}
            </h2>
            <p className={cn(
              "text-caption",
              isBonusMission ? "text-[#8A5A1F] font-bold" : "text-muted-foreground"
            )}>
              {isBonusMission ? "배정장학재단 몸으로 표현하기(단체샷)" : cell.mission.title}
            </p>
            {isBonusMission && (
              <p className="mt-1 text-[11px] font-bold text-[#B25B00]">
                성공 시 랜덤으로 1칸이 추가로 성공처리됩니다.
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[55vh] relative z-10">
          {/* 삭제 확인 인라인 배너 */}
          {pendingDeleteIndex !== null && (
            <div className="mb-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold text-destructive leading-tight">
                {cell.mission.isBonus
                  ? '보너스 사진을 삭제하면 보너스 셀과 추가 인정된 셀도 미완료로 돌아갑니다.'
                  : '이 사진을 삭제하면 미션 완료가 취소될 수 있습니다.'}
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setPendingDeleteIndex(null)}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-border text-foreground"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDeleteExistingPhoto(pendingDeleteIndex)}
                  disabled={deletingIndex !== null}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-destructive text-white disabled:opacity-60"
                >
                  {deletingIndex !== null ? '삭제 중…' : '삭제'}
                </button>
              </div>
            </div>
          )}

          {existingPhotos.length > 0 && (
            <div className="mb-4">
              <p className="text-body-sm font-bold text-foreground mb-2">
                업로드된 사진 ({existingPhotos.length}장)
              </p>
              <div className="grid grid-cols-3 gap-1.5 auto-rows-[80px]">
                {existingPhotos.map((photo, index) => (
                  <div 
                    key={`existing-${index}`} 
                    className={cn(
                      "relative overflow-hidden group rounded-lg",
                      getCollageLayout(existingPhotos.length, index)
                    )}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    {deletingIndex === index && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setReplaceIndex(index); replaceInputRef.current?.click(); }}
                        className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"
                      >
                        <Edit2 className="w-4 h-4 text-accent-foreground" />
                      </button>
                      <button
                        onClick={() => setPendingDeleteIndex(index)}
                        disabled={deletingIndex !== null}
                        className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-destructive-foreground" />
                      </button>
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 sm:hidden">
                      <button
                        onClick={() => { setReplaceIndex(index); replaceInputRef.current?.click(); }}
                        className="w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                      >
                        <Edit2 className="w-3 h-3 text-accent-foreground" />
                      </button>
                      <button
                        onClick={() => setPendingDeleteIndex(index)}
                        disabled={deletingIndex !== null}
                        className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-body-sm font-bold text-foreground mb-2">
                새 사진 ({previewUrls.length}장)
              </p>
              <div className="grid grid-cols-3 gap-1.5 auto-rows-[80px]">
                {previewUrls.map((url, index) => (
                  <div key={`preview-${index}`} className={cn("relative overflow-hidden rounded-lg border border-primary/20", getCollageLayout(previewUrls.length, index))}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePreview(index)} className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          <input ref={replaceInputRef} type="file" accept="image/*" onChange={handleReplaceFile} className="hidden" />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
              isBonusMission
                ? "border-[#F2C356] hover:border-[#E5A400] hover:bg-[#FFF4D6]"
                : "border-border hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isBonusMission ? "bg-[#FFD572]" : "bg-primary/10"
            )}>
              {previewUrls.length > 0 || existingPhotos.length > 0 ? (
                isBonusMission ? <Star className="w-6 h-6 text-[#7A3E00]" /> : <Plus className="w-6 h-6 text-primary" />
              ) : (
                <ImagePlus className={cn("w-6 h-6", isBonusMission ? "text-[#7A3E00]" : "text-primary")} />
              )}
            </div>
            <div className="text-center">
              <p className="text-body font-bold text-foreground">
                {previewUrls.length > 0 || existingPhotos.length > 0 ? '사진 더 추가하기' : '갤러리에서 사진 선택'}
              </p>
              <p className="text-caption text-muted-foreground">여러 장의 사진을 선택할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t relative z-10",
          isBonusMission ? "border-[#F3D17A] bg-[#FFF8E7]" : "border-border bg-card"
        )}>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full font-bold"
              onClick={onClose}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button
              className={cn(
                "flex-1 text-primary-foreground font-bold rounded-full",
                isBonusMission
                  ? "bg-gradient-to-r from-[#FFB300] to-[#FF8A00] hover:from-[#F5A300] hover:to-[#F07F00]"
                  : "bg-primary hover:bg-primary/90"
              )}
              disabled={previewUrls.length === 0 || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <span className="flex items-center gap-2" aria-live="polite">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {uploadStage === 'uploading' && `업로드 중... (${uploadedCount}/${selectedFiles.length})`}
                  {uploadStage === 'syncing' && '서버 반영 중...'}
                </span>
              ) : uploadStage === 'done' ? (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  업로드 완료!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  업로드 ({previewUrls.length}장)
                </span>
              )}
            </Button>
          </div>
          {uploadStage === 'done' && (
            <p className="mt-2 text-center text-[12px] font-bold text-green-700">미션 성공! 빙고 칸을 반영하는 중입니다.</p>
          )}
          {uploadStage === 'error' && (
            <p className="mt-2 text-center text-[12px] font-bold text-destructive">업로드가 완료되지 않았습니다. 다시 시도해주세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};
