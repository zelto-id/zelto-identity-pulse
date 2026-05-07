/**
 * Minimal .env loader.
 *
 * Reads KEY=VALUE pairs from a `.env` file in the current working directory
 * (or a provided path) and assigns them to `process.env` if not already set.
 *
 * Intentionally tiny — no new runtime dependency. Existing environment values
 * win, so explicit shell exports always override the file.
 *
 * Supports:
 *   - `KEY=value`
 *   - `KEY="value with spaces"`
 *   - `KEY='value'`
 *   - `# comment` lines and blank lines
 *   - `export KEY=value` (the `export ` prefix is stripped)
 *
 * Does NOT support: multiline values, variable expansion, escape sequences.
 */

import * as fs from "fs";
import * as path from "path";

export interface LoadEnvOptions {
  /** Path to the env file. Defaults to `<cwd>/.env`. */
  path?: string;
  /** When true, file values overwrite existing process.env values. Default: false. */
  override?: boolean;
}

export interface LoadEnvResult {
  loaded: boolean;
  path: string;
  keys: string[];
}

export function loadDotEnv(options: LoadEnvOptions = {}): LoadEnvResult {
  const filePath = options.path ?? path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(filePath)) {
    return { loaded: false, path: filePath, keys: [] };
  }
  const content = fs.readFileSync(filePath, "utf8");
  const keys: string[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const stripped = line.replace(/^export\s+/, "");
    const eq = stripped.indexOf("=");
    if (eq <= 0) continue;

    const key = stripped.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = stripped.slice(eq + 1).trim();
    // Strip wrapping single or double quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (options.override || process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
      keys.push(key);
    }
  }
  return { loaded: true, path: filePath, keys };
}
