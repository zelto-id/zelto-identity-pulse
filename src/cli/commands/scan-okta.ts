import * as path from "path";
import * as readline from "readline/promises";
import { Command } from "commander";

import { analyzeOktaSnapshot } from "../../analysis/okta/okta.analyzer";
import { runOktaConnector } from "../../connectors/okta/okta.connector";
import {
  OktaAuthMode,
  OktaOrgSnapshot,
  OktaUserCollectionMode
} from "../../connectors/okta/okta.types";
import { ConfigError, AuthenticationError } from "../../core/errors";
import {
  ensureDirSync,
  readJsonSync,
  timestampSlug,
  writeFileSync
} from "../../core/filesystem";
import { createLogger } from "../../core/logger";
import { renderOktaReportHtml } from "../../reporting/html/okta-report.html-renderer";
import {
  buildOktaReportContractV1,
  renderReportContractV1Json
} from "../../reporting/json/report-contract";
import { buildOktaPartialScanSummary } from "../../reporting/markdown/okta-report.collection-status";
import { renderOktaReport } from "../../reporting/markdown/okta-report.renderer";
import { Environment, Severity } from "../../reporting/markdown/report.types";
import {
  parseReportFormats,
  reportFormatLabel,
  resolveReportOutputPath,
  ReportFormat
} from "../../reporting/report-output";
import {
  LoadedReportConfig,
  loadReportConfig,
  mergeOktaScanOptions
} from "../../config/report-config";

const VALID_ENVIRONMENTS: Environment[] = [
  "production",
  "staging",
  "development",
  "sandbox",
  "unknown"
];

const VALID_AUTH_MODES: OktaAuthMode[] = ["oauth", "ssws"];
const VALID_USER_COLLECTION_MODES: OktaUserCollectionMode[] = ["none", "bounded", "full"];

export interface ScanOktaOptions {
  config?: string;
  orgUrl?: string;
  authMode?: string;
  accessToken?: string;
  apiToken?: string;
  output?: string;
  snapshotOutput?: string;
  saveSnapshot?: boolean;
  includeRaw?: boolean | string;
  failOn?: Severity;
  verbose?: boolean;
  fromSnapshot?: string;
  environment?: string;
  format?: string;
  includeUsers?: string;
  maxUsers?: string;
  includeSystemLog?: boolean | string;
  systemLogDays?: string;
  maxLogs?: string;
  includeIdentifiers?: boolean;
}

