import { Command } from "commander";
import { ConfigError, AuthenticationError } from "../../core/errors";
import { createLogger } from "../../core/logger";
import {
  loadReportConfig,
  resolveConfiguredProvider
} from "../../config/report-config";
import { runScanAuth0 } from "./scan-auth0";
import { runScanOkta } from "./scan-okta";

interface ConfiguredScanOptions {
  config?: string;
  provider?: string;
  verbose?: boolean;
}

export function registerConfiguredScanAction(scan: Command): void {
  scan
    .option("--config <path>", "Path to zelto-pulse.yml config file")
    .option("--provider <provider>", "Provider override for config-driven scans: auth0 | okta")
    .option("--verbose", "Verbose logging", false)
    .action(async (options: ConfiguredScanOptions) => {
      try {
        await runConfiguredScan(options);
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

async function runConfiguredScan(options: ConfiguredScanOptions): Promise<void> {
  const loaded = loadReportConfig({ configPath: options.config });
  const provider = resolveConfiguredProvider(loaded, options.provider);
  if (provider === "auth0") {
    await runScanAuth0(
      { config: options.config, verbose: options.verbose ? true : undefined },
      undefined,
      loaded
    );
    return;
  }

  await runScanOkta(
    { config: options.config, verbose: options.verbose ? true : undefined },
    undefined,
    loaded
  );
}
