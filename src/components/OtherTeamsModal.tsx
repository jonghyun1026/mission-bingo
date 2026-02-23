import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TeamGalleryPhoto, TeamSnapshot } from '@/lib/gameApi';
import { X, Images, Users, Medal } from 'lucide-react';
import mapaeImage from '@/assets/mapae-red.png';

interface OtherTeamsModalProps {
  currentTeamId?: string;
  snapshots: TeamSnapshot[];
  gallery: TeamGalleryPhoto[];
  myRank: number | null;
  onFetchSnapshots: () => Promise<void>;
  onFetchGallery: (teamId?: string) => Promise<void>;
  onClose: () => void;
}

const RANK_STYLE: Record<number, { emoji: string; bg: string; text: string; border: string }> = {
  1: { emoji: '🥇', bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white', border: 'border-yellow-300' },
  2: { emoji: '🥈', bg: 'bg-gradient-to-r from-slate-300 to-slate-400', text: 'text-white', border: 'border-slate-200' },
  3: { emoji: '🥉', bg: 'bg-gradient-to-r from-orange-400 to-amber-600', text: 'text-white', border: 'border-orange-300' },
};

export const OtherTeamsModal: React.FC<OtherTeamsModalProps> = ({
  currentTeamId,
  snapshots,
  gallery,
  myRank,
  onFetchSnapshots,
  onFetchGallery,
  onClose,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'snapshot' | 'gallery'>('snapshot');

  useEffect(() => {
    onFetchSnapshots().catch(console.error);
    onFetchGallery().catch(console.error);
  }, [onFetchSnapshots, onFetchGallery]);

  const selectedTeamName = useMemo(() => {
    if (selectedTeamId === 'all') return '전체 조';
    return snapshots.find((t) => t.id === selectedTeamId)?.name || '선택 조';
  }, [selectedTeamId, snapshots]);

  // 마패 순위 1~3위만
  const mapaeTop3 = useMemo(
    () =>
      [...snapshots]
        .filter((t) => t.rank !== null && t.rank <= 3)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999)),
    [snapshots]
  );

  // 조별 진행 현황: 팀 번호 순 (순위 없음)
  const teamsByNumber = useMemo(
    () =>
      [...snapshots].sort((a, b) => {
        const na = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
        const nb = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
        return na - nb;
      }),
    [snapshots]
  );

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    if (teamId === 'all') onFetchGallery().catch(console.error);
    else onFetchGallery(teamId).catch(console.error);
  };

  const myTeam = snapshots.find((t) => t.id === currentTeamId);
  const myMapaeRank = myTeam?.rank ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">다른 조 현황</h2>
              <p className="text-xs text-muted-foreground">마패 순위 · 진행률 · 사진 갤러리</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[72vh] space-y-4">

          {/* 탭 */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-1">
            {['snapshot', 'gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'snapshot' | 'gallery')}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                  activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'snapshot' ? '조별 진행 현황' : '사진 갤러리'}
              </button>
            ))}
          </div>

          {activeTab === 'snapshot' && (
            <>
              {/* 내 순위 카드 */}
              <div className="rounded-xl border border-[#E7D3AE] bg-[#FFF8EA] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-[#C5792C]" />
                  <span className="text-sm font-bold text-[#6B472A]">우리 조 마패 순위</span>
                </div>
                <div className="flex items-center gap-2">
                  {myMapaeRank && myMapaeRank <= 3 ? (
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${(RANK_STYLE[myMapaeRank]).bg} text-white shadow-sm`}>
                      {RANK_STYLE[myMapaeRank].emoji} {myMapaeRank}등
                    </span>
                  ) : myMapaeRank ? (
                    <span className="text-sm font-black text-[#5A3E28]">마패 획득 ({myMapaeRank}등)</span>
                  ) : (
                    <span className="text-sm font-black text-[#5A3E28]">마패 미획득</span>
                  )}
                </div>
              </div>

              {/* 마패 획득 순위 — 1~3위만 */}
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-3.5">
                <div className="flex items-center gap-2 mb-3">
                  <img src={mapaeImage} alt="" className="w-4 h-4 object-contain" />
                  <p className="text-sm font-black text-amber-800">2줄 달성 랭킹 (게임 최종 순위)</p>
                </div>
                {mapaeTop3.length === 0 ? (
                  <p className="text-xs text-amber-700/70 text-center py-2">아직 2줄을 달성한 조가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {mapaeTop3.map((team) => {
                      const rs = RANK_STYLE[team.rank!];
                      const isMine = team.id === currentTeamId;
                      const time = team.secondLineCompletedAt
                        ? new Date(team.secondLineCompletedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '';
                      return (
                        <div key={team.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                            isMine ? 'bg-primary/5 border-primary/20' : 'bg-white/60 border-amber-100'
                          }`}>
                          <span className={`w-14 text-center text-xs font-black px-2 py-1 rounded-full ${rs.bg} ${rs.text} shrink-0 shadow-sm`}>
                            {rs.emoji} {team.rank}등
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground">
                              {team.name}
                              {isMine && <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">내 조</span>}
                            </p>
                            {time && <p className="text-[10px] text-muted-foreground mt-0.5">달성 {time}</p>}
                          </div>
                          <img src={mapaeImage} alt="" className="w-5 h-5 object-contain shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 조별 진행 현황 — 순위 없이 팀 번호 순 */}
              <div className="space-y-1.5">
                <p className="text-sm font-black text-foreground">조별 진행 현황</p>
                {teamsByNumber.map((team) => {
                  const percent = team.totalMissions > 0
                    ? Math.round((team.completedMissions / team.totalMissions) * 100) : 0;
                  const isMine = currentTeamId === team.id;
                  const hasMapae = team.rank !== null;

                  return (
                    <button
                      key={team.id}
                      onClick={() => { handleTeamSelect(team.id); setActiveTab('gallery'); }}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${
                        isMine ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="text-sm font-bold text-foreground truncate">{team.name}</span>
                          {isMine && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">내 조</span>
                          )}
                          {hasMapae && (
                            <img src={mapaeImage} alt="마패" className="w-3.5 h-3.5 object-contain shrink-0" title="마패 획득" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground font-medium tabular-nums">
                          <span>{team.completedMissions}/{team.totalMissions}칸</span>
                          <span>{team.completedLines}줄</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'gallery' && (
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Images className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold text-foreground">{selectedTeamName} 사진 갤러리</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleTeamSelect('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    selectedTeamId === 'all'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  전체
                </button>
                {snapshots.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedTeamId === team.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>

              {gallery.length === 0 ? (
                <p className="text-xs text-muted-foreground">업로드된 사진이 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gallery.map((photo) => (
                    <div key={photo.id} className="rounded-lg overflow-hidden border border-border bg-white">
                      <img src={photo.url} alt={photo.missionTitle} className="w-full h-24 object-cover" />
                      <div className="p-1.5">
                        <p className="text-[11px] font-bold text-foreground truncate">{photo.teamName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{photo.missionTitle}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{photo.uploaderName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
