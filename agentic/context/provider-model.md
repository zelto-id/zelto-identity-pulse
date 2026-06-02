# Provider Model

- Auth0 is CIAM-focused and is primarily tenant, application, API, and connection oriented.
- Okta Workforce is workforce-focused and is primarily users, groups, applications, policies, admins, and logs oriented.
- Provider collectors should share broad patterns where useful, but should not be forced into identical resource models.

## Expected Provider Components
Each provider should have:
- connector
- normalized snapshot
- analyzer
- scoring
- report renderer
- fixtures
- tests

## Modeling Guidance
- Preserve provider-specific semantics when they matter for risk interpretation.
- Normalize enough for shared reporting and orchestration, but do not flatten meaningful differences away.
