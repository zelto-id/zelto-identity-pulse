/**
 * Minimal logger.
 * - Never logs the Management API token.
 * - Caller must pre-redact sensitive payloads (use redaction module).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, meta?: unknown): void;
  error(msg: string, meta?: unknown): void;
}

export interface LoggerOptions {
  verbose?: boolean;
  stream?: NodeJS.WriteStream;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const verbose = options.verbose ?? false;
  const stream = options.stream ?? process.stderr;

  function emit(level: LogLevel, msg: string, meta?: unknown): void {
    if (level === "debug" && !verbose) return;
    const ts = new Date().toISOString();
    let line = `[${ts}] ${level.toUpperCase()} ${msg}`;
    if (meta !== undefined) {
      try {
        line += " " + JSON.stringify(meta);
      } catch {
        line += " [unserializable meta]";
      }
    }
    stream.write(line + "\n");
  }

  return {
    debug: (m, meta) => emit("debug", m, meta),
    info: (m, meta) => emit("info", m, meta),
    warn: (m, meta) => emit("warn", m, meta),
    error: (m, meta) => emit("error", m, meta)
  };
}
