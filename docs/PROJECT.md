# 미션 빙고 — 프로젝트 상세 문서

## 목차

- [개요](#개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [로컬 개발 환경](#로컬-개발-환경)
- [Supabase 구성](#supabase-구성)
- [Vercel 배포](#vercel-배포)
- [관리자 접속](#관리자-접속)

---

## 개요

OKBs 배정장학재단 워크숍 전용 팀 미션 빙고 게임입니다.  
팀원들이 함께 미션을 수행하고 사진을 업로드해 빙고를 완성합니다.

### 주요 기능

**게임**
- 팀별 25칸 미션 빙고 보드 (미션 랜덤 배치)
- 미션 완료 시 사진 업로드로 인증
- 줄 완성(빙고) 시 마패 획득 + 축하 애니메이션
- 보너스 미션 셀 — 완료 시 랜덤 추가 1칸 자동 완료
- 25칸 전체 완성 시 폭죽 풀 셀러브레이션

**팀 현황**
- 실시간 타 팀 빙고 현황 조회
- 팀 갤러리 — 전체 업로드 사진 모아보기
- 팀원 목록 보기

**관리자**
- 전체 팀 / 참가자 현황 대시보드
- 사진 검토 및 삭제 (삭제 시 빙고 데이터 자동 반영)
- 보너스 사진 삭제 → 연쇄 완료 셀 자동 취소
- 참가자 삭제

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 백엔드 | Supabase (PostgreSQL + Storage + Edge Functions) |
| 배포 | Vercel |

---

## 프로젝트 구조

```
okbs-bingo/
├── docs/                        # 프로젝트 문서
│   ├── PROJECT.md               # 프로젝트 상세 문서 (이 파일)
│   └── DESIGN_GUIDE.md          # 디자인 시스템 가이드
│
├── public/                      # 정적 에셋
│   ├── fonts/                   # OKche 폰트 (Light/Medium/Bold)
│   └── images/                  # 배경 이미지, 아이콘
│
├── src/
│   ├── assets/                  # 마패 이미지 등 앱 내 에셋
│   ├── components/              # UI 컴포넌트
│   │   ├── ui/                  # shadcn/ui 기본 컴포넌트
│   │   ├── BingoBoard.tsx       # 메인 빙고 보드
│   │   ├── BingoCell.tsx        # 개별 셀
│   │   ├── PhotoUploadModal.tsx # 미션 사진 업로드
│   │   ├── CelebrationModal.tsx # 빙고 줄 달성 축하 모달
│   │   ├── AllCompleteCelebration.tsx  # 25칸 완성 풀 애니메이션
│   │   ├── OtherTeamsModal.tsx  # 타 팀 현황
│   │   ├── TeamMembersModal.tsx # 팀원 목록
│   │   ├── LoginForm.tsx        # 로그인 폼
│   │   ├── AdminLoginForm.tsx   # 관리자 로그인
│   │   └── Navbar.tsx           # 상단 네비게이션
│   ├── contexts/
│   │   ├── GameContext.tsx      # 게임 전역 상태 (보드, 팀, 미션)
│   │   └── AdminAuthContext.tsx # 관리자 인증 상태
│   ├── data/
│   │   └── missions.ts          # 미션 목록 정의
│   ├── hooks/                   # 커스텀 React 훅
│   ├── integrations/supabase/   # Supabase 클라이언트 (자동 생성)
│   ├── lib/
│   │   ├── gameApi.ts           # API 호출 함수 모음
│   │   └── utils.ts             # 유틸리티 함수
│   ├── pages/
│   │   ├── Index.tsx            # 메인 페이지 (게임 화면)
│   │   ├── Admin.tsx            # 관리자 페이지
│   │   └── NotFound.tsx         # 404 페이지
│   ├── types/
│   │   └── game.ts              # 게임 관련 타입 정의
│   ├── App.tsx                  # 라우팅 설정
│   ├── index.css                # 전역 스타일 + CSS 변수
│   └── main.tsx                 # 앱 진입점
│
├── supabase/
│   ├── functions/game-api/      # Edge Function (단일 API 엔드포인트)
│   └── migrations/              # DB 마이그레이션 파일
│
├── .gitignore
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 로컬 개발 환경

### 요구사항

- Node.js 18 이상
- npm

### 설정

```bash
# 1. 저장소 클론
git clone https://github.com/jonghyun1026/mission-bingo.git
cd mission-bingo

# 2. 패키지 설치
npm install

# 3. 환경변수 설정 (.env 파일 생성)
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>
VITE_SUPABASE_PROJECT_ID=<project-id>

# 4. 개발 서버 실행
npm run dev
```

### 빌드

```bash
npm run build       # 프로덕션 빌드
npm run preview     # 빌드 결과 미리보기
```

---

## Supabase 구성

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

모든 API 요청은 `game-api` 단일 엔드포인트로 처리합니다.

```
POST /functions/v1/game-api
{ "action": "join_team" | "get_board" | "complete_cell" | "delete_photo" | ... }
```

### DB 트리거

- `on_photo_deleted` — 사진 삭제 시 셀 완료 취소 + 보너스 연쇄 취소 자동 처리

### Edge Function 배포

```bash
supabase functions deploy game-api --project-ref <project-id>
```

---

## Vercel 배포

1. [vercel.com](https://vercel.com) → **Add New Project** → `mission-bingo` 저장소 선택
2. **Environment Variables** 등록

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ID |

3. Deploy — 이후 `main` 브랜치 push 시 자동 재배포

---

## 관리자 접속

로그인 화면 하단 **"관리자 페이지"** 링크 또는 `/admin` 경로로 접근합니다.

```
ID: ADMIN001
PW: admin
```
