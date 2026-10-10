"""Validate grounded graph records and regenerate evidence-backed navigation."""
import hashlib
import ipaddress
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

RULES = {
    'workedOn': [('hasContribution', 'inProject')],
    'workedAt': [('hasExperience', 'atOrganization')],
    'studiedAt': [('hasEducation', 'atInstitution')],
    'participatedIn': [('hasParticipation', 'atEvent'), ('hasParticipation', 'inProgram'), ('presented', 'atEvent')],
}


def hash_record(record):
    return hashlib.sha256(json.dumps(record, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def load_schema(root):
    return json.loads((Path(root) / 'cosmos/schema.json').read_text())


def safe_url(value, local=False):
    if not isinstance(value, str) or not value or re.search(r'[\x00-\x20\x7f\\]', value):
        return False
    decoded = unquote(value)
    if re.search(r'[\x00-\x20\x7f\\]', decoded) or '..' in decoded.split('/'):
        return False
    if local and (value.startswith('/') or value.startswith('assets/')):
        return not decoded.startswith('//') and not urlsplit(value).scheme
    try:
        url = urlsplit(value)
        host = url.hostname
        _ = url.port
        if url.scheme not in {'https', 'http'} or not host or url.username or url.password:
            return False
        if host.lower() == 'localhost' or host.lower().endswith(('.localhost', '.local', '.internal')):
            return False
        try:
            return ipaddress.ip_address(host).is_global
        except ValueError:
            return bool(re.fullmatch(r'(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z][A-Za-z0-9-]{0,62}', host))
    except ValueError:
        return False


def _require(ok, message):
    if not ok:
        raise ValueError(message)


def _date(value):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}(?:-\d{2}(?:-\d{2})?)?', value):
        raise ValueError(f'invalid date: {value}')
    import datetime
    parts = [int(v) for v in value.split('-')]
    datetime.date(*(parts + [1] * (3 - len(parts))))
    return value


def validate(graph, schema, policy=None):
    _require(isinstance(graph, dict), 'graph must be an object')
    nodes, edges, sources = graph.get('nodes'), graph.get('edges'), graph.get('sources')
    _require(isinstance(nodes, list) and isinstance(edges, list) and isinstance(sources, dict), 'graph requires nodes, edges and sources')
    policy = policy or {}
    by_id = {}
    for n in nodes:
        _require(isinstance(n, dict), 'node must be an object')
        _require(isinstance(n.get('id'), str) and n['id'] and n['id'] not in by_id, 'missing or duplicate node ID')
        _require(n.get('type') in schema['types'], f'unsupported type: {n.get("type")}')
        _require(isinstance(n.get('label'), str) and bool(n['label'].strip()), f'missing label: {n["id"]}')
        _require(isinstance(n.get('summary'), str) and bool(n['summary'].strip()), f'missing summary: {n["id"]}')
        _require(not set(n) - set(schema['nodeFields']), f'unknown node fields: {n["id"]}')
        _require(n['id'] not in policy.get('excludedIds', []) and n.get('slug') not in policy.get('excludedSlugs', []), f'excluded node: {n["id"]}')
        by_id[n['id']] = n
    for sid, source in sources.items():
        _require(isinstance(source, dict) and isinstance(source.get('label'), str) and source['label'], f'invalid source: {sid}')
        _require(not set(source) - set(schema['sourceFields']), f'unknown source fields: {sid}')
        if 'visibility' in source:
            _require(source['visibility'] in {'public', 'review', 'private'}, f'invalid source visibility: {sid}')
        if source.get('url'):
            _require(safe_url(source['url']), f'unsafe source URL: {sid}')
        if source.get('observedAt'):
            _date(source['observedAt'])
    by_edge, triples = {}, set()
    for e in edges:
        _require(isinstance(e, dict) and isinstance(e.get('id'), str) and bool(e['id']) and e['id'] not in by_edge, 'missing or duplicate edge ID')
        _require(e['id'] not in by_id, f'node/edge ID collision: {e["id"]}')
        _require(not set(e) - set(schema['edgeFields']), f'unknown edge fields: {e["id"]}')
        _require(e['id'] not in policy.get('excludedIds', []), f'excluded edge: {e["id"]}')
        _require(e.get('source') in by_id and e.get('target') in by_id and e['source'] != e['target'], f'invalid endpoints: {e["id"]}')
        rule = schema['predicates'].get(e.get('predicate'))
        _require(rule is not None, f'unknown predicate: {e.get("predicate")}')
        _require(by_id[e['source']]['type'] in rule['domain'] and by_id[e['target']]['type'] in rule['range'], f'invalid relation types: {e["id"]}')
        _require(e.get('assertionStatus') in {'sourced', 'proposed', 'disputed'}, f'invalid assertion status: {e["id"]}')
        triple = (e['source'], e['predicate'], e['target'])
        _require(triple not in triples, f'duplicate triple: {triple}')
        triples.add(triple)
        by_edge[e['id']] = e
    for r in [*nodes, *edges]:
        _require(r.get('visibility') in {'public', 'review', 'private'}, f'invalid visibility: {r["id"]}')
        ev = r.get('evidenceIds')
        _require(isinstance(ev, list) and ev and all(isinstance(k, str) and k in sources for k in ev), f'missing evidence: {r["id"]}')
        for key in ['date', 'startDate', 'endDate', 'validFrom', 'validTo', 'statusAsOf', 'expiresAt', 'observedAt']:
            if r.get(key):
                _date(r[key])
        for start, end in [('startDate', 'endDate'), ('validFrom', 'validTo')]:
            if r.get(start) and r.get(end):
                _require(r[start][:len(r[end])] <= r[end][:len(r[start])], f'inverted interval: {r["id"]}')
        if 'datePrecision' in r:
            _require(r['datePrecision'] in {'year', 'month', 'day'}, f'invalid date precision: {r["id"]}')
        if r.get('url'):
            _require(safe_url(r['url'], local=True), f'unsafe URL: {r["id"]}')
    aliases = {}
    for n in nodes:
        if 'aliases' in n:
            _require(isinstance(n['aliases'], list) and all(isinstance(a, str) and a.strip() for a in n['aliases']), f'invalid aliases: {n["id"]}')
            for alias in n['aliases']:
                key = alias.strip().casefold()
                _require(key not in aliases or aliases[key] == n['id'], f'alias collision: {alias}')
                aliases[key] = n['id']
        for key, allowed in [('details', 'detailFields'), ('media', 'mediaFields'), ('links', 'linkFields'), ('references', 'referenceFields')]:
            values = n.get(key, [])
            _require(isinstance(values, list), f'{key} must be a list: {n["id"]}')
            for item in values:
                _require(isinstance(item, dict) and not set(item) - set(schema[allowed]), f'invalid {key} fields: {n["id"]}')
                if key == 'details':
                    _require(isinstance(item.get('title'), str) and item['title'] and isinstance(item.get('paragraphs'), list) and item['paragraphs'] and all(isinstance(p, str) and p for p in item['paragraphs']), f'invalid details: {n["id"]}')
                else:
                    url = item.get('url')
                    mail = key == 'links' and isinstance(url, str) and re.fullmatch(r'mailto:[A-Za-z0-9.!#$%&\'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', url)
                    _require(item.get('title' if key != 'links' else 'label') and (safe_url(url, local=key == 'media') or mail), f'invalid {key} URL or label: {n["id"]}')
                if key == 'media':
                    _require(item.get('sourceId') in sources and item.get('kind') in {'image', 'youtube'}, f'invalid media source/kind: {n["id"]}')
                    if 'playbackVerified' in item:
                        _require(isinstance(item['playbackVerified'], bool), f'invalid playback verification: {n["id"]}')
                    if item.get('date'):
                        _date(item['date'])
                    if item['kind'] == 'youtube':
                        _require(isinstance(item.get('videoId'), str) and re.fullmatch(r'[A-Za-z0-9_-]{11}', item['videoId']) and item['videoId'] not in policy.get('excludedVideoIds', []), f'invalid or excluded video: {n["id"]}')
                if key == 'references':
                    _require(isinstance(item.get('authors'), list) and item['authors'] and all(isinstance(a, str) and a for a in item['authors']), f'invalid reference authors: {n["id"]}')
        if n['type'] in {'Paper', 'Writing', 'Review'}:
            _require(sum(e['target'] == n['id'] and e['predicate'] == 'authored' for e in edges) == 1, f'authorship cardinality: {n["id"]}')
        if n['type'] in {'Writing', 'Review'}:
            _require(sum(e['source'] == n['id'] and e['predicate'] == 'publishedIn' for e in edges) == 1, f'publication channel cardinality: {n["id"]}')
        if n['type'] == 'Patent':
            _require(isinstance(n.get('status'), str) and n['status'].strip(), f'missing patent status: {n["id"]}')
            status = n['status'].strip().casefold()
            if status in {'filed', 'pending', 'patent pending', '출원', '출원 완료', '출원완료', '출원 중', '출원중'}:
                _require(isinstance(n.get('applicationNumber'), str) and n['applicationNumber'].strip(), f'filed patent requires applicationNumber: {n["id"]}')
            if status in {'registered', 'granted', '등록', '등록 완료', '등록완료', '등록 특허'}:
                _require(isinstance(n.get('patentNumber'), str) and n['patentNumber'].strip(), f'registered patent requires patentNumber: {n["id"]}')
        if n['type'] == 'Section':
            _require(n.get('articleId') in by_id and by_id[n['articleId']]['type'] in {'Writing', 'Review'}, f'invalid section article: {n["id"]}')
            _require((n['articleId'], 'hasSection', n['id']) in triples, f'section requires hasSection: {n["id"]}')
        if n['type'] == 'Contribution':
            _require(any(e['source'] == n['id'] and e['predicate'] in {'inProject', 'duringExperience'} for e in edges), f'contribution context: {n["id"]}')
            _require(any(e['source'] == n['id'] and e['predicate'] == 'demonstrates' for e in edges), f'contribution capability: {n["id"]}')
        if n['type'] == 'Capability':
            _require(any(e['target'] == n['id'] and e['predicate'] == 'demonstrates' and e['assertionStatus'] == 'sourced' for e in edges), f'capability basis: {n["id"]}')
    records = {**by_id, **by_edge}
    successors = {}
    for r in records.values():
        if 'supersedes' not in r:
            continue
        refs = r['supersedes'] if isinstance(r['supersedes'], list) else [r['supersedes']]
        _require(refs and all(isinstance(ref, str) and ref in records and ref != r['id'] for ref in refs), f'invalid supersedes: {r["id"]}')
        _require(all((ref in by_id) == (r['id'] in by_id) for ref in refs), f'supersedes kind mismatch: {r["id"]}')
        successors[r['id']] = refs
    active, visited = set(), set()
    def check_supersedes(key):
        _require(key not in active, 'supersedes cycle')
        if key in visited:
            return
        active.add(key)
        for ref in successors.get(key, []):
            check_supersedes(ref)
        active.remove(key)
        visited.add(key)
    for key in successors:
        check_supersedes(key)
    for predicate in ['broader', 'partOf']:
        adjacency = {}
        for e in edges:
            if e['predicate'] == predicate:
                adjacency.setdefault(e['source'], []).append(e['target'])
        visited, active = set(), set()
        def visit(node):
            _require(node not in active, f'{predicate} cycle')
            if node in visited:
                return
            active.add(node)
            for nxt in adjacency.get(node, []):
                visit(nxt)
            active.remove(node)
            visited.add(node)
        for node in adjacency:
            visit(node)
    for e in edges:
        if e.get('origin') != 'derived' and 'basisPaths' not in e:
            continue
        _require(e['predicate'] in RULES and e.get('basisPaths'), f'invalid derived relation: {e["id"]}')
        evidence = set()
        visibility = 'public'
        for path in e['basisPaths']:
            _require(isinstance(path, list) and len(path) == 2 and all(p in by_edge for p in path), f'missing derived basis: {e["id"]}')
            a, b = [by_edge[p] for p in path]
            _require((a['predicate'], b['predicate']) in RULES[e['predicate']] and a['source'] == e['source'] and a['target'] == b['source'] and b['target'] == e['target'], f'invalid derived path: {e["id"]}')
            _require(a['assertionStatus'] == b['assertionStatus'] == e['assertionStatus'] == 'sourced', f'unsourced derived path: {e["id"]}')
            evidence.update(a['evidenceIds'] + b['evidenceIds'])
            visibility = max([visibility, a['visibility'], b['visibility']], key=['public', 'review', 'private'].index)
        _require(evidence == set(e['evidenceIds']) and visibility == e['visibility'], f'derived evidence/visibility mismatch: {e["id"]}')


def derive_relations(graph):
    graph['edges'] = [e for e in graph['edges'] if e['predicate'] not in RULES]
    base = sorted((e for e in graph['edges'] if e['assertionStatus'] == 'sourced'), key=lambda e: e['id'])
    results = {}
    for predicate, pairs in RULES.items():
        for first, second in pairs:
            for a in base:
                if a['predicate'] != first:
                    continue
                for b in base:
                    if b['predicate'] != second or a['target'] != b['source'] or a['source'] == b['target']:
                        continue
                    triple = [a['source'], predicate, b['target']]
                    key = tuple(triple)
                    e = results.setdefault(key, dict(id='derived:' + hash_record(triple)[:24], source=triple[0], predicate=predicate, target=triple[2], evidenceIds=[], assertionStatus='sourced', visibility='public', origin='derived', basisPaths=[]))
                    e['basisPaths'].append([a['id'], b['id']])
                    e['evidenceIds'] = sorted(set(e['evidenceIds'] + a['evidenceIds'] + b['evidenceIds']))
                    e['visibility'] = max([e['visibility'], a['visibility'], b['visibility']], key=['public', 'review', 'private'].index)
    graph['edges'].extend(results[k] for k in sorted(results))
    return graph
