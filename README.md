# Soyeong Kim — Knowledge Cosmos

AI Agent 연구개발자이자 AI Native Engineer 김소영의 개인 포트폴리오다. 경력, 프로젝트, 개인 기여와 역량을 연결한 온톨로지를 3D 지식 그래프로 탐색한다.

- 포트폴리오: [kimsoyeong.github.io](https://kimsoyeong.github.io/)
- 기술 학습과 논문 리뷰: [소소한 코딩일지](https://soso-cod3v.tistory.com/)

GitHub 포트폴리오는 **어떤 일을 했고, 무엇에 기여했으며, 어떤 역량을 갖췄는지**를 보여준다. Tistory는 기술, 논문 리뷰와 공부 과정을 기록한다. 기존 Freeform 글의 주소도 유지한다.

## 화면과 탐색

- **Intro**: 커서에 반응하는 별 배경과 대표 작업으로 진입한다.
- **Cosmos**: 노드 선택, 검색과 카테고리 필터, 노드 드래그, 시점 회전, 확대 및 축소, 연결선 토글을 제공한다. 자동 회전 중에는 커서 기반 시점 반응을 끈다.
- **Work / Research / About**: 재직 중 수행한 업무, 본인 논문, 경력과 역량을 읽는다. Work는 확인된 `duringExperience` 기여에서 구성하며, 독립 프로젝트가 아닌 사내 플랫폼 설계 업무도 포함한다.
- **Connected knowledge**: 선택한 항목의 직접 이웃을 그래프로 보여준다. 목록 보기로 전환할 수 있다.
- **Ontology**: 실제 사례를 통해 노드, 속성, 관계와 해석 기준을 설명한다.
- **상세 보기**: 근거 자료, 이미지와 영상, 연결 경로를 제공한다. About과 Ontology의 목차는 본문과 독립적으로 유지되며 현재 섹션을 강조한다.

About에서는 에이전트 설계, 평가, 플랫폼 통합의 세 가지 핵심 역량과 대표 업무를 먼저 제시한다. 나머지 기반 역량은 펼쳐 볼 수 있으며, 이미지와 영상보다 경력 및 역할을 앞에 둔다. 역량 상세의 `Experience & evidence`는 확인된 개인 기여와 해당 기여의 사용 기술을 연결한다. 프로젝트 기술 목록 전체를 개인 사용 경험으로 확대하지 않는다.

프로젝트 상세는 문제, 개인 기여, 설계와 구현, 결과 또는 현재 진행 단계 순서로 읽는다. 사내 적용, 개발 중, 평가 케이스 구성 전과 팀 프로토타입을 구분한다. 성과 수치에는 적용 맥락과 출처를 붙이며, 기술 블로그 이전 계획과 미확인 경험은 공개 성과에 포함하지 않는다.

별 배경은 장식이고 지식 노드가 아니다. 화면에서 노드를 이동하거나 연결선을 숨겨도 온톨로지 데이터는 변하지 않는다.

## 기술 구성

React 18, React Router, Create React App을 사용한다. Cosmos는 Canvas 2D에 3D 좌표를 투영하고, 상세의 연결 그래프는 SVG와 HTML로 표시한다. 콘텐츠와 관계는 정적 JSON이므로 별도 API, LLM 또는 그래프 DB 서버 없이 GitHub Pages에서 실행된다.

| 경로 | 역할 |
|---|---|
| `/` | Knowledge Cosmos 포트폴리오 |
| `/freeform` | 기존 기술 글 목록 |
| `/freeform/:slug` | 기존 글 본문 |

`public/404.html`과 `public/index.html`은 GitHub Pages에서 SPA의 직접 URL 진입을 복원한다.

## 로컬 실행

Node.js 18 이상, npm과 Python 3.10 이상이 필요하다. 빌드 전에 Cosmos Engine이 승인된 온톨로지 데이터로 정적 그래프를 생성한다.

```bash
npm ci
npm start
```

개발 서버 기본 주소는 `http://localhost:3000`이다.

## 온톨로지 모델

핵심 관계는 다음과 같다.

```text
Person → workedOn → Project
Person → hasContribution → Contribution → inProject → Project
Contribution → demonstrates → Capability

Person → hasExperience → Experience → atOrganization → Organization
Person → hasEducation → Education → atInstitution → Organization

Person → owns → PublicationChannel
Person → authored → Writing / Review / Paper
Writing / Review → publishedIn → PublicationChannel
```

프로젝트에 참여했다는 사실과 본인이 맡은 범위를 구분한다. 역량은 개인의 실제 기여를 근거로 연결한다. 에이전트 구조 설계, SDK 활용, 플랫폼 구성과 Workflow 설계는 하나의 `Agent Design & Development` 역량으로 묶고 RCA, 사내 플랫폼 업무, PreFlight의 기여를 각각 근거로 연결한다. SDK와 프레임워크는 `Technology`로 구분하며 실제 사용한 기여의 범위를 다른 프로젝트로 확장하지 않는다. 글을 읽거나 특정 기술을 프로젝트 목록에 기재했다는 이유만으로 실무 역량을 만들지 않는다.

`Paper`는 본인 저술 논문, `Review`는 외부 자료에 대한 본인 리뷰, `Writing`은 본인 기술 글이다. 리뷰한 원논문은 필요에 따라 리뷰의 `references` 속성으로 보관한다.

각 기록의 `evidenceIds`는 근거 출처를 가리킨다. 관계의 `assertionStatus`는 `sourced`, `proposed`, `disputed`를 구분한다. `visibility`와 내용별 승인 해시를 사용해 공개할 기록을 빌드 시점에 선별한다. 비공개 원문, 추출 후보, 로컬 이력은 사이트에 포함하지 않는다. 정적 사이트에 게시된 JSON은 누구나 읽을 수 있다.

### 데이터 갱신

원본은 `design/ontology-cosmos/ontology.sample.json`이다. 파일명에 sample이 있지만 현재 앱 데이터를 만드는 편집 원본이다. `src/components/Cosmos/graph.json`만 직접 수정하면 재생성할 때 덮어써진다.

1. 원본의 노드, 기본 관계, 출처 및 상태를 수정한다. 기존 항목의 ID는 유지한다.
2. 변경 내용을 검토하고 해당 기록의 공개 승인을 갱신한다. 기존 승인 해시는 내용이 바뀌면 유효하지 않다.
3. 승인된 자료로 앱 그래프와 검색 데이터를 생성하고 검증한다.
4. 원본, 공개 정책, 생성 결과와 관련 코드를 함께 커밋한다.

```bash
npm run cosmos:update -- --no-extract
npm run cosmos:validate
npm run cosmos:test
```

`cosmos/schema.json`은 타입과 관계 계약, `cosmos/policy.json`은 공개 승인과 제외 정책이다. `cosmos/legacy-enrichment.json`은 기존 자료의 확정된 보완 정보다. 새 입력과 추출 후보는 Git에서 제외되는 `cosmos/inbox/`와 `.cosmos/`에 보관한다. [Cosmos Engine 사용법](packages/cosmos-engine/README.md)에서 자료 추가와 검토 절차를 확인할 수 있다.

`workedOn`, `workedAt`, `studiedAt`, `participatedIn`은 확인된 두 단계 관계에서 생성되는 직접 탐색 관계다. 원본에 수동으로 추가하지 않는다. `basisPaths`에 근거 관계 ID를 보존하고, 근거가 삭제되거나 확인 상태가 바뀌면 다시 계산한다. 이는 정해진 규칙에 따른 파생 관계이며, 문서에서 추출한 후보는 별도의 검토와 공개 승인이 필요하다.

생성 과정의 비교용 `design/ontology-cosmos/cosmos-3d/graph.json`은 앱에서 읽지 않는다. 앱은 `src/components/Cosmos/graph.json`을 사용하고, 공개 그래프와 검색 색인, JSON-LD는 `public/cosmos/`에 생성된다. 로컬 관리 도구는 GitHub Pages에 포함하지 않는다.

## 검증

```bash
npm run lint
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

- lint는 `src`의 JavaScript와 JSX 전체를 검사하며 경고도 실패로 처리한다.
- 테스트는 그래프 연결, 근거 경로, 미디어 선택, 상세 보기, 목차와 기존 글 이동을 검증한다.
- Python 검증기는 관계 타입, 참조, 근거, 저술 구분, 기여와 역량, 게시 공간 및 생성된 직접 관계를 검사한다.

## GitHub Pages 배포

소스는 `main`, 배포 산출물은 `gh-pages` 브랜치에 보관한다. **main에 푸시하는 것만으로 사이트가 갱신되지는 않는다.** GitHub Pages 설정은 `gh-pages` 브랜치의 루트(`/`)를 사용한다.

검증한 커밋의 깨끗한 체크아웃에서 실행한다. `npm run deploy`는 먼저 빌드하므로 작업 폴더의 미커밋 변경도 포함할 수 있다.

```bash
npm ci
npm run lint
CI=true npm test -- --watchAll=false --runInBand
npm run deploy -- --nojekyll -u "kimsoyeong <soyeong.kim9@gmail.com>" -m "Deploy Knowledge Cosmos"
```

기존에 검증한 산출물을 다시 빌드하지 않고 배포하려면 다음 명령을 사용한다.

```bash
npx --no-install gh-pages -d build --nojekyll -u "kimsoyeong <soyeong.kim9@gmail.com>" -m "Deploy Knowledge Cosmos"
```

출력 폴더를 바꾸려면 `BUILD_PATH` 환경 변수로 빌드하고 `gh-pages -d`에 같은 경로를 지정한다. 배포 후 GitHub Pages 빌드 성공과 실제 사이트의 새 화면 및 직접 글 URL을 확인한다.

## 변경 및 커밋 규칙

이 저장소의 커밋 작성자는 항상 다음 값을 사용한다. GitHub 인증 계정은 작성자 설정과 별도로 확인한다.

```bash
git config --local user.name kimsoyeong
git config --local user.email soyeong.kim9@gmail.com
```

Co-author를 추가하지 않는다. UI, 데이터, 검증, 문서는 의미 있는 변경 단위로 나누고 각 커밋을 검증한다. PDF 원본, 디자인 시안, 개인 작업 자료와 무관한 변경은 커밋 및 배포에 포함하지 않는다.
