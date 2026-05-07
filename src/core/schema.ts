/**
 * Cross-cutting types for the snapshot and collector framework.
 *
 * The snapshot is the single source of truth for the analyzer; the analyzer
 * MUST NOT consume raw API responses directly.
 */

export type CollectorStatus = "success" | "partial" | "skipped" | "failed";

export interface CollectorFailure {
  collector: string;
  status: CollectorStatus;
  reason: string;
  httpStatus?: number;
  missingScopes?: string[];
}

export interface ResourceCoverage {
  collector: string;
  status: CollectorStatus;
  count?: number;
  requiredScopes: string[];
  missingScopes?: string[];
  notes?: string;
}

export interface CollectorResult<T = unknown> {
  name: string;
  status: CollectorStatus;
  requiredScopes: string[];
  missingScopes?: string[];
  errors?: string[];
  data?: T;
  count?: number;
  notes?: string;
}
