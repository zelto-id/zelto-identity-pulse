import * as path from "path";
import { Command } from "commander";
import { ConfigError } from "../../core/errors";
import {
  ensureDirSync,
  readJsonSync,
  timestampSlug,
  writeFileSync
} from "../../core/filesystem";
import { createLogger } from "../../core/logger";
import {
  compareStructuredReports,
  renderDeltaReportJson
} from "../../reporting/delta/delta-compare";
import { renderDeltaReportHtml } from "../../reporting/html/delta-report.html-renderer";
import { StructuredReportV1 } from "../../reporting/json/report-contract.types";

type DeltaReportFormat = "json" | "html";

interface CompareOptions {
  before?: string;
  after?: string;
  output?: string;
  format?: string;
  verbose?: boolean;
}

export function registerCompareCommand(program: Command): void {
  program
    .command("compare")
    .description("Compare two structured JSON reports and emit deterministic delta output.")
    .requiredOption("--before <path>", "Baseline Report Contract v1 JSON path")
    .requiredOption("--after <path>", "Follow-up Report Contract v1 JSON path")
    .option("--output <path>", "Delta output path. Defaults to stdout for a single requested format.")
    .option(
      "--format <format>",
      "Output format: json | html | all, or a comma-separated combination. Default: json.",
      "json"
    )
    .option("--verbose", "Verbose logging", false)
    .action((options: CompareOptions) => {
      try {
        runCompare(options);
      } catch (err) {
        const logger = createLogger({ verbose: options.verbose });
        if (err instanceof ConfigError) {
          logger.error(err.message);
          process.exit(1);
        }
        logger.error("Compare failed", { error: (err as Error)?.message });
        process.exit(1);
      }
    });
}

function runCompare(options: CompareOptions): void {
  if (!options.before || !options.after) {
    throw new ConfigError("Both --before and --after report paths are required.");
  }

  const beforePath = path.resolve(options.before);
  const afterPath = path.resolve(options.after);
  const before = readJsonSync<StructuredReportV1>(beforePath);
  const after = readJsonSync<StructuredReportV1>(afterPath);
  const delta = compareStructuredReports(before, after);

  let formats: DeltaReportFormat[];
  try {
    formats = parseDeltaReportFormats(options.format);
  } catch (err) {
    throw new ConfigError((err as Error).message);
  }

  const multipleOutputs = formats.length > 1;
  if (!options.output && !multipleOutputs) {
    process.stdout.write(`${renderDeltaOutput(delta, formats[0])}\n`);
    return;
  }

  const logger = createLogger({ verbose: options.verbose });
  const stamp = timestampSlug();
  for (const format of formats) {
    const outputPath = resolveDeltaOutputPath({
      requestedOutput: options.output,
      format,
      multiple: multipleOutputs,
      defaultPath: path.join("reports", `delta-report-${stamp}.${format}`)
    });
    ensureDirSync(path.dirname(outputPath));
    writeFileSync(outputPath, renderDeltaOutput(delta, format));
    logger.info(`Delta ${format.toUpperCase()} written to ${outputPath}`);
  }
}

export function parseDeltaReportFormats(
  raw: string | undefined
): DeltaReportFormat[] {
  const source = raw?.trim() ? raw : "json";
  const seen = new Set<DeltaReportFormat>();
  const formats: DeltaReportFormat[] = [];

  for (const token of source.split(",")) {
    const normalized = token.trim().toLowerCase();
    if (!normalized) continue;

    if (normalized === "all") {
      for (const format of ["json", "html"] as DeltaReportFormat[]) {
        if (!seen.has(format)) {
          seen.add(format);
          formats.push(format);
        }
      }
      continue;
    }

    if (normalized === "json" || normalized === "html") {
      if (!seen.has(normalized)) {
        seen.add(normalized);
        formats.push(normalized);
      }
      continue;
    }

    throw new Error(
      `Invalid delta report format '${token.trim()}'. Expected json, html, all, or a comma-separated combination.`
    );
  }

  return formats.length > 0 ? formats : ["json"];
}

function renderDeltaOutput(
  delta: ReturnType<typeof compareStructuredReports>,
  format: DeltaReportFormat
): string {
  return format === "html"
    ? renderDeltaReportHtml(delta)
    : renderDeltaReportJson(delta);
}

function resolveDeltaOutputPath(options: {
  requestedOutput?: string;
  format: DeltaReportFormat;
  multiple: boolean;
  defaultPath: string;
}): string {
  const { requestedOutput, format, multiple, defaultPath } = options;
  if (!requestedOutput) return defaultPath;

  if (!multiple) {
    if (format === "html") return requestedOutput.replace(/\.json$/i, ".html");
    return requestedOutput.replace(/\.html$/i, ".json");
  }

  const parsed = path.parse(requestedOutput);
  const base =
    parsed.ext && [".json", ".html"].includes(parsed.ext.toLowerCase())
      ? path.join(parsed.dir, parsed.name)
      : requestedOutput;

  return `${base}.${format}`;
}
