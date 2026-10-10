"""Local-only Studio: the same engine behind a small browser workflow."""
import base64
import binascii
import json
import os
import secrets
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from .engine import assemble, dumps, load, paths, update, write_batch
from .ingest import MAX_BYTES, PATCH_KEYS
from .schema import derive_relations, load_schema, validate
from .semantic import query


class Jobs:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix='cosmos-studio')
        self.lock = threading.Lock()
        self.current = None

    def snapshot(self):
        with self.lock:
            return dict(self.current) if self.current else None

    def submit(self, function):
        with self.lock:
            if self.current and self.current['status'] == 'running':
                raise ValueError('A job is already running')
            self.current = {'id': secrets.token_hex(8), 'status': 'running'}
            initial = dict(self.current)
        def work():
            try:
                result = function()
                final = {'id': initial['id'], 'status': 'complete', 'result': result}
            except (ValueError, KeyError, TypeError, OSError) as error:
                final = {'id': initial['id'], 'status': 'failed', 'error': str(error)}
            except Exception:
                final = {'id': initial['id'], 'status': 'failed', 'error': 'Unexpected local engine error; inspect the input and retry'}
            with self.lock:
                self.current = final
        self.executor.submit(work)
        return initial


class StudioServer(ThreadingHTTPServer):
    daemon_threads = True

    def server_close(self):
        super().server_close()
        self.jobs.executor.shutdown(wait=False, cancel_futures=True)


