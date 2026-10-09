import copy
import unittest
from relation_rules import derive_relations


def edge(i, source, predicate, target, **fields):
    return dict(id=f'relation:{i:03d}', source=source, predicate=predicate, target=target,
                **({'evidenceIds': [str(i)], 'assertionStatus': 'sourced', 'visibility': 'review'} | fields))


class RelationRulesTest(unittest.TestCase):
    def test_multiple_contributions_share_one_project_link_and_keep_both_bases(self):
        data = {'edges': [edge(1, 'person', 'hasContribution', 'degree'),
                          edge(2, 'degree', 'inProject', 'har'),
                          edge(3, 'person', 'hasContribution', 'followup'),
                          edge(4, 'followup', 'inProject', 'har', visibility='private')]}
        derive_relations(data)
        link = data['edges'][-1]
        self.assertEqual((link['source'], link['predicate'], link['target']), ('person', 'workedOn', 'har'))
        self.assertEqual(link['basisPaths'], [['relation:001', 'relation:002'], ['relation:003', 'relation:004']])
        self.assertEqual(link['visibility'], 'private')
        snapshot = copy.deepcopy(data)
        derive_relations(data)
        self.assertEqual(data, snapshot)

    def test_proposed_disputed_or_removed_basis_cannot_keep_a_direct_claim(self):
        for status in ['proposed', 'disputed']:
            data = {'edges': [edge(1, 'person', 'hasExperience', 'job'),
                              edge(2, 'job', 'atOrganization', 'company')]}
            derive_relations(data)
            self.assertEqual(data['edges'][-1]['predicate'], 'workedAt')
            data['edges'][1]['assertionStatus'] = status
            derive_relations(data)
            self.assertFalse(any(e['predicate'] == 'workedAt' for e in data['edges']))
        data = {'edges': [edge(1, 'person', 'hasExperience', 'job'),
                          edge(2, 'job', 'atOrganization', 'company')]}
        derive_relations(data)
        data['edges'] = [e for e in data['edges'] if e['id'] != 'relation:002']
        derive_relations(data)
        self.assertEqual(len(data['edges']), 1)


if __name__ == '__main__':
    unittest.main()
