-- 2줄 달성 시각 기록 컬럼 (랭킹 산정용)
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS second_line_completed_at TIMESTAMPTZ;

-- 랭킹 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_teams_second_line_completed_at
ON public.teams(second_line_completed_at);