def create_server(root, port=8770):
    root = Path(root).resolve()
    p = paths(root)
    token = secrets.token_urlsafe(32)
    jobs = Jobs()
    assets = Path(__file__).with_name('studio')

    def state():
        applied = set(load(p['state'] / 'applied.json', [])) | {f.stem.rsplit('-', 1)[-1] for f in p['records'].glob('*.json')}
        return {'graph': load(p['graph'], {'nodes': [], 'edges': [], 'sources': {}}),
                'report': load(p['state'] / 'report.json', {}),
                'candidates': [load(f) for f in sorted((p['state'] / 'review').glob('*.json')) if f.stem not in applied],
                'inputs': [{'name': f.name, 'size': f.stat().st_size} for f in sorted(p['inbox'].glob('*'))
                           if f.is_file() and not f.name.startswith('.') and f.resolve().is_relative_to(p['inbox'].resolve())],
                'provider': {'default': os.environ.get('COSMOS_LLM_PROVIDER', 'codex'),
                             'openaiConfigured': bool((os.environ.get('COSMOS_LLM_API_KEY') or os.environ.get('OPENAI_API_KEY')) and os.environ.get('COSMOS_LLM_MODEL')),
                             'codexAvailable': bool(shutil.which('codex'))},
                'job': jobs.snapshot()}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

        def respond(self, status, body, content_type='application/json; charset=utf-8'):
            data = dumps(body).encode() if isinstance(body, (dict, list)) else body
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'")
            self.end_headers()
            self.wfile.write(data)

        def trusted(self, mutation=False):
            port = self.server.server_address[1]
            hosts = {f'127.0.0.1:{port}', f'localhost:{port}'}
            host = self.headers.get('Host', '')
            if host not in hosts:
                self.respond(403, {'error': 'Invalid local host'})
                return False
            origin = self.headers.get('Origin')
            if origin and origin != f'http://{host}':
                self.respond(403, {'error': 'Cross-origin requests are forbidden'})
                return False
            if mutation and not secrets.compare_digest(self.headers.get('X-Cosmos-Token', ''), token):
                self.respond(403, {'error': 'Invalid Studio request token'})
                return False
            return True

        def do_GET(self):
            if not self.trusted():
                return
            route = urlsplit(self.path)
            try:
                if route.path == '/api/state':
                    self.respond(200, state())
                elif route.path == '/api/query':
                    args = parse_qs(route.query)
                    result = query(load(p['graph']), args.get('name', ['portfolio'])[0],
                                   args.get('person', ['person:soyeong'])[0], args.get('entity', [None])[0],
                                   args.get('asOf', [None])[0])
                    self.respond(200, result)
                elif route.path in {'/', '/index.html', '/studio.css', '/studio.js'}:
                    name = 'index.html' if route.path in {'/', '/index.html'} else route.path[1:]
                    body = (assets / name).read_bytes()
                    if name == 'index.html':
                        body = body.replace(b'__COSMOS_TOKEN__', token.encode())
                    kind = {'index.html': 'text/html', 'studio.css': 'text/css', 'studio.js': 'text/javascript'}[name]
                    self.respond(200, body, kind + '; charset=utf-8')
                else:
                    self.respond(404, {'error': 'Not found'})
            except (ValueError, KeyError, TypeError, OSError) as error:
                self.respond(400, {'error': str(error)})

        def do_POST(self):
            if not self.trusted(mutation=True):
                return
            try:
                if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                    raise ValueError('Use application/json')
                length = int(self.headers.get('Content-Length', '0'))
                if length < 1 or length > MAX_BYTES * 4 // 3 + 65536:
                    raise ValueError('Request exceeds upload limit')
                self.connection.settimeout(30)
                body = json.loads(self.rfile.read(length))
                if not isinstance(body, dict):
                    raise ValueError('JSON object required')
                if self.path == '/api/upload':
                    name = body.get('name', '')
                    if not isinstance(name, str) or not name or len(name) > 180 or Path(name).name != name or name.startswith('.') or any(c in name for c in '/\\\r\n\x00'):
                        raise ValueError('Use a plain file name')
                    content = base64.b64decode(body.get('contentBase64', ''), validate=True)
                    if not content or len(content) > MAX_BYTES:
                        raise ValueError('File must be between 1 byte and 12 MiB')
                    target = p['inbox'] / name
                    if target.exists():
                        raise ValueError('File already exists; use a new filename to preserve the source')
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with target.open('xb') as stream:
                        stream.write(content)
                    self.respond(200, state())
                elif self.path == '/api/candidate':
                    cid = body.get('id', '')
                    if not isinstance(cid, str) or len(cid) != 20 or not cid.isalnum():
                        raise ValueError('Invalid candidate ID')
                    file = p['state'] / 'review' / f'{cid}.json'
                    candidate = load(file)
                    patch = body.get('patch')
                    if not candidate or not isinstance(patch, dict) or set(patch) - PATCH_KEYS:
                        raise ValueError('Unknown candidate or invalid patch')
                    if jobs.snapshot() and jobs.snapshot()['status'] == 'running':
                        raise ValueError('Wait for the running job before editing')
                    candidate['patch'] = patch
                    try:
                        from .engine import apply_patch, normalize_patch
                        validate(derive_relations(apply_patch(assemble(root), normalize_patch(patch))), load_schema(root), load(p['policy']))
                        candidate['validation'] = 'valid'
                    except (ValueError, KeyError, TypeError) as error:
                        candidate['validation'] = str(error)
                    write_batch({file: dumps(candidate)})
                    self.respond(200, state())
                elif self.path == '/api/update':
                    provider = body.get('provider', 'codex')
                    if provider not in {'none', 'openai', 'codex'}:
                        raise ValueError('Unknown provider')
                    extract, refresh = body.get('extract', True), body.get('refresh', False)
                    if not isinstance(extract, bool) or not isinstance(refresh, bool):
                        raise ValueError('extract and refresh must be boolean')
                    self.respond(202, jobs.submit(lambda: update(root, provider=provider, extract=extract, refresh=refresh)))
                elif self.path == '/api/approve':
                    cid = body.get('id', '')
                    if not isinstance(cid, str) or len(cid) != 20 or not cid.isalnum():
                        raise ValueError('Invalid candidate ID')
                    self.respond(202, jobs.submit(lambda: update(root, extract=False, approve_ids=[cid])))
                elif self.path == '/api/validate':
                    def check():
                        schema, policy = load_schema(root), load(p['policy'])
                        validate(assemble(root), schema, policy)
                        validate(load(p['graph']), schema, policy)
                        return update(root, extract=False, check=True)
                    self.respond(202, jobs.submit(check))
                else:
                    self.respond(404, {'error': 'Not found'})
            except (ValueError, KeyError, TypeError, OSError, binascii.Error) as error:
                self.respond(400, {'error': str(error)})

    server = StudioServer(('127.0.0.1', port), Handler)
    server.token = token
    server.jobs = jobs
    return server


def serve(root, port=8770):
    server = create_server(root, port)
    print(f'Cosmos Studio: http://127.0.0.1:{server.server_address[1]}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
