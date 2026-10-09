"""Build the local design fixture from the reviewed sample and current blog metadata."""
import json
import re
from pathlib import Path
from relation_rules import derive_relations

here = Path(__file__).resolve().parent
repo = here.parents[2]
data = json.loads((here.parent / 'ontology.sample.json').read_text())
ids = {n['id'] for n in data['nodes']}

def node(id_, type_, label, source, **fields):
    if id_ not in ids:
        data['nodes'].append(dict(id=id_, type=type_, label=label, evidenceIds=[source], visibility='review', **fields))
        ids.add(id_)

def edge(source, predicate, target, evidence):
    if not any((e['source'], e['predicate'], e['target']) == (source, predicate, target) for e in data['edges']):
        data['edges'].append(dict(id=f"relation:{max((int(e['id'].split(':')[1]) for e in data['edges']), default=0)+1:03d}", source=source, predicate=predicate, target=target, evidenceIds=[evidence], assertionStatus='sourced', visibility='review'))

posts = (repo / 'src/components/Freeform/posts.js').read_text()
blocks = re.findall(r'slug: "([^"]+)"(.*?)(?=\n  \},)', posts, re.S)
article_ids = {n['slug']: n['id'] for n in data['nodes'] if n['type'] in {'Writing','Review'} and n.get('slug')}
assert set(article_ids).issubset({slug for slug, _ in blocks}), 'Included article metadata missing'
for slug, block in blocks:
    # Only explicitly included ontology articles may import their sections.
    if slug not in article_ids:
        continue
    for anchor, label in re.findall(r'\{ id: "([^"]+)", label: "([^"]+)" \}', block):
        id_ = f'section:{slug}/{anchor}'
        node(id_, 'Section', label, 'repo-posts', summary=f'{slug} 글의 {label} 섹션.', articleId=article_ids[slug], anchor=anchor)
        edge(article_ids[slug], 'hasSection', id_, 'repo-posts')

main = (repo / 'src/components/Main/MainPage.js').read_text()
project_body = re.search(r'const projects = \[(.*?)\n  \];', main, re.S).group(1)
project_blocks = re.findall(r'title: "([^"]+)"(.*?)(?=\n    \},)', project_body, re.S)
assert len(project_blocks) == 6, 'Project metadata shape changed; review the extractor'
project_ids = ['preflight','har','yoco','prupru','blooming','sobok']
for (title, block), pid in zip(project_blocks, project_ids):
    skills = re.search(r'skills: \[(.*?)\]', block, re.S)
    assert skills, title
    for tech in re.findall(r'"([^"]+)"', skills[1]):
        tid = 'technology:' + re.sub(r'[^a-z0-9]+', '-', tech.lower()).strip('-')
        node(tid, 'Technology', tech, 'repo-projects', summary=f'현재 블로그의 프로젝트 기술 목록에 기록된 {tech}.')
        edge(f'project:{pid}', 'usesTechnology', tid, 'repo-projects')

for eid, institution in [('snu','Seoul National University'),('cnu','Chungnam National University')]:
    node(f'organization:{eid}', 'Organization', institution, 'repo-profile', summary='기존 블로그 학력에 표기된 학교.')
    edge(f'education:{eid}', 'atInstitution', f'organization:{eid}', 'repo-profile')
edge('education:snu', 'researchProject', 'project:har', 'career')
edge('education:cnu', 'researchProject', 'project:prupru', 'user-project-context')
preflight_media = next(n['media'] for n in data['nodes'] if n['id']=='project:preflight')
architecture = [m for m in preflight_media if m['kind']=='image'][:2]
node('system:preflight','AgentSystem','PreFlight Agent System','kode-preflight',media=architecture,summary='Bicep으로 구조화한 아키텍처를 Policy와 Recon이 분석하고 Reporter가 통합하는 시스템.')
edge('project:preflight','realizes','system:preflight','repo-projects')
for aid, label, desc in [('policy','Policy','정책 정합성 검토'),('recon','Recon','잠재 위험 분석'),('reporter','Reporter','보고서 통합')]:
    node(f'agent:{aid}','Agent',label,'kode-preflight',summary=desc)
    edge('system:preflight','hasAgent',f'agent:{aid}','repo-projects')

# Link only the technologies and components recorded in the individual's role.
for cid, tids in {
    'rca': ['langgraph'], 'preflight': ['fastapi', 'react'],
    'prupru': ['firebase'], 'blooming': ['docker', 'react'],
    'sobok': ['react', 'node-js', 'express', 'mongodb'],
    'har-followup': ['garmin'],
}.items():
    for tid in tids:
        edge(f'contribution:{cid}', 'usesTechnology', f'technology:{tid}',
             'user-har-followup' if cid == 'har-followup' else 'career' if cid == 'rca' else 'repo-projects')
edge('contribution:rca', 'implemented', 'system:rca', 'career')
edge('contribution:rca', 'implemented', 'tool:device', 'career')
edge('contribution:preflight', 'implemented', 'agent:recon', 'career')
for tid in ['github-copilot-sdk', 'microsoft-agent-framework']:
    edge('writing:tistory-copilot', 'coversTechnology', f'technology:{tid}', 'tistory-copilot')
    edge('capability:agent-sdk', 'appliesTechnology', f'technology:{tid}', 'user-preflight-capabilities')
derive_relations(data)

assert all(e['source'] in ids and e['target'] in ids for e in data['edges'])
assert sum(n['type']=='Section' for n in data['nodes'])==7
assert len(ids)==len(data['nodes'])
assert len({e['id'] for e in data['edges']})==len(data['edges'])
for n in data['nodes']:
    n.setdefault('summary', n['label'])
data['schemaVersion']='0.5-relations'
data['note']='Local review fixture. Decorative stars are not graph entities. Unreviewed career data must not be published.'
(here / 'graph.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f"Built {len(ids)} source-backed entities and {len(data['edges'])} relations")

if '--app' in __import__('sys').argv:
    (repo / 'src/components/Cosmos/graph.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print('Updated React application graph')
