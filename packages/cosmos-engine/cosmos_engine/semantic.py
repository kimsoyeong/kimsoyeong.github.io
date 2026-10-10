"""Deterministic domain queries: semantics are rules, not embedding similarity."""
from datetime import date, datetime
from zoneinfo import ZoneInfo


def query(graph, name, person='person:soyeong', entity=None, as_of=None):
    nodes = {n['id']: n for n in graph['nodes']}
    edges = [e for e in graph['edges'] if e['assertionStatus'] == 'sourced']
    if as_of is not None:
        try:
            if date.fromisoformat(as_of).isoformat() != as_of:
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError('as_of must be an ISO date (YYYY-MM-DD)') from None
    when = as_of or datetime.now(ZoneInfo('Asia/Seoul')).date().isoformat()
    edges = [e for e in edges if (not e.get('validFrom') or e['validFrom'] <= when) and
             (not e.get('validTo') or e['validTo'] > when)]
    active_ids = {e['id'] for e in edges}
    edges = [e for e in edges if e.get('origin') != 'derived' or any(all(i in active_ids for i in path) for path in e['basisPaths'])]
    evidence = lambda records: {s: graph['sources'][s] for r in records for s in r.get('evidenceIds', [])}
    if name == 'connections':
        if entity not in nodes:
            raise ValueError('connections requires an existing --entity ID')
        linked = [e for e in edges if entity in (e['source'], e['target'])]
        ids = {entity} | {e['source'] for e in linked} | {e['target'] for e in linked}
        return {'nodes': [nodes[i] for i in sorted(ids)], 'edges': linked, 'evidence': evidence(linked)}
    if person not in nodes:
        raise ValueError(f'Person not found: {person}')
    if name == 'capabilities':
        results = []
        owned = [e for e in edges if e['source'] == person and e['predicate'] in {'hasContribution', 'hasExperience', 'hasRole'}]
        for link in edges:
            if link['source'] != person or link['predicate'] != 'hasCapability':
                continue
            paths = [[a, b] for a in owned for b in edges if b['source'] == a['target'] and
                     b['predicate'] == 'demonstrates' and b['target'] == link['target']]
            if paths:
                result = nodes[link['target']]
                results.append({'record': result, 'basisPaths': [[e['id'] for e in path] for path in paths],
                                'evidence': evidence([link, *[e for path in paths for e in path]])})
        return results
    predicates = {'portfolio': {'workedOn'}, 'career': {'hasExperience', 'hasRole'},
                  'research': {'authored', 'preparedDisclosure'}, 'writing': {'authored'}}
    if name not in predicates:
        raise ValueError(f'Unknown semantic query: {name}')
    results = []
    for edge in edges:
        if edge['source'] != person or edge['predicate'] not in predicates[name]:
            continue
        record = nodes[edge['target']]
        if name == 'research' and record['type'] not in {'Paper', 'Patent'}:
            continue
        if name == 'writing' and record['type'] not in {'Writing', 'Review'}:
            continue
        results.append({'record': record, 'relation': edge, 'evidence': evidence([record, edge])})
    return sorted(results, key=lambda r: r['record'].get('date', r['record'].get('startDate', '')), reverse=True)
