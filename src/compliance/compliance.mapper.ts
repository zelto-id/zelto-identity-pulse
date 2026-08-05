import {
  ComplianceControlEvidence,
  ComplianceFramework,
  ComplianceMappedFinding,
  ComplianceMapOptions,
  ComplianceMappingResult,
  FindingControlMappingRef
} from "./compliance.types";
import {
  complianceControlKey,
  getComplianceControl,
  getComplianceControls,
  SUPPORTED_COMPLIANCE_FRAMEWORKS
} from "./frameworks";
import { getFindingComplianceMapping } from "./finding-control-map";
import {
  StructuredReportFinding,
  StructuredReportV1
} from "../reporting/json/report-contract.types";

export function mapFindingToCompliance(
  finding: StructuredReportFinding,
  options?: ComplianceMapOptions
): ComplianceMappedFinding | undefined {
  const frameworks = resolveFrameworks(options);
  const frameworkSet = new Set(frameworks);
  const mapping = getFindingComplianceMapping(finding.provider, finding.id);
  if (!mapping) return undefined;

  const controls = mapping.controls
    .filter((controlRef) => frameworkSet.has(controlRef.framework))
    .map((controlRef) => {
      const control = requireControl(controlRef);
      return {
        ...controlRef,
        controlName: control.controlName,
        controlReference: control.controlReference,
        identityDomain: control.identityDomain
      };
    });

  if (controls.length === 0) return undefined;

  return {
    findingId: finding.id,
    fingerprint: finding.fingerprint,
    title: finding.title,
    provider: finding.provider,
    category: finding.category,
    severity: finding.severity,
    classification: finding.classification,
    controls
  };
}

export function mapReportToCompliance(
  report: StructuredReportV1,
  options?: ComplianceMapOptions
): ComplianceMappingResult {
  const frameworks = resolveFrameworks(options);
  const controls = getComplianceControls({ frameworks }).filter((control) =>
    control.supportedProviders.includes(report.provider.id)
  );
  const mappedFindings: ComplianceMappedFinding[] = [];
  const unmappedFindings: ComplianceMappingResult["unmappedFindings"] = [];

  for (const finding of report.findings) {
    const mapped = mapFindingToCompliance(finding, { frameworks });
    if (mapped) {
      mappedFindings.push(mapped);
    } else {
      unmappedFindings.push({
        findingId: finding.id,
        title: finding.title,
        provider: finding.provider,
        severity: finding.severity
      });
    }
  }

  const controlEvidence = controls.map((control): ComplianceControlEvidence => {
    const key = complianceControlKey(control.framework, control.controlId);
    const relatedFindings = mappedFindings
      .flatMap((finding) =>
        finding.controls
          .filter(
            (mappedControl) =>
              complianceControlKey(
                mappedControl.framework,
                mappedControl.controlId
              ) === key
          )
          .map((mappedControl) => ({
            findingId: finding.findingId,
            fingerprint: finding.fingerprint,
            title: finding.title,
            provider: finding.provider,
            severity: finding.severity,
            relevance: mappedControl.relevance,
            evidenceStrength: mappedControl.evidenceStrength,
            caveat: mappedControl.caveat
          }))
      )
      .sort((a, b) => a.findingId.localeCompare(b.findingId));

    return {
      framework: control.framework,
      controlId: control.controlId,
      controlReference: control.controlReference,
      controlName: control.controlName,
      identityDomain: control.identityDomain,
      coverage: control.coverage,
      scannerEvidence: [...control.scannerEvidence],
      manualEvidence: [...control.manualEvidence],
      caveats: [...control.caveats],
      reportWordingGuidance: control.reportWordingGuidance,
      relatedFindings
    };
  });

  return {
    source: {
      reportSchemaVersion: report.schemaVersion,
      reportGeneratedAt: report.generatedAt,
      scanId: report.metadata.scanId,
      provider: report.provider.id,
      tenant: report.tenant,
      environment: report.environment
    },
    frameworks,
    controls: controlEvidence,
    mappedFindings,
    unmappedFindings,
    summary: {
      totalFindings: report.findings.length,
      mappedFindings: mappedFindings.length,
      unmappedFindings: unmappedFindings.length,
      controlsWithFindings: controlEvidence.filter(
        (control) => control.relatedFindings.length > 0
      ).length,
      manualEvidenceRequired: controlEvidence.some(
        (control) => control.manualEvidence.length > 0
      )
    },
    limitations: buildLimitations(report)
  };
}

export function renderComplianceMappingJson(
  result: ComplianceMappingResult
): string {
  return JSON.stringify(result, null, 2);
}

function resolveFrameworks(
  options?: ComplianceMapOptions
): ComplianceFramework[] {
  const requested = options?.frameworks ?? SUPPORTED_COMPLIANCE_FRAMEWORKS;
  const seen = new Set<ComplianceFramework>();
  return requested.filter((framework) => {
    if (seen.has(framework)) return false;
    seen.add(framework);
    return true;
  });
}

function requireControl(ref: FindingControlMappingRef) {
  const control = getComplianceControl(ref.framework, ref.controlId);
  if (!control) {
    throw new Error(
      `Compliance mapping references missing control ${ref.framework}:${ref.controlId}.`
    );
  }
  return control;
}

function buildLimitations(report: StructuredReportV1): string[] {
  const limitations = [
    "Compliance mappings are identity-system evidence support only; they do not certify compliance or prove operating effectiveness.",
    "Manual evidence remains required for policies, approvals, access reviews, incident response, change management, and auditor judgment."
  ];

  if (report.coverage.partial) {
    limitations.push(
      "The source report had partial collection coverage, so absence of mapped findings is not complete assurance."
    );
  }

  if (report.coverage.missingScopes.length > 0) {
    limitations.push(
      "Missing provider scopes reduced available automated identity evidence."
    );
  }

  return limitations;
}
