import * as fs from "fs";
import * as path from "path";

export function ensureDirSync(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFileSync(filePath: string, content: string): void {
  ensureDirSync(path.dirname(filePath));
  // Owner-only on POSIX where supported; Node ignores mode on Windows.
  fs.writeFileSync(filePath, content, { mode: 0o600 });
}

export function readJsonSync<T = unknown>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function timestampSlug(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace(/Z$/, "Z");
}
