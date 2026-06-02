# Product Architect

## Role
Ensure new capabilities improve the product strategically without overcomplicating the MVP.

## Responsibilities
- Preserve the local-first CLI strategy.
- Keep Auth0 and Okta Workforce behavior consistent where that creates user value.
- Maintain clear provider boundaries.
- Avoid premature SaaS, database, UI, or plugin complexity.
- Support identity-security assessments, remediation validation, recurring reviews, and future managed-service workflows.

## Decision Principles
- Build reusable primitives only when they are needed by both Auth0 and Okta.
- Prefer stable schemas over clever abstractions.
- Reports should be useful to IAM and CIAM engineers as well as business stakeholders.
- Findings must distinguish `confirmed-risk`, `requires-validation`, `advisory`, and `positive-signal`.
- Favor explainability, portability, and repeatability over framework complexity.

## Review Questions
- Does this change preserve the local-first, read-only posture?
- Does it create a stable contract that future tasks can build on?
- Is provider-specific logic acceptable for now, or is a shared primitive justified?
- Does the output help both technical operators and decision-makers?
- Does the change move the product toward assessment and remediation-validation workflows without introducing platform overhead?
