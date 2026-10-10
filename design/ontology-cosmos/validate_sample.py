"""Validate ontology contracts without freezing the user's future career record counts."""
import json
import sys
from pathlib import Path

repo = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(repo / 'packages/cosmos-engine'))
from cosmos_engine.schema import load_schema, validate

if __name__ == '__main__':
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name('ontology.sample.json')
    graph = json.loads(source.read_text())
    validate(graph, load_schema(repo), json.loads((repo / 'cosmos/policy.json').read_text()))
    print(f"PASS: {len(graph['nodes'])} entities, {len(graph['edges'])} typed edges, evidence, identity and disclosure policy")
