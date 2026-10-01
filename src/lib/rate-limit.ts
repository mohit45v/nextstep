/**
 * A small in-process rate limiter.
 *
 * Honest about what it is: a `Map` in one server process. It survives neither a
 * restart nor a second instance, so it is not a security control — it is there
 * to stop one student (or one runaway `fetch` loop in a component) from queueing
 * a hundred executions on a single-container judge.
 *
 * Anything that needs a real limit — abuse prevention, billing — wants Redis or
 * the platform's own limiter. This is the cheap 90%.
 */
interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the next attempt would be allowed. 0 when allowed. */
  retryAfterSeconds: number;
  remaining: number;
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };

  // Drop anything older than the window, which also keeps the array bounded.
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      remaining: 0,
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup: without it, every user who ever made a request keeps
  // an entry for the lifetime of the process.
  if (buckets.size > 5_000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.hits.every((at) => now - at >= windowMs)) buckets.delete(entryKey);
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: limit - bucket.hits.length,
  };
}
