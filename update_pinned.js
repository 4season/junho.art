/**
 * GitHub Pinned Repositories Static JSON Updater
 * 
 * [설명]
 * 오라클 VM 서버에서 30분마다 Cron Job으로 실행할 0-dependency Node.js 스크립트입니다.
 * 외부 라이브러리(axios, node-fetch 등)를 전혀 쓰지 않아 npm install 없이 즉시 구동됩니다.
 * 
 * [실행 방법]
 * GITHUB_TOKEN="본인의_토큰" node update_pinned.js /path/to/web_root/pinned-repos.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. 실행 인자 및 환경 변수 검사
const outputFilePath = process.argv[2];
if (!outputFilePath) {
    console.error("오류: 출력할 JSON 파일 경로를 인자로 전달해주세요.");
    console.error("사용법: node update_pinned.js <output_file_path>");
    process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error("오류: GITHUB_TOKEN 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
}

const GITHUB_USERNAME = '4season';

// 2. GitHub GraphQL 쿼리 정의
const query = JSON.stringify({
    query: `
    query {
      user(login: "${GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
              repositoryTopics(first: 10) {
                nodes {
                  topic {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `
});

// 3. API 호출 옵션 설정
const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'Node-Oracle-Server-Cron',
      'Content-Length': Buffer.byteLength(query)
    }
};

// 4. API 요청 전송
console.log("GitHub GraphQL API 호출 중...");
const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`오류: API 응답 실패 (HTTP 상태 코드: ${res.statusCode})`);
            console.error(data);
            process.exit(1);
        }

        try {
            const json = JSON.parse(data);
            
            if (json.errors) {
                console.error("오류: GitHub GraphQL 응답 에러:", JSON.stringify(json.errors));
                process.exit(1);
            }

            const nodes = json.data.user.pinnedItems.nodes || [];
            
            // 포트폴리오에 알맞은 구조로 데이터 가공
            const pinnedRepos = nodes.map(repo => {
                const topics = repo.repositoryTopics && repo.repositoryTopics.nodes
                    ? repo.repositoryTopics.nodes.map(n => n.topic.name)
                    : [];

                return {
                    name: repo.name,
                    description: repo.description,
                    url: repo.url,
                    stars: repo.stargazerCount,
                    forks: repo.forkCount,
                    language: repo.primaryLanguage ? repo.primaryLanguage.name : null,
                    languageColor: repo.primaryLanguage ? repo.primaryLanguage.color : null,
                    topics: topics
                };
            });

            // 지정한 출력 경로에 JSON 정적 파일 쓰기
            const absolutePath = path.resolve(outputFilePath);
            fs.writeFileSync(absolutePath, JSON.stringify(pinnedRepos, null, 2), 'utf-8');
            console.log(`성공: Pinned Repositories 동기화 완료!`);
            console.log(`파일 저장 경로: ${absolutePath}`);
            console.log(`연동된 저장소 개수: ${pinnedRepos.length}개`);
            
        } catch (err) {
            console.error("오류: 응답 데이터 파싱 및 파일 쓰기 실패:", err.message);
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.error("오류: HTTP 요청 실패:", err.message);
    process.exit(1);
});

req.write(query);
req.end();
