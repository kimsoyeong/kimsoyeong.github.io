import copy
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cosmos_engine import engine
from cosmos_engine.schema import hash_record

REPO = Path(__file__).resolve().parents[3]


class EngineTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for path in ['cosmos/config.json', 'cosmos/schema.json', 'cosmos/policy.json', 'cosmos/legacy-enrichment.json', 'design/ontology-cosmos/ontology.sample.json']:
            dest = self.root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / path, dest)
        for path in ['cosmos/inbox', 'cosmos/records', '.cosmos/review']:
            (self.root / path).mkdir(parents=True, exist_ok=True)
        p = engine.paths(self.root)
        policy = engine.load(p['policy'])
        policy['approvedHashes'] = {}
        policy = engine.approve_graph(engine.assemble(self.root), policy)
        p['policy'].write_text(engine.dumps(policy))
        engine.update(self.root, extract=False)

    def new_patch(self):
        graph = engine.assemble(self.root)
        person = next(n['id'] for n in graph['nodes'] if n['type'] == 'Person')
        capability = next(n['id'] for n in graph['nodes'] if n['type'] == 'Capability')
        base = dict(evidenceIds=['test-source'], visibility='review')
        def edge(id_, source, predicate, target):
            return dict(id=id_, source=source, predicate=predicate, target=target, assertionStatus='sourced', **base)
        return dict(sources={'test-source': dict(label='User confirmed project', observedAt='2026-10-10', visibility='review')}, nodes=[dict(id='project:test', type='Project', label='New research', summary='New research', **base), dict(id='contribution:test', type='Contribution', label='My contribution', summary='My contribution', **base)], edges=[edge('test:contribution', person, 'hasContribution', 'contribution:test'), edge('test:context', 'contribution:test', 'inProject', 'project:test'), edge('test:skill', 'contribution:test', 'demonstrates', capability)])

    def candidate(self, change, cid='a' * 20):
        file = self.root / 'cosmos/inbox' / f'{cid}.json'
        file.write_text(engine.dumps(change))
        import hashlib
        record = dict(id=cid, input=str(file.relative_to(self.root)), inputHash=hashlib.sha256(file.read_bytes()).hexdigest(), patch=change, validation='valid')
        (self.root / '.cosmos/review' / f'{cid}.json').write_text(engine.dumps(record))
        return cid

    def graph_bytes(self):
        return (self.root / 'src/components/Cosmos/graph.json').read_bytes()

    def test_approved_extension_stable_regeneration_and_dry_run(self):
        cid = self.candidate(self.new_patch())
        before = self.graph_bytes()
        engine.update(self.root, extract=False, approve_ids=[cid], dry_run=True)
        self.assertEqual(before, self.graph_bytes())
        self.assertEqual(list((self.root / 'cosmos/records').glob('*.json')), [])
        report = engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertIn('project:test', report['changes']['added'])
        after = self.graph_bytes()
        self.assertFalse(engine.update(self.root, extract=False)['outputsChanged'])
        self.assertEqual(after, self.graph_bytes())
        self.assertFalse(engine.update(self.root, extract=False, check=True)['outputsChanged'])

    def test_unapproved_unrelated_edit_not_approved_by_other_patch(self):
        p = engine.paths(self.root)
        baseline = engine.load(p['source'])
        node = next(n for n in baseline['nodes'] if n['type'] == 'Concept')
        node['summary'] = 'UNREVIEWED SECRET'
        p['source'].write_text(engine.dumps(baseline))
        cid = self.candidate(self.new_patch())
        engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertNotIn(b'UNREVIEWED SECRET', self.graph_bytes())
        policy = engine.load(p['policy'])
        self.assertNotEqual(policy['approvedHashes'].get(node['id']), hash_record(node))

    def test_conflict_and_private_candidate_leave_outputs_unchanged(self):
        before = self.graph_bytes()
        graph = engine.assemble(self.root)
        existing = copy.deepcopy(graph['nodes'][0])
        existing['summary'] = 'Conflicting edit'
        cid = self.candidate(dict(nodes=[existing]))
        with self.assertRaisesRegex(ValueError, 'Conflicting update'):
            engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertEqual(before, self.graph_bytes())
        private = self.new_patch()
        private['nodes'][0]['visibility'] = 'private'
        cid = self.candidate(private, 'b' * 20)
        with self.assertRaisesRegex(ValueError, 'Private records'):
            engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertEqual(before, self.graph_bytes())

    def test_nested_raw_information_rejected(self):
        change = self.new_patch()
        change['nodes'][0]['details'] = [dict(title='Research', paragraphs=['Public'], rawQuote='SECRET')]
        before = self.graph_bytes()
        cid = self.candidate(change)
        with self.assertRaisesRegex(ValueError, 'details fields'):
            engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertEqual(before, self.graph_bytes())

    def test_write_failure_rolls_back_outputs_and_policy(self):
        cid = self.candidate(self.new_patch())
        before = self.graph_bytes()
        p = engine.paths(self.root)
        policy = p['policy'].read_bytes()
        original = engine.os.replace
        calls = 0
        def fail_second(source, target):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise OSError('simulated disk failure')
            return original(source, target)
        with patch.object(engine.os, 'replace', fail_second):
            with self.assertRaisesRegex(OSError, 'simulated disk failure'):
                engine.update(self.root, extract=False, approve_ids=[cid])
        self.assertEqual(before, self.graph_bytes())
        self.assertEqual(policy, p['policy'].read_bytes())
        self.assertEqual(list(p['records'].glob('*.json')), [])

    def test_ingested_input_is_not_reextracted_after_approval(self):
        inbox = self.root / 'cosmos/inbox/new-project.json'
        inbox.write_text(engine.dumps(self.new_patch()))
        report = engine.update(self.root)
        self.assertEqual(len(report['candidateIds']), 1)
        cid = report['candidateIds'][0]
        engine.update(self.root, approve_ids=[cid])
        after = self.graph_bytes()
        count = len(list((self.root / 'cosmos/records').glob('*.json')))
        report = engine.update(self.root)
        self.assertEqual(report['candidateIds'], [])
        self.assertEqual(self.graph_bytes(), after)
        self.assertEqual(len(list((self.root / 'cosmos/records').glob('*.json'))), count)

    def test_changed_input_during_extraction_cannot_be_approved(self):
        inbox = self.root / 'cosmos/inbox/racing-source.json'
        change = self.new_patch()
        inbox.write_text(engine.dumps(change))
        def changing_input(file, graph, schema, provider):
            file.write_text(file.read_text() + '\n')
            return change
        with patch('cosmos_engine.ingest.ingest_file', changing_input):
            report = engine.update(self.root)
        before = self.graph_bytes()
        with self.assertRaises(ValueError):
            engine.update(self.root, extract=False, approve_ids=report['candidateIds'])
        self.assertEqual(before, self.graph_bytes())

    def test_existing_lock_blocks_update(self):
        lock = self.root / '.cosmos/update.lock'
        lock.write_text('another process')
        before = self.graph_bytes()
        with self.assertRaisesRegex(ValueError, 'Another Cosmos update'):
            engine.update(self.root, extract=False)
        self.assertEqual(before, self.graph_bytes())
        self.assertTrue(lock.exists())


if __name__ == '__main__':
    unittest.main()
