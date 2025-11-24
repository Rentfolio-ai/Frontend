type LogLevel = 'error' | 'warn' | 'info' | 'debug';

type LogMeta = Record<string, unknown> | undefined;

type ApiLogDetails = {
  method: string;
  url: string;
  service?: string;
  status?: number;
  durationMs?: number;
  payloadPreview?: string;
};

type ApiErrorDetails = ApiLogDetails & {
  error: unknown;
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const resolveLevel = (): LogLevel => {
  const raw = (import.meta.env?.VITE_LOG_LEVEL || 'info').toString().toLowerCase();
  if (raw === 'error' || raw === 'warn' || raw === 'info' || raw === 'debug') {
    return raw;
  }
  return 'info';
};

const ACTIVE_LEVEL: LogLevel = resolveLevel();

const shouldLog = (level: LogLevel) => LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[ACTIVE_LEVEL];

const formatMessage = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  return `[Civitas][${level.toUpperCase()}][${timestamp}] ${message}`;
};

const emit = (level: LogLevel, message: string, meta?: LogMeta) => {
  if (!shouldLog(level)) return;
  const formattedMessage = formatMessage(level, message);
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'debug' ? console.debug : console.info;
  if (meta) {
    consoleMethod(formattedMessage, meta);
  } else {
    consoleMethod(formattedMessage);
  }
};

export const logger = {
  debug: (message: string, meta?: LogMeta) => emit('debug', message, meta),
  info: (message: string, meta?: LogMeta) => emit('info', message, meta),
  warn: (message: string, meta?: LogMeta) => emit('warn', message, meta),
  error: (message: string, meta?: LogMeta) => emit('error', message, meta),
};

export const apiLogger = {
  request: (details: ApiLogDetails) =>
    emit('debug', `API REQUEST ${details.method.toUpperCase()} ${details.url}`, details),
  response: (details: ApiLogDetails) =>
    emit('info', `API RESPONSE ${details.method.toUpperCase()} ${details.url} -> ${details.status ?? 'unknown'}`, details),
  error: (details: ApiErrorDetails) =>
    emit('error', `API ERROR ${details.method.toUpperCase()} ${details.url}`, details),
};

export type { ApiLogDetails, ApiErrorDetails, LogLevel };
