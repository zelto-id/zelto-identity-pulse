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
import { buildCombinedExecutiveSummary } from "../../reporting/combined/combined-summary";
import { renderCombinedExecutiveSummaryHtml } from "../../reporting/html/combined-executive-summary.html-renderer";
import { StructuredReportV1 } from "../../reporting/json/report-contract.types";

interface SummaryOptions {
  reports?: string[] | string;
  output?: string;
  verbose?: boolean;
}

export function registerSummaryCommand(program: Command): void {
  program
    .command("summary")
    .description(
      "Generate a combined executive HTML summary from multiple Report Contract v1 JSON reports."
    )
    .requiredOption(
      "--reports <paths...>",
      "Report Contract v1 JSON report paths, usually one Auth0 report and one Okta report"
    )
    .option(
      "--output <path>",
      "Combined HTML output path. Default: reports/combined-executive-summary-<timestamp>.html"
    )
    .option("--verbose", "Verbose logging", false)
    .action((options: SummaryOptions) => {
      try {
        runSummary(options);
      } catch (err) {
        const logger = createLogger({ verbose: options.verbose });
        if (err instanceof ConfigError) {
          logger.error(err.message);
          process.exit(1);
        }
        logger.error("Combined summary failed", {
          error: (err as Error)?.message
        });
        process.exit(1);
      }
    });
}

export function runSummary(options: SummaryOptions): string {
  const reportPaths = normalizeReportPaths(options.reports);
  if (reportPaths.length < 2) {
    throw new ConfigError("At least two --reports paths are required.");
  }

  const reports = reportPaths.map((reportPath) =>
    readJsonSync<StructuredReportV1>(path.resolve(reportPath))
  );
  const summary = buildCombinedExecutiveSummary(reports);
  const html = renderCombinedExecutiveSummaryHtml(summary);
  const outputPath =
    options.output ??
    path.join(
      "reports",
      `combined-executive-summary-${timestampSlug()}.html`
    );

  ensureDirSync(path.dirname(outputPath));
  writeFileSync(outputPath, html);

  const logger = createLogger({ verbose: options.verbose });
  logger.info(`Combined executive summary written to ${outputPath}`);
  process.stdout.write(`Combined executive summary: ${outputPath}\n`);
  return outputPath;
}

function normalizeReportPaths(raw: string[] | string | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return [raw];
}
