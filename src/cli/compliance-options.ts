import { ConfigError } from "../core/errors";
import {
  ComplianceFramework,
  SUPPORTED_COMPLIANCE_FRAMEWORKS
} from "../compliance";

export interface ComplianceCliOptions {
  compliance?: boolean | string;
  framework?: string;
}

export interface ResolvedComplianceOptions {
  enabled: boolean;
  frameworks: ComplianceFramework[];
}

export function resolveComplianceOptions(
  options: ComplianceCliOptions
): ResolvedComplianceOptions {
  const frameworks = parseComplianceFrameworks(options.framework);
  const enabled = parseComplianceEnabled(options.compliance) || Boolean(options.framework);

  return {
    enabled,
    frameworks: frameworks ?? SUPPORTED_COMPLIANCE_FRAMEWORKS
  };
}

export function parseComplianceFrameworks(
  raw: string | undefined
): ComplianceFramework[] | undefined {
  if (!raw?.trim()) return undefined;

  const frameworks: ComplianceFramework[] = [];
  const seen = new Set<ComplianceFramework>();
  for (const token of raw.split(",")) {
    const normalized = token.trim().toLowerCase();
    if (!normalized) continue;

    if (normalized === "all") {
      for (const framework of SUPPORTED_COMPLIANCE_FRAMEWORKS) {
        if (!seen.has(framework)) {
          seen.add(framework);
          frameworks.push(framework);
        }
      }
      continue;
    }

    if (
      normalized === "nis2" ||
      normalized === "iso27001" ||
      normalized === "soc2"
    ) {
      if (!seen.has(normalized)) {
        seen.add(normalized);
        frameworks.push(normalized);
      }
      continue;
    }

    throw new ConfigError(
      `Invalid compliance framework '${token.trim()}'. Expected nis2, iso27001, soc2, all, or a comma-separated combination.`
    );
  }

  return frameworks.length > 0 ? frameworks : undefined;
}

function parseComplianceEnabled(raw: boolean | string | undefined): boolean {
  if (raw === undefined) return false;
  if (typeof raw === "boolean") return raw;
  const normalized = raw.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  throw new ConfigError(
    `Invalid --compliance value '${raw}'. Expected true or false.`
  );
}
