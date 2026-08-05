import type {
  ReportProviderId,
  StructuredReportFinding,
  StructuredReportV1
} from "../reporting/json/report-contract.types";
import type { Severity } from "../reporting/markdown/report.types";

export type ComplianceFramework = "nis2" | "iso27001" | "soc2";

export type IdentityDomain =
  | "identity-inventory"
  | "user-lifecycle"
  | "authentication-and-mfa"
  | "password-authenticator-policy"
  | "access-rights-and-app-assignments"
  | "privileged-access"
  | "api-oauth-authorization"
  | "federation-and-external-idps"
  | "logging-and-monitoring"
  | "incident-investigation"
  | "network-zones-and-trusted-origins"
  | "change-configuration-drift"
  | "exceptions-and-manual-evidence";

export type ComplianceEvidenceCoverage =
  | "strong"
  | "partial"
  | "manual-only"
  | "not-supported";

export type FindingControlRelevance = "direct" | "supporting" | "indirect";
export type FindingEvidenceStrength = "strong" | "partial" | "weak";

export interface ComplianceControl {
  framework: ComplianceFramework;
  controlId: string;
  controlReference: string;
  controlName: string;
  identityDomain: IdentityDomain;
  requirementSummary: string;
  scannerEvidence: string[];
  manualEvidence: string[];
  supportedProviders: ReportProviderId[];
  coverage: ComplianceEvidenceCoverage;
  caveats: string[];
  reportWordingGuidance: string;
  source: "docs/compliance/identity-control-matrix.md";
}

export interface FindingControlMappingRef {
  framework: ComplianceFramework;
  controlId: string;
  relevance: FindingControlRelevance;
  evidenceStrength: FindingEvidenceStrength;
  caveat?: string;
}

export interface FindingComplianceMapping {
  findingId: string;
  provider: ReportProviderId;
  controls: FindingControlMappingRef[];
}

export interface ComplianceMappedFinding {
  findingId: string;
  fingerprint: string;
  title: string;
  provider: ReportProviderId;
  category: string;
  severity: Severity;
  classification: StructuredReportFinding["classification"];
  controls: Array<
    FindingControlMappingRef & {
      controlName: string;
      controlReference: string;
      identityDomain: IdentityDomain;
    }
  >;
}

export interface ComplianceControlEvidence {
  framework: ComplianceFramework;
  controlId: string;
  controlReference: string;
  controlName: string;
  identityDomain: IdentityDomain;
  coverage: ComplianceEvidenceCoverage;
  scannerEvidence: string[];
  manualEvidence: string[];
  caveats: string[];
  reportWordingGuidance: string;
  relatedFindings: Array<{
    findingId: string;
    fingerprint: string;
    title: string;
    provider: ReportProviderId;
    severity: Severity;
    relevance: FindingControlRelevance;
    evidenceStrength: FindingEvidenceStrength;
    caveat?: string;
  }>;
}

export interface ComplianceMappingResult {
  source: {
    reportSchemaVersion: StructuredReportV1["schemaVersion"];
    reportGeneratedAt: string;
    scanId: string;
    provider: ReportProviderId;
    tenant: StructuredReportV1["tenant"];
    environment: StructuredReportV1["environment"];
  };
  frameworks: ComplianceFramework[];
  controls: ComplianceControlEvidence[];
  mappedFindings: ComplianceMappedFinding[];
  unmappedFindings: Array<{
    findingId: string;
    title: string;
    provider: ReportProviderId;
    severity: Severity;
  }>;
  summary: {
    totalFindings: number;
    mappedFindings: number;
    unmappedFindings: number;
    controlsWithFindings: number;
    manualEvidenceRequired: boolean;
  };
  limitations: string[];
}

export interface ComplianceMapOptions {
  frameworks?: ComplianceFramework[];
}
