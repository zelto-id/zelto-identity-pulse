# Architecture Decisions

- One repository for the product and its supporting assets.
- Node.js and TypeScript are the implementation stack.
- The product is CLI-first.
- Connectors produce normalized snapshots.
- Analyzers consume normalized snapshots, not raw API responses.
- Reports render from structured report objects.
- JSON report output is required before delta comparison.
- Provider-specific logic is acceptable until abstractions are clearly needed.

## Current Direction
- Keep provider boundaries explicit.
- Add shared primitives only when they reduce duplication without hiding provider realities.
- Treat report schema stability as a product contract.
