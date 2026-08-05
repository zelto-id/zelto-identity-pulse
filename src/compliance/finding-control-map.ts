import {
  ComplianceFramework,
  FindingComplianceMapping,
  FindingControlMappingRef,
  FindingControlRelevance,
  FindingEvidenceStrength
} from "./compliance.types";
import { ReportProviderId } from "../reporting/json/report-contract.types";

function ref(
  framework: ComplianceFramework,
  controlId: string,
  relevance: FindingControlRelevance,
  evidenceStrength: FindingEvidenceStrength,
  caveat?: string
): FindingControlMappingRef {
  return { framework, controlId, relevance, evidenceStrength, caveat };
}

function mappings(
  provider: ReportProviderId,
  findingIds: string[],
  controls: FindingControlMappingRef[]
): FindingComplianceMapping[] {
  return findingIds.map((findingId) => ({
    provider,
    findingId,
    controls
  }));
}

function uniqueControls(
  controls: FindingControlMappingRef[]
): FindingControlMappingRef[] {
  const seen = new Set<string>();
  return controls.filter((control) => {
    const key = `${control.framework}:${control.controlId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const AUTHENTICATION_CONTROLS = [
  ref("nis2", "Article 21(2)(j)", "direct", "strong"),
  ref("iso27001", "A.8.5", "direct", "strong"),
  ref("soc2", "CC6.5", "supporting", "partial")
];

const PASSWORD_AUTHENTICATOR_CONTROLS = [
  ref("nis2", "Article 21(2)(j)", "direct", "strong"),
  ref("iso27001", "A.5.17", "direct", "partial"),
  ref("iso27001", "A.8.5", "direct", "strong"),
  ref("soc2", "CC6.5", "supporting", "partial")
];

const ACCESS_CONTROL_CONTROLS = [
  ref("nis2", "Article 21(2)(i)", "direct", "partial"),
  ref("iso27001", "A.5.15", "direct", "partial"),
  ref("iso27001", "A.5.18", "supporting", "partial"),
  ref("soc2", "CC6.1", "direct", "partial")
];

const PRIVILEGED_ACCESS_CONTROLS = [
  ref("nis2", "Article 21(2)(i)", "direct", "partial"),
  ref("iso27001", "A.8.2", "direct", "partial"),
  ref("soc2", "CC6.4", "direct", "partial")
];

const API_OAUTH_CONTROLS = [
  ref("nis2", "Article 21(2)(e)", "direct", "partial"),
  ref("iso27001", "A.8.3", "direct", "partial"),
  ref("soc2", "CC6.1", "supporting", "partial")
];

const TOKEN_DATA_EXPOSURE_CONTROLS = [
  ref("nis2", "Article 21(2)(e)", "direct", "partial"),
  ref("iso27001", "A.8.3", "direct", "partial"),
  ref("soc2", "CC6.7", "supporting", "weak")
];

const CRYPTO_CONTROLS = [
  ref("nis2", "Article 21(2)(h)", "direct", "partial"),
  ref("iso27001", "A.5.17", "supporting", "partial"),
  ref("soc2", "CC6.7", "supporting", "weak")
];

const NETWORK_CONTROLS = [
  ref("iso27001", "A.8.20", "direct", "partial"),
  ref("soc2", "CC6.6", "direct", "partial")
];

const LOGGING_CONTROLS = [
  ref("nis2", "Article 21(2)(b)", "direct", "partial"),
  ref("iso27001", "A.8.15", "direct", "partial"),
  ref("iso27001", "A.8.16", "supporting", "partial"),
  ref("soc2", "CC7.1", "direct", "partial")
];

const INCIDENT_CONTROLS = [
  ref("nis2", "Article 21(2)(b)", "supporting", "partial"),
  ref("nis2", "Article 23", "indirect", "weak"),
  ref("iso27001", "A.5.24-A.5.28", "supporting", "partial"),
  ref("soc2", "CC7.2-CC7.5", "supporting", "weak")
];

const SUPPLY_CHAIN_CONTROLS = [
  ref("nis2", "Article 21(2)(d)", "direct", "partial"),
  ref("iso27001", "A.5.9", "supporting", "partial"),
  ref("soc2", "CC6.1", "supporting", "partial")
];

const SDLC_CONTROLS = [
  ref("nis2", "Article 21(2)(e)", "direct", "partial"),
  ref("iso27001", "A.8.8", "supporting", "weak"),
  ref("soc2", "CC5.2", "supporting", "partial")
];

const COVERAGE_CONTROLS = [
  ref(
    "nis2",
    "Article 21(2)(f)",
    "supporting",
    "weak",
    "Coverage gaps reduce confidence; they are not evidence that a control failed."
  ),
  ref("soc2", "CC4.1", "supporting", "weak")
];

const INVENTORY_CONTROLS = [
  ref("iso27001", "A.5.9", "supporting", "partial"),
  ref("soc2", "CC3.2", "supporting", "partial")
];

const USER_LIFECYCLE_CONTROLS = [
  ref("nis2", "Article 21(2)(i)", "direct", "partial"),
  ref("iso27001", "A.5.16", "direct", "partial"),
  ref("soc2", "CC6.2", "supporting", "partial"),
  ref("soc2", "CC6.3", "direct", "partial")
];

export const FINDING_COMPLIANCE_MAPPINGS: FindingComplianceMapping[] = [
  ...mappings("auth0", ["AUTH-COV-001"], COVERAGE_CONTROLS),
  ...mappings(
    "auth0",
    ["AUTH-TEN-001", "AUTH-ORG-001"],
    INVENTORY_CONTROLS
  ),
  ...mappings(
    "auth0",
    ["AUTH-TEN-003-A", "AUTH-TEN-003-B"],
    AUTHENTICATION_CONTROLS
  ),
  ...mappings(
    "auth0",
    ["AUTH-TEN-004-A", "AUTH-TEN-004-B"],
    NETWORK_CONTROLS
  ),
  ...mappings(
    "auth0",
    ["AUTH-CLI-001", "AUTH-CLI-004"],
    TOKEN_DATA_EXPOSURE_CONTROLS
  ),
  ...mappings("auth0", ["AUTH-CLI-002"], NETWORK_CONTROLS),
  ...mappings("auth0", ["AUTH-CLI-005"], CRYPTO_CONTROLS),
  ...mappings(
    "auth0",
    ["AUTH-CON-001", "AUTH-CON-002"],
    PASSWORD_AUTHENTICATOR_CONTROLS
  ),
  ...mappings("auth0", ["AUTH-CON-003"], SUPPLY_CHAIN_CONTROLS),
  ...mappings("auth0", ["AUTH-API-001"], CRYPTO_CONTROLS),
  ...mappings(
    "auth0",
    ["AUTH-API-002", "AUTH-RBAC-001"],
    ACCESS_CONTROL_CONTROLS
  ),
  ...mappings("auth0", ["AUTH-API-003"], TOKEN_DATA_EXPOSURE_CONTROLS),
  ...mappings("auth0", ["AUTH-API-005"], API_OAUTH_CONTROLS),
  ...mappings("auth0", ["AUTH-API-007"], PRIVILEGED_ACCESS_CONTROLS),
  ...mappings("auth0", ["AUTH-EXT-001", "AUTH-EXT-002"], SDLC_CONTROLS),
  ...mappings(
    "auth0",
    ["AUTH-SEC-001", "AUTH-SEC-004", "AUTH-SEC-005", "AUTH-SEC-006"],
    AUTHENTICATION_CONTROLS
  ),
  ...mappings("auth0", ["AUTH-OBS-001"], uniqueControls([
    ...LOGGING_CONTROLS,
    ...INCIDENT_CONTROLS
  ])),

  ...mappings("okta", ["OKTA-COV-001"], COVERAGE_CONTROLS),
  ...mappings("okta", ["OKTA-ORG-001"], INVENTORY_CONTROLS),
  ...mappings(
    "okta",
    ["OKTA-APP-001", "OKTA-APP-003", "OKTA-APP-004"],
    API_OAUTH_CONTROLS
  ),
  ...mappings("okta", ["OKTA-APP-005"], NETWORK_CONTROLS),
  ...mappings("okta", ["OKTA-APP-006"], SUPPLY_CHAIN_CONTROLS),
  ...mappings(
    "okta",
    ["OKTA-POL-001", "OKTA-POL-002", "OKTA-POL-003", "OKTA-POL-004", "OKTA-POL-005"],
    AUTHENTICATION_CONTROLS
  ),
  ...mappings("okta", ["OKTA-API-001", "OKTA-API-002"], API_OAUTH_CONTROLS),
  ...mappings("okta", ["OKTA-API-003", "OKTA-API-004"], TOKEN_DATA_EXPOSURE_CONTROLS),
  ...mappings("okta", ["OKTA-API-005"], PRIVILEGED_ACCESS_CONTROLS),
  ...mappings(
    "okta",
    ["OKTA-ADM-001", "OKTA-ADM-002", "OKTA-ADM-003", "OKTA-ADM-004"],
    PRIVILEGED_ACCESS_CONTROLS
  ),
  ...mappings("okta", ["OKTA-ADM-005"], USER_LIFECYCLE_CONTROLS),
  ...mappings(
    "okta",
    ["OKTA-USR-001", "OKTA-USR-002", "OKTA-USR-003"],
    USER_LIFECYCLE_CONTROLS
  ),
  ...mappings(
    "okta",
    ["OKTA-NET-001", "OKTA-NET-002", "OKTA-NET-003"],
    NETWORK_CONTROLS
  ),
  ...mappings("okta", ["OKTA-HOOK-001"], SUPPLY_CHAIN_CONTROLS),
  ...mappings("okta", ["OKTA-MON-001"], uniqueControls([
    ...LOGGING_CONTROLS,
    ...INCIDENT_CONTROLS
  ]))
];

export function getFindingComplianceMapping(
  provider: ReportProviderId,
  findingId: string
): FindingComplianceMapping | undefined {
  return FINDING_COMPLIANCE_MAPPINGS.find(
    (mapping) =>
      mapping.provider === provider && mapping.findingId === findingId
  );
}
