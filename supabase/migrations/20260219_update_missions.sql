-- 미션 데이터 업데이트 (2026-02-19)
-- 기존 미션 제목 변경 + 보너스 셀 제목 부여

-- 기존 일반 미션 → 새 제목
UPDATE public.missions SET title = '부산 대표 분식(어묵, 씨앗호떡, 물떡) 먹방 인증샷' WHERE display_order = 10;
UPDATE public.missions SET title = '광안대교 배경 해변에서 멋진 포즈로 단체샷' WHERE display_order = 22;

-- 기존 보너스 셀 → 구체적인 미션 제목 (is_free_cell 유지)
UPDATE public.missions SET title = '광안리 드론쇼 배경으로 인증샷' WHERE display_order = 4;
UPDATE public.missions SET title = '고문님과 셀카찍기' WHERE display_order = 16;
UPDATE public.missions SET title = '김태훈 차장님과 러브샷' WHERE display_order = 25;
