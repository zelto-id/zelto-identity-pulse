import * as fs from "fs";
import * as path from "path";
import { ConfigError } from "../core/errors";
import {
  BUSINESS_CONTEXT_ENVIRONMENTS,
  BusinessContextProfile,
  normalizeBusinessContextProfile
} from "../core/business-context";

export type ConfigProvider = "auth0" | "okta";

export interface ReportConfig {
  provider?: ConfigProvider;
  environment?: string;
  format?: string | string[];
  output?: string;
  snapshotOutput?: string;
  saveSnapshot?: boolean;
  failOn?: string;
  verbose?: boolean;
  reports?: {
    format?: string | string[];
    output?: string;
    snapshotOutput?: string;
  };
  masking?: {
    includeIdentifiers?: boolean;
    includeRaw?: boolean;
  };
  scoring?: {
    profile?: string;
  };
  compliance?: {
    enabled?: boolean;
    frameworks?: string | string[];
  };
  businessContext?: BusinessContextProfile;
  collection?: {
    includeUsers?: string;
    maxUsers?: number;
    includeSystemLog?: boolean;
    systemLogDays?: number;
    maxLogs?: number;
  };
  baseline?: Record<string, unknown>;
  auth0?: {
    domain?: string;
    fromSnapshot?: string;
    environment?: string;
    format?: string | string[];
    output?: string;
    snapshotOutput?: string;
    saveSnapshot?: boolean;
    failOn?: string;
    verbose?: boolean;
    includeLegacyExtensibility?: boolean;
  };
  okta?: {
    orgUrl?: string;
    authMode?: string;
    fromSnapshot?: string;
    environment?: string;
    format?: string | string[];
    output?: string;
    snapshotOutput?: string;
    saveSnapshot?: boolean;
    failOn?: string;
    verbose?: boolean;
    includeIdentifiers?: boolean;
    includeUsers?: string;
    maxUsers?: number;
    includeSystemLog?: boolean;
    systemLogDays?: number;
    maxLogs?: number;
  };
}

export interface LoadedReportConfig {
  path?: string;
  config: ReportConfig;
}

export interface OptionSourceReader {
  getOptionValueSource(name: string): string | undefined;
}

export interface Auth0ConfigurableOptions {
  config?: string;
  domain?: string;
  output?: string;
  snapshotOutput?: string;
  saveSnapshot?: boolean;
  includeRaw?: boolean | string;
  failOn?: string;
  verbose?: boolean;
  fromSnapshot?: string;
  environment?: string;
  includeLegacyExtensibility?: boolean;
  format?: string;
  compliance?: boolean | string;
  framework?: string;
}

export interface OktaConfigurableOptions {
  config?: string;
  orgUrl?: string;
  authMode?: string;
  output?: string;
  snapshotOutput?: string;
  saveSnapshot?: boolean;
  includeRaw?: boolean | string;
  failOn?: string;
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
  compliance?: boolean | string;
  framework?: string;
}

const DEFAULT_CONFIG_FILENAMES = ["zelto-pulse.yml", "zelto-pulse.yaml"];
const SECRET_KEY_PATTERN =
  /(token|secret|password|privatekey|private_key|authorization|cookie|session|credential)/i;
const SECRET_VALUE_PATTERN =
  /(authorization\s*[:=]\s*bearer\s+\S+|-----BEGIN [A-Z ]*PRIVATE KEY-----|access[_-]?token\s*[:=]|api[_-]?token\s*[:=]|refresh[_-]?token\s*[:=]|client[_-]?secret\s*[:=]|password\s*[:=])/i;

