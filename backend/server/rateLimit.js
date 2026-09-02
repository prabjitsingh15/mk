// Default throttling limits for different endpoint groups.
// Auth routes are the most sensitive, while public product pages and user order routes
// have broader thresholds to avoid blocking normal storefront traffic.
const DEFAULT_RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    perAccountMax: 5,
    penaltyBaseMs: 2000,
    penaltyMaxMs: 10 * 60 * 1000,
  },
  public: {
    windowMs: 60 * 1000,
    maxRequests: 120,
  },
  user: {
    windowMs: 60 * 1000,
    maxRequests: 300,
    perAccountMax: 60,
    penaltyBaseMs: 1000,
    penaltyMaxMs: 60 * 1000,
  },
}

// Reads environment values and falls back to safe defaults when values are missing or invalid.
function parseNumber(value, fallback) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

/**
 * Builds the runtime rate-limit settings from environment variables.
 *
 * This lets the server adjust request limits per environment without changing the code.
 * Each route group can override the default window size, max requests, and backoff values.
 */
export function readRateLimitConfig(environment = globalThis.process?.env || {}) {
  const auth = {
    ...DEFAULT_RATE_LIMITS.auth,
    windowMs: parseNumber(environment.RATE_LIMIT_AUTH_WINDOW_MS, DEFAULT_RATE_LIMITS.auth.windowMs),
    maxRequests: parseNumber(environment.RATE_LIMIT_AUTH_MAX, DEFAULT_RATE_LIMITS.auth.maxRequests),
    perAccountMax: parseNumber(environment.RATE_LIMIT_AUTH_PER_ACCOUNT_MAX, DEFAULT_RATE_LIMITS.auth.perAccountMax),
    penaltyBaseMs: parseNumber(environment.RATE_LIMIT_AUTH_PENALTY_BASE_MS, DEFAULT_RATE_LIMITS.auth.penaltyBaseMs),
    penaltyMaxMs: parseNumber(environment.RATE_LIMIT_AUTH_PENALTY_MAX_MS, DEFAULT_RATE_LIMITS.auth.penaltyMaxMs),
  }

  const publicConfig = {
    ...DEFAULT_RATE_LIMITS.public,
    windowMs: parseNumber(environment.RATE_LIMIT_PUBLIC_WINDOW_MS, DEFAULT_RATE_LIMITS.public.windowMs),
    maxRequests: parseNumber(environment.RATE_LIMIT_PUBLIC_MAX, DEFAULT_RATE_LIMITS.public.maxRequests),
  }

  const user = {
    ...DEFAULT_RATE_LIMITS.user,
    windowMs: parseNumber(environment.RATE_LIMIT_USER_WINDOW_MS, DEFAULT_RATE_LIMITS.user.windowMs),
    maxRequests: parseNumber(environment.RATE_LIMIT_USER_MAX, DEFAULT_RATE_LIMITS.user.maxRequests),
    perAccountMax: parseNumber(environment.RATE_LIMIT_USER_PER_ACCOUNT_MAX, DEFAULT_RATE_LIMITS.user.perAccountMax),
    penaltyBaseMs: parseNumber(environment.RATE_LIMIT_USER_PENALTY_BASE_MS, DEFAULT_RATE_LIMITS.user.penaltyBaseMs),
    penaltyMaxMs: parseNumber(environment.RATE_LIMIT_USER_PENALTY_MAX_MS, DEFAULT_RATE_LIMITS.user.penaltyMaxMs),
  }

  return {
    windowMs: auth.windowMs,
    maxRequests: auth.maxRequests,
    perAccountMax: auth.perAccountMax,
    penaltyBaseMs: auth.penaltyBaseMs,
    penaltyMaxMs: auth.penaltyMaxMs,
    auth,
    public: publicConfig,
    user,
  }
}

// Uses the forwarded IP when the app is behind a proxy so rate limiting still works in production.
function getIpKey(request) {
  const forwardedFor = request.headers?.['x-forwarded-for']
  const forwardedValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
  return String(forwardedValue || request.ip || 'unknown-ip')
}

