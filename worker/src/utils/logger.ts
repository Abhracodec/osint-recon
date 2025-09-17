type LogLevel = 'info' | 'error' | 'warn' | 'debug';

const format = (level: LogLevel, message: any, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  if (args.length) {
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  } else {
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
};

export const logger = {
  info: (msg: any, ...args: any[]) => format('info', msg, ...args),
  error: (msg: any, ...args: any[]) => format('error', msg, ...args),
  warn: (msg: any, ...args: any[]) => format('warn', msg, ...args),
  debug: (msg: any, ...args: any[]) => format('debug', msg, ...args),
};
