import graph from './graph.json';
import { contextPaths, newestFirst, mediaOrder, profileMedia, mediaOwners } from './relations';
import { categories, categoryFor } from './spatial';
import { connectedSubgraph } from './connectedGraph';

test('KT context reaches confirmed duties and external activities without unrelated side projects', () => {
  const paths = contextPaths('organization:kt', graph.nodes, graph.edges);
  const targets = paths.map(p => p.ids[p.ids.length - 1]);
  expect(targets).toEqual(expect.arrayContaining(['project:rca', 'project:tracebench', 'project:preflight', 'capability:agent-leadership']));
  expect(targets).not.toContain('project:sobok');
  expect(paths.every(p => p.edges.every(e => e.assertionStatus === 'sourced'))).toBe(true);
  const edges = graph.edges.map(e => e.predicate === 'duringExperience' ? { ...e, assertionStatus: 'proposed' } : e);
  expect(contextPaths('organization:kt', graph.nodes, edges).flatMap(p => p.ids)).not.toContain('project:rca');
  for (const node of graph.nodes) expect(categories[categoryFor(node.type)]).toBeDefined();
});

test('dated records sort newest first, undated last, with requested profile video first', () => {
  expect([{date:'2024-01'}, {}, {startDate:'2026-09'}, {date:'2026-05-20'}].sort(newestFirst))
    .toEqual([{startDate:'2026-09'}, {date:'2026-05-20'}, {date:'2024-01'}, {}]);
  const entries = [
    { m: {url:'latest', date:'2026-10-09'}, owner:{} },
    { m: {url:'video', date:'2026-08-12', profilePriority:1}, owner:{} },
    { m: {url:'old'}, owner:{startDate:'2021-03'} }
  ];
  expect(entries.sort(mediaOrder).map(e => e.m.url)).toEqual(['video','latest','old']);
  expect(graph.nodes.find(n => n.type === 'Person').media).toEqual([]);
});

test('technical archive separates reviewed work and preserves existing article routes', () => {
  expect(graph.edges).toEqual(expect.arrayContaining([
    expect.objectContaining({source:'writing:tistory-copilot', predicate:'publishedIn', target:'channel:tistory'})
  ]));
  expect(graph.nodes.some(n => n.id === 'publication:handbook')).toBe(false);
  expect(graph.nodes.find(n => n.id === 'review:tistory-handbook').references[0].title).toContain('HANDBOOK.md:');
  expect(graph.nodes.find(n => n.id === 'article:customize').slug).toBe('agent-customize');
  expect(graph.edges.some(e => e.source === 'contribution:yoco' && e.predicate === 'duringEducation')).toBe(false);
});

test('blog ownership, authorship and publication form distinct links in the local view', () => {
  const local = connectedSubgraph('channel:tistory', graph.nodes, graph.edges);
  expect(local.nodes.map(n => n.id)).toEqual(expect.arrayContaining(['person:soyeong','review:tistory-handbook','writing:tistory-copilot']));
  expect(local.edges).toEqual(expect.arrayContaining([
    expect.objectContaining({source:'person:soyeong',predicate:'owns',target:'channel:tistory'}),
    expect.objectContaining({source:'person:soyeong',predicate:'authored',target:'review:tistory-handbook'}),
    expect.objectContaining({source:'review:tistory-handbook',predicate:'publishedIn',target:'channel:tistory'})
  ]));
  const targets = contextPaths('channel:tistory', graph.nodes, graph.edges).flatMap(p => p.ids);
  expect(targets).toContain('concept:evaluation');
  expect(targets).not.toContain('project:har');
  expect(graph.edges.some(e => e.source === 'person:soyeong' && e.predicate === 'owns' && e.target === 'channel:kode')).toBe(false);
});

