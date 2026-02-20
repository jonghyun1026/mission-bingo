# 🎨 미션 빙고 게임 - 디자인 가이드

## 📋 개요

이 문서는 장학재단 워크숍 미션 빙고 게임 플랫폼의 디자인 시스템을 정의합니다.  
전통적이면서도 젊고 경쾌한 **워크숍 이벤트형 분위기**를 목표로 합니다.

---

## 🎯 디자인 원칙

| 원칙       | 설명                                   |
| ---------- | -------------------------------------- |
| **클래식** | 전통적인 한국 미학을 현대적으로 재해석 |
| **경쾌함** | 워크숍 참가자들의 활기찬 에너지 반영   |
| **명확성** | 직관적인 UI, 즉각적인 피드백           |
| **일관성** | 모든 요소에 통일된 디자인 언어 적용    |

---

## 🔤 타이포그래피 (Typography)

### 폰트 패밀리

| 폰트명               | 용도              | Tailwind 변수             |
| -------------------- | ----------------- | ------------------------- |
| **오케이체 (OKche)** | 전체 앱 기본 폰트 | `font-sans`, `font-okche` |

### 폰트 웨이트

| 웨이트       | 파일명             | Tailwind 클래스 | 용도              |
| ------------ | ------------------ | --------------- | ----------------- |
| Light (300)  | `OKche-Light.ttf`  | `font-light`    | 캡션, 부가 정보   |
| Medium (500) | `OKche-Medium.ttf` | `font-medium`   | 본문, 서브헤딩    |
| Bold (700)   | `OKche-Bold.ttf`   | `font-bold`     | 제목, 강조 텍스트 |

### 타이포그래피 스케일

| 스타일     | 크기            | 클래스           | 용도        |
| ---------- | --------------- | ---------------- | ----------- |
| Display    | 2.5rem (40px)   | `text-display`   | 메인 타이틀 |
| Heading 1  | 2rem (32px)     | `text-heading-1` | 페이지 제목 |
| Heading 2  | 1.5rem (24px)   | `text-heading-2` | 섹션 제목   |
| Heading 3  | 1.25rem (20px)  | `text-heading-3` | 서브섹션    |
| Body Large | 1.125rem (18px) | `text-body-lg`   | 강조 본문   |
| Body       | 1rem (16px)     | `text-body`      | 기본 본문   |
| Body Small | 0.875rem (14px) | `text-body-sm`   | 보조 본문   |
| Caption    | 0.75rem (12px)  | `text-caption`   | 캡션, 라벨  |

### 사용 예시

```html
<!-- 디스플레이 타이틀 -->
<h1 class="text-display text-primary">미션 빙고!</h1>

<!-- 페이지 제목 -->
<h2 class="text-heading-1 text-foreground">우리 팀 빙고판</h2>

<!-- 본문 -->
<p class="text-body text-muted-foreground">미션을 완료하고 사진을 업로드하세요.</p>

<!-- 캡션 -->
<span class="text-caption text-secondary">12/25 미션 완료</span>
```

---

## 🎨 색상 팔레트 (Color Palette)

### 주요 색상

| 역할          | 색상명   | HEX       | RGB                | HSL (Tailwind) | 클래스                           |
| ------------- | -------- | --------- | ------------------ | -------------- | -------------------------------- |
| **Primary**   | 주황     | `#F55000` | `rgb(245, 80, 0)`  | `19 100% 48%`  | `bg-primary`, `text-primary`     |
| **Secondary** | 회갈색   | `#55474A` | `rgb(85, 71, 74)`  | `350 9% 39%`   | `bg-secondary`, `text-secondary` |
| **Accent**    | 노랑주황 | `#FFAA00` | `rgb(255, 170, 0)` | `40 100% 50%`  | `bg-accent`, `text-accent`       |

### 시맨틱 색상

| 역할            | 설명                   | 클래스                               |
| --------------- | ---------------------- | ------------------------------------ |
| **Success**     | 완료된 미션, 성공 상태 | `bg-success`, `text-success`         |
| **Celebration** | 빙고 완성, 축하        | `bg-celebration`, `text-celebration` |
| **Destructive** | 삭제, 경고             | `bg-destructive`, `text-destructive` |
| **Muted**       | 비활성, 보조 텍스트    | `bg-muted`, `text-muted-foreground`  |

### 배경 및 표면

