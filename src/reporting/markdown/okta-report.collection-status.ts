import { OktaAnalysisReport } from "./okta-report.types";

interface OktaCollectionDegradationSummary {
  partialCount: number;
  failedOrSkippedCount: number;
  degradedCount: number;
}

function pluralize(count: number, singular: string, plural: string = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function summarizeOktaCollectionDegradation(
  report: Pick<OktaAnalysisReport, "collectionStatus">
): OktaCollectionDegradationSummary {
  const partialCount = report.collectionStatus.failedCollectors.filter(
    (collector) => collector.status === "partial"
  ).length;
  const failedOrSkippedCount = report.collectionStatus.failedCollectors.filter(
    (collector) => collector.status === "failed" || collector.status === "skipped"
  ).length;

  return {
    partialCount,
    failedOrSkippedCount,
    degradedCount: partialCount + failedOrSkippedCount
  };
}

export function buildOktaPartialScanSummary(
  report: Pick<OktaAnalysisReport, "collectionStatus">
): string {
  const summary = summarizeOktaCollectionDegradation(report);

  if (summary.failedOrSkippedCount > 0 && summary.partialCount > 0) {
    return `Partial scan: ${pluralize(
      summary.degradedCount,
      "collector"
    )} had degraded coverage (${pluralize(
      summary.partialCount,
      "partial collector",
      "partial collectors"
    )}, ${pluralize(
      summary.failedOrSkippedCount,
      "failed/skipped collector",
      "failed/skipped collectors"
    )}). Categories with failed, skipped, or missing key collectors are reported as N/A; categories with partial key collector data remain scored with reduced confidence.`;
  }

  if (summary.failedOrSkippedCount > 0) {
    return `Partial scan: ${pluralize(summary.failedOrSkippedCount, "collector")} ${
      summary.failedOrSkippedCount === 1 ? "failed or was skipped" : "failed or were skipped"
    }. Categories with failed, skipped, or missing key collectors are reported as N/A rather than scored as clean.`;
  }

  return `Partial scan: ${pluralize(
    summary.partialCount,
    "collector"
  )} had partial data. Categories with partial key collector data remain scored with reduced confidence.`;
}

export function buildOktaNotAssessedEmptyState(
  report: Pick<OktaAnalysisReport, "collectionStatus">
): string {
  if (report.collectionStatus.partial) {
    return "No categories were marked Not Assessed. Partial collector data, if any, is described above.";
  }
  return "All in-scope areas were assessed.";
}
