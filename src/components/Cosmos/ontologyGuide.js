export const ontologyExampleNodes = [
  {id:'person:soyeong', type:'Person', label:'김소영', x:90, y:180},
  {id:'project:preflight', type:'Project', label:'PreFlight', x:350, y:90},
  {id:'contribution:preflight', type:'Contribution', label:'Recon 및 통합 기여', x:350, y:370},
  {id:'capability:architecture', type:'Capability', label:'에이전트 구조 설계', x:670, y:130},
  {id:'capability:integration', type:'Capability', label:'시스템 통합', x:670, y:370},
  {id:'capability:agent-sdk', type:'Capability', label:'에이전트 SDK 활용', x:670, y:610},
  {id:'review:tistory-handbook', type:'Review', label:'HANDBOOK.md 리뷰', x:90, y:630},
  {id:'channel:tistory', type:'PublicationChannel', label:'소소한 코딩일지', x:350, y:630}
];
export const ontologyExampleEdges = [
  {source:'person:soyeong', predicate:'owns', target:'channel:tistory', label:'소유한 블로그', x:211, y:505},
  {source:'person:soyeong', predicate:'workedOn', target:'project:preflight', label:'프로젝트 수행', x:205, y:107},
  {source:'person:soyeong', predicate:'hasContribution', target:'contribution:preflight', label:'맡은 기여', x:234, y:252},
  {source:'contribution:preflight', predicate:'inProject', target:'project:preflight', label:'이 프로젝트에서', x:403, y:224},
  {source:'contribution:preflight', predicate:'demonstrates', target:'capability:architecture', label:'드러난 역량', x:510, y:224},
  {source:'contribution:preflight', predicate:'demonstrates', target:'capability:integration', label:'드러난 역량', x:510, y:348},
  {source:'contribution:preflight', predicate:'demonstrates', target:'capability:agent-sdk', label:'드러난 역량', x:510, y:525},
  {source:'person:soyeong', predicate:'authored', target:'review:tistory-handbook', label:'작성함', x:134, y:454},
  {source:'review:tistory-handbook', predicate:'publishedIn', target:'channel:tistory', label:'게시됨', x:220, y:604}
];
function structureDiagram() {
  const nodes = new Map(ontologyExampleNodes.map(n => [n.id,n]));
  const lines = ontologyExampleEdges.map(e => {
    const a=nodes.get(e.source), b=nodes.get(e.target), distance=Math.hypot(b.x-a.x,b.y-a.y);
    const dx=(b.x-a.x)/distance, dy=(b.y-a.y)/distance;
    return `<g><path d="M ${a.x+dx*52} ${a.y+dy*52} L ${b.x-dx*59} ${b.y-dy*59}" marker-end="url(#ontology-arrow)"/><text x="${e.x}" y="${e.y}" text-anchor="middle"><tspan class="edge-label" x="${e.x}">${e.label}</tspan><tspan class="edge-predicate" x="${e.x}" dy="15">${e.predicate}</tspan></text></g>`;
  }).join('');
  return `<div class="ontology-network-scroll"><div class="ontology-network" role="group" aria-label="김소영의 프로젝트 수행, 개인 기여와 역량 관계 구조도">
    <svg viewBox="0 0 780 730" aria-hidden="true"><defs><marker id="ontology-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8"/></marker></defs>${lines}</svg>
    ${ontologyExampleNodes.map(n => `<button data-read="${n.id}" class="ontology-circle${n.type==='Person'?' ontology-circle--person':''}" style="left:${n.x/780*100}%;top:${n.y/730*100}%" aria-label="${n.label} 상세 보기"><small>${n.type}</small><strong>${n.label}</strong></button>`).join('')}
    </div></div>`;
}

