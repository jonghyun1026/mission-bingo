-- =============================================
-- 미션 빙고 게임 플랫폼 데이터베이스 스키마
-- =============================================

-- 1. ENUM 타입 생성
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. user_roles 테이블 (권한 관리 - 분리된 테이블)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. 역할 확인 함수 (SECURITY DEFINER - 무한 재귀 방지)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- 4. teams 테이블 (팀/조)
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    completed_lines SMALLINT DEFAULT 0,
    is_mission_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. missions 테이블 (미션 마스터 데이터)
CREATE TABLE public.missions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    is_free_cell BOOLEAN DEFAULT false,
    display_order SMALLINT NOT NULL UNIQUE
);

-- 6. bingo_boards 테이블 (빙고판 - 팀당 1개)
CREATE TABLE public.bingo_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_completed SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. board_cells 테이블 (빙고판 칸)
CREATE TABLE public.board_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES public.bingo_boards(id) ON DELETE CASCADE NOT NULL,
    mission_id INT REFERENCES public.missions(id) NOT NULL,
    position SMALLINT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE (board_id, position)
);

-- 8. team_members 테이블 (팀원)
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(30) NOT NULL,
    school VARCHAR(50) NOT NULL,
    major VARCHAR(50) NOT NULL,
    cohort VARCHAR(20) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- 9. photos 테이블 (미션 인증 사진)
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id UUID REFERENCES public.board_cells(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 10. bonus_missions 테이블 (보너스)
CREATE TABLE public.bonus_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    mission_id INT REFERENCES public.missions(id),
    bonus_points SMALLINT DEFAULT 1,
    reason VARCHAR(200),
    granted_by UUID REFERENCES auth.users(id) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now()
);

-- 11. rankings 테이블 (순위)
CREATE TABLE public.rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
    rank SMALLINT NOT NULL,
    total_score INT DEFAULT 0,
    assigned_by UUID REFERENCES auth.users(id) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 헬퍼 함수들
-- =============================================

-- 사용자 팀 ID 조회 함수
CREATE OR REPLACE FUNCTION public.get_user_team_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT team_id FROM public.team_members WHERE user_id = _user_id LIMIT 1
$$;

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- teams 테이블 updated_at 트리거
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS 정책 활성화
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책 정의
-- =============================================

-- user_roles 정책
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- missions 정책 (모든 인증 사용자가 조회 가능)
CREATE POLICY "Anyone can view missions"
    ON public.missions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage missions"
    ON public.missions FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- teams 정책
CREATE POLICY "Authenticated users can view all teams"
    ON public.teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can update own team"
    ON public.teams FOR UPDATE
    TO authenticated
    USING (id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage all teams"
    ON public.teams FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- bingo_boards 정책
CREATE POLICY "Users can view own team board"
    ON public.bingo_boards FOR SELECT
    TO authenticated
    USING (team_id = public.get_user_team_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all boards"
    ON public.bingo_boards FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- board_cells 정책
CREATE POLICY "Users can view own team cells"
    ON public.board_cells FOR SELECT
    TO authenticated
    USING (
        board_id IN (
            SELECT id FROM public.bingo_boards WHERE team_id = public.get_user_team_id(auth.uid())
        ) OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can update own team cells"
    ON public.board_cells FOR UPDATE
    TO authenticated
    USING (
        board_id IN (
            SELECT id FROM public.bingo_boards WHERE team_id = public.get_user_team_id(auth.uid())
        )
    );

CREATE POLICY "Admins can manage all cells"
    ON public.board_cells FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- team_members 정책
CREATE POLICY "Users can view own team members"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (team_id = public.get_user_team_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert themselves"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.team_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all members"
    ON public.team_members FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- photos 정책
CREATE POLICY "Users can view own team photos"
    ON public.photos FOR SELECT
    TO authenticated
    USING (
        cell_id IN (
            SELECT bc.id FROM public.board_cells bc
            JOIN public.bingo_boards bb ON bb.id = bc.board_id
            WHERE bb.team_id = public.get_user_team_id(auth.uid())
        ) OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Team members can upload photos"
    ON public.photos FOR INSERT
    TO authenticated
    WITH CHECK (
        uploaded_by IN (
            SELECT id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own photos"
    ON public.photos FOR DELETE
    TO authenticated
    USING (
        uploaded_by IN (
            SELECT id FROM public.team_members WHERE user_id = auth.uid()
        ) OR public.has_role(auth.uid(), 'admin')
    );

-- bonus_missions 정책
CREATE POLICY "Users can view own team bonuses"
    ON public.bonus_missions FOR SELECT
    TO authenticated
    USING (team_id = public.get_user_team_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage bonuses"
    ON public.bonus_missions FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- rankings 정책
CREATE POLICY "Anyone can view rankings"
    ON public.rankings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage rankings"
    ON public.rankings FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 인덱스
-- =============================================

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_board_cells_board_id ON public.board_cells(board_id);
CREATE INDEX idx_board_cells_position ON public.board_cells(board_id, position);
CREATE INDEX idx_photos_cell_id ON public.photos(cell_id);
CREATE INDEX idx_photos_uploaded_at ON public.photos(uploaded_at DESC);
CREATE INDEX idx_bonus_team_id ON public.bonus_missions(team_id);
CREATE INDEX idx_rankings_rank ON public.rankings(rank);

-- =============================================
-- 미션 시드 데이터 삽입
-- =============================================

INSERT INTO public.missions (id, title, is_free_cell, display_order) VALUES
(1, '팀원 전원 점프샷', false, 1),
(2, '하트 포즈 단체 사진', false, 2),
(3, '자연과 함께 인증샷', false, 3),
(4, '이색 포즈 사진', false, 4),
(5, '팀 구호 외치기 영상', false, 5),
(6, '맛있는 간식 인증', false, 6),
(7, '팀원과 하이파이브', false, 7),
(8, '재단 로고와 함께', false, 8),
(9, '가장 높은 곳에서 찍기', false, 9),
(10, '팀 마스코트 만들기', false, 10),
(11, '그림자로 글자 만들기', false, 11),
(12, '피라미드 포즈', false, 12),
(13, '⭐ FREE ⭐', true, 13),
(14, '낙엽/꽃잎과 함께', false, 14),
(15, '팀원 업고 사진', false, 15),
(16, '웃긴 표정 배틀', false, 16),
(17, '손가락 하트 릴레이', false, 17),
(18, '팀 응원 구호 영상', false, 18),
(19, '가장 재미있는 순간', false, 19),
(20, '팀 단합 포즈', false, 20),
(21, '다른 팀과 협업 사진', false, 21),
(22, '창의적인 소품 활용', false, 22),
(23, '역대급 웃음 사진', false, 23),
(24, '미래 포부 손글씨', false, 24),
(25, '최고의 팀워크 순간', false, 25);

-- =============================================
-- 팀 시드 데이터 삽입
-- =============================================

INSERT INTO public.teams (name) VALUES
('1조 - 열정팀'),
('2조 - 도전팀'),
('3조 - 화합팀'),
('4조 - 희망팀'),
('5조 - 성장팀'),
('6조 - 꿈나래팀'),
('7조 - 빛나래팀'),
('8조 - 새싹팀'),
('9조 - 무한도전팀'),
('10조 - 하나팀');