// Tries to identify the request owner from common headers or the request body.
// This allows per-user throttling in addition to IP-based throttling.
function getAccountKey(request) {
  if (request.headers) {
    const headerUserId = request.headers['x-user-id'] || request.headers['x-user']
    if (headerUserId) return String(headerUserId)

    const authorization = request.headers.authorization
    if (authorization) return String(authorization)
  }

  const bodyEmail = request.body?.email
  if (bodyEmail) return String(bodyEmail)

  return null
}

// The in-memory bucket stores the number of requests and any active penalty for a client.
function readBucket(state, key, now, windowMs) {
  const record = state.get(key)
  if (!record) {
    const fresh = { count: 0, windowStart: now, penaltyUntil: 0 }
    state.set(key, fresh)
    return fresh
  }

  if (now - record.windowStart >= windowMs) {
    record.count = 0
    record.windowStart = now
    record.penaltyUntil = 0
  }

  return record
}

/**
 * Creates an Express middleware that blocks excessive requests by IP and optional account ID.
 *
 * The function keeps counters in memory for a short window and returns HTTP 429 with a
 * Retry-After header when the configured limit is exceeded. A small exponential backoff
 * is applied to discourage repeated abuse.
 */
export function createRateLimiter(config) {
  const state = new Map()
  const maxRequests = Math.max(1, Number(config.maxRequests) || 1)
  const perAccountMax = Math.max(0, Number(config.perAccountMax) || 0)
  const windowMs = Math.max(1000, Number(config.windowMs) || 1000)
  const penaltyBaseMs = Math.max(0, Number(config.penaltyBaseMs) || 0)
  const penaltyMaxMs = Math.max(penaltyBaseMs, Number(config.penaltyMaxMs) || penaltyBaseMs)

  return function rateLimiter(request, response, next) {
    const now = Date.now()
    const ipKey = getIpKey(request)
    const accountKey = getAccountKey(request)
    const ipBucket = readBucket(state, `ip:${ipKey}`, now, windowMs)
    const accountBucket = accountKey ? readBucket(state, `account:${accountKey}`, now, windowMs) : null

    const ipLimitReached = ipBucket.count >= maxRequests
    const accountLimitReached = accountBucket && perAccountMax > 0 && accountBucket.count >= perAccountMax
    const ipPenaltyActive = ipBucket.penaltyUntil > now
    const accountPenaltyActive = accountBucket && accountBucket.penaltyUntil > now

    if (ipPenaltyActive || accountPenaltyActive || ipLimitReached || accountLimitReached) {
      const nextPenaltyUntil = now + Math.max(
        ipBucket.penaltyUntil > now ? ipBucket.penaltyUntil - now : 0,
        accountBucket && accountBucket.penaltyUntil > now ? accountBucket.penaltyUntil - now : 0,
        penaltyBaseMs,
      )

      const violationCount = Math.max(
        ipLimitReached ? ipBucket.count : 0,
        accountLimitReached && accountBucket ? accountBucket.count : 0,
      )
      const exponentialBackoffMs = penaltyBaseMs > 0
        ? Math.min(penaltyBaseMs * (2 ** Math.max(0, violationCount - 1)), penaltyMaxMs)
        : 0

      const penaltyWindowMs = Math.max(nextPenaltyUntil - now, exponentialBackoffMs)

      if (ipPenaltyActive || ipLimitReached) ipBucket.penaltyUntil = Math.max(ipBucket.penaltyUntil, now + penaltyWindowMs)
      if (accountBucket && (accountPenaltyActive || accountLimitReached)) accountBucket.penaltyUntil = Math.max(accountBucket.penaltyUntil, now + penaltyWindowMs)

      const retryAfterSeconds = Math.max(1, Math.ceil((Math.max(ipBucket.penaltyUntil, accountBucket?.penaltyUntil || 0) - now) / 1000))
      response.status(429)
        .set('Retry-After', String(retryAfterSeconds))
        .json({
          message: 'Too many requests. Please slow down and try again later.',
          retryAfterSeconds,
          retryAfterMs: Math.max(ipBucket.penaltyUntil, accountBucket?.penaltyUntil || 0) - now,
        })
      return
    }

    ipBucket.count += 1
    if (accountBucket) accountBucket.count += 1

    return next()
  }
}
