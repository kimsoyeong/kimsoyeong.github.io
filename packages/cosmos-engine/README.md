# Cosmos Engine

GitHub Pages 포트폴리오를 위한 로컬 온톨로지 빌드 패키지. 기존 Cosmos UI를 유지하며 새 프로젝트, 경력, 역량, 글, 논문 및 특허 기록을 확장한다.

## 시작

저장소 루트에서 Node 18+와 Python 3.10+가 필요하다.

```sh
npm install
npm run cosmos:update
```

기본 추출기는 **Codex SDK**이며 기존 Codex CLI 로그인 계정을 사용한다. API 키를 별도로 복사하지 않는다. 최초 설정이 필요하면 `codex login`을 실행한다. 앱 로그인과 CLI 로그인이 항상 같은 상태인 것은 아니므로 `codex login status`로 확인한다. SDK 추출은 계정 사용량을 소비한다. inbox가 비어 있거나 `--no-extract`이면 모델 호출은 없다.

`npm run build`도 승인 자료를 먼저 갱신한다. 이 단계에서는 LLM이나 외부 URL을 호출하지 않는다. GitHub Pages에는 정적 결과만 들어간다.

## 별도 웹 도구

```sh
npm run cosmos:studio
```

내장 브라우저에서 http://127.0.0.1:8770/ 을 열면 된다. 블로그와 별개인 로컬 앱이다. 파일 또는 메모 추가 → 추출 → 후보와 근거 검토 → 수정 저장 → 승인과 Cosmos 갱신을 제공한다. 그래프에서 노드를 선택하면 직접 연결된 관계와 출처를 확인할 수 있다. 승인 자료만 갱신하는 버튼은 LLM을 호출하지 않는다.

API 키는 서버를 시작한 셸의 환경변수로 설정한다. 브라우저에는 키를 전달하지 않는다. 서버는 loopback 주소에만 열리며 요청 토큰과 동일 출처를 검사한다. 종료는 실행한 터미널에서 Ctrl+C다. GitHub Pages에 이 관리 앱을 배포하지 않는다.

## 자료 추가와 승인

1. `cosmos/inbox/`를 만들고 자료를 넣는다. 이 폴더는 git에서 제외된다.
2. `npm run cosmos:update`로 새 자료를 추출하고 공개 가능한 기존 그래프를 갱신한다.
3. `npm run cosmos:review`에서 후보 ID, 변경 내용과 질문을 확인한다.
4. `.cosmos/review/<ID>.json`에서 잘못 추출한 내용과 확인 질문을 수정한다. 질문에 답한 뒤 `patch.questions`를 비운다.
5. 아래 명령 하나로 해당 후보를 승인하고 Cosmos까지 갱신한다.

```sh
npm run cosmos:update -- --approve <ID>
```

승인은 해당 후보의 proposed 관계를 sourced로 확정한다. disputed 관계는 먼저 해결해야 한다. 승인되지 않은 후보, 비공개 원문과 추출 인용문은 사이트에 들어가지 않는다. 새 동영상은 실제 재생을 확인한 뒤 미디어의 `playbackVerified: true`를 지정해야 한다.

원본 자료를 바꾸면 이전 후보는 승인할 수 없다. 내용과 모델 설정이 같으면 재추출하지 않는다. 원격 URL은 가져온 시점의 스냅샷으로 취급한다. 원격 내용이나 추출 context를 다시 확인하려면 `--refresh`를 쓴다.

```sh
npm run cosmos:update -- --refresh
npm run cosmos:update -- --dry-run
npm run cosmos:update -- --check
```

`--dry-run`과 `--check`는 외부 호출이나 파일 쓰기를 하지 않는다. `--check`는 승인된 자료와 생성 결과가 다르면 실패한다. 승인 후보를 지정한 dry-run에서는 예정 변경을 검증한다.

## LLM 연결 2가지

### 현재 로그인 계정의 Codex SDK

```sh
codex login
npm run cosmos:update -- --provider codex
```

