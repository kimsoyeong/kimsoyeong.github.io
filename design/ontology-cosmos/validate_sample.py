"""Validate the design fixture, not a production ontology or publishing pipeline."""
import json
import sys
from pathlib import Path

data = json.loads((Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("ontology.sample.json")).read_text())
nodes = {node["id"]: node for node in data["nodes"]}
assert len(nodes) == len(data["nodes"]), "duplicate entity ID"
assert len({e["id"] for e in data["edges"]}) == len(data["edges"]), "duplicate edge ID"
assert len({(e["source"], e["predicate"], e["target"]) for e in data["edges"]}) == len(data["edges"])

domains = {
    "owns": ({"Person"}, {"PublicationChannel"}),
    "workedAt": ({"Person"}, {"Organization"}),
    "studiedAt": ({"Person"}, {"Organization"}),
    "participatedIn": ({"Person"}, {"Event", "Program"}),
    "atInstitution": ({"Education"}, {"Organization"}),
    "researchProject": ({"Education"}, {"Project"}),
    "hasSection": ({"Writing", "Review"}, {"Section"}),
    "issuedBy": ({"Award", "Credential"}, {"Organization"}),
    "implemented": ({"Contribution"}, {"AgentSystem", "Agent", "Tool"}),
    "coversTechnology": ({"Writing", "Review"}, {"Technology"}),
    "appliesTechnology": ({"Capability"}, {"Technology"}),
    "publishedIn": ({"Writing", "Review"}, {"PublicationChannel"}),
    "partOf": ({"Organization"}, {"Organization"}),
    "hasRole": ({"Person"}, {"RoleAssignment"}),
    "hasParticipation": ({"Person"}, {"Participation"}),
    "duringExperience": ({"Contribution", "RoleAssignment", "Participation", "Presentation", "Media", "Writing"}, {"Experience"}),
    "duringEducation": ({"Contribution"}, {"Education"}),
    "duringParticipation": ({"Contribution"}, {"Participation"}),
    "producedDuring": ({"Paper"}, {"Education"}),
    "withProject": ({"Participation"}, {"Project"}),
    "inProgram": ({"Participation"}, {"Program"}),
    "appliesConcept": ({"Capability"}, {"Concept"}),
    "about": ({"Writing", "Review", "Paper", "Project"}, {"Concept"}),
    "broader": ({"Concept"}, {"Concept"}),
    "hasContribution": ({"Person"}, {"Contribution"}),
    "workedOn": ({"Person"}, {"Project"}),
    "inProject": ({"Contribution"}, {"Project"}),
    "hasCapability": ({"Person"}, {"Capability"}),
    "demonstrates": ({"Contribution", "RoleAssignment"}, {"Capability"}),
    "hasEducation": ({"Person"}, {"Education"}),
    "authored": ({"Person"}, {"Writing", "Review", "Paper"}),
    "realizes": ({"Project"}, {"AgentSystem"}),
    "hasAgent": ({"AgentSystem"}, {"Agent"}),
    "invokes": ({"Agent"}, {"Tool"}),
    "usesTechnology": ({"Person", "Project", "AgentSystem", "Tool", "Contribution"}, {"Technology"}),
    "reviews": ({"Review"}, {"ExternalPublication", "ExternalWriting"}),
    "preparedDisclosure": ({"Person"}, {"Patent"}),
    "documents": ({"Paper", "Patent", "Writing"}, {"Project"}),
    "hasExperience": ({"Person"}, {"Experience"}),
    "atOrganization": ({"Experience", "RoleAssignment"}, {"Organization"}),
    "memberOf": ({"Person"}, {"Organization"}),
    "receivedAward": ({"Person", "Project", "Participation"}, {"Award"}),
    "atEvent": ({"Award", "Presentation", "Participation"}, {"Event"}),
    "organizedBy": ({"Event"}, {"Organization"}),
    "presented": ({"Person"}, {"Presentation"}),
    "presentsProject": ({"Presentation"}, {"Project"}),
    "appearedIn": ({"Person"}, {"Media"}),
    "featuresProject": ({"Media"}, {"Project"}),
    "publishedBy": ({"Media", "PublicationChannel"}, {"Organization"}),
    "hasCredential": ({"Person"}, {"Credential"}),
}
for record in [*data["nodes"], *data["edges"]]:
    assert record["visibility"] in {"public", "review", "private"}
    assert record["evidenceIds"], f"missing evidence: {record['id']}"
    assert all(key in data["sources"] for key in record["evidenceIds"])
