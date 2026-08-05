import {
  ComplianceControl,
  ComplianceFramework
} from "../compliance.types";
import { ISO27001_CONTROLS } from "./iso27001.controls";
import { NIS2_CONTROLS } from "./nis2.controls";
import { SOC2_CONTROLS } from "./soc2.controls";

export const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  ...NIS2_CONTROLS,
  ...ISO27001_CONTROLS,
  ...SOC2_CONTROLS
];

export const SUPPORTED_COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  "nis2",
  "iso27001",
  "soc2"
];

export function getComplianceControls(options?: {
  frameworks?: ComplianceFramework[];
}): ComplianceControl[] {
  const frameworks = options?.frameworks ?? SUPPORTED_COMPLIANCE_FRAMEWORKS;
  const allowed = new Set(frameworks);
  return COMPLIANCE_CONTROLS.filter((control) => allowed.has(control.framework));
}

export function getComplianceControl(
  framework: ComplianceFramework,
  controlId: string
): ComplianceControl | undefined {
  return COMPLIANCE_CONTROLS.find(
    (control) =>
      control.framework === framework && control.controlId === controlId
  );
}

export function complianceControlKey(
  framework: ComplianceFramework,
  controlId: string
): string {
  return `${framework}:${controlId}`;
}
