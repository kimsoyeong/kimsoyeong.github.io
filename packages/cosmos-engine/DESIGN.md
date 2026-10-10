# Cosmos Engine 상세 설계

2026-10-10. GitHub Pages 포트폴리오의 로컬 지식 빌드 패키지.

## 실제 구조 분석

현재 원본은 `design/ontology-cosmos/ontology.sample.json`의 89개 노드, 159개 관계다. React 그래프는 120개 노드, 236개 관계이며 30개 출처를 가진다. 기존 생성기는 MainPage.js의 프로젝트 순서를 고정 매핑하고 6개 프로젝트 및 7개 글 섹션을 가정한다. 검증기는 프로젝트, 글, 논문 개수를 고정하므로 미래 확장을 거부한다. 특허 및 파트 리딩은 현재 데이터에서 제거된 상태이므로 복구하지 않는다. 문서의 과거 127/249 수치는 현재 데이터와 다르다.

`visibility: review`는 기존 로컬 검토 표시였고 실제 공개 차단에 사용되지 않았다. 이를 일괄 public으로 바꾸거나 전체 검토 저장소를 프론트에 복사하지 않는다. 현재 화면의 공개용 필드를 내용 해시로 승인한 명시적 baseline manifest로 이전한다. 새 내용이나 변경된 내용은 승인 전까지 배포 데이터에 포함되지 않는다.

## 목표와 명령

`npm run cosmos:update` 하나로 승인 기록 병합, 관계 파생, 검증, 공개 projection, Cosmos graph 및 검색 인덱스 생성, 변경 보고까지 실행한다. 새 자료는 `cosmos/inbox`에 넣는다. 자유 형식은 LLM으로 후보화하고 구조화 JSON은 LLM 없이 처리한다. 모호한 사실은 후보와 질문으로 남는다. API 키는 환경변수에만 둔다. 배포와 git 작업은 별개다.

## 데이터 흐름

입력 자료 → 내용 해시와 로컬 추출 캐시 → 후보 및 확인 질문 → 명시적 승인 → 정규화된 기록 → domain/range 및 맥락 검증 → sourced 관계의 파생 → 내용별 공개 승인 검사 → 공개 필드 allowlist → React graph / 검색 인덱스 / JSON-LD.

원본, 캐시, 추출 후보 및 변경 이력은 public 밖에 둔다. 원문은 기본적으로 외부 LLM에 보내지 않는다. 설정된 LLM을 사용할 때도 사용자가 inbox에 넣은 파일만 처리하고 사내 문서 자동 탐색은 하지 않는다.

## 패키지 구성

Python 3.10+ 표준 라이브러리 패키지. npm은 단일 진입점을 제공한다. 그래프 DB 및 LLM은 사이트 런타임에 필요 없다.

- `schema.py`: 타입과 관계 계약, 참조, 근거, 날짜, URL, 상세/미디어, 파생 경로 검증. 데이터 개수와 특정 개인 항목에 의존하지 않는다.
- `ingest.py`: JSON 기록, 텍스트/Markdown/HTML/자막, PDF/DOCX/PPTX, 이미지 및 미디어 동반 자막 수집. OpenAI 호환 chat completions와 현재 로그인 계정의 Codex SDK를 선택한다. 기본은 Codex SDK이며 build 단계는 모델 호출 없이 실행한다. 바이너리나 지원하지 않는 형식은 누락하지 않고 질문으로 보고한다.
- `engine.py`: baseline, 승인된 inbox 기록 및 수정 합성, stable ID, 재실행 캐시, public projection, 잠금과 원자적 교체, 이력 및 변경 보고.
- `semantic.py`: 개인 수행, 입증된 역량, 저술 성과, 외부 리뷰를 의미별로 조회. evidence와 실제 경로를 반환한다.
- `cli.py`: update, review/approve, query, validate.
- `cosmos/schema.json`: 관계와 필드 계약. 확장 시 schema와 UI 타입 지원을 함께 수정한다.
- `cosmos/policy.json`: 차단 ID/slug, 필드 allowlist, baseline 승인 해시. 기존에 제거한 항목의 재유입을 막는다.

## 의미와 변경 계약

- 기존 entity ID는 보존한다. label이나 URL이 달라도 LLM이 자동 병합하지 않는다. 후보가 기존 ID를 수정하면 이전 내용 해시가 일치해야 적용한다.
- 새 기록은 기본 review이며 LLM confidence로 sourced/public 승격하지 않는다. 승인 명령은 구조 검증 후 지정 후보만 승인한다.
- 사실의 유효 기간 `validFrom`, `validTo`와 관찰 시간 `observedAt`을 분리한다. 변경 이력은 이전 그래프 및 내용 해시로 남긴다. 과거 상태는 공개 그래프에 혼합하지 않는다.
- workedOn/workedAt/studiedAt/participatedIn은 sourced 근거 경로에서만 생성한다. 내용 기반 stable ID와 basisPaths를 보관하며 근거 삭제/철회 시 사라진다. 검색용 경로를 사실로 새로 저장하지 않는다.
- 저술 논문과 리뷰는 다른 타입이다. 특허는 출원/등록 상태와 식별번호가 확인돼야 해당 상태로 표현한다. 리뷰 원문은 references 속성으로 유지할 수 있다.
- public projection은 승인된 내용의 허용 필드만 내보낸다. 비공개 원문, 추출 프롬프트/응답, 토큰, 내부 URL, 근거 파일 경로를 내보내지 않는다. 공개되지 않은 노드를 가리키는 관계/미디어는 제외한다.

