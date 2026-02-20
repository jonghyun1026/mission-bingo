import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users, Crown, ImagePlus, ChevronDown, ChevronUp,
  ArrowLeft, LogOut, Trash2, RefreshCw, X, AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { getAdminTeams, getAdminPhotos, deletePhoto, AdminTeam, AdminPhoto } from '@/lib/gameApi';

/* ───────────────────────── 삭제 확인 모달 ───────────────────────── */
const DeleteConfirmModal: React.FC<{
  photo: AdminPhoto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ photo, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-body font-black text-foreground">사진 삭제</h3>
            <p className="text-caption text-muted-foreground">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden mb-4 border border-border">
          <img src={photo.url} alt="" className="w-full h-36 object-cover" />
          <div className="p-3 bg-muted/30">
            <p className="text-body-sm font-bold text-foreground">{photo.teamName}</p>
            <p className="text-caption text-muted-foreground">{photo.missionTitle} · {photo.uploaderName}</p>
          </div>
        </div>

        <p className="text-caption text-muted-foreground mb-4">
          사진을 삭제하면 해당 칸의 완료 상태가 취소되고, 빙고 줄 수와 랭킹이 즉시 재계산됩니다.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onCancel} disabled={isDeleting}>
            취소
          </Button>
          <Button
            className="flex-1 rounded-full bg-destructive hover:bg-destructive/90 text-white font-bold"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                삭제 중...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                삭제 확인
              </span>
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
  const filtered = filterTeamId === 'all' ? photos : photos.filter(p => p.teamId === filterTeamId);

  return (
    <div>
      {/* 팀 필터 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 rounded-full text-caption font-bold border transition-colors ${
            filterTeamId === 'all'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
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
              className={`px-3 py-1 rounded-full text-caption font-bold border transition-colors ${
                filterTeamId === team.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {team.name} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-caption text-muted-foreground py-10">업로드된 사진이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map(photo => (
            <div key={photo.id} className="rounded-xl overflow-hidden border border-border bg-card group relative">
              <img src={photo.url} alt={photo.missionTitle} className="w-full h-28 object-cover" />
              <button
                onClick={() => onDelete(photo)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-destructive/90 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="p-2">
                <p className="text-[11px] font-bold text-foreground truncate">{photo.teamName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{photo.missionTitle}</p>
                <p className="text-[10px] text-muted-foreground truncate">{photo.uploaderName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────── 메인 대시보드 ───────────────────────── */
const AdminDashboard = () => {
  const { user, signOut } = useAdminAuth();
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'photos'>('teams');
  const [filterTeamId, setFilterTeamId] = useState('all');
  const [pendingDelete, setPendingDelete] = useState<AdminPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    try {
      const data = await getAdminTeams();
      setTeams(data);
    } catch {
      showToast('팀 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoadingPhotos(true);
    try {
      const data = await getAdminPhotos();
      setPhotos(data);
    } catch {
      showToast('사진 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadPhotos();
  }, [loadTeams, loadPhotos]);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deletePhoto(pendingDelete.id, pendingDelete.url);
      setPhotos(prev => prev.filter(p => p.id !== pendingDelete.id));
      showToast('사진이 삭제되었습니다. 칸 상태와 현황이 자동 반영됩니다.');
      // 팀 현황도 갱신
      await loadTeams();
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalPhotos = photos.length;

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">

          {/* 헤더 */}
          <div className="bg-gradient-to-r from-[#4A2E1A] to-[#7A4A2A] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-white">관리자 대시보드</h1>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:text-white hover:bg-white/10 font-bold">
                    <ArrowLeft className="w-4 h-4 mr-1" /> 게임
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full text-white/50 hover:text-white hover:bg-white/10 font-bold">
                  <LogOut className="w-4 h-4 mr-1.5" /> 로그아웃
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {/* 통계 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { icon: Users, label: '참가자', value: `${totalMembers}명`, color: 'text-primary' },
                { icon: Crown, label: '총 조', value: `${teams.length}개`, color: 'text-amber-600' },
                { icon: ImagePlus, label: '업로드 사진', value: `${totalPhotos}장`, color: 'text-primary' },
                { icon: Crown, label: '2줄 달성', value: `${teams.filter(t => t.completedLines >= 2).length}개조`, color: 'text-yellow-600' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-xl font-black text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 탭 */}
            <div className="grid grid-cols-2 gap-1 bg-muted/30 rounded-xl p-1 mb-4">
              <button
                onClick={() => setActiveTab('teams')}
                className={`rounded-lg py-2 text-body-sm font-bold transition-colors ${activeTab === 'teams' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                조별 현황
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`rounded-lg py-2 text-body-sm font-bold transition-colors ${activeTab === 'photos' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                사진 검토 ({totalPhotos})
              </button>
            </div>

            {/* 새로고침 버튼 */}
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-caption gap-1.5"
                onClick={() => { loadTeams(); loadPhotos(); }}
                disabled={isLoadingTeams || isLoadingPhotos}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingTeams || isLoadingPhotos) ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>

            {/* 조별 현황 탭 */}
            {activeTab === 'teams' && (
              <div className="space-y-2">
                {isLoadingTeams ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : teams.map(team => {
                  const isExpanded = expandedTeam === team.id;
                  const percent = team.totalMissions > 0 ? Math.round(team.completedMissions / team.totalMissions * 100) : 0;
                  return (
                    <div key={team.id} className="rounded-xl border border-border overflow-hidden bg-card">
                      <div
                        className="p-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#E8602A] to-[#A83310] rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-xs font-black text-white">{team.name.replace(/[^0-9]/g, '')}</span>
                            </div>
                            <div>
                              <p className="text-body font-bold text-foreground">{team.name}</p>
                              <p className="text-caption text-muted-foreground">
                                {team.completedMissions}/{team.totalMissions}칸 · {team.completedLines}줄 · 사진 {team.photoCount}장
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {team.completedLines >= 2 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                2줄 달성!
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>

                        {/* 진행률 바 */}
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-border p-3.5">
                          <p className="text-body-sm font-bold text-foreground mb-2">조원 ({team.members.length}명)</p>
                          <div className="space-y-1.5 mb-3">
                            {team.members.length === 0 ? (
                              <p className="text-caption text-muted-foreground">아직 참가자가 없습니다.</p>
                            ) : team.members.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <span className="text-body-sm text-foreground font-medium">{m.name}</span>
                                  <span className="text-caption text-muted-foreground">{m.school} · {m.major}</span>
                                </div>
                                <span className="text-caption text-muted-foreground">{m.cohort}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-caption gap-1.5"
                            onClick={() => {
                              setFilterTeamId(team.id);
                              setActiveTab('photos');
                            }}
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                            이 조 사진 보기
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 사진 검토 탭 */}
            {activeTab === 'photos' && (
              <PhotoReviewPanel
                photos={photos}
                isLoading={isLoadingPhotos}
                onDelete={setPendingDelete}
                filterTeamId={filterTeamId}
                teams={teams}
                onFilterChange={setFilterTeamId}
              />
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {pendingDelete && (
        <DeleteConfirmModal
          photo={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-body-sm font-bold animate-bounce-in ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
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
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <AdminLoginForm />;
};

export default Admin;
