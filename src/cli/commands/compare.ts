import { Command } from "commander";
import { ConfigError } from "../../core/errors";
import { ensureDirSync, readJsonSync, writeFileSync } from "../../core/filesystem";
import { createLogger } from "../../core/logger";
import {
  compareStructuredReports,
  renderDeltaReportJson
} from "../../reporting/delta/delta-compare";
import { StructuredReportV1 } from "../../reporting/json/report-contract.types";
import * as path from "path";

interface CompareOptions {
  before?: string;
  after?: string;
  output?: string;
  verbose?: boolean;
}

export function registerCompareCommand(program: Command): void {
  program
    .command("compare")
    .description("Compare two structured JSON reports and emit deterministic delta JSON.")
    .requiredOption("--before <path>", "Baseline Report Contract v1 JSON path")
    .requiredOption("--after <path>", "Follow-up Report Contract v1 JSON path")
    .option("--output <path>", "Delta JSON output path. Defaults to stdout.")
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
  const json = renderDeltaReportJson(delta);

  if (options.output) {
    ensureDirSync(path.dirname(options.output));
    writeFileSync(options.output, json);
    const logger = createLogger({ verbose: options.verbose });
    logger.info(`Delta JSON written to ${options.output}`);
    return;
  }

  process.stdout.write(`${json}\n`);
}
