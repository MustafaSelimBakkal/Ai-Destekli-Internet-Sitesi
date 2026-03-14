type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

type Options = {
  key: string;
  limit: number;
  windowMs: number;
};

export function hitRateLimit({ key, limit, windowMs }: Options) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
