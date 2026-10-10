import copy
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cosmos_engine.schema import derive_relations, hash_record, load_schema, safe_url, validate

ROOT = Path(__file__).resolve().parents[3]


def fixture():
    def node(id_, type_):
        return dict(id=id_, type=type_, label=id_, summary=id_, visibility='public', evidenceIds=['s'])
    def edge(id_, source, predicate, target):
        return dict(id=id_, source=source, predicate=predicate, target=target, visibility='public', evidenceIds=['s'], assertionStatus='sourced')
    return dict(sources={'s': {'label': 'User confirmation', 'visibility': 'public'}},
                nodes=[node('p', 'Person'), node('c', 'Contribution'), node('j', 'Project'), node('k', 'Capability')],
                edges=[edge('e1', 'p', 'hasContribution', 'c'), edge('e2', 'c', 'inProject', 'j'), edge('e3', 'c', 'demonstrates', 'k')])


class SchemaTest(unittest.TestCase):
    def setUp(self):
        self.schema = load_schema(ROOT)
        self.graph = fixture()

    def test_baseline_and_stable_regeneration(self):
        import json
        baseline = json.loads((ROOT / 'src/components/Cosmos/graph.json').read_text())
        validate(baseline, self.schema)
        derive_relations(self.graph)
        validate(self.graph, self.schema)
        before = copy.deepcopy(self.graph)
        derive_relations(self.graph)
        self.assertEqual(before, self.graph)
        self.assertEqual(hash_record({'b': 2, 'a': 1}), hash_record({'a': 1, 'b': 2}))

    def test_deleted_or_disputed_basis_removes_summary(self):
        derive_relations(self.graph)
        self.graph['edges'][1]['assertionStatus'] = 'disputed'
        derive_relations(self.graph)
        self.assertFalse(any(e['predicate'] == 'workedOn' for e in self.graph['edges']))

    def test_private_basis_cannot_become_public(self):
        self.graph['edges'][1]['visibility'] = 'private'
        derive_relations(self.graph)
        self.assertEqual(self.graph['edges'][-1]['visibility'], 'private')
        self.graph['edges'][-1]['visibility'] = 'public'
        with self.assertRaisesRegex(ValueError, 'visibility mismatch'):
            validate(self.graph, self.schema)

    def test_invalid_types_evidence_policy_and_interval(self):
        for mutate in [lambda g: g['nodes'][0].update(type='Mystery'),
                       lambda g: g['edges'][0].update(target='missing'),
                       lambda g: g['nodes'][0].update(evidenceIds=['missing']),
                       lambda g: g['nodes'][0].update(startDate='2026-12', endDate='2026-01')]:
            g = fixture()
            mutate(g)
            with self.assertRaises(ValueError):
                validate(g, self.schema)
        with self.assertRaisesRegex(ValueError, 'excluded node'):
            validate(self.graph, self.schema, {'excludedIds': ['p']})

    def test_cycles_and_unsafe_media(self):
        g = dict(sources={'s': {'label': 'Source'}}, nodes=[dict(id=i, type='Organization', label=i, summary=i, evidenceIds=['s'], visibility='public') for i in ['a', 'b']], edges=[dict(id=str(i), source=a, predicate='partOf', target=b, evidenceIds=['s'], visibility='public', assertionStatus='sourced') for i, (a, b) in enumerate([('a', 'b'), ('b', 'a')])])
        with self.assertRaisesRegex(ValueError, 'cycle'):
            validate(g, self.schema)
        self.graph['nodes'][0]['media'] = [dict(title='Unsafe', sourceId='s', kind='image', url='javascript:alert(1)')]
        with self.assertRaises(ValueError):
            validate(self.graph, self.schema)

    def test_future_paper_and_patent_are_not_rejected_by_fixture_counts(self):
        self.graph['nodes'].extend([dict(id='paper', type='Paper', label='Research', summary='Research', evidenceIds=['s'], visibility='public'), dict(id='patent', type='Patent', label='Draft specification', summary='Draft specification', evidenceIds=['s'], visibility='public', status='draft')])
        self.graph['edges'].extend([dict(id='author', source='p', predicate='authored', target='paper', evidenceIds=['s'], visibility='public', assertionStatus='sourced'), dict(id='disclosure', source='p', predicate='preparedDisclosure', target='patent', evidenceIds=['s'], visibility='public', assertionStatus='sourced')])
        validate(self.graph, self.schema)
        self.graph['edges'][-2]['target'] = 'patent'
        with self.assertRaisesRegex(ValueError, 'relation types'):
            validate(self.graph, self.schema)

    def test_summary_ids_aliases_and_supersession(self):
        for mutate in [lambda g: g['nodes'][0].update(summary=[]), lambda g: g['edges'][0].update(id='p'), lambda g: g['nodes'][0].update(supersedes='unknown')]:
            graph = fixture()
            mutate(graph)
            with self.assertRaises(ValueError):
                validate(graph, self.schema)
        graph = fixture()
        graph['nodes'][0]['aliases'] = ['Same alias']
        graph['nodes'][1]['aliases'] = ['same alias']
        with self.assertRaisesRegex(ValueError, 'alias collision'):
            validate(graph, self.schema)
        graph = fixture()
        graph['nodes'][0]['supersedes'] = 'c'
        graph['nodes'][1]['supersedes'] = 'p'
        with self.assertRaisesRegex(ValueError, 'supersedes cycle'):
            validate(graph, self.schema)

    def test_patent_stages_require_identifiers_only_when_claimed(self):
        graph = fixture()
        patent = dict(id='patent', type='Patent', label='Patent', summary='Draft', status='specification drafting', evidenceIds=['s'], visibility='review')
        graph['nodes'].append(patent)
        validate(graph, self.schema)
        patent['status'] = 'filed'
        with self.assertRaisesRegex(ValueError, 'applicationNumber'):
            validate(graph, self.schema)
        patent['applicationNumber'] = '10-2026-1234567'
        validate(graph, self.schema)
        patent['status'] = 'registered'
        with self.assertRaisesRegex(ValueError, 'patentNumber'):
            validate(graph, self.schema)
        patent['patentNumber'] = '10-1234567'
        validate(graph, self.schema)

    def test_writing_needs_publication_channel(self):
        graph = fixture()
        graph['nodes'].append(dict(id='w', type='Writing', label='Writing', summary='Writing', evidenceIds=['s'], visibility='public'))
        graph['edges'].append(dict(id='author', source='p', predicate='authored', target='w', evidenceIds=['s'], visibility='public', assertionStatus='sourced'))
        with self.assertRaisesRegex(ValueError, 'publication channel'):
            validate(graph, self.schema)

    def test_urls(self):
        for value in ['javascript:alert(1)', '//evil.com', '/../../secret', 'assets/%2e%2e/secret', 'https://localhost/a', 'https://127.0.0.1/a', 'https://user:password@example.com/a', 'https://example.com/\nfoo', '/%2fhost/a', 'https://127.1/a', 'https://example.com:bad/a']:
            self.assertFalse(safe_url(value, local=True), value)
        for value in ['https://example.com/a', 'http://example.com/a', '/assets/a.svg', 'assets/a.svg']:
            self.assertTrue(safe_url(value, local=True), value)


if __name__ == '__main__':
    unittest.main()