| 역할           | 설명                        | 클래스                  |
| -------------- | --------------------------- | ----------------------- |
| **Background** | 페이지 배경 (경주 일러스트) | `bg-background`         |
| **Card**       | 카드 배경 (반투명)          | `bg-card`, `bg-card/95` |
| **Popover**    | 팝업/모달 배경              | `bg-popover`            |

### 색상 사용 가이드

```html
<!-- Primary 버튼 -->
<button class="bg-primary text-primary-foreground">미션 시작</button>

<!-- Secondary 버튼 -->
<button class="bg-secondary text-secondary-foreground">취소</button>

<!-- Accent 강조 -->
<span class="text-accent font-bold">보너스 미션!</span>

<!-- 성공 상태 -->
<div class="bg-success/20 border-success text-success">완료!</div>
```

---

## 📐 스페이싱 (Spacing)

### 기본 스페이싱 시스템 (8px 기반)

| 토큰  | 값   | Tailwind       | 용도         |
| ----- | ---- | -------------- | ------------ |
| `xs`  | 4px  | `p-1`, `m-1`   | 아이콘 간격  |
| `sm`  | 8px  | `p-2`, `m-2`   | 요소 내 여백 |
| `md`  | 16px | `p-4`, `m-4`   | 카드 내 패딩 |
| `lg`  | 24px | `p-6`, `m-6`   | 섹션 간격    |
| `xl`  | 32px | `p-8`, `m-8`   | 페이지 여백  |
| `2xl` | 48px | `p-12`, `m-12` | 대형 섹션    |

---

## 📦 컴포넌트 스타일

### 카드 (Card)

```html
<!-- 클래식 카드 -->
<div class="card-classic p-6">
  <h3 class="text-heading-3">미션 제목</h3>
  <p class="text-body-sm text-muted-foreground">설명</p>
</div>

<!-- CSS 정의 -->
.card-classic {
  @apply bg-card/95 border-2 border-secondary/30 shadow-lg;
  backdrop-filter: blur(8px);
}
```

### 빙고 셀 (Bingo Cell)

```html
<!-- 미완료 셀 -->
<div class="bingo-cell p-4">
  <span class="text-body-sm">팀원 전원 점프샷</span>
</div>

<!-- 완료 셀 -->
<div class="bingo-cell bingo-cell-completed p-4">
  <img src="..." alt="미션 사진" />
</div>

<!-- CSS 정의 -->
.bingo-cell {
  @apply bg-card/90 border-2 border-secondary/40;
  backdrop-filter: blur(4px);
}

.bingo-cell-completed {
  @apply bg-success/20 border-success;
}
```

### 버튼 (Button)

| 스타일    | 클래스          | 용도      |
| --------- | --------------- | --------- |
| Primary   | `btn-classic`   | 주요 액션 |
| Secondary | `btn-secondary` | 보조 액션 |
| Accent    | `btn-accent`    | 강조 액션 |

```html
<button class="btn-classic">사진 업로드</button>
<button class="btn-secondary">취소</button>
<button class="btn-accent">보너스 받기</button>
```

### 테두리 (Border)

- **모든 컴포넌트는 둥근 모서리 없이 직사각형 유지**
- `--radius: 0rem` 설정으로 모든 `rounded-*` 클래스 무효화

```html
<!-- 전통적인 장식 테두리 -->
<div class="border-traditional p-6">
  특별한 콘텐츠
</div>

<!-- CSS 정의 -->
.border-traditional {
  @apply border-4 border-double border-secondary/50;
}
```

---

## 🖼️ 이미지 및 아이콘

### 배경 이미지

| 이미지        | 파일명            | 용도               |
| ------------- | ----------------- | ------------------ |
| 경주 일러스트 | `gyeongju-bg.jpg` | 모든 페이지 배경   |
| 적토마 마패   | `mapae-red.png`   | 미션 컴플리트 팝업 |

### 배경 적용

```css
body {
  background-image: url('/images/gyeongju-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 반투명 오버레이 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(
    180deg,
    hsl(40 23% 94% / 0.85) 0%,
    hsl(40 23% 94% / 0.75) 50%,
    hsl(40 23% 94% / 0.85) 100%
  );
  pointer-events: none;
  z-index: -1;
}
```

### 아이콘 사용 원칙

- **유틸리티 용도만 사용**: 체크, 삭제, 확인, 업로드 등
- **꾸밈 요소 제한**: 장식용 아이콘 사용 금지
- **Lucide React 사용**: 일관된 아이콘 스타일

