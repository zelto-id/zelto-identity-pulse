import * as path from "path";

export type ReportFormat = "markdown" | "html" | "json";

const FORMAT_EXTENSIONS: Record<ReportFormat, string> = {
  markdown: ".md",
  html: ".html",
  json: ".json"
};

const FORMAT_LABELS: Record<ReportFormat, string> = {
  markdown: "Markdown",
  html: "HTML",
  json: "JSON"
};

const VALID_FORMATS: ReportFormat[] = ["markdown", "html", "json"];

export function parseReportFormats(raw: string | undefined): ReportFormat[] {
  const source = raw?.trim() ? raw : "markdown";
  const seen = new Set<ReportFormat>();
  const formats: ReportFormat[] = [];

  for (const token of source.split(",")) {
    const normalized = token.trim().toLowerCase();
    if (!normalized) continue;

    if (normalized === "all") {
      for (const format of VALID_FORMATS) {
        if (!seen.has(format)) {
          seen.add(format);
          formats.push(format);
        }
      }
      continue;
    }

    if ((VALID_FORMATS as string[]).includes(normalized)) {
      const format = normalized as ReportFormat;
      if (!seen.has(format)) {
        seen.add(format);
        formats.push(format);
      }
      continue;
    }

    throw new Error(
      `Invalid report format '${token.trim()}'. Expected markdown, html, json, all, or a comma-separated combination.`
    );
  }

  return formats.length > 0 ? formats : ["markdown"];
}

export function resolveReportOutputPath(options: {
  requestedOutput?: string;
  format: ReportFormat;
  multiple: boolean;
  defaultPath: string;
}): string {
  const { requestedOutput, format, multiple, defaultPath } = options;
  if (!requestedOutput) return defaultPath;

  if (!multiple) {
    if (format === "html") return requestedOutput.replace(/\.md$/i, ".html");
    if (format === "json") {
      return requestedOutput
        .replace(/\.md$/i, ".json")
        .replace(/\.html$/i, ".json");
    }
    return requestedOutput;
  }

  const parsed = path.parse(requestedOutput);
  const base =
    parsed.ext && [".md", ".html", ".json"].includes(parsed.ext.toLowerCase())
      ? path.join(parsed.dir, parsed.name)
      : requestedOutput;

  return `${base}${FORMAT_EXTENSIONS[format]}`;
}

export function reportFormatLabel(format: ReportFormat): string {
  return FORMAT_LABELS[format];
}
