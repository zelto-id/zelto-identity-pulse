#!/usr/bin/env python3
"""Project only named security settings from the same six synthetic snapshots."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[3]
fixtures = {
    'auth0': {'risk': 'risky-tenant', 'healthy': 'healthy-tenant', 'partial': 'partial-scope'},
    'okta': {'risk': 'risky-org', 'healthy': 'healthy-org', 'partial': 'partial-scope-org'},
}
result = {}
for provider, variants in fixtures.items():
    result[provider] = {}
    for scenario, fixture in variants.items():
        source = f'fixtures/{provider}/{fixture}.snapshot.json'
        snapshot = json.loads((root / source).read_text())
        statuses = {c['collector']: c['status'] for c in snapshot['coverage']}
        controls = []

        def add(name, collector, path, settings, note):
            observed = statuses.get(collector) == 'success' and settings is not None
            controls.append(dict(name=name, collector=collector, sourcePath=path,
                                 status='Observed configuration' if observed else 'Not assessed',
                                 settings=settings if observed else None,
                                 note=note if observed else 'No collected settings are available for this control.'))

        if provider == 'auth0':
            guardian = snapshot.get('guardian', {})
            add('Multi-factor authentication (MFA)', 'guardian', 'guardian',
                dict(policy=guardian.get('policy'), factors=[{k: f[k] for k in ('name', 'enabled') if k in f} for f in guardian.get('factors', [])]) if guardian else None,
                'Configured policy and factors; runtime enforcement and enrollment have not been verified.')
            for key, name in [('breached_password_detection', 'Breached-password detection'), ('brute_force_protection', 'Brute-force protection'), ('suspicious_ip_throttling', 'Suspicious-IP throttling')]:
                raw = snapshot.get('attackProtection', {}).get(key)
                add(name, 'attack_protection', 'attackProtection.' + key,
                    {k: raw[k] for k in ('enabled', 'shields') if k in raw} if raw is not None else None,
                    'Configuration observation only; effectiveness has not been tested.')
            tenant = snapshot.get('tenant', {})
            add('Session policy', 'tenant', 'tenant.session_lifetime / tenant.idle_session_lifetime',
                {k: tenant[k] for k in ('session_lifetime', 'idle_session_lifetime') if k in tenant} or None,
                'Lifetime values are in hours. Application-specific behavior has not been validated.')
        else:
            add('MFA authenticators', 'authenticators', 'authenticators',
                [{k: f[k] for k in ('key', 'name', 'status') if k in f} for f in snapshot.get('authenticators', [])] if 'authenticators' in snapshot else None,
                'Available authenticators do not prove MFA is required for all users or applications.')
            add('Authentication policies', 'policies', 'policies.all',
                [{**{k: p[k] for k in ('name', 'type', 'status') if k in p}, 'rules': [{k: r[k] for k in ('name', 'status') if k in r} for r in p.get('rules', [])]} for p in snapshot.get('policies', {}).get('all', [])] if 'policies' in snapshot else None,
                'Policy inventory only. Rule conditions, enforcement and organizational approval are not verified. An empty list means no policies were returned in this fixture.')
        add('Bot protection configuration', 'not_collected', 'Not present in these fixtures', None,
            '')
        add('Approved organizational security policies', 'not_collected', 'Not supplied', None, '')
        result[provider][scenario] = dict(source=source, provider=provider, target=snapshot['metadata'].get('domain') or snapshot['metadata'].get('orgUrl'), collectedAt=snapshot['metadata']['collectedAt'], controls=controls)

(root / 'outputs/identity-pulse-demo/dist/control-evidence.js').write_text(
    'window.PULSE_CONTROLS = ' + json.dumps(result, indent=2, ensure_ascii=False) + ';\n')
print('Generated allowlisted control evidence for six synthetic fixtures.')