for edge in data["edges"]:
    assert edge["source"] in nodes and edge["target"] in nodes, edge
    assert edge["source"] != edge["target"], edge
    domain, range_ = domains[edge["predicate"]]
    assert nodes[edge["source"]]["type"] in domain, edge
    assert nodes[edge["target"]]["type"] in range_, edge
    assert edge["assertionStatus"] in {"sourced", "proposed", "disputed"}

def visit(node_id, path):
    assert node_id not in path, "broader cycle"
    for edge in data["edges"]:
        if edge["source"] == node_id and edge["predicate"] == "broader":
            visit(edge["target"], path | {node_id})

for node in data["nodes"]:
    visit(node["id"], set())
    if node["type"] == "Contribution":
        assert any(e["source"] == node["id"] and e["predicate"] in {"inProject", "duringExperience"} for e in data["edges"])
    if node["type"] in {"Writing", "Paper", "Review"}:
        assert sum(e["target"] == node["id"] and e["predicate"] == "authored" for e in data["edges"]) == 1

# Removed reviews must not return through the ontology source fixture.
assert not any(term in json.dumps(data).lower() for term in ("openrca", "turboquant", "triattention"))
assert sum(n["type"] == "Project" for n in data["nodes"]) == 9
assert sum(n["type"] == "Writing" for n in data["nodes"]) == 3
print(f"PASS: {len(nodes)} entities, {len(data['edges'])} typed edges, evidence and cardinality checks")

assert sum(n['type']=='Paper' for n in data['nodes'])==1
assert not any(n['type']=='Patent' for n in data['nodes'])
assert not any(term in json.dumps(data, ensure_ascii=False).lower() for term in ('patent', '직무발명', '명세서', '승계', '특허'))
assert not any(e['predicate']=='authored' and nodes[e['target']]['type'] in {'ExternalPublication','ExternalWriting','Patent'} for e in data['edges'])
assert sum(n['type']=='Experience' for n in data['nodes'])==3
assert sum(n['type']=='Award' for n in data['nodes'])==9
assert sum(n['type']=='Credential' for n in data['nodes'])==5
print('PASS: authorship vs review, career records and sourced achievements')

assert nodes['paper:har-thesis']['label']==nodes['paper:har-thesis']['fullTitle']
assert nodes['paper:har-thesis']['publicationType']=='석사 학위논문'
assert nodes['presentation:preflight']['sessionCode']=='LTG137'
assert nodes['presentation:preflight']['url'].endswith('/1772128646313001DaY4')
for n in nodes.values():
    if n['type'] in {'Project','Paper','Patent','Writing'}:
        assert len(n.get('details',[]))>=2, n['id']
    for s in n.get('details',[]):
        assert s['title'] and s['paragraphs'] and all(isinstance(p,str) and p for p in s['paragraphs'])
    for m in n.get('media',[]):
        assert m['sourceId'] in data['sources'] and m['title']
        assert m['kind'] in {'image','youtube'}
        assert m['url'].startswith(('https://','assets/'))
        if m['kind']=='youtube':
            assert __import__('re').fullmatch(r'[A-Za-z0-9_-]{11}',m['videoId'])
print('PASS: actual thesis title, official session and detailed media records')

# The original PruPru demo is no longer playable.
assert 'p2s2YJBEg4w' not in json.dumps(data)

assert not {"project:aof", "project:atc"} & nodes.keys()
assert len([e for e in data["edges"] if e["source"]=="person:soyeong" and e["predicate"]=="hasCapability"])==13
assert nodes["capability:agent-leadership"]["evidenceIds"]==["user-agent-lead"]

