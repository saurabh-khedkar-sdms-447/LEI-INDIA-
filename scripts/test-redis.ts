/**
 * Test Redis connection and functionality
 * Run with: pnpm tsx scripts/test-redis.ts
 */

import { getRedisClient, isRedisConnected, cacheSet, cacheGet, cacheDelete } from '../lib/redis'

async function testRedis() {
  console.log('🔍 Testing Redis connection...\n')

  // Test 1: Check if Redis is connected
  console.log('Test 1: Connection Status')
  const connected = isRedisConnected()
  console.log(`  Status: ${connected ? '✅ Connected' : '❌ Not connected'}\n`)

  if (!connected) {
    console.log('⚠️  Redis is not connected. Check your configuration:')
    console.log('   - REDIS_URL or REDIS_HOST/REDIS_PORT environment variables')
    console.log('   - Redis server is running')
    console.log('   - Network connectivity\n')
    process.exit(1)
  }

  // Test 2: Basic SET/GET
  console.log('Test 2: Basic SET/GET Operations')
  const testKey = 'test:connection'
  const testValue = { message: 'Hello Redis!', timestamp: Date.now() }
  
  try {
    const setResult = await cacheSet(testKey, testValue, 60)
    console.log(`  SET: ${setResult ? '✅ Success' : '❌ Failed'}`)
    
    const getResult = await cacheGet<typeof testValue>(testKey)
    if (getResult && getResult.message === testValue.message) {
      console.log(`  GET: ✅ Success (retrieved: "${getResult.message}")`)
    } else {
      console.log(`  GET: ❌ Failed (expected: "${testValue.message}")`)
    }
    console.log('')
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`)
  }

  // Test 3: TTL (Time To Live)
  console.log('Test 3: TTL (Time To Live)')
  const ttlKey = 'test:ttl'
  try {
    await cacheSet(ttlKey, { data: 'test' }, 10)
    console.log('  ✅ Set value with 10 second TTL')
    
    // Wait a moment and check it still exists
    await new Promise(resolve => setTimeout(resolve, 1000))
    const ttlValue = await cacheGet(ttlKey)
    console.log(`  ✅ Value still exists after 1 second: ${ttlValue ? 'Yes' : 'No'}`)
    console.log('')
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`)
  }

  // Test 4: Cache deletion
  console.log('Test 4: Cache Deletion')
  try {
    const deleteResult = await cacheDelete(testKey)
    console.log(`  DELETE: ${deleteResult ? '✅ Success' : '❌ Failed'}`)
    
    const verifyDelete = await cacheGet(testKey)
    console.log(`  Verification: ${verifyDelete === null ? '✅ Deleted' : '❌ Still exists'}`)
    console.log('')
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`)
  }

  // Test 5: Performance test
  console.log('Test 5: Performance Test (100 operations)')
  const perfKey = 'test:perf'
  const iterations = 100
  const startTime = Date.now()
  
  try {
    for (let i = 0; i < iterations; i++) {
      await cacheSet(`${perfKey}:${i}`, { index: i, data: 'test' }, 60)
    }
    
    const setTime = Date.now() - startTime
    console.log(`  SET ${iterations} keys: ${setTime}ms (${(setTime / iterations).toFixed(2)}ms per operation)`)
    
    const getStartTime = Date.now()
    for (let i = 0; i < iterations; i++) {
      await cacheGet(`${perfKey}:${i}`)
    }
    const getTime = Date.now() - getStartTime
    console.log(`  GET ${iterations} keys: ${getTime}ms (${(getTime / iterations).toFixed(2)}ms per operation)`)
    
    // Cleanup
    for (let i = 0; i < iterations; i++) {
      await cacheDelete(`${perfKey}:${i}`)
    }
    console.log('')
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`)
  }

  // Test 6: Rate limiting simulation
  console.log('Test 6: Rate Limiting Simulation')
  const rateLimitKey = 'rate_limit:test:user123'
  const client = getRedisClient()
  
  if (client) {
    try {
      const now = Date.now()
      const windowSeconds = 60
      const maxRequests = 5
      
      // Simulate 5 requests
      for (let i = 0; i < maxRequests; i++) {
        const pipeline = client.pipeline()
        pipeline.zremrangebyscore(rateLimitKey, 0, now - windowSeconds * 1000)
        pipeline.zcard(rateLimitKey)
        pipeline.zadd(rateLimitKey, now + i, `${now + i}-${Math.random()}`)
        pipeline.expire(rateLimitKey, windowSeconds)
        await pipeline.exec()
      }
      
      const count = await client.zcard(rateLimitKey)
      console.log(`  ✅ Rate limit tracking: ${count} requests in window`)
      console.log(`  ✅ Should allow: ${count < maxRequests ? 'Yes' : 'No (rate limited)'}`)
      
      // Cleanup
      await client.del(rateLimitKey)
      console.log('')
    } catch (error) {
      console.log(`  ❌ Error: ${error}\n`)
    }
  }

  console.log('✅ All tests completed!')
  process.exit(0)
}

// Run tests
testRedis().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