test('direct personal facts are never rediscovered through a longer organization or channel detour', () => {
  const paths = contextPaths('person:soyeong', graph.nodes, graph.edges);
  for (const edge of graph.edges.filter(e => e.source === 'person:soyeong' && e.assertionStatus === 'sourced')) {
    expect(paths.find(p => p.ids[p.ids.length - 1] === edge.target).edges).toHaveLength(1);
  }
});

test('HAR retains separate degree and follow-up work and technology use is personal, not copied from the team', () => {
  const projectLink = graph.edges.find(e => e.source === 'person:soyeong' && e.predicate === 'workedOn' && e.target === 'project:har');
  expect(projectLink.basisPaths).toHaveLength(2);
  const paths = contextPaths('experience:snu', graph.nodes, graph.edges).flatMap(p => p.ids);
  expect(paths).toEqual(expect.arrayContaining(['project:har','capability:data-platform','capability:wearable-app']));
  expect(graph.edges).toEqual(expect.arrayContaining([
    expect.objectContaining({source:'contribution:har-followup',predicate:'usesTechnology',target:'technology:garmin'}),
    expect.objectContaining({source:'contribution:preflight',predicate:'implemented',target:'agent:recon'})
  ]));
  expect(graph.edges.some(e => e.source === 'contribution:preflight' && e.predicate === 'implemented' && e.target === 'agent:policy')).toBe(false);
  expect(graph.edges.some(e => e.source === 'review:tistory-handbook' && e.predicate === 'demonstrates')).toBe(false);
});


test('profile media shares a two-item cap across project, writing and video records', () => {
  const ids = ['media:preflight', 'writing:preflight-kode', 'project:preflight', 'article:customize'];
  const seen = new Set();
  const items = graph.nodes.filter(n => ids.includes(n.id)).flatMap(owner =>
    (owner.media || []).filter(m => {
      if (seen.has(m.url)) return false;
      seen.add(m.url);
      return true;
    }).map(m => ({m, owner})));
  const selected = profileMedia(items, graph.edges);
  expect(selected.map(({m}) => m.title)).toEqual([
    'Microsoft Korea 마소코멘트 / PreFlight',
    'PreFlight / 시스템 아키텍처',
    'AI 코딩 에이전트 커스터마이징'
  ]);
  expect(items.length).toBeGreaterThan(selected.length);
  const standalone = [1,2,3].map(i => ({owner:{id:'standalone'},m:{url:String(i),featured:i>1}}));
  expect(profileMedia(standalone, []).map(({m}) => m.url)).toEqual(['2','3']);
});


test('Soyeong media includes contributed projects without pulling unrelated organization media', () => {
  const owners = mediaOwners('person:soyeong', graph.nodes, graph.edges);
  expect(owners.map(n => n.id)).toEqual(expect.arrayContaining([
    'project:yoco', 'project:prupru', 'project:blooming', 'project:sobok', 'media:preflight'
  ]));
  const seen = new Set();
  const items = owners.flatMap(owner => (owner.media || []).filter(m => {
    if (seen.has(m.url)) return false;
    seen.add(m.url); return true;
  }).map(m => ({m,owner})));
  const selected = profileMedia(items, graph.edges);
  for (const id of ['project:yoco','project:prupru','project:blooming','project:sobok'])
    expect(selected.filter(item => item.owner.id === id)).toHaveLength(2);
  expect(selected[0].m.videoId).toBe('oSdZnvZG0d4');
});

test('public graph excludes unpublished invention records and their sources', () => {
  expect(JSON.stringify(graph)).not.toMatch(/patent|직무발명|명세서|승계|특허/i);
});

test('HAR project displays the actual thesis title separately from its degree type', () => {
  const project = graph.nodes.find(n => n.id === 'project:har');
  const thesis = graph.nodes.find(n => n.id === 'paper:har-thesis');
  expect(project.details).toContainEqual(expect.objectContaining({
    title: '석사 학위논문',
    paragraphs: expect.arrayContaining([thesis.fullTitle]),
  }));
});
