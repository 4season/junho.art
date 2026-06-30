const isEnglish = document.documentElement.lang === 'en';
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const navDrawer = document.getElementById('navDrawer');

if (menuBtn && closeBtn && navDrawer) {
    menuBtn.addEventListener('click', () => {
        navDrawer.classList.add('active');
    });
    closeBtn.addEventListener('click', () => {
        navDrawer.classList.remove('active');
    });
    navDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navDrawer.classList.remove('active');
        });
    });
}

// === GitHub Pinned Projects 동적 연동 로직 ===

const LOCAL_JSON_URL = 'pinned-repos.json';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let isFetching = false;

// 기본 대표 이미지 매핑 테이블
const PROJECT_IMAGES = {
    'Magnolia': './img/IMG_8978.jpg',
    'sobdm-project': 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=800', // 성남시 109번 마을버스와 유사한 한국식 초록색 버스 이미지
    'ConvDDI': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=800',     // 약물 상호작용 관련 알약/의약 이미지
    'junho.art': './img/portfolio_preview.png',                                               // 포트폴리오 웹사이트 이미지
    'TrendXiv': './img/trendxiv_preview.png'                                                  // 트렌드 예측 프로젝트 이미지
};

// 가독성을 위한 프로젝트별 영문 설명 매핑 테이블 (GitHub 설명보다 우선 반영됨)
const PROJECT_DESCRIPTIONS = {
    'Magnolia': 'An API server that processes notification data, and an APK that broadcasts to KakaoTalk.',
    'sobdm-project': 'A Multilayer Perceptron (MLP) model to predict arrival delays for Seongnam-si City Bus Route 109.',
    'ConvDDI': 'A Convolutional Neural Network (CNN) model for detecting drug-to-drug interactions.',
    'junho.art': 'A personal responsive portfolio website built with HTML, CSS, and JavaScript to showcase developer logs.',
    'TrendXiv': 'A machine learning system that predicts academic research trends on arXiv using Principal Component Analysis (PCA) and classifier models.'
};

// 기본 프로젝트 목록 (JSON 생성 전 또는 연동 실패 시 Fallback으로 표시할 고정 정보)
const DEFAULT_PROJECTS = [
    {
        name: 'Magnolia',
        description: PROJECT_DESCRIPTIONS['Magnolia'],
        url: 'https://github.com/4season/Magnolia',
        image: PROJECT_IMAGES['Magnolia'],
        tags: ['Rust', 'Go', 'API', 'KakaoTalk']
    },
    {
        name: 'sobdm-project',
        description: PROJECT_DESCRIPTIONS['sobdm-project'],
        url: 'https://github.com/4season/sobdm-project',
        image: PROJECT_IMAGES['sobdm-project'],
        tags: ['Python', 'Rust', 'R', 'MLP', 'Machine-Learning']
    },
    {
        name: 'ConvDDI',
        description: PROJECT_DESCRIPTIONS['ConvDDI'],
        url: 'https://github.com/4season/ConvDDI',
        image: PROJECT_IMAGES['ConvDDI'],
        tags: ['Python', 'Deep-Learning', 'CNN']
    },
    {
        name: 'Portfolio Website',
        description: PROJECT_DESCRIPTIONS['junho.art'],
        url: 'https://github.com/4season/junho.art',
        image: PROJECT_IMAGES['junho.art'],
        tags: ['HTML', 'CSS', 'JavaScript']
    },
    {
        name: 'TrendXiv',
        description: PROJECT_DESCRIPTIONS['TrendXiv'],
        url: 'https://github.com/4season/TrendXiv',
        image: PROJECT_IMAGES['TrendXiv'],
        tags: ['Python', 'Machine-Learning', 'Data-Analysis']
    }
];

