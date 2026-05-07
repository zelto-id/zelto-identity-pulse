export class ZeltoError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ZeltoError";
    this.code = code;
    this.details = details;
  }
}

export class ConfigError extends ZeltoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFIG_INVALID", message, details);
    this.name = "ConfigError";
  }
}

export class AuthenticationError extends ZeltoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("AUTHENTICATION_FAILED", message, details);
    this.name = "AuthenticationError";
  }
}

export class HttpError extends ZeltoError {
  public readonly status: number;
  public readonly retryAfterMs?: number;

  constructor(
    status: number,
    message: string,
    options?: { retryAfterMs?: number; details?: Record<string, unknown> }
  ) {
    super(`HTTP_${status}`, message, options?.details);
    this.name = "HttpError";
    this.status = status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}
