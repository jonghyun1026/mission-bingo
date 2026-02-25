import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { BingoCell } from './BingoCell';
import { PhotoUploadModal } from './PhotoUploadModal';
import { CelebrationModal } from './CelebrationModal';
import { AllCompleteCelebration } from './AllCompleteCelebration';
import { TeamMembersModal } from './TeamMembersModal';
import { OtherTeamsModal } from './OtherTeamsModal';
import { BingoCell as BingoCellType, CompletedLine } from '@/types/game';
import { LogOut, RefreshCw, Sparkles, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BingoBoard: React.FC = () => {
  const {
    user,
    bingoBoard,
    completedLines,
    totalCompletedLines,
    logout,
    checkBingoLines,
    fetchTeamMembers,
    teamMembers,
    teamSnapshots,
    teamGallery,
    myRank,
    fetchTeamSnapshot,
    fetchTeamGallery,
    refreshBoard,
  } = useGame();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<BingoCellType | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showOtherTeamsModal, setShowOtherTeamsModal] = useState(false);
  const [justCompletedCellIds, setJustCompletedCellIds] = useState<number[]>([]);
  const prevCompletedCellIdsRef = useRef<Set<number>>(new Set());
  const justCompletedTimersRef = useRef<Map<number, number>>(new Map());
  const [celebrationQueue, setCelebrationQueue] = useState<Array<{ type: 'line' | 'complete'; lineCount: number }>>([]);
  // 이미 축하한 총 줄 수를 기억 (새로 달성한 줄에만 반응)
  const celebratedLineCountRef = useRef<number>(0);
  // 최초 보드 로딩 여부 (로그인 직후 기존 달성 줄은 축하 스킵)
  const isInitialLoadRef = useRef<boolean>(true);
  const [showAllComplete, setShowAllComplete] = useState(false);
  const allCompletedRef = useRef<boolean>(false);
  const [celebrationData, setCelebrationData] = useState<{
    show: boolean; type: 'line' | 'complete'; lineCount: number;
  }>({ show: false, type: 'line', lineCount: 0 });

  const completedCount = bingoBoard.filter((cell) => cell.isCompleted).length;
  // 2줄마다 마패 1개
  const mapaeCount = Math.floor(totalCompletedLines / 2);

  // 25칸 전체 완성 감지
  useEffect(() => {
    if (completedCount === 25 && bingoBoard.length === 25 && !allCompletedRef.current && !isInitialLoadRef.current) {
      allCompletedRef.current = true;
      setShowAllComplete(true);
    }
  }, [completedCount, bingoBoard.length]);

  // 언마운트 시 진행 중인 "미션 성공" 타이머 전체 정리
  useEffect(() => {
    return () => {
      justCompletedTimersRef.current.forEach((id) => clearTimeout(id));
      justCompletedTimersRef.current.clear();
    };
  }, []);

  useEffect(() => { if (showTeamModal) fetchTeamMembers(); }, [showTeamModal, fetchTeamMembers]);
  useEffect(() => {
    if (!showOtherTeamsModal) return;
    fetchTeamSnapshot().catch(console.error);
    fetchTeamGallery().catch(console.error);
  }, [showOtherTeamsModal, fetchTeamSnapshot, fetchTeamGallery]);

  const formattedTeamMembers = useMemo(() => teamMembers.map(m => ({
    id: m.id, name: m.name, school: m.school, major: m.major, cohort: m.cohort, isOnline: true,
  })), [teamMembers]);

  useEffect(() => {
    const currentCompleted = new Set(
      bingoBoard.filter((cell) => cell.isCompleted).map((cell) => cell.id)
    );

    // 초기 로드: ref를 현재 상태로만 채우고 애니메이션 없이 종료
    if (prevCompletedCellIdsRef.current.size === 0 && currentCompleted.size > 0 && isInitialLoadRef.current) {
      prevCompletedCellIdsRef.current = currentCompleted;
      return;
    }

    const newlyCompleted = [...currentCompleted].filter(
      (id) => !prevCompletedCellIdsRef.current.has(id)
    );
    prevCompletedCellIdsRef.current = currentCompleted;

    if (newlyCompleted.length === 0) return;

    setJustCompletedCellIds((prev) => {
      const merged = new Set([...prev, ...newlyCompleted]);
      return [...merged];
    });

    // 셀마다 개별 타이머를 ref로 관리 — effect cleanup에 의존하지 않아
    // 보드가 중간에 바뀌어도 타이머가 취소되지 않음
    for (const id of newlyCompleted) {
      if (justCompletedTimersRef.current.has(id)) {
        clearTimeout(justCompletedTimersRef.current.get(id));
      }
      const timerId = window.setTimeout(() => {
        setJustCompletedCellIds((prev) => prev.filter((cid) => cid !== id));
        justCompletedTimersRef.current.delete(id);
      }, 1200);
      justCompletedTimersRef.current.set(id, timerId);
    }
  }, [bingoBoard]);

  useEffect(() => {
    if (bingoBoard.length === 0) return;
    const newLines = checkBingoLines();
    const totalLines = completedLines.length + newLines.length;

    // 최초 보드 로드: 기존 달성 줄은 ref만 맞추고 축하는 스킵
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      celebratedLineCountRef.current = totalLines;
      return;
    }

    // 줄 수가 줄어든 경우 ref도 낮춰야 재달성 시 축하 모달이 다시 뜸
    if (totalLines < celebratedLineCountRef.current) {
      celebratedLineCountRef.current = totalLines;
      return;
    }

    if (newLines.length === 0) return;

    const prevCelebrated = celebratedLineCountRef.current;
    if (totalLines <= prevCelebrated) return;

    const queued: Array<{ type: 'line' | 'complete'; lineCount: number }> = [];

    // 새로 달성한 줄마다 하나씩 축하 모달 예약
    for (let n = prevCelebrated + 1; n <= totalLines; n++) {
      // 짝수 줄 (2, 4, 6...) → 마패 달성 스타일, 홀수 줄 → 일반 빙고 스타일
      const type: 'line' | 'complete' = n % 2 === 0 ? 'complete' : 'line';
      queued.push({ type, lineCount: n });
    }

    celebratedLineCountRef.current = totalLines;
    setCelebrationQueue((prev) => [...prev, ...queued]);
  }, [
    bingoBoard,
    checkBingoLines,
    completedLines.length,
  ]);

  useEffect(() => {
    if (celebrationData.show || celebrationQueue.length === 0) return;
    const [next, ...rest] = celebrationQueue;
    setCelebrationData({ show: true, type: next.type, lineCount: next.lineCount });
    setCelebrationQueue(rest);
  }, [celebrationQueue, celebrationData.show]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshBoard();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCellClick = (cell: BingoCellType) => {
    setSelectedCell(cell);
    setShowUploadModal(true);
  };

  const cellsInCompletedLines = useMemo(() => {
    const cells = new Set<number>();
    completedLines.forEach((line: CompletedLine) => {
      if (line.type === 'row') for (let i = 0; i < 5; i++) cells.add(line.index * 5 + i + 1);
      else if (line.type === 'column') for (let i = 0; i < 5; i++) cells.add(i * 5 + line.index + 1);
      else if (line.type === 'diagonal') {
        if (line.index === 0) [1, 7, 13, 19, 25].forEach(id => cells.add(id));
        else [5, 9, 13, 17, 21].forEach(id => cells.add(id));
      }
    });
    return cells;
  }, [completedLines]);

  return (
    <div className="min-h-screen py-6 px-3 sm:px-4 flex flex-col items-center">
      <div className="w-full max-w-lg">

        {/* 상단 타이틀 */}
        <div className="text-center mb-4 animate-fade-up">
          <h1 className="text-[34px] font-black text-[#3D1E0A] tracking-tight">
            미션 빙고 게임
          </h1>
          <p className="text-[13px] font-bold text-[#8A3A1A] mt-1">
            빙고 2줄 완성 시 적토마 마패 획득!
          </p>
        </div>

        {/* 메인 보드 카드 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border-[3px] border-[#F0C8B0] shadow-[0_18px_40px_-18px_rgba(180,80,40,0.35)] p-3 sm:p-4 relative overflow-hidden">

          {/* 상단 정보 카드 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setShowTeamModal(true)}
              className="info-card min-h-[76px] bg-[#FFF5F0] border-2 border-[#F0C8B0] hover:bg-[#FFE8DC] active:scale-[0.98] flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-bold text-[#A05030] mb-0.5 opacity-80">조</span>
              <span className="text-xl font-black text-[#3D1E0A] leading-none tracking-tight">{user?.teamName?.replace(/[^0-9]/g, '')}조</span>
            </button>

            <div className="info-card min-h-[76px] bg-[#FFF5F0] border-2 border-[#F0C8B0] flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[#A05030] mb-0.5 opacity-80">참가자</span>
              <span className="text-xl font-black text-[#3D1E0A] leading-none tracking-tight truncate w-full text-center">{user?.name}</span>
            </div>

            <div className="info-card min-h-[76px] bg-gradient-to-br from-[#F5A623] to-[#E8462A] border-2 border-[#C03010] flex flex-col items-center justify-center relative shadow-md">
              <span className="text-[10px] font-bold text-white/80 mb-0.5">마패</span>
              <span className="text-xl font-black text-white leading-none tracking-tight tabular-nums">{mapaeCount}개</span>
            </div>
          </div>

          {/* 안내 영역 */}
          <div className="rounded-xl border-2 border-[#F0C8B0] bg-[#FFF8F5] px-3 py-2 text-center mb-2.5">
            <p className="text-[11px] font-bold text-[#A05030]">
              📸 미션 칸을 클릭하여 인증 사진을 업로드하세요
            </p>
          </div>

          {/* 진행률 칩 */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F5A623] to-[#E8462A] px-4 py-1.5 text-white shadow-[0_6px_16px_-6px_rgba(232,70,42,0.8)]">
              <span className="text-[11px] font-bold opacity-90">🎯 완료:</span>
              <span className="text-[13px] font-black tabular-nums">{completedCount}/25</span>
              <span className="text-white/60">|</span>
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span className="text-[11px] font-bold opacity-90">빙고:</span>
              <span className="text-[13px] font-black tabular-nums">{totalCompletedLines}줄</span>
              <span className="text-white/60">|</span>
              <span className="text-[11px] font-bold opacity-90">순위:</span>
              <span className="text-[13px] font-black tabular-nums">{myRank ? `${myRank}위` : '-'}</span>
            </div>
          </div>

          <div className="flex justify-center mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOtherTeamsModal(true)}
              className="rounded-full border-[#F0C8B0] bg-[#FFF5F0] text-[#A04020] hover:bg-[#FFE8DC] font-bold"
            >
              <Users2 className="w-4 h-4 mr-1.5" />
              다른 조 현황/갤러리
            </Button>
          </div>

          {/* 빙고 그리드 */}
          <div className="rounded-2xl border-[3px] border-[#E8462A] bg-[#FFF0EA]/50 p-1.5 mb-2 shadow-inner">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {bingoBoard.map((cell) => (
                <BingoCell
                  key={cell.id}
                  cell={cell}
                  onClick={() => handleCellClick(cell)}
                  isInCompletedLine={cellsInCompletedLines.has(cell.id)}
                  isJustCompleted={justCompletedCellIds.includes(cell.id)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* 하단 액션 */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/70 hover:bg-white border-[#F0C8B0] text-[#A04020] hover:text-destructive rounded-full px-5 font-bold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout} 
            className="bg-white/70 hover:bg-white border-[#F0C8B0] text-[#A04020] hover:text-destructive rounded-full px-5 font-bold shadow-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            로그아웃
          </Button>
        </div>

      </div>

      {/* Modals */}
      {showUploadModal && selectedCell && (
        <PhotoUploadModal cell={selectedCell} onClose={() => { setShowUploadModal(false); setSelectedCell(null); }} />
      )}
      {celebrationData.show && (
        <CelebrationModal
          type={celebrationData.type}
          lineCount={celebrationData.lineCount}
          rank={myRank}
          onClose={() => setCelebrationData((prev) => ({ ...prev, show: false }))}
        />
      )}
      {showAllComplete && (
        <AllCompleteCelebration onClose={() => setShowAllComplete(false)} />
      )}
      {showTeamModal && (
        <TeamMembersModal teamName={user?.teamName || ''} members={formattedTeamMembers} onClose={() => setShowTeamModal(false)} />
      )}
      {showOtherTeamsModal && (
        <OtherTeamsModal
          currentTeamId={user?.teamDbId}
          snapshots={teamSnapshots}
          gallery={teamGallery}
          myRank={myRank}
          onFetchSnapshots={fetchTeamSnapshot}
          onFetchGallery={fetchTeamGallery}
          onClose={() => setShowOtherTeamsModal(false)}
        />
      )}
    </div>
  );
};
