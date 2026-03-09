type CounterEntry = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, CounterEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    counters.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  counters.set(key, existing);
  return true;
}