// 프로젝트 카드 HTML 동적 생성 및 렌더링 함수
function renderProjects(projects) {
    const projectGrid = document.getElementById('projectGrid');
    if (!projectGrid) return;

    let htmlContent = '';
    
    projects.forEach(project => {
        // 태그 HTML 빌드
        const tagsHTML = project.tags
            .map(tag => `<span>${tag}</span>`)
            .join('\n                        ');

        // Magnolia 및 포트폴리오 웹사이트 프로젝트에 라이브 상태(미완성/진행중) 표시 배지 추가
        const isLive = project.name === 'Magnolia' || project.name === 'Portfolio Website' || project.name === 'junho.art';
        const liveBadgeHTML = isLive 
            ? `<span class="live-indicator-badge"><span class="live-dot"></span>In Progress</span>` 
            : '';

        // 카드 컴포넌트 마크업 생성 (기존 디자인 및 클래스 구조 그대로 유지)
        const altText = isEnglish ? `${project.name} Project Image` : `${project.name} 프로젝트 이미지`;
        const fallbackDesc = isEnglish ? 'No detailed description provided on GitHub.' : 'GitHub 프로젝트 상세 설명이 제공되지 않았습니다.';
        const viewLinkText = isEnglish ? 'View Details' : '자세히 보기';

        htmlContent += `
                <div class="project-card glass-card">
                    <img src="${project.image}" alt="${altText}">
                    <div class="project-card-header">
                        <h3>${project.name}</h3>
                        ${liveBadgeHTML}
                    </div>
                    <p>${project.description || fallbackDesc}</p>
                    <div class="tags">
                        ${tagsHTML}
                    </div>
                    <a href="${project.url}" class="project-link" target="_blank">${viewLinkText} &rarr;</a>
                </div>`;
    });

    projectGrid.innerHTML = htmlContent;
}

async function loadGitHubProjects() {
    if (isFetching) return;
    isFetching = true;
    try {
        // 캐시 방지를 위해 타임스탬프 쿼리 매개변수를 추가하여 매번 최신 데이터를 받아오도록 합니다.
        const response = await fetch(`${LOCAL_JSON_URL}?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`정적 JSON 파일 읽기 실패 (상태 코드: ${response.status})`);
        }
        
        const pinnedRepos = await response.json();
        
        if (!Array.isArray(pinnedRepos) || pinnedRepos.length === 0) {
            throw new Error("가져온 핀 저장소 데이터가 비어있거나 올바르지 않습니다.");
        }

        // 로컬 JSON 데이터를 포트폴리오 모델 구조로 매핑
        const projects = pinnedRepos.map(repo => {
            // 태그 설정 (토픽이 있으면 사용하고, 없으면 language를 기본 태그로 사용)
            let tags = repo.topics ? repo.topics.filter(t => t !== 'portfolio') : [];
            if (tags.length === 0 && repo.language) {
                tags = [repo.language];
            }

            // 대표 이미지 설정 (매핑 테이블에 등록되어 있다면 사용하고, 없으면 GitHub 공식 og:image 활용)
            let image = PROJECT_IMAGES[repo.name];
            if (!image) {
                image = `https://opengraph.githubassets.com/1/4season/${repo.name}`;
            }

            // 설명 영어 통일 및 매핑 (로컬 매핑 테이블에 영어 설명이 지정되어 있다면 우선 채움)
            const description = PROJECT_DESCRIPTIONS[repo.name] || repo.description;

            // 영어 명칭 특별 맵핑 (junho.art인 경우 화면에 Portfolio Website로 표시)
            const displayName = repo.name === 'junho.art' ? 'Portfolio Website' : repo.name;

            return {
                name: displayName,
                description: description,
                url: repo.url,
                image: image,
                tags: tags
            };
        });

        renderProjects(projects);
        isTimelineLayoutCached = false;
        updateTimelineProgress();
    } catch (error) {
        console.warn('GitHub Pinned 연동 실패 (서버 생성 전이거나 오류), 기본 캐시 데이터로 표시합니다:', error);
        renderProjects(DEFAULT_PROJECTS);
        isTimelineLayoutCached = false;
        updateTimelineProgress();
    } finally {
        isFetching = false;
    }
}

// DOM이 완전히 로드되었는지 확인하고 GitHub 프로젝트 로딩 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadGitHubProjects();
        updateTimelineNowNode();
        updateTimelineProgress();
        setInterval(loadGitHubProjects, REFRESH_INTERVAL_MS);
    });
} else {
    loadGitHubProjects();
    updateTimelineNowNode();
    updateTimelineProgress();
    // 5분(300,000ms)마다 백그라운드에서 자동으로 핀 프로젝트 정보를 최신으로 갱신합니다.
    setInterval(loadGitHubProjects, 300000);
}

// === CSS view-timeline 미지원 브라우저용 스크롤 리빌 폴백 ===
function initScrollRevealFallback() {
    // 브라우저가 view-timeline을 지원하는지 체크
    const supportsViewTimeline = CSS.supports && CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    
    if (!supportsViewTimeline) {
        // 미지원 브라우저일 때 HTML/Body에 no-view-timeline 클래스 부여
        document.documentElement.classList.add('no-view-timeline');
        
        // IntersectionObserver를 이용한 인뷰(in-view) 체크
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // 15% 이상 보일 때 활성화
        };
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    // 한번 보이면 관찰을 중단하여 성능 확보 (일방향 페이드인 효과)
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // 대상 요소 관찰 시작
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
}

