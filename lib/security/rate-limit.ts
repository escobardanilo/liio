type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __liioRateLimit?: Map<string, Bucket>;
};

const store =
  globalStore.__liioRateLimit ??
  (globalStore.__liioRateLimit = new Map<string, Bucket>());

export function consumeRateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
  },
) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const bucket = {
      count: 1,
      resetAt: now + options.windowMs,
    };

    store.set(key, bucket);

    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt: bucket.resetAt,
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: options.limit - current.count,
    resetAt: current.resetAt,
  };
}
