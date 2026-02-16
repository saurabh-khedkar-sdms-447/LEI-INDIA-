/**
 * Redis client for caching and rate limiting
 * Supports both Redis URL and individual connection parameters
 * Falls back gracefully if Redis is unavailable (for development)
 */

import Redis from 'ioredis'
import { log } from './logger'

let redisClient: Redis | null = null
let isRedisAvailable = false

/**
 * Initialize Redis client
 * Returns null if Redis is not configured (graceful degradation)
 */
function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL
  const redisHost = process.env.REDIS_HOST
  const redisPort = process.env.REDIS_PORT
  const redisPassword = process.env.REDIS_PASSWORD

  // If no Redis configuration, return null (graceful degradation)
  if (!redisUrl && !redisHost) {
    if (process.env.NODE_ENV === 'development') {
      log.warn('Redis not configured - rate limiting and caching will use in-memory fallback')
    }
    return null
  }

  try {
    let client: Redis

    if (redisUrl) {
      // Use Redis URL (e.g., redis://localhost:6379 or rediss:// for TLS)
      client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        enableReadyCheck: true,
        lazyConnect: true,
      })
    } else if (redisHost) {
      // Use individual connection parameters
      client = new Redis({
        host: redisHost,
        port: redisPort ? parseInt(redisPort, 10) : 6379,
        password: redisPassword,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        enableReadyCheck: true,
        lazyConnect: true,
      })
    } else {
      return null
    }

    // Set up error handlers
    client.on('error', (err) => {
      log.error('Redis connection error', err)
      isRedisAvailable = false
    })

    client.on('connect', () => {
      log.info('Redis connected')
      isRedisAvailable = true
    })

    client.on('ready', () => {
      log.info('Redis ready')
      isRedisAvailable = true
    })

    client.on('close', () => {
      log.warn('Redis connection closed')
      isRedisAvailable = false
    })

    // Connect asynchronously (don't block startup)
    client.connect().catch((err) => {
      log.error('Redis connection failed', err)
      isRedisAvailable = false
    })

    return client
  } catch (error) {
    log.error('Failed to create Redis client', error)
    return null
  }
}

/**
 * Get Redis client (singleton)
 * Returns null if Redis is not available
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) {
    redisClient = createRedisClient()
  }
  return redisClient
}

/**
 * Check if Redis is available and connected
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable && redisClient?.status === 'ready'
}

/**
 * Cache helper: Get value from Redis
 * Returns null if key doesn't exist or Redis is unavailable
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client || !isRedisConnected()) {
    return null
  }

  try {
    const value = await client.get(key)
    if (value === null) {
      return null
    }
    return JSON.parse(value) as T
  } catch (error) {
    log.error(`Redis GET error for key ${key}`, error)
    return null
  }
}

/**
 * Cache helper: Set value in Redis with TTL
 * Returns true if successful, false otherwise
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300,
): Promise<boolean> {
  const client = getRedisClient()
  if (!client || !isRedisConnected()) {
    return false
  }

  try {
    const serialized = JSON.stringify(value)
    await client.setex(key, ttlSeconds, serialized)
    return true
  } catch (error) {
    log.error(`Redis SET error for key ${key}`, error)
    return false
  }
}

/**
 * Cache helper: Delete value from Redis
 * Returns true if successful, false otherwise
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const client = getRedisClient()
  if (!client || !isRedisConnected()) {
    return false
  }

  try {
    await client.del(key)
    return true
  } catch (error) {
    log.error(`Redis DEL error for key ${key}`, error)
    return false
  }
}

/**
 * Cache helper: Delete multiple keys matching a pattern
 * Returns number of keys deleted
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  const client = getRedisClient()
  if (!client || !isRedisConnected()) {
    return 0
  }

  try {
    const keys = await client.keys(pattern)
    if (keys.length === 0) {
      return 0
    }
    await client.del(...keys)
    return keys.length
  } catch (error) {
    log.error(`Redis DEL pattern error for ${pattern}`, error)
    return 0
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
      redisClient = null
      isRedisAvailable = false
      log.info('Redis connection closed')
    } catch (error) {
      log.error('Error closing Redis connection', error)
    }
  }
}
