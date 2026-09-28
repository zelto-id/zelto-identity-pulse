#!/usr/bin/env python3
"""Inline local assets into portable pages and create the presentation ZIP."""
from pathlib import Path
import re
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
src, dest = root / 'dist', root / 'offline'
dest.mkdir(exist_ok=True)
for name in ('index.html', 'data-flow.html', 'technical-flow.html'):
    html = (src / name).read_text()
    html = re.sub(r'<link rel="stylesheet" href="([^"/]+)">',
                  lambda m: '<style>\n' + (src / m[1]).read_text() + '\n</style>', html)
    scripts = re.findall(r'<script defer src="([^"/]+)"></script>', html)
    html = re.sub(r'<script defer src="[^"/]+"></script>', '', html)
    inline = '\n'.join('<script>\n' + (src / name).read_text().replace('</script', '<\\/script') + '\n</script>' for name in scripts)
    html = html.replace('</body>', inline + '\n</body>')
    (dest / name).write_text(html)
with ZipFile(root / 'identity-pulse-demo.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted(dest.glob('*.html')):
        archive.write(file, file.name)
    for name in ('demo-guide.md', 'architecture-diagrams.md', 'verification.md'):
        file = root / name
        if file.exists():
            archive.write(file, name)
    archive.writestr('START-HERE.txt', 'Identity Pulse presentation demo\n\nOpen index.html in a browser. Keep the three HTML pages together for navigation.\nAll data is synthetic. No installation, account, token or provider connection is needed.\nSee demo-guide.md for a walkthrough and architecture-diagrams.md for editable diagrams.\n')
with ZipFile(root / 'identity-pulse-demo.zip') as archive:
    assert archive.testzip() is None
print(f'Packaged {len(list(dest.glob("*.html")))} self-contained pages: {root / "identity-pulse-demo.zip"}')
