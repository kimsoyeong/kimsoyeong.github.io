# Daily Report 운영

## 실행 환경

React 18 / Create React App 5 / React Router 7 / Tailwind 3.
홈은 scoped CSS, 리포트는 독립적인 라이트 테마 CSS를 사용한다.
react-markdown / remark-gfm 재사용, Mermaid / DOMPurify 추가.

## 매일 실행

Codex 앱의 `매일 에이전트 기술 리포트 발행` 자동화가 매일 07:00 KST에 로컬 프로젝트에서 실행된다.
Mac과 Codex 앱이 실행 가능한 상태이며 인터넷에 연결돼 있어야 한다.
07:30 열람을 목표로 하지만 절전, 네트워크, 구독 한도, GitHub Actions 대기열에 따라 지연될 수 있다.

1. Python 표준 라이브러리가 여섯 키워드의 Google News RSS와 AI 전문 매체 RSS를 수집한다.
2. 발행 시각이 최근 24시간인 자료만 선별한다. GitHub Trending은 별도 스냅샷이다.
3. ChatGPT 구독으로 로그인한 Codex CLI가 `gpt-6-luna`, `model_reasoning_effort="low"`로 구조화된 초안을 생성한다.
4. 출처 ID와 형식을 검증하고 세로형 Mermaid를 포함한 `public/daily-reports/YYYY-MM-DD.md`를 저장한다.
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
직접 접근은 기존 GitHub Pages 404 SPA 복원 스크립트를 사용한다.

- 최신: https://kimsoyeong.github.io/daily
- 날짜 지정: https://kimsoyeong.github.io/daily/2026-10-27

뉴스 수집/구독 인증/출처 검증이 실패하면 가짜 리포트를 만들지 않는다.
같은 날짜의 리포트를 덮어쓰지 않는다. 재실행은 중복 없이 푸시/배포를 복구한다.
원격 인프라가 아직 없으면 실행기는 생성 전에 실패한다.
사용자 작업 디렉터리의 다른 변경과 staged 파일은 자동 커밋에 포함하지 않는다.
