# 🌟 junho.art - 개인 포트폴리오 및 학부연구생 CV

백석대학교 컴퓨터학부 학부연구생 **허준호 (4season)** 의 개인 포트폴리오이자 반응형 CV 웹사이트 리포지토리입니다.  

컴퓨터공학과 기계학습 모델링을 기반으로 뇌와 마음의 계산적 원리를 연구하는 **계산정신의학 (Computational Psychiatry)** 연구자로서의 성장의 여정과 프로젝트들을 상세히 기록하고 있습니다.

## 주요 기능 및 특징

* **실시간 깃허브 핀 프로젝트 연동:**
  오라클 VM 서버에서 30분마다 Cron Job으로 작동하는 Node.js 동기화 스크립트(`update_pinned.js`)가 GitHub GraphQL API를 통해 핀(Pinned)된 프로젝트 목록을 `pinned-repos.json` 파일로 자동 업데이트합니다.
  웹 프론트엔드(`script.js`)에서는 이 정적 JSON 데이터를 비동기(fetch)로 불러와 카드 형태로 동적 렌더링합니다.
* **캐시 버스팅(Cache Busting) 및 실시간 자동 갱신:**
  정적 JSON 데이터와 자바스크립트가 브라우저나 CDN에 의해 강하게 캐싱되는 현상을 막기 위해, 호출 시 타임스탬프 쿼리 파라미터를 추가하여 언제나 최신의 핀 상태를 화면에 렌더링하며, 사용자가 탭을 열어둔 상태에서도 5분 주기로 백그라운드 갱신을 실행합니다.
* **반응형 디자인:**
  바닐라 HTML, CSS, JavaScript로 구현된 글래스모피즘(Glassmorphism) 기반의 미니멀하고 세련된 UI를 제공하며, 데스크톱부터 초소형 모바일 기기(최소 320px 폭)까지 완벽한 반응형 레이아웃을 보장합니다.
* **스크롤 리빌 애니메이션:**
  `view-timeline` API를 지원하는 최신 브라우저에서는 CSS 기반의 스크롤 애니메이션을 제공하며, 미지원 브라우저를 대비해 `IntersectionObserver` 기반의 JS 폴백(Fallback) 모션이 적용되어 있습니다.

## 디렉토리 구조

```
junho.art/
├── img/                       # 이미지 자원 (프로필, 프로젝트 프리미엄 썸네일)
│   ├── junho_profile.jpg
│   ├── portfolio_preview.png  # 포트폴리오 프로젝트 카드 썸네일
│   └── trendxiv_preview.png   # TrendXiv 프로젝트 카드 썸네일
├── favicon_io/                # 브라우저 파비콘 패키지
├── index.html                 # 메인 웹페이지 구조 및 콘텐츠
├── style.css                  # 글래스모피즘 테마 및 모바일 최적화 스타일시트
├── script.js                  # 핀 프로젝트 동적 렌더링 및 모션 로직
├── update_pinned.js           # 오라클 VM 서버용 GitHub GraphQL 동기화 스크립트
├── LICENSE                    # All Rights Reserved 라이센스 명시
└── README.md                  # 본 문서
```

## 서버 연동 (오라클 VM 환경 세팅)

오라클 VM 서버에서 깃허브 핀 정보를 30분 주기로 동기화하기 위해 다음과 같이 크론탭(Crontab)을 등록하여 운영합니다.

### 1. 동기화 스크립트 수동 테스트

```bash
GITHUB_TOKEN="본인의_GITHUB_TOKEN" node update_pinned.js /path/to/web_root/pinned-repos.json
```

### 2. 크론탭(Cron Job) 주기 설정

```bash
# 30분마다 백그라운드에서 동기화 스크립트를 실행하여 정적 JSON 갱신
*/30 * * * * GITHUB_TOKEN="본인의_GITHUB_TOKEN" node /path/to/web_root/update_pinned.js /path/to/web_root/pinned-repos.json >> /path/to/web_root/cron_log.log 2>&1
```

## 라이센스 (License)

본 웹사이트의 소스코드, 디자인 레이아웃, 자기소개 텍스트를 포함한 모든 저작권은 **허준호(4season)** 에게 있으며, **All Rights Reserved** 라이센스 하에 보호받습니다. 저작권자의 서면 동의 없는 무단 도용 및 상업적 복제를 금지합니다.
