import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TeamGalleryPhoto, TeamSnapshot } from '@/lib/gameApi';
import { X, Trophy, Images, Users, Medal } from 'lucide-react';

interface OtherTeamsModalProps {
  currentTeamId?: string;
  snapshots: TeamSnapshot[];
  gallery: TeamGalleryPhoto[];
  myRank: number | null;
  onFetchSnapshots: () => Promise<void>;
  onFetchGallery: (teamId?: string) => Promise<void>;
  onClose: () => void;
}

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

  const successTeams = useMemo(
    () =>
      [...snapshots]
        .filter((t) => t.rank)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999)),
    [snapshots]
  );

  const progressLeaderboard = useMemo(
    () =>
      [...snapshots].sort((a, b) => {
        if (b.completedMissions !== a.completedMissions) return b.completedMissions - a.completedMissions;
        if (b.completedLines !== a.completedLines) return b.completedLines - a.completedLines;
        return a.name.localeCompare(b.name, 'ko');
      }),
    [snapshots]
  );

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    if (teamId === 'all') onFetchGallery().catch(console.error);
    else onFetchGallery(teamId).catch(console.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-body-lg font-black text-foreground">다른 조 현황</h2>
              <p className="text-caption text-muted-foreground">랭킹 · 진행률 · 사진 갤러리</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[72vh] space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-1">
            <button
              onClick={() => setActiveTab('snapshot')}
              className={`rounded-lg px-3 py-2 text-body-sm font-bold transition-colors ${
                activeTab === 'snapshot'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              조별 진행 현황
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`rounded-lg px-3 py-2 text-body-sm font-bold transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              사진 갤러리
            </button>
          </div>

          {activeTab === 'snapshot' && (
            <>
              <div className="rounded-xl border border-[#E7D3AE] bg-[#FFF8EA] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-[#C5792C]" />
                  <span className="text-body-sm font-bold text-[#6B472A]">내 순위</span>
                </div>
                <span className="text-body font-black text-[#5A3E28]">
                  {myRank ? `${myRank}위` : '미확정'}
                </span>
              </div>

              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <p className="text-body-sm font-bold text-foreground">2줄 달성 랭킹</p>
                </div>
                {successTeams.length === 0 ? (
                  <p className="text-caption text-muted-foreground">아직 2줄 달성 조가 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {successTeams.map((team) => (
                      <div key={team.id} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-caption font-bold">
                        {team.rank}위 {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-body-sm font-bold text-foreground">조별 진행 리더보드</p>
                <div className="grid grid-cols-[44px_1fr_78px_56px] px-2 py-1.5 text-[11px] font-bold text-muted-foreground">
                  <span>순위</span>
                  <span>조 이름</span>
                  <span className="text-right">성공 칸</span>
                  <span className="text-right">빙고</span>
                </div>
                {progressLeaderboard.map((team, index) => {
                  const percent = team.totalMissions > 0 ? Math.round((team.completedMissions / team.totalMissions) * 100) : 0;
                  const isMine = currentTeamId === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => {
                        handleTeamSelect(team.id);
                        setActiveTab('gallery');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-colors ${
                        selectedTeamId === team.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/20'
                      }`}
                    >
                      <div className="grid grid-cols-[44px_1fr_78px_56px] items-center gap-1">
                        <div className="text-body-sm font-black text-foreground">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-body font-bold text-foreground truncate">{team.name}</span>
                          {isMine && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">내 조</span>}
                          {team.rank && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{team.rank}위</span>}
                        </div>
                        <span className="text-right text-body-sm font-black text-foreground tabular-nums">
                          {team.completedMissions}칸
                        </span>
                        <span className="text-right text-caption font-bold text-muted-foreground tabular-nums">
                          {team.completedLines}줄
                        </span>
                      </div>
                      <p className="text-caption text-muted-foreground mt-1 pl-[44px]">
                        진행률 {percent}% · {team.completedMissions}/{team.totalMissions}칸 완료
                      </p>
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
                <p className="text-body-sm font-bold text-foreground">{selectedTeamName} 사진 갤러리</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleTeamSelect('all')}
                  className={`px-2.5 py-1 rounded-full text-caption font-bold border ${
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
                    className={`px-2.5 py-1 rounded-full text-caption font-bold border ${
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
                <p className="text-caption text-muted-foreground">업로드된 사진이 없습니다.</p>
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
