/**
 * `zelto-pulse scan auth0` command.
 */

import * as path from "path";
import * as readline from "readline/promises";
import { Command } from "commander";

import { runAuth0Connector } from "../../connectors/auth0/auth0.connector";
import { analyzeAuth0Snapshot } from "../../analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../reporting/markdown/auth0-report.renderer";
import { createLogger } from "../../core/logger";
import { ConfigError, AuthenticationError } from "../../core/errors";
import {
  ensureDirSync,
  readJsonSync,
  timestampSlug,
  writeFileSync
} from "../../core/filesystem";
import { Auth0TenantSnapshot } from "../../connectors/auth0/auth0.types";
import { Environment, Severity } from "../../reporting/markdown/report.types";

const VALID_ENVIRONMENTS: Environment[] = [
  "production",
  "staging",
  "development",
  "sandbox",
  "unknown"
];

interface ScanAuth0Options {
  domain?: string;
  token?: string;
  output?: string;
  snapshotOutput?: string;
  saveSnapshot?: boolean;
  includeRaw?: boolean | string;
  failOn?: Severity;
  verbose?: boolean;
  fromSnapshot?: string;
  environment?: string;
  includeLegacyExtensibility?: boolean;
}

export function registerScanAuth0Command(program: Command): void {
  program
    .command("auth0")
    .description("Scan an Auth0 tenant and generate a posture report.")
    .option("--domain <domain>", "Auth0 tenant domain (or AUTH0_DOMAIN env var)")
    .option("--token <token>", "Auth0 Management API token (or AUTH0_MGMT_API_TOKEN env var). Prefer the env var to avoid leaking via shell history.")
    .option("--output <path>", "Markdown report output path")
    .option("--snapshot-output <path>", "Snapshot output path (implies --save-snapshot)")
    .option("--save-snapshot", "Save the redacted snapshot JSON", false)
    .option("--include-raw [bool]", "(MVP no-op) Include raw API responses; ignored — never enabled in MVP", "false")
    .option(
      "--fail-on <severity>",
      "Exit with code 2 if any finding at this severity or higher exists (critical|high|medium|low)"
    )
    .option("--verbose", "Verbose logging", false)
    .option(
      "--from-snapshot <path>",
      "Skip live collection and analyze a previously saved snapshot JSON file (useful for testing fixtures)"
    )
    .option(
      "--environment <env>",
      `Tenant environment classification: ${VALID_ENVIRONMENTS.join("|")}. If omitted, you will be prompted in TTY mode (or 'unknown' is used).`
    )
    .option(
      "--include-legacy-extensibility",
      "Collect Rules and Hooks (legacy extensibility) and report them as EOL migration risk if present. Excluded from the default Actions & Extensibility score.",
      false
    )
    .action(async (options: ScanAuth0Options) => {
      try {
        await runScanAuth0(options);
      } catch (err) {
        const logger = createLogger({ verbose: options.verbose });
        if (err instanceof ConfigError) {
          logger.error(err.message);
          process.exit(1);
        }
        if (err instanceof AuthenticationError) {
          logger.error(`Authentication failed: ${err.message}`);
          process.exit(1);
        }
        logger.error("Scan failed", { error: (err as Error)?.message });
        process.exit(1);
      }
    });
}

