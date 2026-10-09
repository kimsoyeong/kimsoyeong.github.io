const markup = `
<canvas id="universe" aria-label="노드를 드래그해 이동하고 빈 공간을 드래그해 회전하는 3D 지식 우주. 동일한 콘텐츠는 목록 보기에서 키보드로 탐색할 수 있습니다."></canvas>
<div class="vignette" aria-hidden="true"></div>
<header>
 <button class="brand" data-action="home" aria-label="인트로로 돌아가기"><span class="brand-symbol">✳</span> SOYEONG KIM <span class="brand-caption">KNOWLEDGE COSMOS</span></button>
 <nav aria-label="주 메뉴"><button data-action="graph">Cosmos</button><button data-collection="Project">Work</button><button data-collection="Research">Research</button><button data-collection="Person">About</button><button data-action="ontology">Ontology</button><a href="https://soso-cod3v.tistory.com/" target="_blank" rel="noopener noreferrer">Tech blog ↗</a></nav>
 <button class="theme-button" data-action="theme" aria-label="라이트 모드로 전환">◐ <span>Light</span></button>
</header>
<main id="intro">
 <div class="hero">
  <p class="eyebrow">A CONNECTED UNIVERSE OF EXPERIENCE</p>
  <h1>Everything<br>is <em>connected.</em></h1>
  <p class="identity">AI Agent Researcher & Developer<br><span>AI Native Engineer</span></p>
  <p class="intro-copy">에이전트를 연구하고, 시스템을 설계합니다.<br>경험과 역할, 그 안에서 쌓아 온 역량의 연결.</p>
  <button class="enter" data-action="graph">Explore my cosmos <span>↗</span></button>
  <span class="hint">MOVE YOUR CURSOR. FIND A CONNECTION.</span>
 </div>
 <button class="floating-card card-rca" data-open="project:rca" aria-label="Network RCA Agent 프로젝트 보기">
  <span class="card-kicker">SYSTEM / 01 <span>↗</span></span><strong>Agents that<br>reason & act.</strong>
  <div class="mini-system" aria-hidden="true"><span>Supervisor</span><i>↓</i><div><span>Action</span><span>Report</span></div><i>↓</i><span>Tools + observations</span></div>
  <span class="card-foot">NETWORK RCA AGENT</span>
 </button>
 <button class="floating-card card-paper" data-open="capability:architecture" aria-label="에이전트 설계 및 개발 역량 보기">
  <span class="card-kicker">AGENT ENGINEERING <span>↗</span></span><strong>Customize<br>your agents.</strong><span class="paper-sub">Architecture, tools,<br>state &amp; orchestration.</span>
  <div class="paper-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="paper-plot" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div>
  <span class="card-foot">AGENT DESIGN &amp; DEVELOPMENT</span>
 </button>
 <button class="floating-card card-framework" data-open="person:soyeong" aria-label="에이전트 설계 역량 보기">
  <span class="card-kicker">ENGINEERING <span>↗</span></span><strong>Knowledge<br>into action.</strong><div class="framework-flow"><span>Skill</span><i>→</i><span>Workflow</span><i>→</i><span>Playground</span></div><span class="card-foot">AGENT DESIGN / ENGINEERING</span>
 </button>
 <button class="floating-card card-identity" data-collection="Person" aria-label="Soyeong 소개 보기">
  <span class="card-kicker">THE HUMAN IN THE LOOP <span>↗</span></span><span class="profile-mark">S<span>K</span></span><strong>Soyeong Kim</strong><span class="card-foot">RESEARCH / BUILD / EVALUATE</span>
 </button>
 <div class="intro-coordinate coord-a" aria-hidden="true">01 — INTELLIGENT SYSTEMS</div><div class="intro-coordinate coord-b" aria-hidden="true">02 — CONNECTED KNOWLEDGE</div>
</main>
<section id="explorer" hidden aria-label="3D 지식 탐색">
 <div class="graph-title"><p class="eyebrow">THE KNOWLEDGE COSMOS</p><h1>A universe of connections.</h1><p>커서를 움직여 우주를 느껴보세요. 노드는 드래그로 이동할 수 있어요.</p></div>
 <aside class="filters" aria-label="지식 탐색 도구">
  <label class="search-label"><span>⌕</span><input id="search" type="search" placeholder="Search this cosmos" aria-label="노드 검색"></label>
  <p class="eyebrow">EXPLORE BY</p><div class="type-filters"></div>
  <div class="filter-divider"></div><p class="eyebrow">SELECT A NODE</p><div id="node-list" class="node-list"></div><p id="match-count" class="micro" aria-live="polite"></p>
 </aside>
 <aside id="inspector" hidden aria-label="선택한 노드의 상세 정보"></aside>
 <div id="node-tooltip" role="status" hidden></div>
 <div class="graph-tools" aria-label="시점 조작"><button data-action="left" aria-label="왼쪽으로 회전">↶</button><button data-action="right" aria-label="오른쪽으로 회전">↷</button><span></span><button data-action="zoom-in" aria-label="확대">+</button><button data-action="zoom-out" aria-label="축소">−</button><span></span><button data-action="reset">시점 초기화</button><button data-action="spin" aria-pressed="false">자동 회전</button><button data-action="edges" aria-pressed="true">연결선 켜짐</button><button data-action="list">목록 보기</button></div>
 <div class="graph-help">DRAG NODE TO MOVE <span>/</span> DRAG SPACE TO ORBIT <span>/</span> SCROLL TO ZOOM</div>
</section>
<footer><span class="footer-state"><i></i><span id="footer-caption">SOYEONG'S PERSONAL UNIVERSE</span></span><span id="graph-count">LOCAL DESIGN PREVIEW</span><button data-action="motion" aria-pressed="false">모션 끄기</button></footer>
<div class="sr-only" id="announcement" aria-live="polite"></div>
<dialog id="reader" aria-labelledby="reader-title"><div class="reader-top"><span>SOYEONG / KNOWLEDGE ARCHIVE</span><button id="close-reader" aria-label="콘텐츠 닫기">닫기 ×</button></div><div class="reader-layout"><nav id="reader-list" aria-label="콘텐츠 목록"></nav><article id="reader-content"></article></div></dialog>
<div id="load-error" hidden role="alert">지식 데이터를 불러오지 못했습니다. <button data-action="reload">다시 불러오기</button></div>
`;
export default markup;
