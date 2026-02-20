-- 사진 저장용 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('mission-photos', 'mission-photos', true, 10485760);

-- Storage RLS 정책: 인증된 사용자가 업로드 가능
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mission-photos');

-- Storage RLS 정책: 모든 사용자가 사진 조회 가능 (public bucket)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'mission-photos');

-- Storage RLS 정책: 관리자만 삭제 가능
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'mission-photos' AND public.has_role(auth.uid(), 'admin'));