async function runScanAuth0(options: ScanAuth0Options): Promise<void> {
  const logger = createLogger({ verbose: Boolean(options.verbose) });

  const domain = options.domain ?? process.env.AUTH0_DOMAIN;
  const token = options.token ?? process.env.AUTH0_MGMT_API_TOKEN;

  // 1. Acquire snapshot (live or from file).
  let snapshot: Auth0TenantSnapshot;

  if (options.fromSnapshot) {
    const p = path.resolve(options.fromSnapshot);
    logger.info(`Loading snapshot from ${p}`);
    snapshot = readJsonSync<Auth0TenantSnapshot>(p);
  } else {
    if (!domain) {
      throw new ConfigError(
        "Missing tenant domain. Pass --domain or set AUTH0_DOMAIN."
      );
    }
    if (!token) {
      throw new ConfigError(
        "Missing Management API token. Pass --token or set AUTH0_MGMT_API_TOKEN."
      );
    }
    logger.info(`Scanning Auth0 tenant ${domain} (read-only)...`);
    snapshot = await runAuth0Connector({
      domain,
      token,
      logger,
      includeLegacyExtensibility: Boolean(options.includeLegacyExtensibility)
    });
  }

  // 2. Optionally save snapshot.
  const stamp = timestampSlug();
  const wantSnapshot = Boolean(options.saveSnapshot || options.snapshotOutput);
  if (wantSnapshot) {
    const snapPath =
      options.snapshotOutput ??
      path.join("snapshots", `auth0-snapshot-${stamp}.json`);
    ensureDirSync(path.dirname(snapPath));
    writeFileSync(snapPath, JSON.stringify(snapshot, null, 2));
    logger.info(`Snapshot written to ${snapPath}`);
  }

  // 3. Analyze (with environment classification).
  const environment = await resolveEnvironment(options);
  const report = analyzeAuth0Snapshot(snapshot, { environment });

  // 4. Render markdown.
  const md = renderAuth0Report(report);
  const outPath =
    options.output ??
    path.join("reports", `auth0-report-${stamp}.md`);
  ensureDirSync(path.dirname(outPath));
  writeFileSync(outPath, md);
  logger.info(`Report written to ${outPath}`);

  // 5. Console summary.
  process.stdout.write(
    `\nScore: ${report.score.overall}/100 — Grade ${report.score.grade}\n` +
      `Findings: ${report.findings.length} (critical=${count(report, "critical")}, high=${count(report, "high")}, medium=${count(report, "medium")}, low=${count(report, "low")})\n` +
      (report.collectionStatus.partial
        ? `Partial scan: ${report.collectionStatus.failedCollectors.length} collector(s) failed/skipped\n`
        : ``) +
      `Report: ${outPath}\n`
  );

  // 6. Threshold exit code.
  if (options.failOn) {
    if (matchesThreshold(report.findings.map((f) => f.severity), options.failOn)) {
      process.exit(2);
    }
  }
  process.exit(0);
}

function count(
  report: ReturnType<typeof analyzeAuth0Snapshot>,
  sev: Severity
): number {
  return report.findings.filter((f) => f.severity === sev).length;
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

function matchesThreshold(severities: Severity[], threshold: Severity): boolean {
  const t = SEVERITY_RANK[threshold];
  return severities.some((s) => SEVERITY_RANK[s] >= t);
}

async function resolveEnvironment(options: ScanAuth0Options): Promise<Environment> {
  const fromFlag = options.environment ?? process.env.ZELTO_PULSE_ENVIRONMENT;
  if (fromFlag) {
    const v = fromFlag.toLowerCase();
    if ((VALID_ENVIRONMENTS as string[]).includes(v)) {
      return v as Environment;
    }
    throw new ConfigError(
      `Invalid --environment value '${fromFlag}'. Expected one of: ${VALID_ENVIRONMENTS.join(", ")}.`
    );
  }
  // Skip prompt when not interactive or when analyzing a snapshot non-interactively.
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return "unknown";
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write(
      `\nWhich environment is this tenant?\n` +
        `  1) production\n  2) staging\n  3) development\n  4) sandbox\n  5) unknown\n`
    );
    const ans = (await rl.question("Select [1-5] or type a name (default: unknown): ")).trim().toLowerCase();
    if (!ans) return "unknown";
    const byNumber: Record<string, Environment> = {
      "1": "production",
      "2": "staging",
      "3": "development",
      "4": "sandbox",
      "5": "unknown"
    };
    if (ans in byNumber) return byNumber[ans];
    if ((VALID_ENVIRONMENTS as string[]).includes(ans)) return ans as Environment;
    process.stdout.write(`Unrecognized environment '${ans}', defaulting to 'unknown'.\n`);
    return "unknown";
  } finally {
    rl.close();
  }
}
