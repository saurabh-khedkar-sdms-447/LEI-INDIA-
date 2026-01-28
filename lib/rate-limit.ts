import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { log } from './logger'

// Initialize Redis client (optional - falls back to in-memory if not configured)
let redis: Redis | null = null
let ratelimit: Ratelimit | null = null

// Try to initialize Upstash Redis if URL is provided
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })
    
    // Create rate limiter with different limits for different endpoint types
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // Default: 10 requests per 10 seconds
      analytics: true,
      prefix: '@leiindias/ratelimit',
    })
    
    log.info('Rate limiting initialized with Upstash Redis')
  } catch (error) {
    log.warn('Failed to initialize Upstash Redis, using in-memory fallback', error)
  }
}

// In-memory fallback rate limiter (simple implementation)
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowSeconds * 1000
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier
    const requests = this.requests.get(key) || []

    // Remove requests outside the window
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0]
      const reset = oldestRequest + this.windowMs
      this.requests.set(key, validRequests)
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.ceil(reset / 1000),
      }
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    // Cleanup old entries periodically (every 1000 requests)
    if (Math.random() < 0.001) {
      this.cleanup(now)
    }

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validRequests.length,
      reset: Math.ceil((now + this.windowMs) / 1000),
    }
  }

  private cleanup(now: number): void {
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// Create in-memory rate limiters for different endpoint types
const authRateLimiter = new InMemoryRateLimiter(5, 60) // 5 requests per minute for auth endpoints
const apiRateLimiter = new InMemoryRateLimiter(100, 60) // 100 requests per minute for general API
const adminRateLimiter = new InMemoryRateLimiter(200, 60) // 200 requests per minute for admin endpoints

export type RateLimitConfig = {
  maxRequests?: number
  windowSeconds?: number
  identifier?: (req: NextRequest) => string
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Rate limit middleware
 * Returns null if rate limit is OK, or a NextResponse with 429 if rate limited
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = {},
): Promise<NextResponse | null> {
  const {
    maxRequests = 100,
    windowSeconds = 60,
    identifier,
  } = config

  // Determine which rate limiter to use based on endpoint
  const pathname = req.nextUrl.pathname
  
  let limiter: InMemoryRateLimiter
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/reset-password')) {
    limiter = authRateLimiter
  } else if (pathname.includes('/admin')) {
    limiter = adminRateLimiter
  } else {
    limiter = apiRateLimiter
  }

  // Get identifier
  const id = identifier ? identifier(req) : getIdentifier(req)

  // Check rate limit
  let result
  if (ratelimit && redis) {
    // Use Upstash if available
    result = await ratelimit.limit(id)
  } else {
    // Use in-memory fallback
    result = await limiter.limit(id)
  }

  if (!result.success) {
    log.warn('Rate limit exceeded', { identifier: id, pathname, limit: result.limit })
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${new Date(result.reset * 1000).toISOString()}`,
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': result.reset.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      },
    )
  }

  return null
}

/**
 * Rate limit wrapper for API route handlers
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimit(req, config)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(req)
  }
}
