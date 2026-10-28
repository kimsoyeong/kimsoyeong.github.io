# Daily Report 운영

## 실행 환경

React 18 / Create React App 5 / React Router 7 / Tailwind 3.
홈은 scoped CSS, 리포트는 독립적인 라이트 테마 CSS를 사용한다.
react-markdown / remark-gfm 재사용, Mermaid / DOMPurify 추가.

## 매일 실행

Codex 앱의 `매일 에이전트 기술 리포트 발행` 자동화가 매일 07:00 KST에 로컬 프로젝트에서 실행된다.
Mac과 Codex 앱이 실행 가능한 상태이며 인터넷에 연결돼 있어야 한다.
07:30 열람을 목표로 하지만 절전, 네트워크, 구독 한도, GitHub Actions 대기열에 따라 지연될 수 있다.

1. Python 표준 라이브러리가 공식 기술 채널, 여섯 키워드의 Google News RSS, AI 전문 매체를 수집한다. 공식 채널은 OpenAI News, Anthropic News/Engineering/Research, Google DeepMind/Research, Hugging Face, LangChain, NVIDIA Developer, Microsoft Research, AWS Machine Learning이다. 전문 매체는 TechCrunch AI, The Decoder, MIT Technology Review AI, The Register, BleepingComputer다.
2. 발행 시각이 최근 24시간인 자료만 선별하고, 이전 리포트의 기사 URL/제목과 GitHub 저장소를 제외한다. 같은 사건의 재보도는 이전 제목을 모델에 전달해 추가로 걸러낸다. GitHub Trending은 별도 스냅샷이다.
3. ChatGPT 구독으로 로그인한 Codex CLI가 `gpt-6-luna`, `model_reasoning_effort="low"`로 구조화된 초안을 생성한다.
4. 내용 요약 제목, 전체 3줄 요약, 기술/산업 영향과 검증 행동/한계, 출처 ID를 검증하고 시스템 구조 변화에만 세로형 Mermaid를 포함한 `public/daily-reports/YYYY-MM-DD.md`를 저장한다.
5. 임시 clone에서 새 리포트 파일만 커밋/푸시한다. GitHub Actions가 빌드와 Pages 배포를 완료한다.

API 키 또는 GitHub OPENAI_API_KEY Secret은 필요 없다.
GitHub Actions는 콘텐츠 생성 없이 push / 수동 실행으로 배포한다. 생성 스케줄은 로컬 Codex 자동화에만 있다.

## 수동 실행

```sh
# 실제 생성과 푸시/배포 트리거
npm run daily:publish

# 생성만, 푸시 없음
npm run daily:generate

# 모델 사용 없이 실제 수집 자료 확인
python3 scripts/generate_report.py --collect-only

# 로컬 뷰어
npm start

# 검증
npm run daily:test
CI=true npm test -- --watchAll=false --runInBand
```

최초 npm 의존성 설치는 완료됐다. 새 checkout에서는 `npm ci`를 실행한다.
Python 3.11 이상을 사용한다. pip 패키지 설치는 필요 없다.
기존 build 디렉터리가 root 소유인 환경에서는 `BUILD_PATH=/tmp/kimsoyeong-daily-build npm run build`로 검증한다.

## 인증과 배포

```sh
# 사용자 셸 PATH에 gh가 없을 때
/opt/homebrew/bin/gh auth login -h github.com
/opt/homebrew/bin/gh auth setup-git

# Codex 구독 인증 상태
codex login status
```

Pages 설정은 GitHub Actions 방식이다. 워크플로우는 `.github/workflows/daily-post.yml`.
리포트 목록 index.json은 prestart / prebuild에서 생성되며 커밋하지 않는다.
목록은 모바일에서 날짜 목록, 900px 이상 데스크톱에서 월별 달력으로 표시한다. 발행된 날짜만 개별 리포트로 연결한다.
요약 제목은 새 리포트의 H1에서 읽는다. 기존 발행본의 짧은 제목은 titles.json, 검증된 저장소 설명은 repositories.json에 보관해 원문을 바꾸지 않는다.
기존 발행본의 3줄 요약 교정은 summaries.json에 보관한다. 요약은 주체, 실제 결과, 확인된 조건이나 한계를 명시하고 발표자의 주장과 검증 완료를 구분한다.
개별 리포트는 내용 요약을 큰 제목으로 표시하고 그 아래 날짜를 작은 글씨로 표시한다. 전체 3줄 요약 콜아웃과 번호가 있는 목차를 제공한다. 기본 라이트 테마와 저장되는 다크모드를 지원한다.
postbuild는 /daily와 발행 날짜별 index.html을 생성해 GitHub Pages 직접 접근 시 404 응답을 피한다.
기타 경로에는 기존 SPA 복원 스크립트가 유지된다.

조사 주제는 AI 모델/에이전트뿐 아니라 주요 기술기업의 합병/사업 재편, 로봇/자율주행, 반도체/데이터센터/우주 인프라, 광범위한 소프트웨어 취약점과 AI 보안 사건까지 포함한다.
이 주제들은 매일 채워야 하는 고정 섹션이 아니다. 최근 24시간 내 중요한 신규 변화와 확인 가능한 근거가 있을 때만 전체 2~3개 핵심 트렌드 후보로 선택한다.
합병 검토와 합병 확정, 취약점 발견과 실제 악용을 구분하고, 지난 기사에 새 전개가 없다면 다시 싣지 않는다.

공식 본문 수집이 막히면 RSS 요약만 사용했다고 표시한다. 최근 글이 없는 채널과 수집 실패를 구분하고 출처 점검에 기록한다.
본문의 중요한 원본 도표/이미지는 수집한 HTTPS URL과 설명을 모델에 제공하고, 인용한 출처의 이미지 중 필요한 것만 선택한다. 이미지 URL을 생성하거나 로고/추적 이미지를 싣지 않는다. 원문 이미지와 출처 링크를 함께 표시하며 외부 호스트에서 이미지 제공을 중단하면 원본 링크로 확인할 수 있다.
GitHub 섹션은 일간 Trending에서 이전에 소개하지 않은 AI/개발 도구를 보여준다. 신규 출시 목록이 아니며, 공개 API 설명/주제/언어를 함께 제시한다.

- 날짜별 목록: https://kimsoyeong.github.io/daily
- 개별 리포트/본문 목차: https://kimsoyeong.github.io/daily/2026-10-27

뉴스 수집/구독 인증/출처 검증이 실패하면 가짜 리포트를 만들지 않는다.
같은 날짜의 리포트를 덮어쓰지 않는다. 재실행은 중복 없이 푸시/배포를 복구한다.
원격 인프라가 아직 없으면 실행기는 생성 전에 실패한다.
사용자 작업 디렉터리의 다른 변경과 staged 파일은 자동 커밋에 포함하지 않는다.
