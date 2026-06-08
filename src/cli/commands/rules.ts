import { Command } from "commander";
import { ConfigError } from "../../core/errors";
import { createLogger } from "../../core/logger";
import {
  getRuleCatalogEntry,
  renderRuleCatalogList,
  renderRuleExplanation
} from "../../analysis/rules/rule-catalog";
import { ReportProviderId } from "../../reporting/json/report-contract.types";

interface RulesListOptions {
  provider?: string;
  verbose?: boolean;
}

interface RulesExplainOptions {
  verbose?: boolean;
}

export function registerRulesCommand(program: Command): void {
  const rules = program
    .command("rules")
    .description("Inspect deterministic rule metadata.");

  rules
    .command("list")
    .description("List deterministic rule catalog entries.")
    .option("--provider <provider>", "Filter by provider: auth0 | okta")
    .option("--verbose", "Verbose logging", false)
    .action((options: RulesListOptions) => {
      try {
        const provider = parseProvider(options.provider);
        process.stdout.write(`${renderRuleCatalogList({ provider })}\n`);
      } catch (err) {
        handleRulesError(err, Boolean(options.verbose));
      }
    });

  rules
    .command("explain")
    .description("Explain one deterministic rule by ID.")
    .argument("<rule-id>", "Rule ID, for example AUTH-CLI-004 or OKTA-APP-001")
    .option("--verbose", "Verbose logging", false)
    .action((ruleId: string, options: RulesExplainOptions) => {
      try {
        const entry = getRuleCatalogEntry(ruleId);
        if (!entry) {
          throw new ConfigError(
            `Unknown rule ID '${ruleId}'. Run 'zelto-pulse rules list' to see available rules.`
          );
        }
        process.stdout.write(`${renderRuleExplanation(entry)}\n`);
      } catch (err) {
        handleRulesError(err, Boolean(options.verbose));
      }
    });
}

function parseProvider(raw: string | undefined): ReportProviderId | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  if (normalized === "auth0" || normalized === "okta") {
    return normalized;
  }
  throw new ConfigError(
    `Invalid --provider value '${raw}'. Expected auth0 or okta.`
  );
}

function handleRulesError(err: unknown, verbose: boolean): never {
  const logger = createLogger({ verbose });
  if (err instanceof ConfigError) {
    logger.error(err.message);
    process.exit(1);
  }
  logger.error("Rules command failed", { error: (err as Error)?.message });
  process.exit(1);
}
