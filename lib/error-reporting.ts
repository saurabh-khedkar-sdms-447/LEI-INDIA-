import { log } from './logger'

interface ApiErrorContext {
  route: string
  message: string
  requestId?: string
  extras?: Record<string, unknown>
}

/**
 * Report an API error in a single, consistent place.
 * Uses simple console-based logging via the shared logger.
 */
export function reportApiError(error: unknown, context: ApiErrorContext): void {
  const { route, message, requestId, extras } = context

  log.error(message, error instanceof Error ? error : undefined, {
    route,
    requestId,
    ...extras,
  })
}
