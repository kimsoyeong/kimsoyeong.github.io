"""One-command build plus explicit, inspectable review and semantic queries."""
import argparse
import json
import os
import sys
from pathlib import Path
from .engine import assemble, dumps, load, paths, update
from .schema import load_schema, validate
from .semantic import query


def find_root(start):
    for directory in (start, *start.parents):
        if (directory / 'cosmos/config.json').exists():
            return directory
    raise ValueError('Run inside a repository with cosmos/config.json, or pass --root')


def main(argv=None):
    parser = argparse.ArgumentParser(prog='cosmos', description='Build a reviewed, static Cosmos knowledge graph')
    parser.add_argument('--root', type=Path)
    sub = parser.add_subparsers(dest='command', required=True)
    build = sub.add_parser('update', help='Ingest, validate and update the Cosmos graph')
    build.add_argument('--provider', choices=['none', 'openai', 'codex'], default=os.environ.get('COSMOS_LLM_PROVIDER', 'codex'))
    build.add_argument('--no-extract', action='store_true', help='Build approved data without LLM or inbox extraction')
    build.add_argument('--approve', action='append', default=[], metavar='CANDIDATE_ID')
    build.add_argument('--approve-baseline', action='store_true', help='Explicitly approve the current canonical graph contents for publication')
    build.add_argument('--dry-run', action='store_true')
    build.add_argument('--refresh', action='store_true', help='Re-extract inbox sources, including remote URL snapshots')
    build.add_argument('--check', action='store_true', help='Fail if generated public outputs differ; no writes or extraction')
    sub.add_parser('review', help='Print pending candidate changes and questions')
    sub.add_parser('validate', help='Validate canonical and public graph')
    studio = sub.add_parser('studio', help='Open a separate local web workspace')
    studio.add_argument('--port', type=int, default=8770)
    queries = sub.add_parser('query', help='Run evidence-backed semantic queries')
    queries.add_argument('name', choices=['portfolio', 'career', 'capabilities', 'research', 'writing', 'connections'])
    queries.add_argument('--person', default='person:soyeong')
    queries.add_argument('--entity')
    queries.add_argument('--as-of')
    args = parser.parse_args(argv)
    try:
        root = (args.root or find_root(Path.cwd())).resolve()
        p = paths(root)
        os.environ['COSMOS_PROJECT_ROOT'] = str(root)
        if args.command == 'studio':
            from .server import serve
            serve(root, args.port)
            return 0
        if args.command == 'update':
            result = update(root, provider=args.provider, extract=not args.no_extract, approve_ids=args.approve,
                            approve_baseline=args.approve_baseline, dry_run=args.dry_run, check=args.check, refresh=args.refresh)
        elif args.command == 'review':
            applied = load(p['state'] / 'applied.json', [])
            result = [load(file) for file in sorted((p['state'] / 'review').glob('*.json')) if file.stem not in applied]
        elif args.command == 'validate':
            schema, policy = load_schema(root), load(p['policy'])
            validate(assemble(root), schema, policy)
            public = load(p['graph'])
            validate(public, schema, policy)
            result = {'status': 'valid', 'nodes': len(public['nodes']), 'edges': len(public['edges'])}
        else:
            result = query(load(p['graph']), args.name, args.person, args.entity, args.as_of)
        print(dumps(result), end='')
        return 0
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(f'Cosmos: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
