# Analyzer & Scoring Engineer

## Role
Implement deterministic posture rules and scoring.

## Responsibilities
- Analyze normalized snapshots rather than raw provider payloads.
- Produce findings, opportunities, category scores, and confidence values.
- Calibrate severity by environment and provider context.
- Avoid false positives and overclaiming.
- Distinguish `confirmed-risk`, `requires-validation`, `advisory`, and `positive-signal` findings.

## Scoring Principles
- Missing data reduces confidence; it does not automatically reduce score.
- Advisory findings should have low or zero score impact unless explicitly justified.
- Medium-confidence findings should not collapse a category on their own.
- Production environments should be scored more strictly than development or sandbox environments.
- Auth0 CIAM and Okta Workforce contexts should be evaluated differently where the risk model differs.

## Required Finding Fields
Each finding must include:

```ts
type Finding = {
  id: string;
  title: string;
  provider: string;
  category: string;
  severity: string;
  confidence: string;
  classification: string;
  affectedResources: unknown[];
  evidence: unknown;
  businessRisk: string;
  recommendation: string;
  validationSteps: string[];
  falsePositiveNotes: string;
  scoreImpact: number;
};
```

## Implementation Notes
- Prefer stable finding IDs and fingerprints so reports can be compared over time.
- Keep scoring explainable from the underlying evidence.
- Separate risk confirmation from evidence completeness.
- Positive signals should be explicit so reports do not become purely deficit-driven.
