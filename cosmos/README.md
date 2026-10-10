# Cosmos 데이터 관리

실행: `npm run cosmos:update`

새 자료는 git에서 제외되는 `cosmos/inbox/`에 넣는다. 추출 후보를 검토하고 `npm run cosmos:update -- --approve <ID>`로 반영한다. 현재 기본 모델 경로는 로그인 계정의 Codex SDK이며 OpenAI 호환 API도 선택할 수 있다.

사용법, 지원 자료 형식, 승인과 정정 절차: [Cosmos Engine 안내](../packages/cosmos-engine/README.md)

설계와 연구 근거: [상세 설계](../packages/cosmos-engine/DESIGN.md)

기존 원본은 `design/ontology-cosmos/ontology.sample.json`, 이전 UI에서 확정된 보완 정보는 `legacy-enrichment.json`, 신규 승인 기록은 `records/`다. 파생 그래프를 직접 편집하지 않는다. `schema.json`은 확장 가능한 타입과 관계 계약이며 `policy.json`은 제외 항목과 내용별 공개 승인 해시다.