assert nodes['role:agent-lead']['teamMembers']==4
assert not any(e['source']=='contribution:yoco' and e['predicate']=='duringEducation' for e in data['edges'])
assert nodes['project:sobok']['activityKind']=='개인 사이드 프로젝트'
for record in nodes.values():
    if record['type']=='Participation':
        assert sum(e['source']==record['id'] and e['predicate'] in {'atEvent','inProgram'} for e in data['edges'])==1
for record in nodes.values():
    if record['type']=='Project':
        assert any(e['target']==record['id'] and e['predicate']=='inProject' for e in data['edges'])
print('PASS: employment, roles, project contributions and distinct participation contexts')

assert 'publication:handbook' not in nodes
assert nodes['review:tistory-handbook']['references'][0]['url']=='https://arxiv.org/abs/2607.25398'
for n in nodes.values():
    for ref in n.get('references', []):
        assert ref['title'] and ref['url'].startswith('https://') and ref['authors']
print('PASS: reviewed paper is reference metadata, not a portfolio entity')

# Every authored blog record has a publication space, every contribution a skill basis.
for n in nodes.values():
    if n['type'] in {'Writing', 'Review'}:
        assert sum(e['source'] == n['id'] and e['predicate'] == 'publishedIn' for e in data['edges']) == 1
    if n['type'] == 'Contribution':
        assert any(e['source'] == n['id'] and e['predicate'] == 'demonstrates' for e in data['edges']), n['id']
    if n['type'] == 'Capability':
        assert any(e['target'] == n['id'] and e['predicate'] == 'demonstrates' and e['assertionStatus'] == 'sourced' for e in data['edges']), n['id']
triples = {(e['source'], e['predicate'], e['target']) for e in data['edges']}
assert ('person:soyeong', 'owns', 'channel:tistory') in triples
assert ('person:soyeong', 'owns', 'channel:github') in triples
assert ('person:soyeong', 'owns', 'channel:kode') not in triples
assert ('contribution:har-followup', 'duringExperience', 'experience:snu') in triples
assert ('contribution:har', 'duringExperience', 'experience:snu') not in triples
assert ('contribution:har-followup', 'duringEducation', 'education:snu') not in triples
assert {e['target'] for e in data['edges'] if e['source'] == 'contribution:preflight' and e['predicate'] == 'demonstrates'} == {'capability:integration', 'capability:architecture', 'capability:agent-sdk'}
print('PASS: blog ownership and publication coverage, personal skill evidence, distinct HAR research periods')

if len(sys.argv) > 1:
    sys.path.insert(0, str(Path(__file__).parent / 'cosmos-3d'))
    from relation_rules import RULES
    by_edge = {e['id']: e for e in data['edges']}
    for e in data['edges']:
        if e['predicate'] not in RULES:
            continue
        evidence = set()
        for pair in e['basisPaths']:
            a, b = [by_edge[i] for i in pair]
            assert (a['predicate'], b['predicate']) in RULES[e['predicate']]
            assert a['source'] == e['source'] and a['target'] == b['source'] and b['target'] == e['target']
            assert a['assertionStatus'] == b['assertionStatus'] == e['assertionStatus'] == 'sourced'
            evidence.update(a['evidenceIds'] + b['evidenceIds'])
        assert evidence == set(e['evidenceIds'])
    for predicate, pairs in RULES.items():
        for first, second in pairs:
            for a in data['edges']:
                if a['predicate'] != first or a['assertionStatus'] != 'sourced':
                    continue
                for b in data['edges']:
                    if b['predicate'] == second and b['source'] == a['target'] and b['assertionStatus'] == 'sourced':
                        assert (a['source'], predicate, b['target']) in triples
    assert len(next(e['basisPaths'] for e in data['edges'] if e['source'] == 'person:soyeong' and e['predicate'] == 'workedOn' and e['target'] == 'project:har')) == 2
    print('PASS: generated graph types and derived navigation links preserve every confirmed basis path')
