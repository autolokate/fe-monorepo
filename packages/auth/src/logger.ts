export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
};

export function createLogger(options: {
  enabled: boolean;
  namespace?: string;
}): Logger {
  const prefix = options.namespace ? `[${options.namespace}]` : '[auth]';

  const write = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    if (!options.enabled && level === 'debug') {
      return;
    }
    const payload = context ? { ...context } : undefined;
    if (level === 'error') {
      console.error(prefix, message, payload);
      return;
    }
    if (level === 'warn') {
      console.warn(prefix, message, payload);
      return;
    }
    if (!options.enabled) {
      return;
    }
    if (level === 'info') {
      console.info(prefix, message, payload);
      return;
    }
    console.debug(prefix, message, payload);
  };

  return {
    debug: (message, context) => {
      write('debug', message, context);
    },
    info: (message, context) => {
      write('info', message, context);
    },
    warn: (message, context) => {
      write('warn', message, context);
    },
    error: (message, context) => {
      write('error', message, context);
    },
  };
}
