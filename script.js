// DOM 요소들을 가져옵니다.
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const navDrawer = document.getElementById('navDrawer');

// 햄버거 메뉴 버튼을 클릭했을 때
menuBtn.addEventListener('click', () => {
    navDrawer.classList.add('active'); // 네비게이션 드로어에 'active' 클래스를 추가해서 보이게 함
});

// 닫기 버튼을 클릭했을 때
closeBtn.addEventListener('click', () => {
    navDrawer.classList.remove('active'); // 'active' 클래스를 제거해서 숨김
});

// 드로어의 링크를 클릭했을 때도 드로어가 닫히게 (선택 사항)
const drawerLinks = navDrawer.querySelectorAll('a');
drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
        navDrawer.classList.remove('active');
    });
});

// === GitHub Pinned Projects 동적 연동 로직 ===

// 오라클 서버의 Cron Job이 생성해줄 정적 JSON 파일 경로
// 로컬 파일이므로 별도의 외부 도메인이나 CORS 프록시가 필요 없습니다.
const LOCAL_JSON_URL = 'pinned-repos.json';

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
    'Magnolia': 'An intelligent KakaoTalk chatbot built with Go, Rust, and Kotlin, designed to process notification data and automate tasks.',
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
        tags: ['Go', 'Rust', 'Kotlin', 'API', 'Chatbot']
    },
    {
        name: 'sobdm-project',
        description: PROJECT_DESCRIPTIONS['sobdm-project'],
        url: 'https://github.com/4season/sobdm-project',
        image: PROJECT_IMAGES['sobdm-project'],
        tags: ['Python', 'Machine-Learning', 'MLP']
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

        // Magnolia 프로젝트에 라이브 상태(미완성/진행중) 표시 배지 추가
        const isLive = project.name === 'Magnolia';
        const liveBadgeHTML = isLive 
            ? `<span class="live-indicator-badge"><span class="live-dot"></span>In Progress</span>` 
            : '';

        // 카드 컴포넌트 마크업 생성 (기존 디자인 및 클래스 구조 그대로 유지)
        htmlContent += `
                <div class="project-card glass-card">
                    <img src="${project.image}" alt="${project.name} 프로젝트 이미지">
                    <div class="project-card-header">
                        <h3>${project.name}</h3>
                        ${liveBadgeHTML}
                    </div>
                    <p>${project.description || 'GitHub 프로젝트 상세 설명이 제공되지 않았습니다.'}</p>
                    <div class="tags">
                        ${tagsHTML}
                    </div>
                    <a href="${project.url}" class="project-link" target="_blank">자세히 보기 &rarr;</a>
                </div>`;
    });

    projectGrid.innerHTML = htmlContent;
}

// GitHub API를 통해 실시간 데이터를 가져오는 비동기 함수
async function loadGitHubProjects() {
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
        
    } catch (error) {
        console.warn('GitHub Pinned 연동 실패 (서버 생성 전이거나 오류), 기본 캐시 데이터로 표시합니다:', error);
        // JSON 로드 에러 시 기존 캐시 데이터 렌더링 (안전장치)
        renderProjects(DEFAULT_PROJECTS);
    }
}

// DOM이 완전히 로드되었는지 확인하고 GitHub 프로젝트 로딩 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadGitHubProjects();
        updateTimelineNowNode();
        updateTimelineProgress();
        // 5분(300,000ms)마다 백그라운드에서 자동으로 핀 프로젝트 정보를 최신으로 갱신합니다.
        setInterval(loadGitHubProjects, 300000);
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
    
    nowBadge.innerHTML = `<i class="fa-solid fa-location-crosshairs fa-spin"></i> 현재 여정 (${year}년 ${month}월)`;
}

// 타임라인 스크롤 프로그래스바 업데이트 함수
function updateTimelineProgress() {
    const timeline = document.querySelector('.timeline');
    const progressLine = document.querySelector('.timeline-line-progress');
    if (!timeline || !progressLine) return;
    
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // 타임라인 시작점이 화면 80%에 걸릴 때부터 진행률 업데이트 시작
    const timelineHeight = rect.height;
    const startY = windowHeight * 0.8;
    const currentY = rect.top;
    
    let progress = 0;
    if (currentY < startY) {
        const scrolled = startY - currentY;
        progress = (scrolled / timelineHeight) * 100;
    }
    
    // 0% ~ 100% 범위 제한
    progress = Math.max(0, Math.min(100, progress));
    
    progressLine.style.height = `${progress}%`;
}

// 스크롤 및 브라우저 크기 변경 리스너 등록
window.addEventListener('scroll', updateTimelineProgress);
window.addEventListener('resize', updateTimelineProgress);


