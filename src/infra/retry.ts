export function computeBackoffMs(attempt: number) {
  const base = 300; // ms
  const max = 30_000;
  const jitter = Math.floor(Math.random() * 200);
  const exp = Math.min(max, base * Math.pow(2, attempt));
  return exp + jitter;
}