// 초기화 함수 실행 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollRevealFallback);
} else {
    initScrollRevealFallback();
}

// 여정 타임라인의 현재 시점 실시간 업데이트 함수
function updateTimelineNowNode() {
    const nowBadge = document.querySelector('.timeline-now-node .now-badge');
    if (!nowBadge) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 0-indexed
    
    if (isEnglish) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const engMonth = monthNames[today.getMonth()];
        nowBadge.innerHTML = `<i class="fa-solid fa-location-crosshairs fa-spin"></i> Current Journey (${engMonth} ${year})`;
    } else {
        nowBadge.innerHTML = `<i class="fa-solid fa-location-crosshairs fa-spin"></i> 현재 여정 (${year}년 ${month}월)`;
    }
}

// 타임라인 좌표 및 높이를 캐시하여 스크롤 성능 향상 (레이아웃 스래싱 방지)
let cachedTimelinePageTop = 0;
let cachedTimelineHeight = 0;
let cachedNowNodeOffsetTop = 0;
let isTimelineLayoutCached = false;

function cacheTimelineLayout() {
    const timeline = document.querySelector('.timeline');
    const nowNode = document.querySelector('.timeline-now-node');
    if (!timeline) return;

    // 절대 페이지 탑 좌표 계산
    let top = 0;
    let el = timeline;
    while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
    }
    cachedTimelinePageTop = top;
    cachedTimelineHeight = timeline.offsetHeight;

    if (nowNode) {
        // .timeline-now-node의 offsetTop은 부모인 .timeline 기준
        cachedNowNodeOffsetTop = nowNode.offsetTop + (nowNode.offsetHeight / 2);
    }
    isTimelineLayoutCached = true;
}

// 타임라인 스크롤 프로그래스바 업데이트 함수
function updateTimelineProgress() {
    const timeline = document.querySelector('.timeline');
    const progressLine = document.querySelector('.timeline-line-progress');
    const nowNode = document.querySelector('.timeline-now-node');
    if (!timeline || !progressLine) return;
    
    // 캐시가 유효하지 않으면 갱신
    if (!isTimelineLayoutCached) {
        cacheTimelineLayout();
    }
    
    const scrollTop = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const startY = windowHeight * 0.8;
    
    let progress = 0;
    // 타임라인 시작점이 화면 80%에 걸릴 때부터 진행률 업데이트 시작
    if (scrollTop + startY > cachedTimelinePageTop) {
        const scrolled = (scrollTop + startY) - cachedTimelinePageTop;
        progress = (scrolled / cachedTimelineHeight) * 100;
    }
    
    // 현재 여정 노드(nowNode)가 존재할 경우, 선이 이 노드를 초과하여 나아가지 못하게 제한
    if (nowNode && cachedNowNodeOffsetTop > 0) {
        const maxProgress = (cachedNowNodeOffsetTop / cachedTimelineHeight) * 100;
        progress = Math.min(progress, maxProgress);
    }
    
    progress = Math.max(0, Math.min(100, progress));
    progressLine.style.height = `${progress}%`;
    const progressHeight = (progress / 100) * cachedTimelineHeight;
    const items = document.querySelectorAll('.timeline-item');

    items.forEach((item, index) => {
        const dot = item.querySelector('.timeline-dot');
        if (!dot) return;
        
        // 아이템의 top 좌표에 40px(점의 세로 중간값)을 더해 판정 높이 계산
        const itemY = item.offsetTop + 40; 
        
        const isActive = progressHeight >= itemY;
        
        if (isActive) {
            dot.classList.add('active');
            item.classList.add('active');
        } else {
            dot.classList.remove('active');
            item.classList.remove('active');
        }
    });
}

// 스크롤 및 브라우저 크기 변경 리스너 등록
window.addEventListener('scroll', updateTimelineProgress);

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    // 모바일 스크롤 시 주소창 여닫힘에 따른 높이(height) 단독 변화 시의 레이아웃 재계산(스래싱) 방지
    if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        isTimelineLayoutCached = false; // 가로 크기가 변경되었을 때만 캐시 무효화
        updateTimelineProgress();
    }
});

window.addEventListener('load', () => {
    isTimelineLayoutCached = false; // 이미지/폰트 등 모든 리소스 로드 시 캐시 무효화
    updateTimelineProgress();
});


