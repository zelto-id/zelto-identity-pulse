#!/usr/bin/env node
/**
 * zelto-pulse CLI entry point.
 */

import { Command } from "commander";
import { registerScanAuth0Command } from "./commands/scan-auth0";
import { registerScanOktaCommand } from "./commands/scan-okta";
import { loadDotEnv } from "../core/dotenv";

function main(): void {
  // Load .env from CWD before parsing args so env-var defaults work.
  // Existing shell-exported values always win.
  loadDotEnv();

  const program = new Command();
  program
    .name("zelto-pulse")
    .description(
      "Local-first identity-security posture analyzer for Auth0 and Okta Workforce. Read-only."
    )
    .version("0.1.0");

  const scan = program
    .command("scan")
    .description("Run a posture scan against an identity provider.");

  registerScanAuth0Command(scan);
  registerScanOktaCommand(scan);

  program.parseAsync(process.argv).catch((err) => {
    process.stderr.write(`Unhandled error: ${(err as Error)?.message ?? err}\n`);
    process.exit(1);
  });
}

main();
