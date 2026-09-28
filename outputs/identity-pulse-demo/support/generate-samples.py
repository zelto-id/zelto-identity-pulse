#!/usr/bin/env python3
"""Generate synthetic browser inputs through the existing CLI, offline."""
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[3]
out = root / 'outputs/identity-pulse-demo/dist/sample-data.js'
fixtures = {
    'auth0': {'risk': 'risky-tenant', 'healthy': 'healthy-tenant', 'partial': 'partial-scope'},
    'okta': {'risk': 'risky-org', 'healthy': 'healthy-org', 'partial': 'partial-scope-org'},
}
reports = {}
with tempfile.TemporaryDirectory(prefix='identity-pulse-demo-') as tmp:
    for provider, variants in fixtures.items():
        reports[provider] = {}
        for scenario, fixture in variants.items():
            destination = Path(tmp) / f'{provider}-{scenario}.json'
            subprocess.run([
                'node', str(root / 'dist/cli/index.js'), 'scan', provider,
                '--from-snapshot', str(root / f'fixtures/{provider}/{fixture}.snapshot.json'),
                '--environment', 'production', '--format', 'json', '--output', str(destination),
            ], cwd=tmp, check=True, capture_output=True, text=True)
            reports[provider][scenario] = json.loads(destination.read_text())
            print(f'{provider}/{scenario}: {len(reports[provider][scenario]["findings"])} findings')
out.write_text('window.PULSE_REPORTS = ' + json.dumps(reports, indent=2, ensure_ascii=False) + ';\n')
