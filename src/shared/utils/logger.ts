type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isEnabled = true;

const write = (level: LogLevel, message: string, meta?: unknown): void => {
  if (!isEnabled) {
    return;
  }

  const payload = meta === undefined ? message : `${message} ${JSON.stringify(meta)}`;
  console[level](payload);
};

export const logger = {
  debug: (message: string, meta?: unknown): void => write('debug', message, meta),
  info: (message: string, meta?: unknown): void => write('info', message, meta),
  warn: (message: string, meta?: unknown): void => write('warn', message, meta),
  error: (message: string, meta?: unknown): void => write('error', message, meta),
};
