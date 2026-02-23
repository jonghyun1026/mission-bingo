# 🎯 미션 빙고 — OKBs Bingo

> **배정장학재단 OKBs 워크숍용 팀 미션 빙고 게임**  
> 팀원들과 함께 미션 사진을 올리며 빙고를 완성하세요!

---

## 📌 주요 기능

### 🎮 게임
- **팀 기반 빙고 보드** — 팀마다 25칸 미션이 랜덤 배치
- **미션 사진 업로드** — 미션 완료 시 사진 촬영/업로드로 인증
- **빙고 줄 달성** — 줄 완성 시 축하 모달 + 마패 획득
- **보너스 미션** — 보너스 셀 완료 시 랜덤으로 추가 1칸 자동 완료
- **25칸 전체 완성** — 폭죽 애니메이션 풀 셀러브레이션

### 👥 팀 현황
- 실시간 다른 팀 빙고 현황 보기
- 팀 갤러리 — 모든 팀 업로드 사진 모아보기
- 팀원 목록

### 🛡️ 관리자
- 전체 팀/참가자 현황 대시보드
- 사진 검토 및 삭제 (삭제 시 빙고 데이터 자동 반영)
- 보너스 사진 삭제 시 연쇄 완료 셀도 자동 취소
- 참가자 삭제

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 백엔드 | Supabase (PostgreSQL + Storage + Edge Functions) |
| 배포 | Vercel |

---

## 🗂️ 프로젝트 구조

```
src/
├── components/
│   ├── BingoBoard.tsx        # 메인 빙고 보드
│   ├── BingoCell.tsx         # 개별 셀 컴포넌트
│   ├── PhotoUploadModal.tsx  # 미션 사진 업로드
│   ├── CelebrationModal.tsx  # 빙고 달성 축하 모달
│   ├── AllCompleteCelebration.tsx  # 25칸 완성 풀 애니메이션
│   ├── OtherTeamsModal.tsx   # 타 팀 현황
│   ├── TeamMembersModal.tsx  # 팀원 목록
│   ├── LoginForm.tsx         # 로그인 폼
│   └── AdminLoginForm.tsx    # 관리자 로그인
├── contexts/
│   ├── GameContext.tsx       # 게임 전역 상태
│   └── AdminAuthContext.tsx  # 관리자 인증
├── pages/
│   ├── Index.tsx             # 메인 페이지
│   └── Admin.tsx             # 관리자 페이지
├── lib/
│   └── gameApi.ts            # API 호출 함수
└── types/
    └── game.ts               # 타입 정의

supabase/
├── functions/
│   └── game-api/             # Edge Function (단일 엔드포인트)
└── migrations/               # DB 마이그레이션
```

---

## 🚀 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/jonghyun1026/mission-bingo.git
cd mission-bingo
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

### 4. 개발 서버 실행

```bash
npm run dev
```

---

## ☁️ Vercel 배포

1. [vercel.com](https://vercel.com) → **Add New Project** → 이 저장소 선택
2. **Environment Variables** 등록:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ID |

3. **Deploy** — 이후 `main` 브랜치 push 시 자동 재배포

---

## 🗄️ Supabase 구성

### 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `teams` | 팀 정보 및 완성 줄 수 |
| `team_members` | 팀원 정보 |
| `missions` | 미션 목록 (보너스 미션 포함) |
| `bingo_boards` | 팀별 빙고 보드 |
| `board_cells` | 25개 셀 (완료 여부, 보너스 연결) |
| `photos` | 업로드된 사진 |

### Edge Function

모든 API 요청은 `game-api` Edge Function 단일 엔드포인트로 처리됩니다.

```
POST /functions/v1/game-api
{ "action": "join_team" | "get_board" | "complete_cell" | "delete_photo" | ... }
```

### DB 트리거

- `on_photo_deleted` — 사진 삭제 시 셀 완료 취소 + 보너스 연쇄 취소 자동 처리

---

## 🔐 관리자 접속

로그인 화면 하단 **"관리자 페이지"** 링크 또는 `/admin` 경로로 접근

```
ID: ADMIN001
PW: admin
```

---

## 📄 라이선스

내부 프로젝트 — OKBs 배정장학재단 워크숍 전용
