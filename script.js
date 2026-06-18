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