선택적으로 `COSMOS_CODEX_MODEL`로 계정에서 이용 가능한 모델을 지정할 수 있다. 미설정이면 현재 Codex 기본 모델을 사용한다. SDK는 읽기 전용 임시 작업 공간에서 추출하며 파일 수정, 셸, 웹 검색 및 MCP 사용을 차단한다.

### OpenAI 호환 API

키를 채팅이나 저장소 파일에 쓰지 않는다. 셸 또는 로컬 비밀 관리 도구에서 아래 환경변수를 설정한다.

```sh
export COSMOS_LLM_PROVIDER=openai
export COSMOS_LLM_BASE_URL=https://api.openai.com/v1
export COSMOS_LLM_MODEL=<사용할-모델>
export COSMOS_LLM_API_KEY=<로컬에서-설정>
npm run cosmos:update
```

`OPENAI_API_KEY`도 대체 변수로 지원한다. Chat Completions의 JSON 응답을 지원하는 endpoint가 필요하다. 이미지 입력에는 해당 모델의 vision 지원이 필요하다. `.env.local`을 자동으로 읽지 않으므로 셸 환경에 변수가 있어야 한다. API 오류나 JSON 오류를 성공으로 기록하지 않는다.

LLM 없이 JSON 자료만 처리하려면 `--provider none`을 쓴다.

## 입력 형식

| 자료 | 처리 |
|---|---|
| JSON | 아래 구조의 변경 후보를 모델 없이 처리 |
| Markdown, 텍스트, 코드, CSV, HTML, SRT/VTT | 텍스트를 추출해서 선택한 모델에 전달. HTML의 script/style 제외 |
| DOCX, PPTX | 본문/슬라이드의 텍스트 추출. 이미지 및 도형 해석은 별도 이미지 입력 필요 |
| PDF | `pdftotext` 또는 설치된 `pypdf`로 텍스트 추출. 스캔/OCR 필요 자료는 확인 질문 반환 |
| PNG, JPEG, WebP, GIF | vision 입력. 사람의 원본 확인 후 승인 필요 |
| 음성 및 영상 | 같은 이름의 `.vtt`, `.srt`, `.txt` 자막을 이용. 직접 음성 전사나 전체 영상 분석을 했다고 표시하지 않음 |
| `.url` | 파일에 HTTPS URL 또는 `URL=https://...`를 저장. 공개 HTML/텍스트 페이지만 가져옴 |
| 로그인 제한, 비공개 URL, 미지원 바이너리 | 실패 또는 미처리 이유를 검토 질문으로 표시 |

파일 최대 12 MiB, 텍스트 최대 160,000자다. 큰 자료는 분할해야 하며 조용히 잘라내지 않는다. 사용자 대화나 Librarian 내보내기는 텍스트 또는 JSON으로 넣는다. 브라우저 로그인 세션을 자동 복사하거나 내부 폴더를 탐색하지 않는다.

## 구조화 입력 예시

`cosmos/inbox/project.json`에 아래처럼 추가한다. 실제 프로젝트 내용으로 바꾸고 필요한 기여 및 역량 관계를 추가한다. 이 예시는 최소 프로젝트 등록이며 개인 수행을 임의로 추론하지 않는다.

```json
{
  "sources": {
    "user:new-project": {
      "label": "본인 확인: 새 프로젝트",
      "observedAt": "2026-10-10",
      "visibility": "review",
      "verification": "user-confirmed"
    }
  },
  "nodes": [
    {
      "id": "project:new-project",
      "type": "Project",
      "label": "새 프로젝트 이름",
      "summary": "수행한 문제와 결과 설명",
      "details": [
        {"title": "문제와 목표", "paragraphs": ["근거에 맞는 설명"]},
        {"title": "담당 업무와 결과", "paragraphs": ["실제로 맡은 범위와 결과"]}
      ],
      "evidenceIds": ["user:new-project"],
      "visibility": "review"
    }
  ],
  "edges": [],
  "questions": []
}
```

