"""Reviewed changes and deterministic, allowlisted static graph builds."""
import copy
import hashlib
import json
import os
import tempfile
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .schema import derive_relations, hash_record, load_schema, validate


def dumps(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n'


def load(path, default=None):
    return json.loads(path.read_text()) if path.exists() else copy.deepcopy(default)


def timestamp():
    return datetime.now(ZoneInfo('Asia/Seoul')).isoformat(timespec='seconds')


def fingerprint(value):
    return hashlib.sha256(dumps(value).encode()).hexdigest()


def paths(root):
    config = load(root / 'cosmos/config.json')
    if not config or config.get('version') != 1:
        raise ValueError('cosmos/config.json version 1 is required')
    result = {}
    for key, value in config.items():
        if key == 'version':
            continue
        path = (root / value).resolve()
        if not path.is_relative_to(root.resolve()):
            raise ValueError(f'Config path escapes repository: {key}')
        result[key] = path
    return result


@contextmanager
def locked(state):
    state.mkdir(parents=True, exist_ok=True)
    lock = state / 'update.lock'
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise ValueError('Another Cosmos update is running. Remove .cosmos/update.lock only after it exits.') from None
    try:
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        yield
    finally:
        lock.unlink(missing_ok=True)


def write_batch(files):
    """Stage all bytes before replacement; restore previous outputs on write failures."""
    staged, old, replaced = {}, {}, []
    try:
        for path, text in files.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            old[path] = path.read_bytes() if path.exists() else None
            if old[path] == text.encode():
                continue
            fd, name = tempfile.mkstemp(prefix='.cosmos-', dir=path.parent)
            with os.fdopen(fd, 'w', encoding='utf-8') as stream:
                stream.write(text)
                stream.flush()
                os.fsync(stream.fileno())
            staged[path] = Path(name)
        for path, temporary in staged.items():
            os.replace(temporary, path)
            replaced.append(path)
    except BaseException:
        for path in reversed(replaced):
            if old[path] is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(old[path])
        raise
    finally:
        for temporary in staged.values():
            temporary.unlink(missing_ok=True)
    return [str(p) for p in replaced]


def apply_patch(graph, patch):
    """Stable identity with compare-and-swap for modifications and deletions."""
    result = copy.deepcopy(graph)
    expected = patch.get('expectedHashes', {})
    if not isinstance(expected, dict):
        raise ValueError('expectedHashes must be an object')
    for section in ('sources', 'nodes', 'edges'):
        current = result[section] if section == 'sources' else {r['id']: r for r in result[section]}
        supplied = patch.get(section, {} if section == 'sources' else [])
        if not isinstance(supplied, dict if section == 'sources' else list):
            raise ValueError(f'Invalid patch {section}')
        incoming = supplied.items() if section == 'sources' else [(r['id'], r) for r in supplied]
        seen = set()
        for key, record in incoming:
            if key in seen:
                raise ValueError(f'Duplicate patch ID: {key}')
            seen.add(key)
            if key in current and current[key] != record:
                token = f'source:{key}' if section == 'sources' else key
                if expected.get(token) != hash_record(current[key]):
                    raise ValueError(f'Conflicting update requires expectedHashes[{token!r}]')
            current[key] = copy.deepcopy(record)
        result[section] = current if section == 'sources' else list(current.values())
    removed_nodes = set(patch.get('removeNodes', []))
    removed_edges = set(patch.get('removeEdges', []))
    by_id = {r['id']: r for r in [*result['nodes'], *result['edges']]}
    for key in removed_nodes | removed_edges:
        if key not in by_id or expected.get(key) != hash_record(by_id[key]):
            raise ValueError(f'Deletion requires current expected hash: {key}')
    result['nodes'] = [n for n in result['nodes'] if n['id'] not in removed_nodes]
    result['edges'] = [e for e in result['edges'] if e['id'] not in removed_edges and
                       e['source'] not in removed_nodes and e['target'] not in removed_nodes]
    return result


def assemble(root):
    p = paths(root)
    graph = load(p['source'])
    if not graph:
        raise ValueError('Canonical ontology source is missing')
    graph = apply_patch(graph, load(p['enrichment'], {}))
    for path in sorted(p['records'].glob('*.json')):
        graph = apply_patch(graph, load(path))
    graph['schemaVersion'] = '1.0-cosmos-engine'
    graph.pop('note', None)
    return derive_relations(graph)


NODE_FIELDS = set('id type label summary subtitle headline details activityKind authors category contentKind date degreeName duration endDate expiresAt fullTitle gpa issuer links location media publicationType rank references role sessionCode slug speakers startDate startDateLabel status statusAsOf time track url urlLabel venue verification visibility evidenceIds anchor articleId validFrom validTo datePrecision aliases supersedes teamMembers origin applicationNumber patentNumber observedAt'.split())
EDGE_FIELDS = set('id source predicate target evidenceIds assertionStatus visibility origin basisPaths validFrom validTo supersedes'.split())
SOURCE_FIELDS = {'label', 'observedAt', 'url', 'verification', 'visibility'}
MEDIA_FIELDS = set('kind url title sourceId videoId date profilePriority featured playbackVerified layout'.split())


def approved(record, key, policy):
    return record.get('visibility') != 'private' and policy.get('approvedHashes', {}).get(key) == hash_record(record)


def project_public(graph, policy):
    """Content approval is separate from factual sourcing and raw-data visibility."""
    sources = {key: {k: v for k, v in s.items() if k in SOURCE_FIELDS}
               for key, s in graph['sources'].items() if approved(s, f'source:{key}', policy)}
    nodes, pending = [], []
    for node in graph['nodes']:
        if not approved(node, node['id'], policy) or not all(s in sources for s in node['evidenceIds']):
            pending.append(node['id'])
            continue
        n = {k: copy.deepcopy(v) for k, v in node.items() if k in NODE_FIELDS}
        n['visibility'] = 'public'
        n['details'] = [{k: v for k, v in d.items() if k in {'title', 'paragraphs'}} for d in n.get('details', [])]
        for field, allowed in [('links', {'label', 'url', 'title'}), ('references', {'title', 'authors', 'url', 'kind'})]:
            if field in n:
                n[field] = [{k: v for k, v in item.items() if k in allowed} for item in n[field]]
        if 'media' in n:
            n['media'] = [{k: v for k, v in m.items() if k in MEDIA_FIELDS} for m in n['media'] if m['sourceId'] in sources]
        nodes.append(n)
    ids = {n['id'] for n in nodes}
    edges = []
    for edge in graph['edges']:
        if edge['predicate'] in {'workedOn', 'workedAt', 'studiedAt', 'participatedIn'}:
            continue
        if (edge['source'] in ids and edge['target'] in ids and edge['assertionStatus'] == 'sourced'
                and approved(edge, edge['id'], policy) and all(s in sources for s in edge['evidenceIds'])):
            e = {k: copy.deepcopy(v) for k, v in edge.items() if k in EDGE_FIELDS}
            e['visibility'] = 'public'
            edges.append(e)
        elif not approved(edge, edge['id'], policy):
            pending.append(edge['id'])
    public = {'schemaVersion': graph['schemaVersion'], 'sources': sources, 'nodes': nodes, 'edges': edges}
    derive_relations(public)
    used_sources = {s for r in [*public['nodes'], *public['edges']] for s in r['evidenceIds']}
    used_sources.update(m['sourceId'] for n in nodes for m in n.get('media', []))
    public['sources'] = {k: {**v, 'visibility': 'public'} for k, v in sources.items() if k in used_sources}
    return public, sorted(pending)


def approve_graph(graph, policy):
    result = copy.deepcopy(policy)
    for key, source in graph['sources'].items():
        if source.get('visibility') != 'private':
            result['approvedHashes'][f'source:{key}'] = hash_record(source)
    for record in [*graph['nodes'], *graph['edges']]:
        if record.get('visibility') != 'private' and record.get('origin') != 'derived':
            result['approvedHashes'][record['id']] = hash_record(record)
    return result


def normalize_patch(patch):
    result = copy.deepcopy(patch)
    for key in ('nodes', 'edges'):
        for record in result.get(key, []):
            record.setdefault('visibility', 'review')
            if key == 'nodes':
                record.setdefault('summary', record.get('label', ''))
            else:
                record.setdefault('assertionStatus', 'sourced')
    for source in result.get('sources', {}).values():
        source.setdefault('visibility', 'review')
        source.setdefault('observedAt', timestamp()[:10])
    return result


def delta(before, after):
    old = {r['id']: r for r in [*before.get('nodes', []), *before.get('edges', [])]}
    new = {r['id']: r for r in [*after['nodes'], *after['edges']]}
    return {'added': sorted(new.keys() - old.keys()), 'removed': sorted(old.keys() - new.keys()),
            'changed': sorted(k for k in old.keys() & new.keys() if old[k] != new[k])}


def exports(graph):
    # Search and linked data derive from the same public projection.
    index = [{'id': n['id'], 'type': n['type'], 'label': n['label'],
              'text': ' '.join([n['label'], n['summary'], *[p for d in n.get('details', []) for p in d['paragraphs']]])}
             for n in graph['nodes']]
    linked = {'@context': {'@vocab': 'https://kimsoyeong.github.io/ontology/', 'label': 'http://www.w3.org/2000/01/rdf-schema#label'},
              '@graph': [{'@id': n['id'], '@type': n['type'], 'label': n['label'],
                          **{predicate: [{'@id': e['target']} for e in graph['edges'] if e['source'] == n['id'] and e['predicate'] == predicate]
                             for predicate in {e['predicate'] for e in graph['edges'] if e['source'] == n['id']}}}
                         for n in graph['nodes']]}
    return index, linked


def input_hash(file):
    from .ingest import AV
    if file.suffix.lower() in AV:
        transcripts = [(str(p.suffix), hashlib.sha256(p.read_bytes()).hexdigest()) for p in
                       [file.with_suffix(ext) for ext in ('.vtt', '.srt', '.txt')] if p.is_file()]
        return fingerprint({'media': hashlib.sha256(file.read_bytes()).hexdigest(), 'transcripts': transcripts})
    return hashlib.sha256(file.read_bytes()).hexdigest()


def _update(root, *, provider='none', extract=True, approve_ids=(), approve_baseline=False, dry_run=False, check=False, refresh=False):
    from .ingest import ingest_file
    root = root.resolve()
    p = paths(root)
    schema = load_schema(root)
    policy = load(p['policy'])
    current = assemble(root)
    validate(current, schema, policy)
    decisions = []
    candidate_files = {}
    record_files = list(p['records'].glob('*.json'))
    applied = list(dict.fromkeys(load(p['state'] / 'applied.json', []) + [f.stem.rsplit('-', 1)[-1] for f in record_files]))
    sequence = max((int(f.name.split('-', 1)[0]) for f in record_files), default=0)
    # Dry-run/check never execute providers or write cache/state.
    if extract and not dry_run and not check:
        for file in sorted(p['inbox'].glob('*')):
            if not file.is_file() or file.name.startswith('.'):
                continue
            if not file.resolve().is_relative_to(p['inbox'].resolve()):
                raise ValueError('Inbox symlinks cannot reference files outside the inbox')
            snapshot = input_hash(file)
            signature = fingerprint({'file': snapshot,
                                     'name': file.name, 'provider': provider, 'schema': schema,
                                                    'model': os.environ.get('COSMOS_LLM_MODEL') or os.environ.get('COSMOS_CODEX_MODEL'),
                                     'endpoint': os.environ.get('COSMOS_LLM_BASE_URL')})
            cid = signature[:20]
            if refresh:
                signature = fingerprint({'signature': signature, 'refresh': timestamp()})
                cid = signature[:20]
            path = p['state'] / 'review' / f'{cid}.json'
            if cid in applied:
                continue
            if not path.exists():
                try:
                    patch = normalize_patch(ingest_file(file, current, schema, provider))
                    candidate = {'id': cid, 'input': str(file.relative_to(root)),
                                 'inputHash': snapshot, 'patch': patch}
                    # Structural candidates can be inspected even when incomplete.
                    try:
                        validate(derive_relations(apply_patch(current, patch)), schema, policy)
                        candidate['validation'] = 'valid'
                    except (ValueError, KeyError, TypeError) as error:
                        candidate['validation'] = str(error)
                    candidate_files[path] = dumps(candidate)
                except (ValueError, OSError) as error:
                    candidate_files[path] = dumps({'id': cid, 'input': str(file.relative_to(root)),
                                                  'inputHash': snapshot,
                                                  'patch': {'questions': [{'message': str(error), 'status': 'needs-extraction'}]},
                                                  'validation': 'needs-extraction'})
            decisions.append(cid)
    for cid in dict.fromkeys(approve_ids):
        if cid in applied:
            continue
        if not cid.isalnum() or len(cid) != 20:
            raise ValueError('Candidate ID must be the 20-character ID from cosmos:review')
        path = p['state'] / 'review' / f'{cid}.json'
        candidate = json.loads(candidate_files[path]) if path in candidate_files else load(path)
        if not candidate:
            raise ValueError(f'Candidate not found: {cid}')
        file = (root / candidate['input']).resolve()
        if not file.is_relative_to(p['inbox']) or not file.exists() or input_hash(file) != candidate['inputHash']:
            raise ValueError(f'Input changed or removed; regenerate candidate: {cid}')
        patch = normalize_patch(candidate['patch'])
        if patch.get('questions'):
            raise ValueError(f'Resolve questions in {path.relative_to(root)} before approving')
        if not any(patch.get(key) for key in ('nodes', 'edges', 'removeNodes', 'removeEdges')):
            raise ValueError('Candidate contains no graph changes')
        for edge in patch.get('edges', []):
            if edge.get('assertionStatus') == 'disputed':
                raise ValueError('Resolve disputed facts before approval')
            if edge.get('assertionStatus') == 'proposed':
                edge['assertionStatus'] = 'sourced'
        known_videos = {m.get('videoId') for n in current['nodes'] for m in n.get('media', []) if m['kind'] == 'youtube'}
        for node in patch.get('nodes', []):
            for media in node.get('media', []):
                if media.get('kind') == 'youtube' and media.get('videoId') not in known_videos and not media.get('playbackVerified'):
                    raise ValueError('New video requires playbackVerified=true after playback verification')
        prospective = derive_relations(apply_patch(current, patch))
        validate(prospective, schema, policy)
        if any(r.get('visibility') == 'private' for r in [*patch.get('nodes', []), *patch.get('edges', []), *patch.get('sources', {}).values()]):
            raise ValueError('Private records cannot be published; create a public summary with public evidence instead')
        # Public records never contain raw extraction quotes or private provenance fields.
        allowed_patch = {'sources': {k: {f: v for f, v in s.items() if f in SOURCE_FIELDS} for k, s in patch.get('sources', {}).items()},
                         'nodes': [{f: v for f, v in n.items() if f in NODE_FIELDS} for n in patch.get('nodes', [])],
                         'edges': [{f: v for f, v in e.items() if f in EDGE_FIELDS} for e in patch.get('edges', [])],
                         'expectedHashes': patch.get('expectedHashes', {}),
                         'removeNodes': patch.get('removeNodes', []), 'removeEdges': patch.get('removeEdges', [])}
        # Recompute against exactly the sanitized, versioned record representation.
        prospective = derive_relations(apply_patch(current, allowed_patch))
        validate(prospective, schema, policy)
        current = prospective
        policy = policy_for_patch(policy, current, allowed_patch)
        sequence += 1
        candidate_files[p['records'] / f'{sequence:06d}-{cid}.json'] = dumps(allowed_patch)
        if cid not in applied:
            applied.append(cid)
    if approve_baseline:
        policy = approve_graph(current, policy)
    public, pending = project_public(current, policy)
    validate(public, schema, policy)
    before = load(p['graph'], {'nodes': [], 'edges': []})
    changes = delta(before, public)
    index, linked = exports(public)
    files = {p['graph']: dumps(public), p['public'] / 'graph.json': dumps(public),
             p['public'] / 'search.json': dumps(index), p['public'] / 'graph.jsonld': dumps(linked)}
    report = {'nodes': len(public['nodes']), 'edges': len(public['edges']), 'changes': changes,
              'pendingRecordIds': pending, 'candidateIds': decisions, 'provider': provider,
              'graphHash': fingerprint(public)}
    changed = [str(path.relative_to(root)) for path, text in files.items() if not path.exists() or path.read_text() != text]
    report['outputsChanged'] = changed
    if check:
        if changed:
            raise ValueError('Generated graph is stale. Run npm run cosmos:update')
        return report
    if dry_run:
        return report
    files.update(candidate_files)
    if policy != load(p['policy']):
        files[p['policy']] = dumps(policy)
    files[p['state'] / 'report.json'] = dumps(report)
    files[p['state'] / 'applied.json'] = dumps(applied)
    if any(changes.values()):
        journal = load(p['state'] / 'history.json', [])
        journal.append({'at': timestamp(), 'beforeHash': fingerprint(before), 'afterHash': fingerprint(public), 'changes': changes, 'previousGraph': before})
        files[p['state'] / 'history.json'] = dumps(journal)
    write_batch(files)
    return report


def policy_for_patch(policy, graph, patch):
    result = copy.deepcopy(policy)
    by_id = {r['id']: r for r in [*graph['nodes'], *graph['edges']]}
    for section in ('nodes', 'edges'):
        for record in patch.get(section, []):
            result['approvedHashes'][record['id']] = hash_record(by_id[record['id']])
    for key in patch.get('sources', {}):
        result['approvedHashes'][f'source:{key}'] = hash_record(graph['sources'][key])
    return result


def update(root, **options):
    if options.get('dry_run') or options.get('check'):
        return _update(root, **options)
    with locked(paths(root)['state']):
        return _update(root, **options)