export function ontologyGuide(nodeCount, edgeCount) {
  return `<p class="eyebrow">ABOUT THIS KNOWLEDGE COSMOS</p>
    <h1 id="reader-title">경험을 연결하는 방법</h1>
    <p>이 포트폴리오는 무엇을 했는지, 어떤 역할을 맡았는지, 그 경험에서 어떤 역량을 쌓았는지를 연결해서 보여줍니다. 온톨로지는 그 연결에 사용하는 대상의 종류와 관계의 의미를 정한 구조입니다.</p>
    <div class="ontology-counts"><span><strong>${nodeCount}</strong>개의 항목</span><span><strong>${edgeCount}</strong>개의 관계</span></div>
    <section id="ontology-basics"><h2>노드, 관계, 속성</h2>
      <div class="ontology-basics">
        <div><span>01 / NODE</span><h3>독립적으로 살펴볼 대상</h3><p>김소영, KT, PreFlight, 에이전트 설계 역량처럼 별도 설명과 연결이 필요한 항목입니다.</p></div>
        <div><span>02 / RELATION</span><h3>두 대상 사이의 의미</h3><p>작성했다, 참여했다, 기여했다, 재직했다처럼 연결의 이유를 표현합니다. 선의 방향과 이름을 함께 읽습니다.</p></div>
        <div><span>03 / PROPERTY</span><h3>대상을 설명하는 정보</h3><p>날짜, 직책, 설명, 이미지, 원문 링크입니다. 모든 정보를 별도 노드로 만들지는 않습니다.</p></div>
      </div>
    </section>
    <section id="ontology-paths"><h2>경험이 이어지는 지식 그래프</h2><p>원은 하나의 항목, 화살표는 두 항목의 관계입니다. 김소영에서 출발해 수행한 프로젝트, 맡은 기여와 드러난 역량을 따라가 보세요. 원을 누르면 해당 상세가 열립니다.</p>
      ${structureDiagram()}
      <p class="ontology-diagram-note">프로젝트 수행은 전체 참여를, 기여는 본인이 맡은 범위를, 역량은 그 수행으로 입증한 능력을 나타냅니다. 관계 이름은 화살표 방향으로 읽습니다. 작은 화면에서는 구조도를 좌우로 움직여 볼 수 있습니다.</p>
      <div class="ontology-type-list">
        <div><h3>경력에서 조직으로</h3><p>김소영의 KT 재직 기록이 회사와 연결됩니다. 기여 기록도 당시 재직 경험과 연결되어 어떤 맥락에서 수행한 일인지 보여줍니다.</p></div>
        <div><h3>수행한 프로젝트와 맡은 기여</h3><p>김소영 → 프로젝트 수행 → PreFlight로 직접 연결합니다. Recon 및 통합은 그 프로젝트 안에서 맡은 개인 기여입니다. 기여를 근거로 시스템 통합, 에이전트 구조 설계, SDK 활용 역량을 각각 연결합니다.</p></div>
        <div><h3>소유한 블로그와 작성한 글</h3><p>김소영은 소소한 코딩일지를 소유하고 운영하며, 본인이 작성한 HANDBOOK.md 리뷰를 그 블로그에 게시합니다. 블로그 소유, 글 작성, 게시 위치는 서로 다른 관계입니다. 원논문은 리뷰 안의 참고 자료이며 독립 노드로 표시하지 않습니다.</p></div>
      </div>
    </section>
    <section id="ontology-types"><h2>이 포트폴리오의 항목 종류</h2>
      <div class="ontology-type-list">
        <div><h3>사람과 경력</h3><p><code>Person</code> 사람, <code>Organization</code> 회사와 팀, <code>Experience</code> 재직 기록, <code>RoleAssignment</code> 맡은 역할, <code>Education</code> 학력</p></div>
        <div><h3>수행과 역량</h3><p><code>Project</code> 프로젝트, <code>Contribution</code> 본인의 기여, <code>Capability</code> 경험으로 드러난 능력</p></div>
        <div><h3>연구와 글</h3><p><code>Paper</code> 본인 저술 논문, <code>Writing</code> 본인 기술 글, <code>Review</code> 외부 자료를 읽고 쓴 리뷰, <code>Section</code> 글의 목차, <code>PublicationChannel</code> 게시 공간</p></div>
        <div><h3>활동과 결과</h3><p><code>Participation</code> 참가 기록, <code>Event</code> 행사, <code>Program</code> 교육 프로그램, <code>Award</code> 수상, <code>Presentation</code> 발표, <code>Media</code> 출연, <code>Credential</code> 자격 및 어학 기록</p></div>
        <div><h3>설계와 기술</h3><p><code>AgentSystem</code> 에이전트 시스템, <code>Agent</code> 개별 에이전트, <code>Tool</code> 실행 도구, <code>Technology</code> 사용 기술, <code>Concept</code> 지식 주제</p></div>
      </div>
    </section>
    <section id="ontology-reading"><h2>관계를 해석하는 기준</h2>
      <div class="ontology-type-list">
        <div><h3>직접 연결도 수행 근거를 가집니다</h3><p>수행한 프로젝트, 근무 조직, 학교와 행사 참여를 직접 연결하되 개인 기여, 경력, 학위 및 참가 기록의 근거 경로를 함께 보존합니다. 같은 프로젝트의 석사 연구와 졸업 이후 연구원 기여도 별도로 기록합니다.</p></div>
        <div><h3>소속과 소유는 다릅니다</h3><p>KT 재직 중 수행한 업무와 KT 소속 대외 활동을 구분합니다. 재직 관계가 있다고 해서 회사의 소유 프로젝트라는 의미는 아닙니다.</p></div>
        <div><h3>학습 기록과 실무 근거를 구분합니다</h3><p>리뷰의 about는 다루는 주제를 뜻합니다. 기여의 demonstrates는 실제 수행에서 드러난 역량을 뜻합니다. 같은 주제를 읽었다는 이유로 수행 경력을 만들지 않습니다.</p></div>
        <div><h3>상태와 출처를 함께 읽습니다</h3><p>관계에는 확인 근거를 연결합니다. 만료된 어학 기록에는 상태를 표시합니다. 공간에서 가깝다는 이유만으로 관계를 만들지 않습니다.</p></div>
      </div>
    </section>
    <section id="ontology-explore"><h2>화면에서 탐색하는 방법</h2>
      <p><strong>Cosmos</strong>는 전체 항목을 보여줍니다. 노드 선택 시 직접 관계와 확인된 맥락 경로를 강조합니다. <strong>상세의 Connected knowledge</strong>는 해당 항목의 직접 이웃만 목록 또는 그래프로 보여줍니다. <strong>맥락 따라가기</strong>는 최대 세 단계의 관계를 통해 조직, 기여와 프로젝트를 이어 읽는 기능입니다.</p>
      <p>노드는 드래그로 이동하고 빈 공간은 드래그로 회전할 수 있습니다. 배치 변경과 연결선 숨기기는 화면 표현만 바꾸며 관계 데이터는 바꾸지 않습니다.</p>
      <p>GitHub 포트폴리오는 경력과 역량을 중심으로, Tistory는 기술 학습과 리뷰를 중심으로 연결합니다. 이 구조는 항목과 관계를 정적 데이터로 제공하므로 별도의 그래프 DB 서버 없이 GitHub Pages에서 동작합니다.</p>
    </section>`;
}
