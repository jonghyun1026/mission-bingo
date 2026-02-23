import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { User, BingoCell, CompletedLine, Mission } from '@/types/game';
import { 
  joinTeam, 
  getBoard,
  getTeams, 
  getTeamMembers, 
  getTeamSnapshot,
  getTeamGallery,
  completeCell, 
  deletePhoto,
  updateTeamLinesWithRank,
  Team as ApiTeam,
  BoardCell,
  Photo,
  TeamMember,
  TeamSnapshot,
  TeamGalleryPhoto
} from '@/lib/gameApi';

interface ExtendedUser extends User {
visibleMemberId: string;
  teamDbId: string;
  boardId: string;
}

interface GameContextType {
  user: ExtendedUser | null;
  bingoBoard: BingoCell[];
  completedLines: CompletedLine[];
  totalCompletedLines: number;
  isLoading: boolean;
  sessionRestoring: boolean;
  teams: ApiTeam[];
  teamMembers: TeamMember[];
  teamSnapshots: TeamSnapshot[];
  teamGallery: TeamGalleryPhoto[];
  myRank: number | null;
  login: (teamId: string, teamName: string, name: string, school: string, major: string, cohort: string) => Promise<void>;
  logout: () => void;
  uploadPhoto: (cellId: number, photos: string[]) => void;
  removePhoto: (cellId: number, photoIndex: number) => void;
  deleteUserPhoto: (cellId: number, photoId: string, storagePath?: string) => Promise<void>;
  checkBingoLines: () => CompletedLine[];
  fetchTeams: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchTeamSnapshot: () => Promise<void>;
  fetchTeamGallery: (teamId?: string) => Promise<void>;
  syncCellCompletion: (cellId: number, dbCellId: string, photoUrls: string[]) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SESSION_KEY = 'okbs_bingo_session';

interface SavedSession {
  id: string;
  visibleMemberId: string;
  teamName: string;
  name: string;
  school: string;
  major: string;
  cohort: string;
  teamDbId: string;
  boardId: string;
}

const createBoardFromDb = (cells: BoardCell[], photos: Photo[]): BingoCell[] => {
  return cells.map((cell) => {
    const cellPhotoObjects = photos.filter((p) => p.cell_id === cell.id);
    return {
      id: cell.position,
      dbCellId: cell.id,
      mission: {
        id: cell.missions.id,
        title: cell.missions.title,
        description: cell.missions.description,
        isBonus: cell.missions.is_free_cell,
      },
      photos: cellPhotoObjects.map((p) => p.public_url),
      photoMeta: cellPhotoObjects.map((p) => ({
        id: p.id,
        url: p.public_url,
        storagePath: p.storage_path,
      })),
      isCompleted: cell.is_completed,
      isBonusAwarded: !!cell.bonus_awarded_by,
    };
  });
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [bingoBoard, setBingoBoard] = useState<BingoCell[]>([]);
  const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionRestoring, setSessionRestoring] = useState(true);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSnapshots, setTeamSnapshots] = useState<TeamSnapshot[]>([]);
  const [teamGallery, setTeamGallery] = useState<TeamGalleryPhoto[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 보드의 현재 완료 셀 기준으로 라인 전부 계산 (admin 삭제 반영용)
  const computeAllLines = useCallback((board: BingoCell[]): CompletedLine[] => {
    const lines: CompletedLine[] = [];
    for (let r = 0; r < 5; r++) {
      if (board.slice(r * 5, r * 5 + 5).every(c => c.isCompleted)) lines.push({ type: 'row', index: r });
    }
    for (let col = 0; col < 5; col++) {
      if ([0,1,2,3,4].map(r => board[r * 5 + col]).every(c => c.isCompleted)) lines.push({ type: 'column', index: col });
    }
    if ([0,6,12,18,24].map(i => board[i]).every(c => c.isCompleted)) lines.push({ type: 'diagonal', index: 0 });
    if ([4,8,12,16,20].map(i => board[i]).every(c => c.isCompleted)) lines.push({ type: 'diagonal', index: 1 });
    return lines;
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    if (!user?.teamDbId) return;
    
    try {
      const members = await getTeamMembers(user.teamDbId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  }, [user?.teamDbId]);

  const fetchTeamSnapshot = useCallback(async () => {
    try {
      const snapshot = await getTeamSnapshot();
      setTeamSnapshots(snapshot);
    } catch (error) {
      console.error('Failed to fetch team snapshot:', error);
    }
  }, []);

  const fetchTeamGallery = useCallback(async (teamId?: string) => {
    try {
      const gallery = await getTeamGallery(teamId);
      setTeamGallery(gallery);
    } catch (error) {
      console.error('Failed to fetch team gallery:', error);
    }
  }, []);

  // 앱 시작 시 저장된 세션으로 자동 복원
  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const saved: SavedSession = JSON.parse(raw);
        const refreshed = await getBoard(saved.teamDbId);
        const newBoard = createBoardFromDb(refreshed.cells, refreshed.photos || []);
        setUser(saved);
        setBingoBoard(newBoard);
        setCompletedLines(computeAllLines(newBoard));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setSessionRestoring(false);
      }
    };
    restore();
  // computeAllLines는 안정적인 callback이므로 deps에 포함
  }, [computeAllLines]);

  const login = useCallback(async (
    teamId: string,
    teamName: string,
    name: string,
    school: string,
    major: string,
    cohort: string
  ) => {
    setIsLoading(true);
    try {
      const result = await joinTeam(teamId, name, school, major, cohort);
      
      const newUser: ExtendedUser = {
        id: result.member.id,
        visibleMemberId: result.member.id,
        teamName,
        name,
        school,
        major,
        cohort,
        teamDbId: teamId,
        boardId: result.boardId,
      };
      
      // 세션을 localStorage에 저장
      const session: SavedSession = {
        id: newUser.id,
        visibleMemberId: newUser.visibleMemberId,
        teamName: newUser.teamName,
        name: newUser.name,
        school: newUser.school,
        major: newUser.major,
        cohort: newUser.cohort,
        teamDbId: newUser.teamDbId,
        boardId: newUser.boardId,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      setUser(newUser);
      setBingoBoard(createBoardFromDb(result.cells, result.photos || []));
      setCompletedLines([]);
      setMyRank(null);
      fetchTeamSnapshot().catch(console.error);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTeamSnapshot]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setBingoBoard([]);
    setCompletedLines([]);
    setTeamMembers([]);
    setTeamSnapshots([]);
    setTeamGallery([]);
    setMyRank(null);
  }, []);

  const uploadPhoto = useCallback((cellId: number, photos: string[]) => {
    setBingoBoard((prev) =>
      prev.map((cell) =>
        cell.id === cellId
          ? {
              ...cell,
              photos: [...cell.photos, ...photos],
              photoMeta: [...(cell.photoMeta ?? []), ...photos.map((url) => ({ id: '', url }))],
              isCompleted: true,
            }
          : cell
      )
    );
  }, []);

  const removePhoto = useCallback((cellId: number, photoIndex: number) => {
    setBingoBoard((prev) =>
      prev.map((cell) => {
        if (cell.id !== cellId) return cell;
        const newPhotos = cell.photos.filter((_, i) => i !== photoIndex);
        const newMeta = cell.photoMeta.filter((_, i) => i !== photoIndex);
        return {
          ...cell,
          photos: newPhotos,
          photoMeta: newMeta,
          isCompleted: newPhotos.length > 0,
        };
      })
    );
  }, []);

  const deleteUserPhoto = useCallback(async (cellId: number, photoId: string, storagePath?: string) => {
    await deletePhoto(photoId, storagePath || '');
    if (!user) return;
    const refreshed = await getBoard(user.teamDbId);
    const newBoard = createBoardFromDb(refreshed.cells, refreshed.photos || []);
    setBingoBoard(newBoard);
    setCompletedLines(computeAllLines(newBoard));
  }, [user, computeAllLines]);

  const syncCellCompletion = useCallback(async (
    cellId: number,
    dbCellId: string,
    photoUrls: string[]
  ) => {
    if (!user) return;
    
    try {
      await completeCell(dbCellId, photoUrls, user.visibleMemberId);
      // 서버에서 보너스 랜덤 완료가 일어날 수 있어 보드를 재동기화한다.
      const refreshed = await getBoard(user.teamDbId);
      setBingoBoard(createBoardFromDb(refreshed.cells, refreshed.photos || []));
    } catch (error) {
      console.error('Failed to sync cell completion:', error);
      throw error;
    }
  }, [user]);

  const checkBingoLines = useCallback((): CompletedLine[] => {
    const newCompletedLines: CompletedLine[] = [];
    const board = bingoBoard;

    if (board.length === 0) return [];

    // Check rows
    for (let row = 0; row < 5; row++) {
      const rowCells = board.slice(row * 5, row * 5 + 5);
      if (rowCells.every((cell) => cell.isCompleted)) {
        const lineExists = completedLines.some(
          (l) => l.type === 'row' && l.index === row
        );
        if (!lineExists) {
          newCompletedLines.push({ type: 'row', index: row });
        }
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      const colCells = [0, 1, 2, 3, 4].map((row) => board[row * 5 + col]);
      if (colCells.every((cell) => cell.isCompleted)) {
        const lineExists = completedLines.some(
          (l) => l.type === 'column' && l.index === col
        );
        if (!lineExists) {
          newCompletedLines.push({ type: 'column', index: col });
        }
      }
    }

    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24].map((i) => board[i]);
    if (diagonal1.every((cell) => cell.isCompleted)) {
      const lineExists = completedLines.some(
        (l) => l.type === 'diagonal' && l.index === 0
      );
      if (!lineExists) {
        newCompletedLines.push({ type: 'diagonal', index: 0 });
      }
    }

    const diagonal2 = [4, 8, 12, 16, 20].map((i) => board[i]);
    if (diagonal2.every((cell) => cell.isCompleted)) {
      const lineExists = completedLines.some(
        (l) => l.type === 'diagonal' && l.index === 1
      );
      if (!lineExists) {
        newCompletedLines.push({ type: 'diagonal', index: 1 });
      }
    }

    if (newCompletedLines.length > 0) {
      setCompletedLines((prev) => [...prev, ...newCompletedLines]);
      
      // 팀 완성 라인 수 DB에 업데이트
      if (user?.teamDbId) {
        const totalLines = completedLines.length + newCompletedLines.length;
        updateTeamLinesWithRank(user.teamDbId, totalLines)
          .then((result) => {
            if (typeof result.rank === 'number') setMyRank(result.rank);
          })
          .catch(console.error);
        fetchTeamSnapshot().catch(console.error);
      }
    }

    return newCompletedLines;
  }, [bingoBoard, completedLines, user?.teamDbId]);

  // 30초마다 보드를 서버에서 재조회 (admin 사진 삭제 반영)
  useEffect(() => {
    if (!user?.teamDbId) return;

    const refresh = async () => {
      try {
        const refreshed = await getBoard(user.teamDbId);
        const newBoard = createBoardFromDb(refreshed.cells, refreshed.photos || []);
        setBingoBoard(newBoard);
        // 실제 완료 셀 기준으로 라인 재계산 (삭제된 칸이 있으면 줄도 줄어듦)
        setCompletedLines(computeAllLines(newBoard));
      } catch {
        // 조용히 실패 (네트워크 일시 끊김 등)
      }
    };

    pollRef.current = setInterval(refresh, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.teamDbId, computeAllLines]);

  const totalCompletedLines = completedLines.length;

  return (
    <GameContext.Provider
      value={{
        user,
        bingoBoard,
        completedLines,
        totalCompletedLines,
        isLoading,
        sessionRestoring,
        teams,
        teamMembers,
        teamSnapshots,
        teamGallery,
        myRank,
        login,
        logout,
        uploadPhoto,
        removePhoto,
        deleteUserPhoto,
        checkBingoLines,
        fetchTeams,
        fetchTeamMembers,
        fetchTeamSnapshot,
        fetchTeamGallery,
        syncCellCompletion,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
