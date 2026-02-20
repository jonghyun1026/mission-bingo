-- 워크숍 앱은 Supabase Auth 대신 커스텀 로그인(user_id)을 사용하므로
-- Storage 업로드는 anon 클라이언트도 허용해야 한다.
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;

CREATE POLICY "Public can upload mission photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'mission-photos');
