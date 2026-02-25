import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users, Crown, ImagePlus, ChevronDown, ChevronUp,
  ArrowLeft, LogOut, Trash2, RefreshCw, X, AlertTriangle, UserX,
  Shield, Trophy, Camera, ZoomIn,
} from 'lucide-react';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import {
  getAdminTeams, getAdminPhotos, deletePhoto, deleteMember,
  AdminTeam, AdminPhoto,
} from '@/lib/gameApi';
import mapaeImage from '@/assets/mapae-red.png';

/* ───────────────────────── 사진 삭제 확인 모달 ───────────────────────── */
const DeletePhotoModal: React.FC<{
  photo: AdminPhoto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ photo, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm glass-card-premium rounded-3xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">사진 삭제</h3>
            <p className="text-xs text-muted-foreground">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden mb-4 border border-white/50">
          <img src={photo.url} alt="" className="w-full h-36 object-cover" />
          <div className="p-3 bg-muted/30">
            <p className="text-sm font-bold text-foreground">{photo.teamName}</p>
            <p className="text-xs text-muted-foreground">{photo.missionTitle} · {photo.uploaderName}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          사진을 삭제하면 해당 칸의 완료 상태가 취소되고, 빙고 줄 수와 랭킹이 즉시 재계산됩니다.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl font-bold border-border/60" onClick={onCancel} disabled={isDeleting}>
            취소
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold"
            onClick={onConfirm} disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                삭제 중...
              </span>
            ) : (
              <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />삭제 확인</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

/* ───────────────────────── 참가자 삭제 확인 모달 ───────────────────────── */
const DeleteMemberModal: React.FC<{
  member: { id: string; name: string; school: string; major: string; cohort: string };
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ member, teamName, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm glass-card-premium rounded-3xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <UserX className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">참가자 삭제</h3>
            <p className="text-xs text-muted-foreground">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <div className="rounded-2xl p-3.5 mb-4 bg-muted/30 border border-white/40">
          <p className="text-sm font-bold text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{teamName} · {member.school} · {member.major}</p>
          <p className="text-xs text-muted-foreground">{member.cohort}</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          참가자를 삭제해도 업로드된 사진과 빙고 기록은 유지됩니다.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl font-bold border-border/60" onClick={onCancel} disabled={isDeleting}>
            취소
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold"
            onClick={onConfirm} disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                삭제 중...
              </span>
            ) : (
              <span className="flex items-center gap-1.5"><UserX className="w-3.5 h-3.5" />삭제 확인</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

/* ───────────────────────── 사진 갤러리 탭 ───────────────────────── */
const PhotoReviewPanel: React.FC<{
  photos: AdminPhoto[];
  isLoading: boolean;
  onDelete: (photo: AdminPhoto) => void;
  filterTeamId: string;
  teams: AdminTeam[];
  onFilterChange: (teamId: string) => void;
}> = ({ photos, isLoading, onDelete, filterTeamId, teams, onFilterChange }) => {
  const [lightboxPhoto, setLightboxPhoto] = useState<AdminPhoto | null>(null);
  const filtered = filterTeamId === 'all' ? photos : photos.filter(p => p.teamId === filterTeamId);

  return (
    <div>
      {/* 팀 필터 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
            filterTeamId === 'all'
              ? 'border-primary bg-primary/10 text-primary shadow-sm'
              : 'border-white/50 bg-white/40 text-muted-foreground hover:text-foreground hover:bg-white/60'
          }`}
        >
          전체 ({photos.length})
        </button>
        {teams.map(team => {
          const count = photos.filter(p => p.teamId === team.id).length;
          return (
            <button
              key={team.id}
              onClick={() => onFilterChange(team.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
                filterTeamId === team.id
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-white/50 bg-white/40 text-muted-foreground hover:text-foreground hover:bg-white/60'
              }`}
            >
              {team.name} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">사진 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-3xl bg-muted/40 flex items-center justify-center">
            <Camera className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">업로드된 사진이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map(photo => (
              <div key={photo.id} className="rounded-2xl overflow-hidden border border-white/50 bg-white/40 backdrop-blur-sm relative group shadow-sm">
                <div className="relative cursor-pointer" onClick={() => setLightboxPhoto(photo)}>
                  <img src={photo.url} alt={photo.missionTitle} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
                <button
                  onClick={() => onDelete(photo)}
                  className="absolute top-2 right-2 w-7 h-7 bg-destructive/85 hover:bg-destructive rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  title="사진 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="p-2.5">
                  <p className="text-[11px] font-black text-foreground truncate">{photo.teamName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{photo.missionTitle}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate">{photo.uploaderName}</p>
                </div>
              </div>
            ))}
          </div>
          {lightboxPhoto && (
            <PhotoLightbox
              url={lightboxPhoto.url}
              caption={`${lightboxPhoto.teamName} · ${lightboxPhoto.missionTitle}`}
              subCaption={lightboxPhoto.uploaderName}
              showDownload
              onClose={() => setLightboxPhoto(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ───────────────────────── 메인 대시보드 ───────────────────────── */
const AdminDashboard = () => {
  const { signOut } = useAdminAuth();
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'photos'>('teams');
  const [filterTeamId, setFilterTeamId] = useState('all');

  const [pendingDeletePhoto, setPendingDeletePhoto] = useState<AdminPhoto | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [pendingDeleteMember, setPendingDeleteMember] = useState<{
    member: AdminTeam['members'][number]; teamName: string;
  } | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    try { const data = await getAdminTeams(); setTeams(data); }
    catch { showToast('팀 정보를 불러오지 못했습니다.', 'error'); }
    finally { setIsLoadingTeams(false); }
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoadingPhotos(true);
    try { const data = await getAdminPhotos(); setPhotos(data); }
    catch { showToast('사진 목록을 불러오지 못했습니다.', 'error'); }
    finally { setIsLoadingPhotos(false); }
  }, []);

  useEffect(() => { loadTeams(); loadPhotos(); }, [loadTeams, loadPhotos]);

  const handleDeletePhotoConfirm = async () => {
    if (!pendingDeletePhoto) return;
    setIsDeletingPhoto(true);
    try {
      await deletePhoto(pendingDeletePhoto.id, pendingDeletePhoto.url);
      setPhotos(prev => prev.filter(p => p.id !== pendingDeletePhoto.id));
      showToast('사진이 삭제되었습니다.');
      await loadTeams();
    } catch { showToast('사진 삭제에 실패했습니다.', 'error'); }
    finally { setIsDeletingPhoto(false); setPendingDeletePhoto(null); }
  };

  const handleDeleteMemberConfirm = async () => {
    if (!pendingDeleteMember) return;
    setIsDeletingMember(true);
    try {
      await deleteMember(pendingDeleteMember.member.id);
      setTeams(prev => prev.map(t => ({ ...t, members: t.members.filter(m => m.id !== pendingDeleteMember.member.id) })));
      showToast(`${pendingDeleteMember.member.name} 참가자가 삭제되었습니다.`);
    } catch { showToast('참가자 삭제에 실패했습니다.', 'error'); }
    finally { setIsDeletingMember(false); setPendingDeleteMember(null); }
  };

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const mapaeTeams = teams.filter(t => t.rank !== null).length;

  // 마패 획득 순위 정렬: 순위 있는 팀 먼저(rank 오름차순), 나머지는 completedMissions 내림차순
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return b.completedMissions - a.completedMissions;
  });

  const rankColors: Record<number, { bg: string; text: string; border: string; label: string }> = {
    1: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', text: 'text-white', border: 'border-yellow-300', label: '🥇 1등' },
    2: { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', text: 'text-white', border: 'border-slate-200', label: '🥈 2등' },
    3: { bg: 'bg-gradient-to-br from-orange-400 to-amber-600', text: 'text-white', border: 'border-orange-300', label: '🥉 3등' },
  };

  const stats = [
    { icon: Users, label: '참가자', value: `${totalMembers}명`, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Crown, label: '총 조', value: `${teams.length}개`, color: 'text-amber-600', bg: 'bg-amber-100/60' },
    { icon: ImagePlus, label: '업로드 사진', value: `${photos.length}장`, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Trophy, label: '마패 획득', value: `${mapaeTeams}개조`, color: 'text-yellow-600', bg: 'bg-yellow-100/60' },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 카드 */}
        <div className="glass-card-premium rounded-3xl overflow-hidden mb-4 relative">
          {/* 상단 그라데이션 바 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="bg-gradient-to-r from-[#3A1E08]/90 to-[#6A3818]/80 backdrop-blur-sm px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Shield className="w-5 h-5 text-white/90" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white leading-tight">관리자 대시보드</h1>
                  <div className="flex items-center gap-1.5">
                    <img src={mapaeImage} alt="" className="w-3.5 h-3.5 object-contain opacity-80" />
                    <p className="text-[11px] text-white/50 font-medium">ADMIN001</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link to="/">
                  <Button variant="ghost" size="sm"
                    className="rounded-2xl text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs px-3">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> 게임
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}
                  className="rounded-2xl text-white/50 hover:text-white hover:bg-white/10 font-bold text-xs px-3">
                  <LogOut className="w-3.5 h-3.5 mr-1" /> 로그아웃
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-3.5 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 메인 콘텐츠 카드 */}
        <div className="glass-card-premium rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-5">

            {/* 탭 */}
            <div className="grid grid-cols-2 gap-1 bg-black/5 rounded-2xl p-1 mb-4">
              {[
                { key: 'teams', label: '조별 현황' },
                { key: 'photos', label: `사진 검토 (${photos.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'teams' | 'photos')}
                  className={`rounded-xl py-2 text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 새로고침 */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() => { loadTeams(); loadPhotos(); }}
                disabled={isLoadingTeams || isLoadingPhotos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground bg-white/50 hover:bg-white/80 border border-white/60 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${(isLoadingTeams || isLoadingPhotos) ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>

            {/* 조별 현황 탭 */}
            {activeTab === 'teams' && (
              <div className="space-y-3">
                {/* 마패 획득 순위 요약 */}
                {!isLoadingTeams && mapaeTeams > 0 && (
                  <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 p-3.5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <img src={mapaeImage} alt="" className="w-4 h-4 object-contain" />
                      <p className="text-xs font-black text-amber-800">마패 획득 순위 (게임 최종 순위)</p>
                    </div>
                    <div className="space-y-1.5">
                      {sortedTeams.filter(t => t.rank !== null).map(team => {
                        const rc = rankColors[team.rank!] || rankColors[3];
                        const time = team.secondLineCompletedAt
                          ? new Date(team.secondLineCompletedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : '';
                        return (
                          <div key={team.id} className="flex items-center gap-2.5">
                            <span className={`w-12 text-center text-[10px] font-black px-1.5 py-0.5 rounded-full ${rc.bg} ${rc.text} shrink-0`}>
                              {team.rank}등
                            </span>
                            <span className="text-xs font-black text-amber-900 flex-1">{team.name}</span>
                            <span className="text-[10px] text-amber-700/70 font-medium shrink-0">{time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isLoadingTeams ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground font-medium">데이터 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedTeams.map(team => {
                      const isExpanded = expandedTeam === team.id;
                      const percent = team.totalMissions > 0
                        ? Math.round(team.completedMissions / team.totalMissions * 100) : 0;
                      const teamNum = team.name.replace(/[^0-9]/g, '');
                      const hasRank = team.rank !== null;
                      const rc = hasRank ? (rankColors[team.rank!] || rankColors[3]) : null;

                      return (
                        <div key={team.id}
                          className={`rounded-2xl border overflow-hidden backdrop-blur-sm shadow-sm transition-all ${
                            hasRank
                              ? 'border-amber-300/60 bg-amber-50/50'
                              : 'border-white/50 bg-white/40'
                          }`}>
                          <div
                            className="p-3.5 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                {/* 팀 번호 or 순위 배지 */}
                                {hasRank && rc ? (
                                  <div className={`w-10 h-10 shrink-0 rounded-xl ${rc.bg} flex flex-col items-center justify-center shadow-sm border ${rc.border}`}>
                                    <span className="text-[9px] font-black text-white leading-none">{team.rank}등</span>
                                    <span className="text-[10px] font-black text-white leading-none mt-0.5">{teamNum}조</span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center shadow-sm">
                                    <span className="text-sm font-black text-white">{teamNum}</span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-black text-foreground">{team.name}</p>
                                    {hasRank && rc && (
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rc.bg} ${rc.text} shadow-sm`}>
                                        {rc.label} 마패
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {team.completedMissions}/{team.totalMissions}칸 · {team.completedLines}줄 · 사진 {team.photoCount}장 · 참가자 {team.members.length}명
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-xs font-black text-primary">{percent}%</span>
                                {isExpanded
                                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>

                            {/* 진행률 바 */}
                            <div className="mt-2.5 h-1.5 rounded-full bg-black/8 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  hasRank
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                    : 'bg-gradient-to-r from-primary to-amber-400'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* 확장 영역 */}
                          {isExpanded && (
                            <div className="border-t border-white/40 p-3.5 bg-white/20">
                              <p className="text-xs font-black text-foreground mb-2 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                조원 ({team.members.length}명)
                              </p>
                              <div className="space-y-1.5 mb-3">
                                {team.members.length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2 text-center">아직 참가자가 없습니다.</p>
                                ) : team.members.map(m => (
                                  <div key={m.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-white/60">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-primary">
                                          {m.name.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-foreground truncate">{m.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                                          {m.school} · {m.major}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                                        {m.cohort}
                                      </span>
                                      <button
                                        onClick={e => { e.stopPropagation(); setPendingDeleteMember({ member: m, teamName: team.name }); }}
                                        className="w-6 h-6 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                                        title="참가자 삭제"
                                      >
                                        <UserX className="w-3.5 h-3.5 text-destructive" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => { setFilterTeamId(team.id); setActiveTab('photos'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-all"
                              >
                                <ImagePlus className="w-3.5 h-3.5" />
                                이 조 사진 보기
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 사진 검토 탭 */}
            {activeTab === 'photos' && (
              <PhotoReviewPanel
                photos={photos}
                isLoading={isLoadingPhotos}
                onDelete={setPendingDeletePhoto}
                filterTeamId={filterTeamId}
                teams={teams}
                onFilterChange={setFilterTeamId}
              />
            )}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {pendingDeletePhoto && (
        <DeletePhotoModal
          photo={pendingDeletePhoto}
          onConfirm={handleDeletePhotoConfirm}
          onCancel={() => setPendingDeletePhoto(null)}
          isDeleting={isDeletingPhoto}
        />
      )}
      {pendingDeleteMember && (
        <DeleteMemberModal
          member={pendingDeleteMember.member}
          teamName={pendingDeleteMember.teamName}
          onConfirm={handleDeleteMemberConfirm}
          onCancel={() => setPendingDeleteMember(null)}
          isDeleting={isDeletingMember}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl text-white text-sm font-bold animate-bounce-in backdrop-blur-sm ${
          toast.type === 'success' ? 'bg-green-600/90' : 'bg-destructive/90'
        }`}>
          {toast.type === 'error' && <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────── 진입점 ───────────────────────── */
const Admin = () => {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <AdminLoginForm />;
};

export default Admin;
