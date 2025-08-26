export interface PickOptions {
  eps?: number;
  rng?: () => number; // inject RNG for tests
}

/**
 * Robust weighted index picker to avoid floating-point edge cases.
 * - Treats non-finite and near-zero weights as zero.
 * - If no positive weights: fallback to uniform random among all indices.
 * - If exactly one positive weight: return it deterministically.
 * - Otherwise: perform cumulative sampling and fall back to the last positive index.
 */
export function pickWeightedIndex(weights: number[], opts: PickOptions = {}): number {
  const eps = typeof opts.eps === 'number' ? opts.eps : 1e-9;
  const rand = opts.rng ?? Math.random;

  const cleaned = weights.map((w) => (Number.isFinite(w) && w > eps ? w : 0));
  const positives: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] > 0) positives.push(i);
  }
  if (positives.length === 0) {
    return Math.floor(rand() * (weights.length || 1));
  }
  if (positives.length === 1) {
    return positives[0];
  }
  const total = cleaned.reduce((sum, w) => sum + w, 0);
  let r = rand() * total;
  let lastPositive = positives[0];
  for (let i = 0; i < cleaned.length; i++) {
    const w = cleaned[i];
    if (w > 0) {
      if (r < w) return i;
      r -= w;
      lastPositive = i;
    }
  }
  return lastPositive;
}
