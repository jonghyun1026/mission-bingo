-- 기존 SELECT 정책 삭제
DROP POLICY IF EXISTS "Users can view own team members" ON public.team_members;

-- 더 안전한 SELECT 정책 생성 (PERMISSIVE로 변경하여 정상 작동)
CREATE POLICY "Users can view own team members only"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  team_id = get_user_team_id(auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 비인증 사용자는 team_members 테이블에 접근 불가하도록 확인
-- (RLS가 이미 활성화되어 있으므로 anon 사용자는 접근 불가)