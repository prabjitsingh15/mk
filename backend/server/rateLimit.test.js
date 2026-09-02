import test from 'node:test'
import assert from 'node:assert/strict'

import { createRateLimiter, readRateLimitConfig } from './rateLimit.js'

test('readRateLimitConfig returns configurable values with fallbacks', () => {
  const config = readRateLimitConfig({
    RATE_LIMIT_AUTH_WINDOW_MS: '900000',
    RATE_LIMIT_AUTH_MAX: '10',
    RATE_LIMIT_AUTH_PER_ACCOUNT_MAX: '6',
    RATE_LIMIT_AUTH_PENALTY_BASE_MS: '15000',
    RATE_LIMIT_AUTH_PENALTY_MAX_MS: '600000',
  })

  assert.equal(config.windowMs, 900000)
  assert.equal(config.maxRequests, 10)
  assert.equal(config.perAccountMax, 6)
  assert.equal(config.penaltyBaseMs, 15000)
  assert.equal(config.penaltyMaxMs, 600000)
  assert.equal(config.auth.windowMs, 900000)
})

test('auth limiter blocks repeated requests and sets a retry delay', () => {
  const limiter = createRateLimiter({
    name: 'auth',
    windowMs: 60000,
    maxRequests: 2,
    perAccountMax: 3,
    penaltyBaseMs: 1000,
    penaltyMaxMs: 5000,
  })

  const req = {
    ip: '203.0.113.42',
    headers: { 'x-user-id': 'user-123' },
    body: { email: 'user@example.com' },
  }

  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    set(name, value) {
      this.headers[name] = value
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }

  let nextCalled = 0
  const next = () => { nextCalled += 1 }

  limiter(req, res, next)
  limiter(req, res, next)
  const nextResult = limiter(req, res, next)

  assert.equal(nextCalled, 2)
  assert.equal(res.statusCode, 429)
  assert.ok(res.payload.retryAfterSeconds >= 1)
  assert.equal(nextResult, undefined)
})
