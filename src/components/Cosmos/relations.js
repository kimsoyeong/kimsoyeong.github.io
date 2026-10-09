const relationLabels = {
  owns:'소유한 게시 공간', authored:'작성한 글 또는 논문', publishedIn:'게시된 공간', publishedBy:'발행 조직',
  workedOn:'수행한 프로젝트', hasContribution:'맡은 기여', inProject:'기여한 프로젝트', demonstrates:'드러난 역량', hasCapability:'보유 역량',
  workedAt:'근무 이력', studiedAt:'학업 이력', participatedIn:'참여한 행사 또는 프로그램',
  hasExperience:'재직 기록', atOrganization:'활동 조직', partOf:'상위 조직', memberOf:'소속 조직',
  hasEducation:'학위 과정', atInstitution:'교육 기관', researchProject:'과정 내 연구 또는 프로젝트',
  duringExperience:'수행 당시 경력', duringEducation:'수행 당시 학위 과정', duringParticipation:'수행한 참가 활동',
  hasRole:'담당 역할', hasParticipation:'참가 기록', atEvent:'해당 행사', withProject:'참가 프로젝트', inProgram:'교육 프로그램',
  receivedAward:'수상', organizedBy:'주최 조직', issuedBy:'발급 또는 수여 기관',
  presented:'발표', presentsProject:'발표한 프로젝트', appearedIn:'출연', featuresProject:'소개한 프로젝트',
  documents:'기록한 프로젝트', producedDuring:'작성한 학위 과정', hasCredential:'자격 및 어학 기록',
  realizes:'구현한 시스템', hasAgent:'구성 에이전트', invokes:'실행 도구', implemented:'직접 개발한 구성 요소',
  usesTechnology:'사용 기술', coversTechnology:'글에서 다룬 기술', appliesTechnology:'활용 기술',
  about:'다루는 주제', appliesConcept:'역량의 지식 영역', broader:'상위 개념', hasSection:'글의 목차', reviews:'리뷰한 원문'
};
export const relationLabel = predicate => relationLabels[predicate] || predicate;

const contextPredicates = new Set(['atOrganization', 'partOf', 'duringExperience', 'duringEducation', 'duringParticipation', 'inProject', 'demonstrates', 'atEvent', 'withProject', 'inProgram', 'receivedAward', 'organizedBy', 'presentsProject', 'featuresProject', 'producedDuring', 'documents', 'publishedIn', 'reviews', 'about', 'appliesConcept', 'owns', 'workedOn', 'workedAt', 'studiedAt', 'participatedIn', 'atInstitution', 'researchProject', 'realizes', 'hasAgent', 'invokes', 'implemented', 'usesTechnology', 'coversTechnology', 'appliesTechnology', 'publishedBy', 'issuedBy']);
const expandableTypes = new Set(['Organization', 'Experience', 'Contribution', 'RoleAssignment', 'Participation', 'Education', 'Program', 'PublicationChannel', 'Writing', 'Review', 'AgentSystem']);

// Bounded paths expose existing evidence, without creating transitive fact edges.
export function contextPaths(id, nodes, edges) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  if (!byId.has(id)) return [];
  const paths = [], seen = new Set([id]), queue = [{ ids: [id], edges: [] }];
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], current = path.ids[path.ids.length - 1];
    if (path.edges.length >= 3 || (current !== id && !expandableTypes.has(byId.get(current).type))) continue;
    for (const edge of edges) {
      // Start with every direct fact so a longer detour never replaces it.
      if (edge.assertionStatus !== 'sourced' || (current !== id && !contextPredicates.has(edge.predicate))) continue;
      const next = edge.source === current ? edge.target : edge.target === current ? edge.source : null;
      if (!next || seen.has(next) || !byId.has(next) || byId.get(next).type === 'Person') continue;
      seen.add(next);
      const extended = { ids: [...path.ids, next], edges: [...path.edges, edge] };
      paths.push(extended);
      queue.push(extended);
    }
  }
  return paths;
}

export function newestFirst(a, b) {
  return (b.date || b.startDate || '').localeCompare(a.date || a.startDate || '');
}

export function mediaOrder(a, b) {
  return (b.m.profilePriority || 0) - (a.m.profilePriority || 0) || newestFirst({ date: a.m.date || a.owner.date || a.owner.startDate }, { date: b.m.date || b.owner.date || b.owner.startDate });
}

export function profileMedia(items, edges) {
  const counts = new Map();
  return [...items].sort((a, b) =>
    (b.m.profilePriority || 0) - (a.m.profilePriority || 0) ||
    Number(Boolean(b.m.featured)) - Number(Boolean(a.m.featured)) || mediaOrder(a, b)
  ).filter(({ owner }) => {
    const project = edges.find(e => e.source === owner.id && e.assertionStatus === 'sourced' &&
      ['documents', 'featuresProject', 'presentsProject', 'inProject'].includes(e.predicate));
    const group = project?.target || owner.id;
    const count = counts.get(group) || 0;
    counts.set(group, count + 1);
    return count < 2;
  }).sort(mediaOrder);
}

export function mediaOwners(id, nodes, edges) {
  const own = nodes.find(n => n.id === id);
  const related = new Set(edges.filter(e => e.source === id || e.target === id)
    .map(e => e.source === id ? e.target : e.source));
  if (own?.type === 'Person') {
    const contributions = new Set(edges.filter(e => e.source === id &&
      ['hasContribution', 'hasParticipation'].includes(e.predicate) && e.assertionStatus === 'sourced').map(e => e.target));
    edges.filter(e => contributions.has(e.source) && ['inProject', 'withProject'].includes(e.predicate) &&
      e.assertionStatus === 'sourced').forEach(e => related.add(e.target));
  }
  return [own, ...nodes.filter(n => related.has(n.id) && n.type !== 'Person')].filter(Boolean);
}

// Use personal contribution evidence, never the whole team's project stack.
export function profileTechnologies(personId, nodes, edges) {
  const sourced = edges.filter(e => e.assertionStatus === 'sourced');
  const owners = new Set([personId, ...sourced.filter(e => e.source === personId && ['hasContribution', 'hasCapability'].includes(e.predicate)).map(e => e.target)]);
  const ids = new Set(sourced.filter(e => owners.has(e.source) && ['usesTechnology', 'appliesTechnology'].includes(e.predicate)).map(e => e.target));
  const priority = new Map(['technology:langgraph', 'technology:microsoft-agent-framework', 'technology:github-copilot-sdk', 'technology:python'].map((id, i) => [id, i]));
  return nodes.filter(n => n.type === 'Technology' && ids.has(n.id)).sort((a, b) => (priority.get(a.id) ?? 4) - (priority.get(b.id) ?? 4) || a.label.localeCompare(b.label));
}