export function loadReportConfig(options: {
  configPath?: string;
  cwd?: string;
} = {}): LoadedReportConfig {
  const cwd = options.cwd ?? process.cwd();
  const explicitPath = options.configPath?.trim();
  const configPath = explicitPath
    ? path.resolve(cwd, explicitPath)
    : findDefaultConfigPath(cwd);

  if (!configPath) {
    return { config: {} };
  }

  if (!fs.existsSync(configPath)) {
    throw new ConfigError(`Config file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = parseConfigYaml(raw);
  validateReportConfig(parsed, configPath);
  parsed.businessContext = normalizeBusinessContextProfile(parsed.businessContext);
  return {
    path: configPath,
    config: parsed
  };
}

export function findDefaultConfigPath(cwd: string = process.cwd()): string | undefined {
  for (const filename of DEFAULT_CONFIG_FILENAMES) {
    const candidate = path.join(cwd, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export function parseConfigYaml(raw: string): ReportConfig {
  const lines = raw
    .split(/\r?\n/)
    .map((line, index) => ({
      index: index + 1,
      indent: countIndent(line),
      content: stripYamlComment(line).trim()
    }))
    .filter((line) => line.content.length > 0);

  let cursor = 0;

  function parseBlock(indent: number): unknown {
    if (cursor >= lines.length) return {};
    const first = lines[cursor];
    if (first.indent < indent) return {};
    const isArray = first.indent === indent && first.content.startsWith("- ");
    return isArray ? parseArray(indent) : parseObject(indent);
  }

  function parseObject(indent: number): Record<string, unknown> {
    const object: Record<string, unknown> = {};
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.indent < indent) break;
      if (line.indent > indent) {
        throw new ConfigError(
          `Invalid indentation in config at line ${line.index}.`
        );
      }
      if (line.content.startsWith("- ")) break;

      const separator = line.content.indexOf(":");
      if (separator <= 0) {
        throw new ConfigError(
          `Invalid config line ${line.index}; expected key: value.`
        );
      }

      const key = line.content.slice(0, separator).trim();
      const rawValue = line.content.slice(separator + 1).trim();
      if (!key) {
        throw new ConfigError(`Invalid empty config key at line ${line.index}.`);
      }

      cursor += 1;
      object[key] =
        rawValue.length === 0 ? parseBlock(indent + 2) : parseScalar(rawValue);
    }
    return object;
  }

  function parseArray(indent: number): unknown[] {
    const array: unknown[] = [];
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.indent < indent) break;
      if (line.indent > indent) {
        throw new ConfigError(
          `Invalid indentation in config at line ${line.index}.`
        );
      }
      if (!line.content.startsWith("- ")) break;

      const rawValue = line.content.slice(2).trim();
      cursor += 1;
      if (rawValue.length === 0) {
        array.push(parseBlock(indent + 2));
        continue;
      }
      if (looksLikeInlineObject(rawValue)) {
        array.push(parseInlineObject(rawValue, indent + 2));
        continue;
      }
      array.push(parseScalar(rawValue));
    }
    return array;
  }

  function parseInlineObject(
    rawValue: string,
    childIndent: number
  ): Record<string, unknown> {
    const object: Record<string, unknown> = {};
    const separator = rawValue.indexOf(":");
    const key = rawValue.slice(0, separator).trim();
    const value = rawValue.slice(separator + 1).trim();
    if (!key) {
      throw new ConfigError(`Invalid empty inline object key: ${rawValue}.`);
    }

    object[key] =
      value.length === 0 ? parseBlock(childIndent) : parseScalar(value);

    if (
      cursor < lines.length &&
      lines[cursor].indent === childIndent &&
      !lines[cursor].content.startsWith("- ")
    ) {
      Object.assign(object, parseObject(childIndent));
    }

    return object;
  }

  function looksLikeInlineObject(rawValue: string): boolean {
    if (
      rawValue.startsWith('"') ||
      rawValue.startsWith("'") ||
      rawValue.startsWith("[")
    ) {
      return false;
    }
    const separator = rawValue.indexOf(":");
    if (separator <= 0) return false;
    const key = rawValue.slice(0, separator);
    return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key);
  }

  const parsed = parseBlock(lines[0]?.indent ?? 0);
  if (cursor < lines.length) {
    throw new ConfigError(`Could not parse config at line ${lines[cursor].index}.`);
  }
  if (!isPlainObject(parsed)) {
    throw new ConfigError("Config root must be a mapping object.");
  }
  return parsed as ReportConfig;
}

export function mergeAuth0ScanOptions(
  options: Auth0ConfigurableOptions,
  source?: OptionSourceReader,
  loaded?: LoadedReportConfig
): Auth0ConfigurableOptions {
  const config = loaded ?? loadReportConfig({ configPath: options.config });
  const provider = config.config.auth0 ?? {};
  const complianceFrameworks =
    config.config.compliance?.enabled === false
      ? undefined
      : config.config.compliance?.frameworks;

  return {
    ...options,
    domain: pickOption(options, source, "domain", provider.domain),
    output: pickOption(
      options,
      source,
      "output",
      provider.output,
      config.config.reports?.output,
      config.config.output
    ),
    snapshotOutput: pickOption(
      options,
      source,
      "snapshotOutput",
      provider.snapshotOutput,
      config.config.reports?.snapshotOutput,
      config.config.snapshotOutput
    ),
    saveSnapshot: pickOption(
      options,
      source,
      "saveSnapshot",
      provider.saveSnapshot,
      config.config.saveSnapshot
    ),
    includeRaw: pickOption(
      options,
      source,
      "includeRaw",
      config.config.masking?.includeRaw
    ),
    failOn: pickOption(options, source, "failOn", provider.failOn, config.config.failOn),
    verbose: pickOption(options, source, "verbose", provider.verbose, config.config.verbose),
    fromSnapshot: pickOption(options, source, "fromSnapshot", provider.fromSnapshot),
    environment: pickOption(
      options,
      source,
      "environment",
      provider.environment,
      config.config.environment,
      config.config.businessContext?.environment
    ),
    includeLegacyExtensibility: pickOption(
      options,
      source,
      "includeLegacyExtensibility",
      provider.includeLegacyExtensibility
    ),
    format: formatValue(
      pickOption(
        options,
        source,
        "format",
        provider.format,
        config.config.reports?.format,
        config.config.format
      )
    ),
    compliance: pickOption(
      options,
      source,
      "compliance",
      config.config.compliance?.enabled
    ),
    framework: formatValue(
      pickOption(
        options,
        source,
        "framework",
        complianceFrameworks
      )
    )
  };
}

export function mergeOktaScanOptions(
  options: OktaConfigurableOptions,
  source?: OptionSourceReader,
  loaded?: LoadedReportConfig
): OktaConfigurableOptions {
  const config = loaded ?? loadReportConfig({ configPath: options.config });
  const provider = config.config.okta ?? {};
  const collection = config.config.collection ?? {};
  const complianceFrameworks =
    config.config.compliance?.enabled === false
      ? undefined
      : config.config.compliance?.frameworks;

  return {
    ...options,
    orgUrl: pickOption(options, source, "orgUrl", provider.orgUrl),
    authMode: pickOption(options, source, "authMode", provider.authMode),
    output: pickOption(
      options,
      source,
      "output",
      provider.output,
      config.config.reports?.output,
      config.config.output
    ),
    snapshotOutput: pickOption(
      options,
      source,
      "snapshotOutput",
      provider.snapshotOutput,
      config.config.reports?.snapshotOutput,
      config.config.snapshotOutput
    ),
    saveSnapshot: pickOption(
      options,
      source,
      "saveSnapshot",
      provider.saveSnapshot,
      config.config.saveSnapshot
    ),
    includeRaw: pickOption(
      options,
      source,
      "includeRaw",
      config.config.masking?.includeRaw
    ),
    failOn: pickOption(options, source, "failOn", provider.failOn, config.config.failOn),
    verbose: pickOption(options, source, "verbose", provider.verbose, config.config.verbose),
    fromSnapshot: pickOption(options, source, "fromSnapshot", provider.fromSnapshot),
    environment: pickOption(
      options,
      source,
      "environment",
      provider.environment,
      config.config.environment,
      config.config.businessContext?.environment
    ),
    includeIdentifiers: pickOption(
      options,
      source,
      "includeIdentifiers",
      provider.includeIdentifiers,
      config.config.masking?.includeIdentifiers
    ),
    includeUsers: pickOption(
      options,
      source,
      "includeUsers",
      provider.includeUsers,
      collection.includeUsers
    ),
    maxUsers: numberString(
      pickOption(options, source, "maxUsers", provider.maxUsers, collection.maxUsers)
    ),
    includeSystemLog: pickOption(
      options,
      source,
      "includeSystemLog",
      provider.includeSystemLog,
      collection.includeSystemLog
    ),
    systemLogDays: numberString(
      pickOption(
        options,
        source,
        "systemLogDays",
        provider.systemLogDays,
        collection.systemLogDays
      )
    ),
    maxLogs: numberString(
      pickOption(options, source, "maxLogs", provider.maxLogs, collection.maxLogs)
    ),
    format: formatValue(
      pickOption(
        options,
        source,
        "format",
        provider.format,
        config.config.reports?.format,
        config.config.format
      )
    ),
    compliance: pickOption(
      options,
      source,
      "compliance",
      config.config.compliance?.enabled
    ),
    framework: formatValue(
      pickOption(
        options,
        source,
        "framework",
        complianceFrameworks
      )
    )
  };
}

export function resolveConfiguredProvider(
  loaded: LoadedReportConfig,
  cliProvider?: string
): ConfigProvider {
  const provider = (cliProvider ?? loaded.config.provider)?.toLowerCase();
  if (provider === "auth0" || provider === "okta") return provider;
  throw new ConfigError(
    "Missing or invalid provider. Set provider: auth0|okta in zelto-pulse.yml or pass --provider auth0|okta."
  );
}

function validateReportConfig(config: ReportConfig, configPath: string): void {
  rejectSecrets(config);

  if (
    config.provider !== undefined &&
    config.provider !== "auth0" &&
    config.provider !== "okta"
  ) {
    throw new ConfigError(
      `Invalid provider in ${configPath}: ${String(config.provider)}. Expected auth0 or okta.`
    );
  }

  if (config.masking?.includeRaw === true) {
    throw new ConfigError(
      "Config cannot enable includeRaw. Raw output must remain an explicit CLI opt-in."
    );
  }

  validateComplianceConfig(config, configPath);
  validateBusinessContext(config, configPath);
}

function validateComplianceConfig(config: ReportConfig, configPath: string): void {
  if (!config.compliance) return;
  if (!isPlainObject(config.compliance)) {
    throw new ConfigError(
      `Invalid compliance in ${configPath}: expected a mapping object.`
    );
  }
  if (
    config.compliance.enabled !== undefined &&
    typeof config.compliance.enabled !== "boolean"
  ) {
    throw new ConfigError(
      `Invalid compliance.enabled in ${configPath}: expected true or false.`
    );
  }
  const frameworks = config.compliance.frameworks;
  if (frameworks === undefined) return;
  const values = Array.isArray(frameworks) ? frameworks : [frameworks];
  const allowed = new Set(["nis2", "iso27001", "soc2", "all"]);
  for (const framework of values) {
    const normalized = String(framework).toLowerCase();
    if (!allowed.has(normalized)) {
      throw new ConfigError(
        `Invalid compliance framework in ${configPath}: ${String(framework)}. Expected nis2, iso27001, soc2, or all.`
      );
    }
  }
}

function validateBusinessContext(config: ReportConfig, configPath: string): void {
  if (!config.businessContext) return;
  if (!isPlainObject(config.businessContext)) {
    throw new ConfigError(
      `Invalid businessContext in ${configPath}: expected a mapping object.`
    );
  }

  const environment = config.businessContext.environment;
  if (
    environment !== undefined &&
    !(BUSINESS_CONTEXT_ENVIRONMENTS as string[]).includes(
      String(environment).toLowerCase()
    )
  ) {
    throw new ConfigError(
      `Invalid businessContext.environment in ${configPath}: ${String(environment)}. Expected one of: ${BUSINESS_CONTEXT_ENVIRONMENTS.join(", ")}.`
    );
  }
}

function rejectSecrets(value: unknown, pathParts: string[] = []): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectSecrets(item, [...pathParts, String(index)]));
    return;
  }
  if (!isPlainObject(value)) {
    if (typeof value === "string" && SECRET_VALUE_PATTERN.test(value)) {
      throw new ConfigError(
        `Config value at ${pathParts.join(".")} looks like a secret. Use environment variables or hidden prompts instead.`
      );
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...pathParts, key];
    if (SECRET_KEY_PATTERN.test(key)) {
      throw new ConfigError(
        `Config key ${childPath.join(".")} is not allowed because it may store a secret. Use environment variables or hidden prompts instead.`
      );
    }
    rejectSecrets(child, childPath);
  }
}

function pickOption<T extends object, K extends keyof T>(
  options: T,
  source: OptionSourceReader | undefined,
  key: K,
  ...configValues: unknown[]
): T[K] | undefined {
  if (isCliProvided(options, source, key)) return options[key];
  for (const value of configValues) {
    if (value !== undefined) return value as T[K];
  }
  return options[key];
}

function isCliProvided<T extends object, K extends keyof T>(
  options: T,
  source: OptionSourceReader | undefined,
  key: K
): boolean {
  if (!source) return options[key] !== undefined;
  return source.getOptionValueSource(String(key)) === "cli";
}

function formatValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item)).join(",");
  return String(value);
}

function numberString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return String(value);
}

function parseScalar(rawValue: string): unknown {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    const inner = rawValue.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseScalar(item.trim()));
  }

  const lower = rawValue.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (lower === "null" || lower === "~") return null;

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  return rawValue;
}

function stripYamlComment(line: string): string {
  let quote: '"' | "'" | undefined;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") {
      quote = quote === char ? undefined : quote ?? char;
    }
    if (char === "#" && !quote) {
      return line.slice(0, index);
    }
  }
  return line;
}

function countIndent(line: string): number {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
