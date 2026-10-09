#!/usr/bin/env python3
"""Inline local assets into portable pages and create the presentation ZIP."""
from pathlib import Path
from hashlib import sha256
from shutil import copy2
import re
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
src, dest = root / 'dist', root / 'offline'
dest.mkdir(exist_ok=True)
# Fonts and raster brand files stay as siblings of the HTML so @font-face and <img> resolve.
binary_assets = (
    'Lato-Regular.woff2',
    'Lato-Regular-Ext.woff2',
    'Lato-Bold.woff2',
    'Lato-Bold-Ext.woff2',
    'Lato-Black.woff2',
    'Lato-Black-Ext.woff2',
    'favicon.png',
    'zelto-logo.png',
)
for name in binary_assets:
    copy2(src / name, dest / name)
for name in ('index.html', 'workspace.html', 'data-flow.html', 'technical-flow.html'):
    html = (src / name).read_text()
    # Keep an already-open local preview from reusing scripts from an older demo.
    html = re.sub(r'((?:href|src)=")([^"/]+\.(?:css|js))(?:\?[^" ]*)?(\")',
                  lambda m: m[1] + m[2] + '?v=' + sha256((src / m[2]).read_bytes()).hexdigest()[:12] + m[3], html)
    (src / name).write_text(html)
    html = re.sub(r'<link rel="stylesheet" href="([^"/]+)">',
                  lambda m: '<style>\n' + (src / m[1].split('?', 1)[0]).read_text() + '\n</style>', html)
    scripts = re.findall(r'<script defer src="([^"/]+)"></script>', html)
    html = re.sub(r'[ \t]*<script defer src="[^"/]+"></script>', '', html)
    inline = '\n'.join('<script>\n' + (src / name.split('?', 1)[0]).read_text().replace('</script', '<\\/script') + '\n</script>' for name in scripts)
    html = html.replace('</body>', inline + '\n</body>')
    (dest / name).write_text(html)
with ZipFile(root / 'identity-pulse-demo.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted(dest.glob('*.html')):
        archive.write(file, file.name)
    for name in binary_assets:
        archive.write(dest / name, name)
    for name in ('demo-guide.md', 'architecture-diagrams.md', 'verification.md'):
        file = root / name
        if file.exists():
            archive.write(file, name)
    archive.writestr('START-HERE.txt', 'Identity Pulse presentation demo\n\nOpen index.html in a browser. Choose Business User or Technical User, then explore the workspace. Keep the four HTML pages together with the Lato font files, favicon.png and zelto-logo.png.\nAll data is synthetic. No installation, account, token or provider connection is needed.\nSee demo-guide.md for a walkthrough and architecture-diagrams.md for editable diagrams.\n')
with ZipFile(root / 'identity-pulse-demo.zip') as archive:
    assert archive.testzip() is None
print(f'Packaged {len(list(dest.glob("*.html")))} self-contained pages: {root / "identity-pulse-demo.zip"}')