개인의 수행은 `Person → hasContribution → Contribution → inProject → Project`, 역량은 `Contribution → demonstrates → Capability`로 연결한다. 확인된 경로로 `workedOn`을 자동 생성한다. 회사에서 수행한 업무는 `Contribution → duringExperience → Experience`로 연결하며 회사 소유를 추론하지 않는다. 새 글은 `authored`, `publishedIn` 관계가 필요하다. 외부 논문 리뷰는 Review이며 원문은 `references`에 넣을 수 있다.

수정은 같은 ID의 **전체 레코드**와 `expectedHashes: {"해당 ID": "현재 정규 레코드의 SHA256"}`를 함께 준다. 삭제는 `removeNodes`, `removeEdges`에 ID와 같은 expected hash를 지정한다. 출처 수정의 hash 키는 `source:<출처 ID>`다. 해시는 엔진의 `hash_record` 함수로 계산한다. 공개 JSON은 필드가 정제돼 원본과 해시가 다를 수 있다.

직접 관리하는 기존 원본 `design/ontology-cosmos/ontology.sample.json`을 수정한 경우, 검토 후 `npm run cosmos:update -- --no-extract --approve-baseline`으로 현재 정규 그래프 전체 내용을 명시적으로 승인할 수 있다. 이 옵션은 선택 후보 승인보다 범위가 넓으므로 전체 변경 내용을 확인한 경우에 사용한다. 기존 제외 정책은 `cosmos/policy.json`에서 유지한다.

## 의미 기반 조회

```sh
npm run cosmos:query -- portfolio
npm run cosmos:query -- career
npm run cosmos:query -- capabilities
npm run cosmos:query -- research
npm run cosmos:query -- writing
npm run cosmos:query -- connections --entity project:preflight
npm run cosmos:query -- research --as-of 2026-10-10
```

`research`는 본인 저술 Paper 및 Patent만 반환한다. Review는 writing에 포함한다. capabilities는 본인의 수행 기록에서 입증된 근거 경로를 반환한다. 자연어를 임의 SQL/SPARQL로 바꾸지 않는다. 시맨틱 레이어는 타입, 관계, 유효 기간과 근거를 적용하는 결정적 질의로 구현했다.

## 저장과 배포

- 원본: `ontology.sample.json`, `cosmos/legacy-enrichment.json`
- 승인된 추가/정정: `cosmos/records/*.json`. 공개용 필드만 보관하므로 이 폴더는 버전 관리한다.
- 스키마 및 공개 승인: `cosmos/schema.json`, `cosmos/policy.json`
- 비공개 로컬 상태: `.cosmos/review`, `.cosmos/history.json`, `.cosmos/report.json`
- 앱 입력: `src/components/Cosmos/graph.json`
- 정적 산출물: `public/cosmos/graph.json`, `search.json`, `graph.jsonld`

현재 UI의 기존 120개 노드는 내용 해시 기준 baseline으로 이전했다. 기존 `review` 값을 모든 미래 항목에 대한 공개 허가로 취급하지 않는다. 검토 상태였던 proposed 관계는 공개 그래프에 넣지 않는다. 현재 제외된 항목은 자동 복구하지 않는다.

추출, 검증 및 승인 실패 시 기존 사이트 그래프를 유지한다. 쓰기 실패는 복구하고 동시 update는 잠금으로 거부한다. 프로세스 강제 종료나 전원 차단 시 여러 파일의 완전한 트랜잭션까지 보장하지 않으므로 다음 실행에서 재생성한다. 이 명령은 git commit, push 또는 배포를 수행하지 않는다.

## 검증과 설치

```sh
npm run cosmos:test
npm run cosmos:validate
npm run cosmos:update -- --check
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

Python 패키지를 따로 설치할 수도 있다.

```sh
python3 -m pip install ./packages/cosmos-engine
cosmos --root /path/to/kimsoyeong.github.io update --no-extract
```

Codex SDK 경로에는 이 저장소의 Node 의존성이 필요하다. 그래프 DB 서버, 벡터 DB와 LLM은 GitHub Pages 실행 환경에 포함되지 않는다.

설계와 연구 근거는 [DESIGN.md](DESIGN.md)를 따른다. 온톨로지의 JSON 계약을 검증하며 OWL/SHACL 완전 추론기를 구현했다고 주장하지 않는다.
