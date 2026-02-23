import { supabase } from '@/integrations/supabase/client';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-api`;

interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  [key: string]: T | boolean | string | undefined;
}

const API_TIMEOUT_MS = 20000;

async function callGameApi<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action, data }),
    signal: controller.signal,
  }).finally(() => {
    window.clearTimeout(timeoutId);
  });

  const result = await response.json().catch(() => {
    throw new Error(`API 응답 파싱 실패 (${action})`);
  });

  if (!response.ok) {
    throw new Error(result.error || `API 호출 실패 (${action})`);
  }
  
  if (!result.success) {
    throw new Error(result.error || 'API call failed');
  }
  
  return result;
}

function ensureWorkshopUserId(): string {
  const storageKey = 'workshop_user_id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = crypto.randomUUID();
  localStorage.setItem(storageKey, generated);
  return generated;
}

export interface Team {
  id: string;
  name: string;
  completed_lines?: number;
  second_line_completed_at?: string | null;
}

export interface Mission {
  id: number;
  title: string;
  description?: string;
  is_free_cell: boolean;
  display_order: number;
}

export interface BoardCell {
  id: string;
  position: number;
  is_completed: boolean;
  mission_id: number;
  missions: Mission;
  bonus_awarded_by?: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  school: string;
  major: string;
  cohort: string;
  joined_at: string;
}

export interface Photo {
  id: string;
  cell_id: string;
  public_url: string;
  storage_path?: string;
}

export interface TeamSnapshot {
  id: string;
  name: string;
  completedLines: number;
  completedMissions: number;
  totalMissions: number;
  isSuccess: boolean;
  secondLineCompletedAt: string | null;
  rank: number | null;
}

export interface TeamGalleryPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  teamId: string;
  teamName: string;
  missionTitle: string;
  position: number;
  uploaderName: string;
}

// 팀 목록 조회
export async function getTeams(): Promise<Team[]> {
  const result = await callGameApi<{ teams: Team[] }>('get_teams');
  return result.teams;
}

// 미션 목록 조회
export async function getMissions(): Promise<Mission[]> {
  const result = await callGameApi<{ missions: Mission[] }>('get_missions');
  return result.missions;
}

// 팀 참가 (로그인)
export async function joinTeam(
  teamId: string,
  name: string,
  school: string,
  major: string,
  cohort: string
): Promise<{
  member: TeamMember;
  team: Team;
  boardId: string;
  cells: BoardCell[];
  photos: Photo[];
}> {
  const userId = ensureWorkshopUserId();

  const result = await callGameApi<{
    member: TeamMember;
    team: Team;
    boardId: string;
    cells: BoardCell[];
    photos: Photo[];
  }>('join_team', { teamId, name, school, major, cohort, userId });
  
  return {
    member: result.member,
    team: result.team,
    boardId: result.boardId,
    cells: result.cells,
    photos: result.photos,
  };
}

// 빙고 보드 조회
export async function getBoard(teamId: string): Promise<{
  boardId: string;
  cells: BoardCell[];
  photos: Photo[];
}> {
  const result = await callGameApi<{
    boardId: string;
    cells: BoardCell[];
    photos: Photo[];
  }>('get_board', { teamId });
  
  return {
    boardId: result.boardId,
    cells: result.cells,
    photos: result.photos,
  };
}

// 셀 완료 처리
export async function completeCell(
  cellId: string,
  photoUrls: string[],
  memberId: string
): Promise<{ bonusAwardedCellId?: string | null }> {
  return await callGameApi<{ bonusAwardedCellId?: string | null }>('complete_cell', { cellId, photoUrls, memberId });
}

// 팀원 목록 조회
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const result = await callGameApi<{ members: TeamMember[] }>('get_team_members', { teamId });
  return result.members;
}

// 팀+이름으로 기존 멤버 정보 조회 (로그인 폼 자동완성용)
export async function lookupMember(
  teamId: string,
  name: string
): Promise<Pick<TeamMember, 'school' | 'major' | 'cohort'> | null> {
  const result = await callGameApi<{
    member: Pick<TeamMember, 'school' | 'major' | 'cohort'> | null;
  }>('lookup_member', { teamId, name });
  return result.member;
}

// 팀 완성 라인 수 업데이트
export async function updateTeamLines(teamId: string, completedLines: number): Promise<void> {
  await callGameApi('update_team_lines', { teamId, completedLines });
}

export async function getTeamSnapshot(): Promise<TeamSnapshot[]> {
  const result = await callGameApi<{ teams: TeamSnapshot[] }>('get_team_snapshot');
  return result.teams;
}

export async function getTeamGallery(teamId?: string): Promise<TeamGalleryPhoto[]> {
  const result = await callGameApi<{ photos: TeamGalleryPhoto[] }>('get_team_gallery', { teamId });
  return result.photos;
}

export async function updateTeamLinesWithRank(teamId: string, completedLines: number): Promise<{
  rank: number | null;
  secondLineCompletedAt: string | null;
}> {
  return await callGameApi<{ rank: number | null; secondLineCompletedAt: string | null }>(
    'update_team_lines',
    { teamId, completedLines }
  );
}

// ── 관리자 API ──────────────────────────────────────────────

export interface AdminPhoto {
  id: string;
  cellId: string;
  url: string;
  uploadedAt: string;
  teamId: string;
  teamName: string;
  missionTitle: string;
  position: number;
  uploaderName: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  completedLines: number;
  completedMissions: number;
  totalMissions: number;
  photoCount: number;
  members: Array<{ id: string; name: string; school: string; major: string; cohort: string }>;
}

export async function getAdminTeams(): Promise<AdminTeam[]> {
  const result = await callGameApi<{ teams: AdminTeam[] }>('get_admin_teams');
  return result.teams;
}

export async function getAdminPhotos(teamId?: string): Promise<AdminPhoto[]> {
  const result = await callGameApi<{ photos: AdminPhoto[] }>('get_admin_photos', { teamId });
  return result.photos;
}

export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
  await callGameApi('delete_photo', { photoId, storagePath });
}

export async function deleteMember(memberId: string): Promise<void> {
  await callGameApi('delete_member', { memberId });
}

// Storage에 사진 업로드
export async function uploadPhotoToStorage(
  file: File,
  teamId: string,
  cellId: string
): Promise<string> {
  // 파일 확장자 추출
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  // 한글 등 특수문자 문제를 피하기 위해 UUID + 타임스탬프로 파일명 생성
  const safeFileName = `${Date.now()}_${crypto.randomUUID()}.${extension}`;
  const filePath = `${teamId}/${cellId}/${safeFileName}`;
  
  const uploadPromise = supabase.storage
    .from('mission-photos')
    .upload(filePath, file);
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('스토리지 업로드 시간 초과(20초)')), API_TIMEOUT_MS);
  });

  const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);
  
  if (error) {
    const hint = error.message?.toLowerCase().includes('maximum allowed size')
      ? ' (파일 크기 제한 10MB 초과)'
      : '';
    throw new Error(`스토리지 업로드 실패: ${error.message}${hint}`);
  }
  
  const { data: urlData } = supabase.storage
    .from('mission-photos')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}
