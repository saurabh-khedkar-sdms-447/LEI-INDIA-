type LogContext = Record<string, unknown> | undefined

/**
 * Very small logger wrapper that writes directly to the console.
 * This keeps logging simple and avoids any external logging dependencies.
 */
export const log = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message, context ?? {})
    }
  },
  info: (message: string, context?: LogContext) => {
    console.info(message, context ?? {})
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(message, context ?? {})
  },
  error: (message: string, errorOrContext?: unknown, maybeContext?: LogContext) => {
    const context: LogContext =
      typeof maybeContext === 'object' && maybeContext !== null
        ? (maybeContext as LogContext)
        : typeof errorOrContext === 'object' && errorOrContext !== null && !(errorOrContext instanceof Error)
          ? (errorOrContext as LogContext)
          : undefined

    const error = errorOrContext instanceof Error ? errorOrContext : undefined

    console.error(message, {
      ...(context ?? {}),
      error: error ?? (errorOrContext && !error ? errorOrContext : undefined),
    })
  },
}

export default log
