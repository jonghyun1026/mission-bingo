export interface User {
  id: string;
  teamName: string;
  name: string;
  school: string;
  major: string;
  cohort: string;
}

export interface Mission {
  id: number;
  title: string;
  description?: string;
  isBonus?: boolean;
}

export interface BingoCell {
  id: number;
  dbCellId?: string;
  mission: Mission;
  photos: string[];
  isCompleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  bingoBoard: BingoCell[];
  completedLines: number;
  members: User[];
}

export type BingoLine = 'row' | 'column' | 'diagonal';

export interface CompletedLine {
  type: BingoLine;
  index: number;
}
