import { describe, expect, it } from "vitest";
import {
  parseReportFormats,
  resolveReportOutputPath
} from "../../src/reporting/report-output";

describe("report output helpers", () => {
  it("parses comma-separated formats and expands the legacy all alias", () => {
    expect(parseReportFormats("html,json")).toEqual(["html", "json"]);
    expect(parseReportFormats("all")).toEqual([
      "markdown",
      "html",
      "json"
    ]);
    expect(parseReportFormats("all,json")).toEqual([
      "markdown",
      "html",
      "json"
    ]);
  });

  it("derives sibling output paths when multiple formats are requested", () => {
    expect(
      resolveReportOutputPath({
        requestedOutput: "reports/example.md",
        format: "json",
        multiple: true,
        defaultPath: "reports/default.json"
      })
    ).toBe("reports/example.json");

    expect(
      resolveReportOutputPath({
        requestedOutput: "reports/example",
        format: "html",
        multiple: true,
        defaultPath: "reports/default.html"
      })
    ).toBe("reports/example.html");
  });

  it("rejects invalid format tokens", () => {
    expect(() => parseReportFormats("markdown,pdf")).toThrow(
      /Invalid report format/
    );
  });
});
