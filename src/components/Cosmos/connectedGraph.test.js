import { connectedSubgraph } from './connectedGraph';

test('connected graph contains only direct neighbors and edges within that set', () => {
  const nodes = ['root','a','b','far','isolated'].map(id => ({id}));
  const edges = [{source:'root',target:'a'}, {source:'b',target:'root'}, {source:'a',target:'b'}, {source:'a',target:'far'}];
  const graph = connectedSubgraph('root',nodes,edges);
  expect(graph.nodes.map(n => n.id)).toEqual(['root','a','b']);
  expect(graph.edges).toEqual(edges.slice(0,3));
});
