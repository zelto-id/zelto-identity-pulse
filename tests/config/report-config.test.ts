import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { describe, expect, it } from "vitest";
import {
  loadReportConfig,
  mergeAuth0ScanOptions,
  mergeOktaScanOptions,
  OptionSourceReader,
  parseConfigYaml,
  resolveConfiguredProvider
} from "../../src/config/report-config";

function source(cliKeys: string[]): OptionSourceReader {
  const cli = new Set(cliKeys);
  return {
    getOptionValueSource(name: string): string | undefined {
      return cli.has(name) ? "cli" : "default";
    }
  };
}

function tempConfig(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zelto-config-test-"));
  const filePath = path.join(dir, "zelto-pulse.yml");
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe("report config", () => {
  it("parses nested zelto-pulse.yml settings", () => {
    const config = parseConfigYaml(`
provider: okta
environment: production
reports:
  format:
    - html
    - json
  output: reports/okta-posture.md
masking:
  includeIdentifiers: false
  includeRaw: false
collection:
  includeUsers: bounded
  maxUsers: 250
  includeSystemLog: true
okta:
  fromSnapshot: fixtures/okta/risky-org.snapshot.json
  authMode: oauth
`);

    expect(config.provider).toBe("okta");
    expect(config.reports?.format).toEqual(["html", "json"]);
    expect(config.masking?.includeIdentifiers).toBe(false);
    expect(config.collection?.maxUsers).toBe(250);
    expect(config.okta?.fromSnapshot).toBe(
      "fixtures/okta/risky-org.snapshot.json"
    );
  });

  it("loads business context and uses it as environment fallback", () => {
    const configPath = tempConfig(`
provider: auth0
reports:
  format:
    - html
    - json
businessContext:
  organizationType: "B2B SaaS"
  environment: sandbox
  industry: healthcare
  regulatedData: true
  identityUseCase: customer-identity
  userPopulation:
    customers: 50000
    workforce: 300
    admins: 15
  criticalApplications:
    - name: "Customer Portal"
      provider: auth0
      businessCriticality: high
      dataSensitivity: regulated
    - name: "Admin Console"
      provider: okta
      businessCriticality: critical
      dataSensitivity: high
  riskTolerance: low
  complianceDrivers:
    - SOC2
    - HIPAA
  businessPriorities:
    - "reduce account takeover risk"
    - "improve audit readiness"
  designDecisions:
    - id: auth0-roles-external-by-design
      provider: auth0
      effect: suppress-finding
      decision: "Authorization is managed in the application and not with Auth0 roles."
      rationale: "Entitlements are owned by the product domain model."
      owner: IAM Architecture
      appliesTo:
        findingIds:
          - AUTH-RBAC-001
auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json
`);
    const loaded = loadReportConfig({ configPath, cwd: "/" });

    expect(loaded.config.businessContext).toMatchObject({
      organizationType: "B2B SaaS",
      environment: "sandbox",
      industry: "healthcare",
      regulatedData: true,
      identityUseCase: "customer-identity",
      riskTolerance: "low",
      complianceDrivers: ["SOC2", "HIPAA"]
    });
    expect(loaded.config.businessContext?.userPopulation?.customers).toBe(50000);
    expect(loaded.config.businessContext?.criticalApplications).toHaveLength(2);
    expect(loaded.config.businessContext?.designDecisions).toEqual([
      {
        id: "auth0-roles-external-by-design",
        provider: "auth0",
        title: undefined,
        decision: "Authorization is managed in the application and not with Auth0 roles.",
        rationale: "Entitlements are owned by the product domain model.",
        owner: "IAM Architecture",
        effect: "suppress-finding",
        appliesTo: {
          findingIds: ["AUTH-RBAC-001"],
          categories: undefined,
          keywords: undefined
        }
      }
    ]);

    const merged = mergeAuth0ScanOptions(
      {
        config: loaded.path
      },
      source([]),
      loaded
    );

    expect(merged.environment).toBe("sandbox");
    expect(merged.fromSnapshot).toBe("fixtures/auth0/risky-tenant.snapshot.json");
  });

  it("merges Auth0 config while preserving CLI precedence over config", () => {
    const loaded = {
      path: "/tmp/zelto-pulse.yml",
      config: parseConfigYaml(`
provider: auth0
environment: production
reports:
  format:
    - html
    - json
  output: reports/config-output.md
auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json
  includeLegacyExtensibility: true
`)
    };

    const merged = mergeAuth0ScanOptions(
      {
        config: loaded.path,
        environment: "staging",
        format: "markdown",
        output: "reports/default.md"
      },
      source(["environment", "format"]),
      loaded
    );

    expect(merged.environment).toBe("staging");
    expect(merged.format).toBe("markdown");
    expect(merged.output).toBe("reports/config-output.md");
    expect(merged.fromSnapshot).toBe("fixtures/auth0/risky-tenant.snapshot.json");
    expect(merged.includeLegacyExtensibility).toBe(true);
  });

  it("merges Okta bounded collection and masking settings", () => {
    const loaded = {
      path: "/tmp/zelto-pulse.yml",
      config: parseConfigYaml(`
provider: okta
environment: production
format: json
masking:
  includeIdentifiers: false
collection:
  includeUsers: bounded
  maxUsers: 500
  includeSystemLog: true
  systemLogDays: 14
  maxLogs: 2000
okta:
  fromSnapshot: fixtures/okta/risky-org.snapshot.json
`)
    };

    const merged = mergeOktaScanOptions(
      {
        config: loaded.path,
        includeIdentifiers: true,
        maxUsers: "100"
      },
      source(["includeIdentifiers", "maxUsers"]),
      loaded
    );

    expect(merged.environment).toBe("production");
    expect(merged.format).toBe("json");
    expect(merged.includeIdentifiers).toBe(true);
    expect(merged.includeUsers).toBe("bounded");
    expect(merged.maxUsers).toBe("100");
    expect(merged.includeSystemLog).toBe(true);
    expect(merged.systemLogDays).toBe("14");
    expect(merged.maxLogs).toBe("2000");
  });

  it("rejects likely secrets and raw-output opt-in from config files", () => {
    const secretConfig = tempConfig(`
provider: auth0
auth0:
  accessToken: abc123
`);
    expect(() => loadReportConfig({ configPath: secretConfig, cwd: "/" })).toThrow(
      /may store a secret/
    );

    const rawConfig = tempConfig(`
provider: okta
masking:
  includeRaw: true
`);
    expect(() => loadReportConfig({ configPath: rawConfig, cwd: "/" })).toThrow(
      /cannot enable includeRaw/
    );
  });

  it("rejects invalid business context environment values", () => {
    const configPath = tempConfig(`
provider: auth0
businessContext:
  environment: disaster-recovery
`);
    expect(() => loadReportConfig({ configPath, cwd: "/" })).toThrow(
      /Invalid businessContext.environment/
    );
  });

  it("resolves provider from config with CLI override", () => {
    const loaded = {
      config: parseConfigYaml(`
provider: auth0
`)
    };

    expect(resolveConfiguredProvider(loaded)).toBe("auth0");
    expect(resolveConfiguredProvider(loaded, "okta")).toBe("okta");
  });
});
