"""Direct navigation summaries from confirmed two-edge paths, retaining each basis."""

RULES = {
    'workedOn': [('hasContribution', 'inProject')],
    'workedAt': [('hasExperience', 'atOrganization')],
    'studiedAt': [('hasEducation', 'atInstitution')],
    'participatedIn': [('hasParticipation', 'atEvent'), ('hasParticipation', 'inProgram'), ('presented', 'atEvent')],
}


def derive_relations(data):
    edges = data['edges']
    base = [e for e in edges if e['assertionStatus'] == 'sourced' and e['predicate'] not in RULES]
    # Regenerate rather than retain summaries after their underlying evidence changes.
    edges[:] = [e for e in edges if e['predicate'] not in RULES]
    next_id = max((int(e['id'].split(':')[1]) for e in edges), default=0) + 1
    summaries = {}
    for predicate, paths in RULES.items():
        for first, second in paths:
            for a in base:
                if a['predicate'] != first:
                    continue
                for b in base:
                    if b['predicate'] != second or a['target'] != b['source']:
                        continue
                    key = (a['source'], predicate, b['target'])
                    if key not in summaries:
                        summaries[key] = dict(id=f'relation:{next_id:03d}', source=a['source'],
                            predicate=predicate, target=b['target'], evidenceIds=[],
                            assertionStatus='sourced', visibility='public', basisPaths=[])
                        next_id += 1
                    result = summaries[key]
                    result['basisPaths'].append([a['id'], b['id']])
                    result['evidenceIds'] = list(dict.fromkeys(result['evidenceIds'] + a['evidenceIds'] + b['evidenceIds']))
                    result['visibility'] = max([result['visibility'], a['visibility'], b['visibility']], key=['public', 'review', 'private'].index)
    edges.extend(summaries.values())
