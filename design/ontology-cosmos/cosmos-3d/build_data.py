"""Compatibility entry point. Production builds use the reviewed Cosmos Engine."""
import sys
from pathlib import Path

repo = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(repo / 'packages/cosmos-engine'))
from cosmos_engine.engine import dumps, load, update, write_batch

if __name__ == '__main__':
    report = update(repo, extract=False)
    # Keep the design viewer usable without a second, unfiltered build pipeline.
    graph = load(repo / 'src/components/Cosmos/graph.json')
    write_batch({Path(__file__).with_name('graph.json'): dumps(graph)})
    print(f"Built {report['nodes']} public entities and {report['edges']} relations through Cosmos Engine")
