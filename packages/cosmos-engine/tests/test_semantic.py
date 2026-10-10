import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cosmos_engine.semantic import query


def fixture():
    nodes = [dict(id=id_, type=type_, label=id_, evidenceIds=['s']) for id_, type_ in [('p', 'Person'), ('paper', 'Paper'), ('review', 'Review'), ('patent', 'Patent'), ('c', 'Contribution'), ('k', 'Capability'), ('unproven', 'Capability'), ('j', 'Project')]]
    def edge(id_, source, predicate, target, **extra):
        return dict(id=id_, source=source, predicate=predicate, target=target, assertionStatus='sourced', evidenceIds=['s'], **extra)
    edges = [edge('a1', 'p', 'authored', 'paper'), edge('a2', 'p', 'authored', 'review'), edge('a3', 'p', 'preparedDisclosure', 'patent'), edge('owns', 'p', 'hasContribution', 'c'), edge('claims', 'p', 'hasCapability', 'k'), edge('proof', 'c', 'demonstrates', 'k'), edge('emptyclaim', 'p', 'hasCapability', 'unproven'), edge('project', 'c', 'inProject', 'j')]
    return dict(nodes=nodes, edges=edges, sources={'s': {'label': 'Confirmed evidence'}})


class SemanticTest(unittest.TestCase):
    def test_research_excludes_review_and_writing_retains_it(self):
        graph = fixture()
        self.assertEqual({r['record']['id'] for r in query(graph, 'research', person='p')}, {'paper', 'patent'})
        self.assertEqual([r['record']['id'] for r in query(graph, 'writing', person='p')], ['review'])

    def test_capability_requires_owned_performed_basis(self):
        graph = fixture()
        results = query(graph, 'capabilities', person='p')
        self.assertEqual([r['record']['id'] for r in results], ['k'])
        self.assertEqual(results[0]['basisPaths'], [['owns', 'proof']])
        graph['edges'][5]['assertionStatus'] = 'proposed'
        self.assertEqual(query(graph, 'capabilities', person='p'), [])

    def test_expired_relation_and_future_relation_excluded_at_as_of(self):
        graph = fixture()
        graph['edges'][0]['validTo'] = '2026-10-10'
        graph['edges'][2]['validFrom'] = '2026-11-01'
        self.assertEqual(query(graph, 'research', person='p', as_of='2026-10-10'), [])
        self.assertEqual([r['record']['id'] for r in query(graph, 'research', person='p', as_of='2026-10-09')], ['paper'])
        self.assertEqual([r['record']['id'] for r in query(graph, 'research', person='p', as_of='2026-11-01')], ['patent'])

    def test_as_of_rejects_invalid_or_noncanonical_dates(self):
        for value in ('tomorrow', '20261010', '2026-02-30'):
            with self.assertRaises(ValueError):
                query(fixture(), 'research', person='p', as_of=value)

    def test_connections_include_direct_neighbors_only(self):
        results = query(fixture(), 'connections', entity='k')
        self.assertEqual({n['id'] for n in results['nodes']}, {'k', 'p', 'c'})
        self.assertEqual(set(results['evidence']), {'s'})


if __name__ == '__main__':
    unittest.main()
