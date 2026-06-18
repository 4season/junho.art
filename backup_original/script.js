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
    'junho.art': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800'     // 포트폴리오 웹사이트 이미지
};

// 가독성을 위한 프로젝트별 영문 설명 매핑 테이블 (GitHub 설명보다 우선 반영됨)
const PROJECT_DESCRIPTIONS = {
    'Magnolia': 'An intelligent KakaoTalk chatbot built with Go, Rust, and Kotlin, designed to process notification data and automate tasks.',
    'sobdm-project': 'A Multilayer Perceptron (MLP) model to predict arrival delays for Seongnam-si City Bus Route 109.',
    'ConvDDI': 'A Convolutional Neural Network (CNN) model for detecting drug-to-drug interactions.',
    'junho.art': 'A personal responsive portfolio website built with HTML, CSS, and JavaScript to showcase developer logs.'
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
        name: '포트폴리오 웹사이트',
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

        // 카드 컴포넌트 마크업 생성 (기존 디자인 및 클래스 구조 그대로 유지)
        htmlContent += `
                <div class="project-card">
                    <img src="${project.image}" alt="${project.name} 프로젝트 이미지">
                    <h3>${project.name}</h3>
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
        const response = await fetch(LOCAL_JSON_URL);
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

            // 한글 명칭 특별 맵핑 (junho.art인 경우 화면에 포트폴리오 웹사이트로 표시)
            const displayName = repo.name === 'junho.art' ? '포트폴리오 웹사이트' : repo.name;

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
    document.addEventListener('DOMContentLoaded', loadGitHubProjects);
} else {
    loadGitHubProjects(); // Cloudflare Rocket Loader 등으로 인해 이미 로드가 완료된 경우 즉시 실행
}

