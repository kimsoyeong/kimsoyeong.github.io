import graph from './graph.json';
import { ontologyGuide, ontologyExampleNodes, ontologyExampleEdges } from './ontologyGuide';

test('structure examples link to existing records and represent stored edges', () => {
  const markup = ontologyGuide(graph.nodes.length, graph.edges.length);
  for (const [, id] of markup.matchAll(/data-read="([^"]+)"/g))
    expect(graph.nodes.some(n => n.id === id)).toBe(true);
  for (const {source,predicate,target} of ontologyExampleEdges)
    expect(graph.edges).toEqual(expect.arrayContaining([expect.objectContaining({source,predicate,target})]));
  for (const a of ontologyExampleNodes) for (const b of ontologyExampleNodes.filter(n => n.id !== a.id)) {
    expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeGreaterThan(120);
  }
});

test('PreFlight is directly linked to its contributor and separates demonstrated capabilities from implementation technology', () => {
  expect(graph.edges).toEqual(expect.arrayContaining([
    expect.objectContaining({source:'person:soyeong', predicate:'workedOn', target:'project:preflight'}),
    ...['integration','architecture'].map(id => expect.objectContaining({
      source:'contribution:preflight', predicate:'demonstrates', target:`capability:${id}`
    }))
  ]));
  expect(ontologyExampleEdges.some(e => e.predicate === 'workedOn')).toBe(true);
  expect(ontologyExampleEdges).toContainEqual(expect.objectContaining({source:'contribution:preflight',predicate:'usesTechnology',target:'technology:github-copilot-sdk'}));
  expect(ontologyExampleEdges.filter(e => e.predicate === 'demonstrates')).toHaveLength(2);
});