## 연구 근거와 채택 범위

- MOOSEDev: typed 결정/근거/대체 관계 및 ontology 검증. 형식 검증 원리를 JSON domain/range 계약으로 구현한다. OWL 완전 추론기나 SHACL 구현이라고 부르지 않는다. https://arxiv.org/abs/2608.13662
- IBM Personal Agents and Conversational Memory: 추출, 질의, 저장을 분리하고 provenance 보존. NL→SPARQL 오류라는 한계를 고려해 공개 승인과 핵심 질의는 결정적 코드로 수행한다. https://ceur-ws.org/Vol-4210/paper1.pdf
- Zep/Graphiti: 증분 갱신, 시간 정보, 이전 사실 무효화. 이 패키지는 로컬 변경 기록과 유효 기간을 구현하며 실시간 graph DB 및 Zep 기능을 그대로 구현하지 않는다. https://arxiv.org/abs/2501.13956
- Cognee: 작은 도메인 schema와 canonical entity. 기존 ID 우선 및 명시적 병합으로 잘못된 fuzzy 병합을 피한다. https://www.cognee.ai/grounding-ai-memory
- Context Engineering: 전체 원문 대신 관련 schema와 기존 ID 요약을 추출 context에 제공한다. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- AutoSchemaKG: 새로운 타입/관계는 확장 후보로 보고하되 모델이 자동으로 schema를 변경하지 않는다. https://aclanthology.org/2026.acl-long.942/

## 설계 검토와 보완

1. 무조건 자동 공개 → 추출과 공개 승인 분리, 내용 해시 기준 승인으로 변경 후 재승인 요구.
2. 기존 review 필터 적용으로 화면 소실 → 현 화면 baseline만 명시적 migration, private는 승인으로 우회 불가.
3. JS 정규식/프로젝트 위치 의존 → 현재 enrichment를 선언 데이터로 이전. 새 자료는 inbox 계약 사용.
4. 수량 고정 검증 → 일반 schema와 제외 정책 분리, 성장 가능한 fixture 테스트.
5. LLM 잘못된 관계 → 후보는 검증 실패와 질문을 보존, 정해진 semantic query를 코드로 실행.
6. 파생 ID 변동 → triple 기반 stable ID 및 원본 basisPaths 추적.
7. 불완전 쓰기로 화면 손상 → 전체 검증 후 잠금, 같은 파일시스템 임시 파일, 실패 시 원상 복구.
8. 재실행마다 API 비용 → 원문 및 자막 해시 + 추출 설정/schema 해시 캐시. 원격 URL은 스냅샷이며 --refresh로 다시 추출한다. 승인 전 파일이 바뀌면 후보를 무효화.
9. API 미설정 → JSON은 완전히 로컬 실행. 자연어/멀티모달 입력은 미처리 상태와 설정 안내 표시.
10. 영상 재생 불가 → 자동 승인 대상에서 제외하고 재생 확인 상태를 요구. 자막은 내용 추출용이며 영상 재생 가능성의 증거가 아니다.

## 검증 계획

기존 공개 UI 데이터 보존, 개수 증가, 작성/리뷰 구분, unknown predicate, 없는 근거/끝점, 날짜/URL 주입, private 누출, 변경 후 승인 무효화, 결정적 파생과 근거 철회, 실패 시 기존 산출물 유지, dry-run 무변경, 증분 캐시, LLM 실패/잘못된 JSON, 구조화 자료 갱신, semantic query 근거 경로를 테스트한다. React 기존 테스트와 프로덕션 빌드도 수행한다.

## 구현 검토 보완

현재 노드 120개는 유지한다. proposed인 broader 관계 한 건은 원본에 유지하고 public projection에서 제외한다. 파생 관계 ID는 triple 해시로 변경한다. 기존 영상의 재생 확인 기록은 baseline으로 유지하고 새 영상은 playbackVerified를 요구한다. 승인한 후보의 proposed 관계는 명시적 승인 시 sourced로 승격한다. API 미설정과 SDK 로그인 오류는 실패로 표시하며 모델을 임의 대체하지 않는다.

## Separate local Studio

The packaged stdlib HTTP server binds to 127.0.0.1. It serves a light-mode standalone UI for upload, provider selection, extraction, candidate editing, explicit approval, validation and direct-neighbor graph inspection. Single-worker jobs serialize actions; the engine lock also protects CLI runs. Same-origin checks and a per-process request token guard mutations. Only bundled frontend assets are served. API credentials stay in the server environment. Local candidates include quotes for review, while the static public projection excludes them. No LLM runs on page load.
