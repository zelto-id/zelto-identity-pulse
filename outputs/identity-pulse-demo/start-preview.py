#!/usr/bin/env python3
"""Serve only the static demo, bound to loopback."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

root = Path(__file__).resolve().parent / 'dist'
server = ThreadingHTTPServer(('127.0.0.1', 8793), partial(SimpleHTTPRequestHandler, directory=str(root)))
print('Identity Pulse preview: http://127.0.0.1:8793', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
