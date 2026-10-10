import { ontologyGuide } from './ontologyGuide';
import { mountConnectedGraph } from './connectedGraph';
import { relationLabel, contextPaths, newestFirst, mediaOrder, profileMedia, mediaOwners, profileTechnologies } from './relations';
import { clamp, randomGenerator, project, assignPositions, moveInView, categories, categoryFor, cursorView } from './spatial';
import graph from './graph.json';
import customizeImage from './assets/agent-customize.svg';
export function mountCosmos(root, navigate) {
  const listeners = [];
  function on(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    listeners.push(() => target.removeEventListener(type, listener, options));
  }
  const localMedia = {
    'assets/agent-customize.svg': customizeImage
  };
  const $ = s => root.querySelector(s),
    canvas = $('#universe'),
    ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
    fine = matchMedia('(hover: hover) and (pointer: fine)');
  const state = {
    view: 'intro',
    selected: null,
    hover: null,
    filter: 'all',
    query: '',
    yaw: -.22,
    pitch: .16,
    zoom: 1,
    spacing: 1,
    spin: false,
    edgesVisible: true,
    motion: !reduced.matches,
    light: false
  };
  const pointer = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      vx: 0,
      vy: 0
    },
    orbit = {
      vx: 0,
      vy: 0
    };
  let connectionView = 'graph', readerId, disposeConnected = () => {};
  let data,
    byId,
    w = window.innerWidth,
    h = window.innerHeight,
    dpr = 1,
    frame,
    lastTime = 0,
    projected = [],
    activeIds = new Set(),
    drag = null,
    pinchDistance = 0,
    readerType = 'Project';
  const pointers = new Map();
  const random = randomGenerator(826),
    stars = Array.from({
      length: 2200
    }, () => ({
      x: (random() - .5) * 2400,
      y: (random() - .5) * 1800,
      z: random() * 1600 - 350,
      r: random(),
      phase: random() * 7,
      tint: random()
    }));
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const gc = glow.getContext('2d'),
    gg = gc.createRadialGradient(32, 32, 0, 32, 32, 32);
  gg.addColorStop(0, '#fff');
  gg.addColorStop(.06, '#fff');
  gg.addColorStop(.19, '#ffffff50');
  gg.addColorStop(1, '#ffffff00');
  gc.fillStyle = gg;
  gc.fillRect(0, 0, 64, 64);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  const related = id => data.edges.filter(e => e.source === id || e.target === id).map(e => ({
    edge: e,
    node: byId.get(e.source === id ? e.target : e.source),
    out: e.source === id
  }));
  const categoryStyle = t => {
    const c = categories[categoryFor(t)];
    return `--category-color:${c.color};--category-light:${c.light}`;
  };
  const swatch = t => `<i class="category-dot" style="${categoryStyle(t)}" aria-hidden="true"></i>`;
  const typeName = t => ({
    Writing: 'Writing / 본인 작성 글',
    Paper: 'Paper / 본인 저술 논문',
    Review: 'Review / 본인 작성 리뷰',
    ExternalPublication: 'External paper / 타인 저술 논문',
    ExternalWriting: 'External writing / 타인 작성 글',
    Capability: 'Capability / 역량',
    AgentSystem: 'Agent system',
    Section: 'Writing section',
    Experience: 'Experience / 경력',
    Credential: 'Credential / 자격 및 어학',
    Award: 'Award / 수상',
    Presentation: 'Talk / 발표',
    Media: 'Media / 출연',
    Event: 'Event / 행사',
RoleAssignment: 'Role / 담당 역할', Participation: 'Participation / 참가', Program: 'Program / 교육 프로그램', PublicationChannel: 'Channel / 게시 공간'
  })[t] || t;
  function evidence(n) {
    return n.evidenceIds.map(id => {
      const s = data.sources[id];
      return s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>` : esc(s.label);
    }).join('<br>');
  }
  function recordFacts(n) {
    const fields = [['활동 맥락', n.activityKind], ['파트원', n.teamMembers ? `${n.teamMembers}명` : null], ['제목', n.fullTitle !== n.label ? n.fullTitle : null], ['유형', n.publicationType], ['세션', n.sessionCode], ['발표자', n.speakers?.join(', ')], ['시간', n.time], ['재생 길이', n.duration], ['저자', n.authors?.join(', ')], ['기간', n.startDate ? `${n.startDateLabel || n.startDate} — ${n.endDate || '현재'}` : n.date], ['학위', n.degreeName], ['학점', n.gpa], ['발행기관', n.issuer], ['장소', n.venue], ['상태', n.status], ['상태 기록일', n.statusAsOf], ['만료', n.expiresAt]];
    return `<dl class="record-facts">${fields.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  }
  function announce(message) {
    $('#announcement').textContent = message;
  }
  function viewCamera() {
    return cursorView(state.yaw, state.pitch, pointer, state.motion && fine.matches && !(state.view === 'graph' && state.spin));
  }
  function updateCameraLabel() {
    const view = viewCamera();
    canvas.dataset.camera = `${view.yaw.toFixed(3)},${view.pitch.toFixed(3)},${state.zoom.toFixed(3)}`;
  }
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }
  function setView(view) {
    state.view = view;
    root.classList.toggle('graph', view === 'graph');
    $('#intro').hidden = view !== 'intro';
    $('#explorer').hidden = view !== 'graph';
    $('#footer-caption').textContent = view === 'graph' ? 'CONNECTED KNOWLEDGE / 3D' : 'SOYEONG\'S PERSONAL UNIVERSE';
    state.hover = null;
    $('#node-tooltip').hidden = true;
    orbit.vx = orbit.vy = 0;
    updateCameraLabel();
    draw(performance.now());
  }
  function select(id) {
    if (!byId.has(id)) return;
    state.selected = id;
    state.hover = null;
    state.query = '';
    state.filter = 'all';
    $('#search').value = '';
    $('#node-tooltip').hidden = true;
    setView('graph');
    renderInspector();
    renderList();
    announce(`${byId.get(id).label} 선택. ${related(id).length}개의 관계.`);
  }
  const pathCache = new Map();
  function pathsFor(id) {
    if (!pathCache.has(id)) pathCache.set(id, contextPaths(id, data.nodes, data.edges));
    return pathCache.get(id);
  }
  function contextMarkup(id) {
    const paths = pathsFor(id).filter(p => p.edges.length > 1);
    if (!paths.length) return '';
    return `<section class="context-paths"><h2>맥락 따라가기</h2><p class="source-note">확인된 관계를 따라 연결된 경로</p><div class="relation-list">${paths.map(p => `<button data-read="${esc(p.ids[p.ids.length - 1])}"><strong>${esc(byId.get(p.ids[p.ids.length - 1]).label)}</strong><small>${p.ids.map((nid, i) => `${i ? ` ${p.edges[i - 1].source === p.ids[i - 1] ? '→' : '←'} ${esc(relationLabel(p.edges[i - 1].predicate))} / ` : ''}${esc(byId.get(nid).label)}`).join('')}</small></button>`).join('')}</div></section>`;
  }
  function renderInspector() {
    const el = $('#inspector');
    el.hidden = !state.selected;
    if (!state.selected) return;
    const n = byId.get(state.selected),
      rels = related(n.id);
    el.innerHTML = `<button class="close" data-action="clear" aria-label="선택 해제">×</button><p class="eyebrow">${swatch(n.type)}${esc(typeName(n.type))}</p><h2>${esc(n.label)}</h2><p class="summary">${esc(n.summary)}</p>${recordFacts(n)}<button class="inspector-action" data-open="${esc(n.id)}">내용 살펴보기 ↗</button><p class="eyebrow">${rels.length} CONNECTIONS</p><div class="relation-list">${rels.map(r => `<button data-node="${esc(r.node.id)}"><small>${r.out ? '→' : '←'} ${esc(relationLabel(r.edge.predicate))}${r.edge.assertionStatus === 'proposed' ? ' / 제안' : ''}</small>${esc(r.node.label)}</button>`).join('') || '<p class="source-note">연결 근거 정리 중</p>'}</div>${contextMarkup(n.id)}<p class="source-note">출처: ${evidence(n)}</p>`;
  }
  function matching() {
    const q = state.query.toLocaleLowerCase().trim();
    return data.nodes.filter(n => (state.filter === 'all' || categoryFor(n.type) === state.filter) && (!q || (n.label + ' ' + n.summary).toLocaleLowerCase().includes(q)));
  }
  function renderList() {
    const matches = matching();
    activeIds = new Set(matches.map(n => n.id));
    const prioritized = [...matches].sort((a, b) => (['Person', 'Project', 'Concept', 'Writing', 'Paper', 'Award', 'Presentation', 'Media'].includes(b.type) ? 1 : 0) - (['Person', 'Project', 'Concept', 'Writing', 'Paper', 'Award', 'Presentation', 'Media'].includes(a.type) ? 1 : 0));
    $('#node-list').innerHTML = prioritized.map(n => `<button data-node="${esc(n.id)}" aria-pressed="${n.id === state.selected}" title="${esc(typeName(n.type))}">${swatch(n.type)}${esc(n.label)}</button>`).join('') || `<p class="micro">${state.filter === 'Review' ? '등록된 외부 리뷰가 없습니다. 제외한 리뷰는 복원하지 않았습니다.' : '일치하는 지식이 없습니다.'}</p>`;
    $('#match-count').textContent = `${matches.length} / ${data.nodes.length} nodes`;
    root.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
  }
function referenceSection(n) {
    if (!n.references?.length) return '';
    return `<section class="review-references"><h2>리뷰한 원문</h2><p>아래 논문은 리뷰의 참고 자료이며, 본인 저술 논문과 구분합니다.</p>${n.references.map(r => `<div><strong>${esc(r.title)}</strong><p>${esc(r.authors.join(', '))}</p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">논문 원문 읽기 ↗</a></div>`).join('')}</section>`;
  }
  function detailSections(n) {
    const heading = n.type === 'Person' ? 'h3' : 'h2';
    return (n.details || []).map((s, i) => `<section class="detail-section"><span class="section-number">${String(i + 1).padStart(2, '0')}</span><div><${heading}>${esc(s.title)}</${heading}>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div></section>`).join('');
  }
  function mediaGallery(n) {
    const seen = new Set(),
      items = [];
    for (const owner of mediaOwners(n.id, data.nodes, data.edges)) for (const m of owner.media || []) {
      if (seen.has(m.url)) continue;
      seen.add(m.url);
      items.push({
        m,
        owner
      });
    }
    items.sort(mediaOrder);
    if (!items.length) return '';
    const main = items.filter(({
        m
      }) => m.featured),
      extra = items.filter(({
        m
      }) => !m.featured);
    if (!main.length) main.push(extra.shift());
    const grid = entries => `<div class="media-grid${entries.every(({
      m
    }) => m.layout === 'mockup') ? ' media-grid--mockups' : ''}">${entries.map(({
      m,
      owner
    }) => `<figure>${m.kind === 'youtube' ? `<button class="video-preview" data-video="${esc(m.videoId)}" aria-label="${esc(m.title)} 재생"><img src="https://i.ytimg.com/vi/${esc(m.videoId)}/hqdefault.jpg" alt="${esc(m.title)}" loading="lazy"><span>▶ 영상 재생</span></button>` : `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(m.url)}" alt="${esc(m.title)}" loading="lazy"></a>`}<figcaption><strong>${esc(m.title)}</strong>${m.date ? `<span>${esc(m.date)}</span>` : ''}${owner.id === n.id ? '' : `<span>관련 항목: ${esc(owner.label)}</span>`}<span>출처: ${esc(data.sources[m.sourceId].label)}</span><a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${m.kind === 'youtube' ? 'YouTube에서 보기' : '원본 보기'} ↗</a></figcaption></figure>`).join('')}</div>`;
    if (n.type === 'Person') return `<section class="archive-media profile-media"><h2>Photos & media</h2>${grid(profileMedia(items, data.edges))}</section>`;
    return `<section class="archive-media"><h2>${items.some(({
      m
    }) => m.kind === 'youtube') ? 'Images & video' : 'Images'}</h2>${grid(main)}${extra.length ? `<details class="more-media"><summary>이미지와 관련 자료 더 보기 (${extra.length})</summary>${grid(extra)}</details>` : ''}</section>`;
  }
  function renderReader(id) {
    const n = byId.get(id);
    if (!n) return;
    disposeConnected(); readerId = id;
    const items = n.type === 'Person' ? [n] : readerType === 'all' ? data.nodes : data.nodes.filter(x => readerType === 'Research' ? ['Paper'].includes(x.type) : readerType === 'Writing' ? ['Writing', 'Review', 'PublicationChannel'].includes(x.type) : x.type === readerType);
    $('#reader-list').innerHTML = items.map(x => `<button data-read="${esc(x.id)}" class="${id === x.id ? 'active' : ''}">${swatch(x.type)}${esc(x.label)}</button>`).join('');
    const rels = related(id),
      person = n.type === 'Person';
    const article = n.slug ? n : byId.get(n.articleId);
    const articlePath = article?.slug ? `/freeform/${article.slug}${n.anchor ? '#' + n.anchor : ''}` : null;
    const groups = person ? [['Capabilities', ['Capability']], ['Roles & responsibilities', ['RoleAssignment']], ['Career', ['Experience']], ['Education', ['Education']], ['Research', ['Paper']], ['Activities', ['Participation']], ['Awards & speaking', ['Award', 'Presentation', 'Media']], ['Credentials', ['Credential']]] : [];
    const techTags = person ? `<div class="technology-tags" role="group" aria-label="활용 기술">${profileTechnologies(n.id, data.nodes, data.edges).map(t => `<button data-read="${esc(t.id)}">${esc(t.label)}</button>`).join('')}</div>` : '';
    const timeline = groups.map(([label, types]) => {
      const records = rels.map(r => r.node).filter(x => types.includes(x.type)).sort(newestFirst);
      return records.length ? `<h2>${label}</h2>${types.includes('Capability') ? techTags : ''}<div class="profile-records" role="group" aria-label="${label}">${records.map(x => `<button data-read="${esc(x.id)}">${swatch(x.type)}<strong>${esc(x.label)}</strong><small>${esc(x.startDate ? `${x.startDateLabel || x.startDate} — ${x.endDate || '현재'}` : x.date || x.status || (x.type === 'Capability' ? x.summary : ''))}</small></button>`).join('')}</div>` : '';
    });
    $('#reader-content').innerHTML = `<p class="eyebrow">${swatch(n.type)}${esc(typeName(n.type))}</p><h1 id="reader-title">${esc(n.label)}</h1>${n.publicationType ? `<span class="record-badge">${esc(n.publicationType)}</span>` : ''}${n.subtitle ? `<p class="subtitle">${esc(n.subtitle)}</p>` : ''}<p>${esc(n.summary)}</p>${['Project', 'Presentation'].includes(n.type) && n.url ? `<div class="profile-links"><a class="resource-link" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${esc(n.urlLabel || '프로젝트 저장소')} ↗</a></div>` : ''}${recordFacts(n)}${n.links ? `<div class="profile-links">${n.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}${articlePath ? `<button class="inspector-action" data-route="${esc(articlePath)}">글 본문 읽기 ↗</button>` : ''}${n.role ? `<h2>My contribution</h2><p>${esc(n.role)}</p>` : ''}${readerType === 'Writing' ? '<div class="profile-links"><button data-route="/freeform">전체 글 목록 ↗</button></div>' : ''}${person ? `${timeline[0]}${detailSections(n)}${mediaGallery(n)}${timeline.slice(1).join('')}` : `${mediaGallery(n)}${detailSections(n)}`}${referenceSection(n)}${contextMarkup(n.id)}<h2>Connected knowledge</h2><div class="connection-switch" role="group" aria-label="연결 보기 방식"><button data-connection-view="list" aria-pressed="true">목록</button><button data-connection-view="graph" aria-pressed="false">그래프</button></div><div id="connected-list" class="reader-chips" role="group" aria-label="직접 연결된 지식 목록">${rels.map(r => `<button data-read="${esc(r.node.id)}"><small>${r.out ? '→' : '←'} ${esc(relationLabel(r.edge.predicate))}</small><strong>${esc(r.node.label)} ↗</strong><span>${esc(r.node.summary)}</span></button>`).join('') || '<p>연결 근거 정리 중</p>'}</div><div id="connected-graph-panel" hidden><p class="connected-help">직접 연결된 항목만 표시합니다. 빈 공간 드래그로 회전, 노드 드래그로 이동, 클릭으로 상세 보기.</p><div id="connected-graph" class="connected-graph" role="group" aria-label="직접 연결된 지식 그래프"></div></div><button class="reader-cta" data-node="${esc(id)}">이 지식의 연결 탐색하기 ↗</button>${n.url && !['Project', 'Presentation'].includes(n.type) && !n.links?.some(l => l.url === n.url) ? `<a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${esc(n.urlLabel || '프로젝트 저장소')} ↗</a>` : ''}<h2>Sources</h2><p class="source-note">${evidence(n)}</p>`;
    if (person) {
      const toc = document.createElement('div'); toc.className = 'reader-toc';
      toc.setAttribute('role','navigation'); toc.setAttribute('aria-label','소개 목차');
      const title = document.createElement('p'); title.textContent = 'ON THIS PAGE'; toc.append(title);
      $('#reader-content').querySelectorAll('h2').forEach((heading, index) => {
        heading.id = `profile-section-${index}`;
        const button = document.createElement('button'); button.dataset.section = heading.id;
        button.textContent = heading.textContent; toc.append(button);
      });
      $('#reader-list').append(toc);
    }
    $('#reader-content').scrollTop = 0;
    updateConnectionView();
    updateToc();
  }
  function updateConnectionView() {
    disposeConnected(); disposeConnected = () => {};
    const graphView = connectionView === 'graph';
    $('#connected-list').hidden = graphView;
    $('#connected-graph-panel').hidden = !graphView;
    root.querySelectorAll('[data-connection-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.connectionView===connectionView)));
    if (graphView) disposeConnected = mountConnectedGraph($('#connected-graph'), readerId, data, id => {
      renderReader(id); $('#reader-content').scrollTop = 0;
    });
  }
  function openOntology() {
    disposeConnected();
    readerType = 'all';
    $('#reader-content').innerHTML = ontologyGuide(data.nodes.length, data.edges.length);
    $('#reader-list').innerHTML = [['ontology-basics','노드와 관계'],['ontology-paths','구조 시각화'],['ontology-types','항목 종류'],['ontology-reading','해석 기준'],['ontology-explore','탐색 방법']].map(([id,label]) => `<button data-section="${id}">${label}</button>`).join('');
    $('#reader-content').scrollTop = 0;
    if (!$('#reader').open) $('#reader').showModal();
    updateToc();
  }
  function openReader(id, type) {
    readerType = type || byId.get(id)?.type || 'all';
    renderReader(id);
    if (!$('#reader').open) $('#reader').showModal();
    updateToc();
  }
  function closeReader() {
    disposeConnected();
    $('#reader').close();
  }
  function sphere(p, r, alpha, selected) {
    const c = categories[categoryFor(p.node.type)];
    ctx.globalAlpha = alpha;
    if (state.light) {
      const gradient = ctx.createRadialGradient(p.x - r * .3, p.y - r * .4, r * .05, p.x, p.y, r);
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(.4, c.light);
      gradient.addColorStop(1, c.shade);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      halo.addColorStop(0, '#ffffff');
      halo.addColorStop(.09, c.color);
      halo.addColorStop(.25, c.color + '85');
      halo.addColorStop(.6, c.color + '15');
      halo.addColorStop(1, c.color + '00');
      ctx.fillStyle = halo;
      ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.1, r * .23), 0, Math.PI * 2);
      ctx.fill();
    }
    if (selected) {
      ctx.strokeStyle = state.light ? '#20242d' : c.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function sceneGeometry() {
    const narrow = w < 760;
    return {
      zoom: state.zoom * Math.min((w - (narrow ? 40 : 420)) / 710, (h - (narrow ? 270 : 180)) / 600),
      cx: narrow ? w / 2 : w / 2 + 35,
      cy: narrow ? h * .58 : h * .53
    };
  }
  function draw(time) {
    if (!ctx || !data) return;
    ctx.clearRect(0, 0, w, h);
    const rgb = state.light ? '40,47,64' : '218,224,238';
    const home = state.view === 'intro';
    const view = viewCamera(),
      px = !home && state.spin ? 0 : pointer.x,
      py = !home && state.spin ? 0 : pointer.y,
      starYaw = home ? px * .045 : state.yaw * .035 + px * .055,
      starPitch = home ? py * .035 : state.pitch * .035 - py * .04;
    if (!home && !state.light) {
      for (const [x, y, r, color] of [[.58, .40, .5, '#7770ad'], [.77, .63, .38, '#477a99']]) {
        const haze = ctx.createRadialGradient(w * x + px * 18, h * y + py * 12, 0, w * x, h * y, w * r);
        haze.addColorStop(0, color + '18');
        haze.addColorStop(.45, color + '09');
        haze.addColorStop(1, color + '00');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);
      }
    }
    for (const s of stars) {
      const p = project(s, starYaw, starPitch, Math.max(w / 1600, h / 1000), w, h);
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue;
      const twinkle = state.motion ? .82 + .18 * Math.sin(time * .0005 + s.phase) : 1;
      const opacity = (home ? .8 : .86) * twinkle * (.22 + s.r * .78);
      const size = (.35 + s.r * 1.1) * p.scale;
      ctx.fillStyle = state.light ? '#4b5365' : s.tint < .15 ? '#b7dbf4' : s.tint > .88 ? '#f3dfad' : '#e0e4ed';
      ctx.globalAlpha = opacity;
      if (s.r > .977 && !state.light) {
        ctx.drawImage(glow, p.x - 11 * p.scale, p.y - 11 * p.scale, 22 * p.scale, 22 * p.scale);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(.3, size), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (home) {
      const halo = ctx.createRadialGradient(w * .5, h * .46, 0, w * .5, h * .46, w * .43);
      halo.addColorStop(0, state.light ? '#c7cbd822' : '#8794b40b');
      halo.addColorStop(1, '#ffffff00');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    const {
      zoom,
      cx,
      cy
    } = sceneGeometry();
    projected = data.nodes.map(n => ({
      ...project(n, view.yaw, view.pitch, zoom, w, h, cx + view.offsetX, cy + view.offsetY, state.spacing),
      node: n
    }));
    const positions = new Map(projected.map(p => [p.node.id, p]));
    const focused = drag?.node?.id || state.hover || state.selected,
      connected = new Set(focused ? [focused, ...related(focused).map(r => r.node.id), ...pathsFor(focused).flatMap(p => p.ids)] : []);
    const contextEdges = new Set(focused ? pathsFor(focused).flatMap(p => p.edges.map(e => e.id)) : []);
    const filtered = state.filter !== 'all' || state.query.trim();
    for (const e of state.edgesVisible ? data.edges : []) {
      const a = positions.get(e.source),
        b = positions.get(e.target);
      let alpha = focused ? e.source === focused || e.target === focused || contextEdges.has(e.id) ? 0.62 : 0.045 : 0.16;
      if (filtered && (!activeIds.has(e.source) || !activeIds.has(e.target))) alpha *= .18;
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth = focused && (e.source === focused || e.target === focused || contextEdges.has(e.id)) ? 1.15 : .6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (const p of [...projected].sort((a, b) => b.z - a.z)) {
      const n = p.node;
      let alpha = clamp(1 - p.z / 900, .25, 1);
      if (focused && !connected.has(n.id)) alpha *= .20;
      if (filtered && !activeIds.has(n.id)) alpha *= .12;
      const r = Math.max(1.2, n.radius * p.scale);
      if ((n.id === focused || n.degree > 7) && !state.light) {
        ctx.globalAlpha = alpha * .45;
        ctx.drawImage(glow, p.x - r * 4, p.y - r * 4, r * 8, r * 8);
        ctx.globalAlpha = 1;
      }
      sphere(p, r, alpha, n.id === state.selected);
    }
    // Labels yield to panels and other labels; hidden labels remain in the accessible list.
    const boxes = [];
    if (w >= 760) {
      boxes.push({
        x: 0,
        y: 210,
        w: 225,
        h: h - 210
      });
      if (state.selected) boxes.push({
        x: w - 320,
        y: 210,
        w: 320,
        h: h - 210
      });
    } else boxes.push({
      x: 0,
      y: 0,
      w,
      h: 300
    });
    const labels = projected.filter(p => p.node.id === focused || p.node.id === state.selected || (focused && connected.has(p.node.id)) || (!filtered && ['Person', 'Project', 'Article', 'Concept'].includes(p.node.type)) || (filtered && activeIds.has(p.node.id))).sort((a, b) => (b.node.id === focused ? 100 : 0) + (b.node.id === state.selected ? 90 : 0) + b.node.degree - (a.node.id === focused ? 100 : 0) - (a.node.id === state.selected ? 90 : 0) - a.node.degree);
    for (const p of labels) {
      const n = p.node;
      if (focused && !connected.has(n.id)) continue;
      if (p.x < 8 || p.x > w - 8 || p.y < 150 || p.y > h - 135) continue;
      ctx.font = `${n.id === focused ? 12 : 10}px -apple-system,BlinkMacSystemFont,sans-serif`;
      let text = n.label;
      while (ctx.measureText(text).width > Math.min(270, w - 70) && text.length > 1) text = text.slice(0, -2) + '…';
      const width = ctx.measureText(text).width + 10;
      const box = {
        x: clamp(p.x - width / 2, 8, w - width - 8),
        y: p.y + n.radius * p.scale + 10,
        w: width,
        h: 19
      };
      if (boxes.some(b => box.x < b.x + b.w + 3 && box.x + box.w + 3 > b.x && box.y < b.y + b.h + 3 && box.y + box.h + 3 > b.y)) continue;
      boxes.push(box);
      ctx.fillStyle = state.light ? '#f4f5f7ed' : '#07080be8';
      ctx.fillRect(box.x, box.y, width, 19);
      ctx.fillStyle = state.light ? '#333b4c' : n.id === focused ? '#fff' : '#c8cbd3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, box.x + width / 2, box.y + 9);
    }
    updateCameraLabel();
  }
  function animate(time) {
    const dt = Math.min((time - lastTime) / 1000 || .016, .032);
    lastTime = time;
    if (state.motion) {
      if (!drag && !state.hover && !$('#reader').open) for (const axis of ['x', 'y']) {
        const v = 'v' + axis;
        pointer[v] += (100 * (pointer['t' + axis] - pointer[axis]) - 10 * pointer[v]) * dt;
        pointer[axis] += pointer[v] * dt;
      }
      if (state.view === 'graph' && !drag) {
        state.yaw += orbit.vx;
        state.pitch = clamp(state.pitch + orbit.vy, -1.25, 1.25);
        orbit.vx *= Math.pow(.88, dt * 60);
        orbit.vy *= Math.pow(.88, dt * 60);
        if (state.spin) state.yaw += dt * .055;
      }
    } else {
      pointer.x = pointer.y = pointer.vx = pointer.vy = 0;
      orbit.vx = orbit.vy = 0;
    }
    if (state.view === 'intro') {
      root.querySelectorAll('.floating-card').forEach((card, i) => {
        const depth = [20, 32, 26, 38][i],
          tilt = [-9, 10, 7, -10][i];
        card.style.transform = `perspective(1000px) translate3d(${pointer.x * depth}px,${pointer.y * depth}px,0) rotateX(${-pointer.y * 9}deg) rotateY(${pointer.x * 12}deg) rotateZ(${tilt}deg)`;
      });
    }
    draw(time);
    if (!document.hidden) frame = requestAnimationFrame(animate);
  }
  function hit(x, y) {
    if (state.view !== 'graph') return null;
    return [...projected].filter(p => activeIds.has(p.node.id) && Math.hypot(p.x - x, p.y - y) < Math.max(12, p.node.radius * p.scale + 7)).sort((a, b) => a.z - b.z)[0]?.node || null;
  }
  on(canvas, 'pointerdown', e => {
    if (state.view !== 'graph' || e.button !== 0) return;
    state.hover = null;
    $('#node-tooltip').hidden = true;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY
    });
    if (pointers.size === 1) {
      const node = hit(e.clientX, e.clientY),
        view = viewCamera();
      pointer.vx = pointer.vy = 0;
      drag = {
        id: e.pointerId,
        node,
        yaw: view.yaw,
        pitch: view.pitch,
        scale: node ? projected.find(p => p.node === node).scale : 1,
        spacing: state.spacing,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
        moved: false
      };
      orbit.vx = orbit.vy = 0;
    } else {
      const ps = [...pointers.values()];
      pinchDistance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (drag) {
        drag.moved = true;
        drag.node = null;
      }
    }
    canvas.style.cursor = 'grabbing';
    root.classList.add('dragging');
  });
  on(canvas, 'pointermove', e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY
    });
    if (pointers.size > 1) {
      const ps = [...pointers.values()],
        distance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (pinchDistance > 0) state.zoom = clamp(state.zoom * distance / pinchDistance, .5, 3.2);
      pinchDistance = distance;
      return;
    }
    if (drag && drag.id === e.pointerId) {
      if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) <= 5) return;
      drag.moved = true;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (drag.node) moveInView(drag.node, dx, dy, drag.yaw, drag.pitch, drag.scale, drag.spacing);else {
        state.yaw += dx * .006;
        state.pitch = clamp(state.pitch + dy * .006, -1.25, 1.25);
        orbit.vx = clamp(dx * .0015, -.04, .04);
        orbit.vy = clamp(dy * .0015, -.04, .04);
      }
      drag.x = e.clientX;
      drag.y = e.clientY;
      return;
    }
    if (state.view === 'graph' && e.pointerType !== 'touch') {
      const n = hit(e.clientX, e.clientY);
      state.hover = n?.id || null;
      const tip = $('#node-tooltip');
      tip.hidden = !n;
      if (n) {
        tip.textContent = `${typeName(n.type)} / ${n.label} — 드래그로 이동`;
        tip.style.left = `${clamp(e.clientX + 16, 8, w - 240)}px`;
        tip.style.top = `${Math.min(e.clientY + 16, h - 80)}px`;
      }
      canvas.style.cursor = 'grab';
    }
  });
  function release(e, canceled = false) {
    pointers.delete(e.pointerId);
    if (drag?.id === e.pointerId && !canceled) {
      if (!drag.moved && drag.node) select(drag.node.id);else if (drag.moved && drag.node) announce(`${drag.node.label} 위치 이동. 새로고침하면 기본 배치로 돌아갑니다.`);
    }
    if (pointers.size === 0) {
      drag = null;
      pinchDistance = 0;
      root.classList.remove('dragging');
      canvas.style.cursor = 'grab';
    } else {
      const [id, p] = pointers.entries().next().value;
      drag = {
        id,
        node: null,
        x: p.x,
        y: p.y,
        startX: p.x,
        startY: p.y,
        moved: true
      };
    }
    if (canceled || !state.motion) orbit.vx = orbit.vy = 0;
  }
  on(canvas, 'pointerup', e => release(e));
  on(canvas, 'pointercancel', e => release(e, true));
  on(canvas, 'pointerleave', () => {
    state.hover = null;
    $('#node-tooltip').hidden = true;
  });
  on(canvas, 'wheel', e => {
    if (state.view !== 'graph') return;
    e.preventDefault();
    if (drag) return;
    state.zoom = clamp(state.zoom * Math.exp(-e.deltaY * .001), .5, 3.2);
  }, {
    passive: false
  });
  on(window, 'pointermove', e => {
    if (!fine.matches || !state.motion || e.pointerType === 'touch' || (state.view === 'graph' && state.spin)) return;
    const tracking = state.view === 'intro' || e.target === canvas;
    pointer.tx = tracking ? clamp((e.clientX / w - .5) * 2, -1, 1) : 0;
    pointer.ty = tracking ? clamp((e.clientY / h - .5) * 2, -1, 1) : 0;
  });
  on(document.documentElement, 'pointerleave', () => {
    pointer.tx = pointer.ty = 0;
  });
  on(fine, 'change', () => {
    pointer.x = pointer.y = pointer.tx = pointer.ty = pointer.vx = pointer.vy = 0;
  });
  on(window, 'blur', () => {
    pointer.tx = pointer.ty = 0;
    pointers.clear();
    drag = null;
    orbit.vx = orbit.vy = 0;
    root.classList.remove('dragging');
  });
  on($('#search'), 'input', e => {
    state.query = e.target.value;
    renderList();
  });
  on($('#node-spacing'), 'input', e => {
    state.spacing = Number(e.target.value) / 100;
    e.target.nextElementSibling.value = `${e.target.value}%`;
    draw(performance.now());
  });
  function updateToc() {
    const article = $('#reader-content');
    const buttons = [...$('#reader-list').querySelectorAll('[data-section]')];
    if (!buttons.length) return;
    const threshold = article.getBoundingClientRect().top + 64;
    let active = buttons[0];
    for (const button of buttons) {
      const section = root.querySelector('#'+button.dataset.section);
      if (section && section.getBoundingClientRect().top <= threshold) active = button;
    }
    if (article.scrollHeight > article.clientHeight && article.scrollTop + article.clientHeight >= article.scrollHeight - 2) active = buttons[buttons.length-1];
    for (const button of buttons) {
      button.classList.toggle('is-current',button===active);
      if (button===active) button.setAttribute('aria-current','location');
      else button.removeAttribute('aria-current');
    }
  }
  on($('#reader-content'), 'scroll', updateToc);
  on($('#close-reader'), 'click', closeReader);
  function motionControls() {
    root.querySelector('[data-action=spin]').disabled = !state.motion;
    root.querySelector('[data-action=motion]').textContent = state.motion ? '모션 끄기' : '모션 켜기';
    root.querySelector('[data-action=motion]').setAttribute('aria-pressed', String(!state.motion));
  }
  on(root, 'click', e => {
    const b = e.target.closest('button');
    if (!b || !data) return;
    if (b.dataset.connectionView) { connectionView = b.dataset.connectionView; updateConnectionView(); return; }
    if (b.dataset.section) { root.querySelector('#'+b.dataset.section)?.scrollIntoView({behavior:'auto',block:'start'}); return; }
    if (b.dataset.video) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1`;
      iframe.title = b.getAttribute('aria-label');
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      b.replaceWith(iframe);
      return;
    }
    if (b.dataset.route) {
      navigate(b.dataset.route);
      return;
    }
    if (b.dataset.node) {
      if ($('#reader').open) closeReader();
      select(b.dataset.node);
      return;
    }
    if (b.dataset.open) {
      openReader(b.dataset.open);
      return;
    }
    if (b.dataset.read) {
      renderReader(b.dataset.read);
      $('#reader-content').scrollTop = 0;
      return;
    }
    if (b.dataset.collection) {
      const n = data.nodes.find(n => b.dataset.collection === 'Research' ? ['Paper'].includes(n.type) : n.type === b.dataset.collection);
      if (n) openReader(n.id, b.dataset.collection);
      return;
    }
    if (b.dataset.filter) {
      state.filter = b.dataset.filter;
      renderList();
      return;
    }
    switch (b.dataset.action) {
      case 'reload':
        window.location.reload();
        break;
      case 'ontology':
        openOntology();
        break;
      case 'home':
        setView('intro');
        break;
      case 'graph':
        setView('graph');
        break;
      case 'clear':
        state.selected = null;
        renderInspector();
        renderList();
        break;
      case 'left':
        state.yaw -= .24;
        orbit.vx = orbit.vy = 0;
        break;
      case 'right':
        state.yaw += .24;
        orbit.vx = orbit.vy = 0;
        break;
      case 'zoom-in':
        state.zoom = clamp(state.zoom * 1.18, .5, 3.2);
        break;
      case 'zoom-out':
        state.zoom = clamp(state.zoom / 1.18, .5, 3.2);
        break;
      case 'reset':
        state.yaw = -.22;
        state.pitch = .16;
        state.zoom = 1;
        state.spacing = 1;
        $('#node-spacing').value = '100';
        $('#node-spacing').nextElementSibling.value = '100%';
        orbit.vx = orbit.vy = 0;
        break;
      case 'edges':
        state.edgesVisible = !state.edgesVisible;
        b.setAttribute('aria-pressed', String(state.edgesVisible));
        b.textContent = state.edgesVisible ? '연결선 켜짐' : '연결선 꺼짐';
        announce(state.edgesVisible ? '연결선을 표시합니다.' : '연결선을 숨겼습니다.');
        break;
      case 'spin':
        state.spin = !state.spin;
        pointer.x = pointer.y = pointer.tx = pointer.ty = pointer.vx = pointer.vy = 0;
        orbit.vx = orbit.vy = 0;
        b.setAttribute('aria-pressed', String(state.spin));
        break;
      case 'list':
        openReader(state.selected || 'person:soyeong', 'all');
        break;
      case 'theme':
        state.light = !state.light;
        root.classList.toggle('light', state.light);
        b.innerHTML = `◐ <span>${state.light ? 'Dark' : 'Light'}</span>`;
        b.setAttribute('aria-label', state.light ? '다크 모드로 전환' : '라이트 모드로 전환');
        break;
      case 'motion':
        state.motion = !state.motion;
        if (!state.motion) {
          state.spin = false;
          root.querySelector('[data-action=spin]').setAttribute('aria-pressed', 'false');
        }
        motionControls();
        break;
      default:
        break;
    }
    draw(performance.now());
  });
  on(window, 'resize', resize);
  on(window, 'resize', updateToc);
  on(document, 'visibilitychange', () => {
    cancelAnimationFrame(frame);
    lastTime = 0;
    if (!document.hidden) frame = requestAnimationFrame(animate);
  });
  on(reduced, 'change', () => {
    state.motion = !reduced.matches;
    motionControls();
  });
  try {
    data = JSON.parse(JSON.stringify(graph));
    for (const n of data.nodes) for (const m of n.media || []) m.url = localMedia[m.url] || m.url;
    byId = assignPositions(data.nodes, data.edges);
    $('.type-filters').innerHTML = '<button data-filter="all" aria-pressed="true">All knowledge</button>' + Object.entries(categories).map(([id, c]) => `<button data-filter="${id}" aria-pressed="false">${swatch(id)}${esc(c.label)}</button>`).join('');
    $('#graph-count').textContent = `${data.nodes.length} NODES / ${data.edges.length} RELATIONS`;
    renderList();
    motionControls();
    resize();
    frame = requestAnimationFrame(animate);
  } catch (error) {
    $('#load-error').hidden = false;
    console.error('Cosmos initialization failed', error);
  }
  on(root, 'error', e => {
    if (e.target.matches?.('.media-grid img')) {
      e.target.classList.add('media-error');
      e.target.closest('figure').querySelector('figcaption').insertAdjacentHTML('beforeend', '<span>미리보기를 불러오지 못했어요. 원본 링크에서 확인하세요.</span>');
    }
  }, true);
  return () => {
    disposeConnected();
    cancelAnimationFrame(frame);
    listeners.forEach(remove => remove());
    if ($('#reader').open) $('#reader').close();
    root.classList.remove('graph', 'light', 'dragging');
  };
}
