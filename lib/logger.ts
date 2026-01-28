import pino from 'pino'

// Create logger instance with appropriate configuration
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Export logger methods with consistent API
export const log = {
  debug: (message: string, data?: Record<string, unknown>) => logger.debug(data, message),
  info: (message: string, data?: Record<string, unknown>) => logger.info(data, message),
  warn: (message: string, data?: Record<string, unknown>) => logger.warn(data, message),
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    if (error instanceof Error) {
      logger.error({ err: error, ...data }, message)
    } else {
      logger.error(data, message, error)
    }
  },
}

export default logger
