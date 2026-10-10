import { connectedSubgraph, connectedLayout } from './connectedGraph';

test('connected graph contains only direct neighbors and edges within that set', () => {
  const nodes = ['root','a','b','far','isolated'].map(id => ({id}));
  const edges = [{source:'root',target:'a'}, {source:'b',target:'root'}, {source:'a',target:'b'}, {source:'a',target:'far'}];
  const graph = connectedSubgraph('root',nodes,edges);
  expect(graph.nodes.map(n => n.id)).toEqual(['root','a','b']);
  expect(graph.edges).toEqual(edges.slice(0,3));
});

test('category clusters preserve direct nodes and deterministic positions without mutating data', () => {
  const nodes = [{id:'root',type:'Person'}, {id:'p',type:'Project'}, {id:'w',type:'Writing'}, {id:'paper',type:'Paper'}, {id:'t',type:'Technology'}];
  const graph = {nodes,edges:[]};
  const layout = connectedLayout(graph,'root');
  expect(layout.groups.map(g => [g.key,g.members.length])).toEqual([['Person',1],['Writing',2],['Project',1],['Technology',1]]);
  expect(layout.nodes.map(n=>n.id).sort()).toEqual(nodes.map(n=>n.id).sort());
  expect(connectedLayout({...graph,nodes:[...nodes].reverse()},'root')).toEqual(layout);
  expect(nodes.every(n=>n.x===undefined)).toBe(true);
  expect(layout.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)&&Number.isFinite(n.z))).toBe(true);
  expect(connectedLayout({nodes:[nodes[0]],edges:[]},'root').width).toBeGreaterThan(0);
});