```tsx
import { Check, X, Upload, Camera } from 'lucide-react';

// 사용 예시
<Check className="w-5 h-5 text-success" />
<Upload className="w-5 h-5 text-primary" />
```

---

## 📱 반응형 디자인 (Responsive)

### 브레이크포인트

| 이름             | 최소 너비 | Tailwind          | 대상 기기       |
| ---------------- | --------- | ----------------- | --------------- |
| `mobile`         | 320px     | `mobile:`         | 스마트폰 (세로) |
| `sm`             | 640px     | `sm:`             | 스마트폰 (가로) |
| `tablet` / `md`  | 768px     | `tablet:`, `md:`  | 태블릿          |
| `desktop` / `lg` | 1024px    | `desktop:`, `lg:` | 데스크탑        |
| `wide`           | 1440px    | `wide:`           | 대형 모니터     |
| `xl`             | 1280px    | `xl:`             | 와이드 스크린   |
| `2xl`            | 1536px    | `2xl:`            | 초대형 스크린   |

### 모바일 우선 설계

```html
<!-- 모바일 우선 그리드 -->
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
  ...
</div>

<!-- 반응형 패딩 -->
<div class="p-4 tablet:p-6 desktop:p-8">
  ...
</div>

<!-- 반응형 텍스트 -->
<h1 class="text-heading-2 tablet:text-heading-1 desktop:text-display">
  제목
</h1>
```

### 빙고판 반응형

```html
<!-- 5x5 빙고 그리드 -->
<div class="
  grid grid-cols-5 gap-1
  tablet:gap-2
  desktop:gap-3
  max-w-[320px] tablet:max-w-[480px] desktop:max-w-[600px]
  mx-auto
">
  <!-- 25개 셀 -->
</div>
```

---

## ✨ 인터랙션 및 애니메이션

### 원칙

- **즉시 등장**: 팝업, 알림 등 모든 인터랙션 요소는 애니메이션 없이 즉시 나타남
- **최소화된 전환**: 필수적인 상태 변화만 부드럽게 처리

### 허용된 전환 효과

```css
/* 호버 상태 변화 */
.bingo-cell {
  @apply transition-all duration-200;
}

/* 버튼 클릭 피드백 */
.btn-classic {
  @apply active:scale-95 transition-all;
}
```

### 금지된 효과

- ❌ 페이드 인/아웃 애니메이션
- ❌ 슬라이드 애니메이션
- ❌ 바운스 효과
- ❌ 컨페티/파티클 효과

---

## 📄 페이지 레이아웃

### 기본 구조

```html
<div class="min-h-screen flex flex-col">
  <!-- Topbar -->
  <header class="h-14 bg-card/95 border-b-2 border-secondary/30">
    ...
  </header>

  <!-- Main Content -->
  <main class="flex-1 container-game py-6">
    ...
  </main>

  <!-- Bottombar (모바일) -->
  <nav class="h-16 bg-card/95 border-t-2 border-secondary/30 tablet:hidden">
    ...
  </nav>
</div>
```

### 컨테이너

```css
.container-game {
  @apply w-full max-w-lg mx-auto px-4;
}

@screen md {
  .container-game {
    @apply max-w-2xl px-6;
  }
}

@screen lg {
  .container-game {
    @apply max-w-4xl px-8;
  }
}
```

---

## 📁 파일 구조

```
public/
├── fonts/
│   ├── OKche-Light.ttf
│   ├── OKche-Medium.ttf
│   └── OKche-Bold.ttf
└── images/
    └── gyeongju-bg.jpg

src/
├── assets/
│   ├── mapae-original.jpg
│   └── mapae-red.png
├── index.css          # 전역 스타일, CSS 변수
└── ...

tailwind.config.ts     # Tailwind 설정
```

---

## ✅ 체크리스트

### 새 컴포넌트 작성 시

- [ ] 오케이체 폰트 사용 (`font-sans` 또는 `font-okche`)
- [ ] 시맨틱 색상 토큰 사용 (`text-primary`, `bg-card` 등)
- [ ] 둥근 모서리 제거 확인 (`rounded-*` 미사용)
- [ ] 모바일 우선 반응형 적용
- [ ] 애니메이션 최소화

### 스타일 변경 시

- [ ] `index.css`의 CSS 변수 활용
- [ ] Tailwind 클래스 우선 사용
- [ ] 하드코딩된 색상값 금지

---

## 📞 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons)
- 경주 일러스트: 경주시 관광 홍보 자료 참조
