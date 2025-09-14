export interface PickOptions {
  eps?: number;
  rng?: () => number; // inject RNG for tests
}

/**
 * Robust weighted index picker to handle normalized probabilities (values between 0 and 1).
 * - Treats non-finite and near-zero weights as zero.
 * - If no positive weights: fallback to uniform random among all indices.
 * - If exactly one positive weight: return it deterministically.
 * - Otherwise: perform cumulative sampling and fall back to the last positive index.
 */
export function pickWeightedIndex(weights: number[], opts: PickOptions = {}): number {
  const eps = typeof opts.eps === 'number' ? opts.eps : 1e-9;
  const rand = opts.rng ?? Math.random;

  console.group('🔍 pickWeightedIndex - Début');
  console.log('Poids bruts:', weights);
  
  // Clean and validate weights
  const cleaned = weights.map((w, i) => {
    const valid = Number.isFinite(w) && w > eps;
    const value = valid ? Math.max(0, Math.min(1, w)) : 0; // Ensure between 0 and 1
    console.log(`- Poids[${i}]: ${w} -> ${valid ? 'valide' : 'invalide'} -> ${value}`);
    return value;
  });
  
  console.log('Poids nettoyés et validés:', cleaned);
  
  // Collect indices of positive weights
  const positives: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] > 0) positives.push(i);
  }
  
  console.log('Indices positifs:', positives);
  
  // Handle edge cases
  if (positives.length === 0) {
    console.log('Aucun poids positif, retourne un index aléatoire');
    return Math.floor(rand() * (weights.length || 1));
  }
  
  if (positives.length === 1) {
    const selected = positives[0];
    console.log(`Un seul poids positif (${cleaned[selected]}), retourne son index:`, selected);
    return selected;
  }
  
  // Calculate total weight and generate random value
  const total = cleaned.reduce((sum, w) => sum + w, 0);
  const r = rand() * total; // Random value between 0 and total
  
  console.log(`Total des poids: ${total}, tirage aléatoire: ${r}`);
  
  // Find selected index using cumulative probability
  let cumulative = 0;
  let lastPositive = positives[0];
  
  for (let i = 0; i < cleaned.length; i++) {
    const w = cleaned[i];
    if (w > 0) {
      cumulative += w;
      console.log(`- Index ${i} (${w}): cumul=${cumulative.toFixed(4)}, r=${r.toFixed(4)}`);
      
      if (r <= cumulative + eps) {
        console.log(`  -> Sélectionné: index ${i} (${w})`);
        return i;
      }
      lastPositive = i;
    }
  }
  console.log(`Aucune sélection, retourne le dernier index positif: ${lastPositive}`);
  console.groupEnd();
  return lastPositive;
}