export function registerScanOktaCommand(program: Command): void {
  program
    .command("okta")
    .description("Scan an Okta Workforce org and generate a posture report.")
    .option("--config <path>", "Path to zelto-pulse.yml config file")
    .option("--org-url <url>", "Okta org URL (or OKTA_ORG_URL env var)")
    .option("--auth-mode <mode>", "Authentication mode: oauth | ssws")
    .option("--access-token <token>", "Okta OAuth access token (or OKTA_ACCESS_TOKEN env var). Prefer the env var.")
    .option("--api-token <token>", "Okta SSWS API token (or OKTA_API_TOKEN env var). Prefer the env var.")
    .option("--output <path>", "Report output path")
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
      "Skip live collection and analyze a previously saved snapshot JSON file"
    )
    .option(
      "--environment <env>",
      `Okta org environment classification: ${VALID_ENVIRONMENTS.join("|")}. If omitted, you will be prompted in TTY mode (or 'unknown' is used).`
    )
    .option(
      "--format <format>",
      "Output format: markdown | html | json | all, or a comma-separated combination. Default: markdown.",
      "markdown"
    )
    .option(
      "--include-users <mode>",
      `User collection mode: ${VALID_USER_COLLECTION_MODES.join("|")}. Default: bounded.`,
      "bounded"
    )
    .option("--max-users <number>", "Maximum users to collect in bounded mode. Default: 500.")
    .option(
      "--include-system-log [bool]",
      "Collect bounded Okta System Log summary. Default: true.",
      "true"
    )
    .option("--system-log-days <number>", "System log lookback window in days. Default: 7.")
    .option("--max-logs <number>", "Maximum system log events to summarize. Default: 1000.")
    .option(
      "--include-identifiers",
      "Include full user or principal identifiers in generated reports instead of masking them by default.",
      false
    )
    .action(async (options: ScanOktaOptions, command: Command) => {
      try {
        await runScanOkta(options, command);
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

export async function runScanOkta(
  rawOptions: ScanOktaOptions,
  command?: Command,
  loadedConfig?: LoadedReportConfig
): Promise<void> {
  const parentOptions = command?.parent?.opts<{ config?: string; verbose?: boolean }>();
  const configPath = rawOptions.config ?? parentOptions?.config;
  const loaded = loadedConfig ?? loadReportConfig({ configPath });
  const options = mergeOktaScanOptions(
    {
      ...rawOptions,
      config: configPath,
      verbose: rawOptions.verbose || parentOptions?.verbose
    },
    command,
    loaded
  ) as ScanOktaOptions;
  const logger = createLogger({ verbose: Boolean(options.verbose) });

  let snapshot: OktaOrgSnapshot;
  if (options.fromSnapshot) {
    const snapshotPath = path.resolve(options.fromSnapshot);
    logger.info(`Loading snapshot from ${snapshotPath}`);
    snapshot = readJsonSync<OktaOrgSnapshot>(snapshotPath);
  } else {
    const orgUrl = options.orgUrl ?? process.env.OKTA_ORG_URL;
    if (!orgUrl) {
      throw new ConfigError("Missing Okta org URL. Pass --org-url or set OKTA_ORG_URL.");
    }

    const authMode = resolveAuthMode(options);
    const token = resolveToken(options, authMode);
    const includeUsers = resolveIncludeUsers(options.includeUsers);
    const includeSystemLog = parseOptionalBoolean(options.includeSystemLog, true);
    const maxUsers = parseOptionalNumber(options.maxUsers, 500, "--max-users");
    const systemLogDays = parseOptionalNumber(options.systemLogDays, 7, "--system-log-days");
    const maxLogs = parseOptionalNumber(options.maxLogs, 1000, "--max-logs");

    logger.info(`Scanning Okta org ${orgUrl} (${authMode}, read-only)...`);
    snapshot = await runOktaConnector({
      orgUrl,
      authMode,
      token,
      logger,
      includeUsers,
      maxUsers,
      includeSystemLog,
      systemLogDays,
      maxLogs
    });
  }

  const stamp = timestampSlug();
  if (options.saveSnapshot || options.snapshotOutput) {
    const snapshotPath =
      options.snapshotOutput ?? path.join("snapshots", `okta-snapshot-${stamp}.json`);
    ensureDirSync(path.dirname(snapshotPath));
    writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    logger.info(`Snapshot written to ${snapshotPath}`);
  }

  const environment = await resolveEnvironment(options.environment);
  const report = analyzeOktaSnapshot(snapshot, {
    environment,
    includeIdentifiers: Boolean(options.includeIdentifiers),
    businessContext: loaded.config.businessContext
  });

  let formats: ReportFormat[];
  try {
    formats = parseReportFormats(options.format);
  } catch (err) {
    throw new ConfigError((err as Error).message);
  }
  const wantMarkdown = formats.includes("markdown");
  const wantHtml = formats.includes("html");
  const wantJson = formats.includes("json");
  const multipleOutputs = formats.length > 1;
  const writtenPaths: string[] = [];

  if (wantMarkdown) {
    const markdown = renderOktaReport(report);
    const reportPath = resolveReportOutputPath({
      requestedOutput: options.output,
      format: "markdown",
      multiple: multipleOutputs,
      defaultPath: path.join("reports", `okta-report-${stamp}.md`)
    });
    ensureDirSync(path.dirname(reportPath));
    writeFileSync(reportPath, markdown);
    logger.info(`${reportFormatLabel("markdown")} report written to ${reportPath}`);
    writtenPaths.push(reportPath);
  }

  if (wantHtml) {
    const html = renderOktaReportHtml(report);
    const htmlPath = resolveReportOutputPath({
      requestedOutput: options.output,
      format: "html",
      multiple: multipleOutputs,
      defaultPath: path.join("reports", `okta-report-${stamp}.html`)
    });
    ensureDirSync(path.dirname(htmlPath));
    writeFileSync(htmlPath, html);
    logger.info(`${reportFormatLabel("html")} report written to ${htmlPath}`);
    writtenPaths.push(htmlPath);
  }

  if (wantJson) {
    const structuredReport = buildOktaReportContractV1(report, snapshot);
    const jsonPath = resolveReportOutputPath({
      requestedOutput: options.output,
      format: "json",
      multiple: multipleOutputs,
      defaultPath: path.join("reports", `okta-report-${stamp}.json`)
    });
    ensureDirSync(path.dirname(jsonPath));
    writeFileSync(jsonPath, renderReportContractV1Json(structuredReport));
    logger.info(`${reportFormatLabel("json")} report written to ${jsonPath}`);
    writtenPaths.push(jsonPath);
  }

  process.stdout.write(
    `\nScore: ${report.score.overall}/100 — Grade ${report.score.grade}\n` +
      `Findings: ${report.findings.length} (critical=${count(report, "critical")}, high=${count(report, "high")}, medium=${count(report, "medium")}, low=${count(report, "low")})\n` +
      (report.collectionStatus.partial
        ? `${buildOktaPartialScanSummary(report)}\n`
        : "") +
      writtenPaths.map((outputPath) => `Report: ${outputPath}`).join("\n") +
      "\n"
  );

  if (options.failOn && matchesThreshold(report.findings.map((finding) => finding.severity), options.failOn)) {
    process.exit(2);
  }

  process.exit(0);
}

function count(
  report: ReturnType<typeof analyzeOktaSnapshot>,
  severity: Severity
): number {
  return report.findings.filter((finding) => finding.severity === severity).length;
}

function resolveAuthMode(options: ScanOktaOptions): OktaAuthMode {
  const raw = options.authMode?.toLowerCase();
  if (raw) {
    if ((VALID_AUTH_MODES as string[]).includes(raw)) return raw as OktaAuthMode;
    throw new ConfigError(
      `Invalid --auth-mode value '${options.authMode}'. Expected one of: ${VALID_AUTH_MODES.join(", ")}.`
    );
  }

  const hasAccessToken = Boolean(options.accessToken ?? process.env.OKTA_ACCESS_TOKEN);
  const hasApiToken = Boolean(options.apiToken ?? process.env.OKTA_API_TOKEN);
  if (hasAccessToken) return "oauth";
  if (hasApiToken) return "ssws";
  throw new ConfigError(
    "Missing Okta credential. Provide --auth-mode and the matching token, or set OKTA_ACCESS_TOKEN / OKTA_API_TOKEN."
  );
}

function resolveToken(options: ScanOktaOptions, authMode: OktaAuthMode): string {
  const token =
    authMode === "oauth"
      ? options.accessToken ?? process.env.OKTA_ACCESS_TOKEN
      : options.apiToken ?? process.env.OKTA_API_TOKEN;
  if (!token) {
    throw new ConfigError(
      authMode === "oauth"
        ? "Missing Okta OAuth access token. Pass --access-token or set OKTA_ACCESS_TOKEN."
        : "Missing Okta SSWS API token. Pass --api-token or set OKTA_API_TOKEN."
    );
  }
  return token;
}

function resolveIncludeUsers(rawValue: string | undefined): OktaUserCollectionMode {
  const normalized = (rawValue ?? "bounded").toLowerCase();
  if ((VALID_USER_COLLECTION_MODES as string[]).includes(normalized)) {
    return normalized as OktaUserCollectionMode;
  }
  throw new ConfigError(
    `Invalid --include-users value '${rawValue}'. Expected one of: ${VALID_USER_COLLECTION_MODES.join(", ")}.`
  );
}

function parseOptionalNumber(
  rawValue: string | undefined,
  defaultValue: number,
  flag: string
): number {
  if (!rawValue) return defaultValue;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ConfigError(`Invalid ${flag} value '${rawValue}'. Expected a positive number.`);
  }
  return Math.floor(parsed);
}

function parseOptionalBoolean(rawValue: string | boolean | undefined, defaultValue: boolean): boolean {
  if (rawValue === undefined) return defaultValue;
  if (typeof rawValue === "boolean") return rawValue;
  const normalized = rawValue.toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return defaultValue;
}

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

function matchesThreshold(severities: Severity[], threshold: Severity): boolean {
  const thresholdRank = SEVERITY_RANK[threshold];
  return severities.some((severity) => SEVERITY_RANK[severity] >= thresholdRank);
}

async function resolveEnvironment(rawEnvironment: string | undefined): Promise<Environment> {
  const value = rawEnvironment ?? process.env.ZELTO_PULSE_ENVIRONMENT;
  if (value) {
    const normalized = value.toLowerCase();
    if ((VALID_ENVIRONMENTS as string[]).includes(normalized)) {
      return normalized as Environment;
    }
    throw new ConfigError(
      `Invalid --environment value '${value}'. Expected one of: ${VALID_ENVIRONMENTS.join(", ")}.`
    );
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return "unknown";
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write(
      `\nWhich environment is this Okta org?\n` +
        `  1) production\n  2) staging\n  3) development\n  4) sandbox\n  5) unknown\n`
    );
    const answer = (await rl.question("Select [1-5] or type a name (default: unknown): "))
      .trim()
      .toLowerCase();
    if (!answer) return "unknown";
    const byNumber: Record<string, Environment> = {
      "1": "production",
      "2": "staging",
      "3": "development",
      "4": "sandbox",
      "5": "unknown"
    };
    if (answer in byNumber) return byNumber[answer];
    if ((VALID_ENVIRONMENTS as string[]).includes(answer)) return answer as Environment;
    process.stdout.write(`Unrecognized environment '${answer}', defaulting to 'unknown'.\n`);
    return "unknown";
  } finally {
    rl.close();
  }
}
