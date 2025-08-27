import { pickWeightedIndex } from '../utils/weightedPicker';

describe('Wheel Probability System', () => {
  // Test case for 100% probability on a single segment
  test('should always select the segment with 100% probability', () => {
    // Segment 0: 100% probability, others: 0%
    const weights = [1, 0, 0, 0];
    
    // Run multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const result = pickWeightedIndex(weights, { 
        rng: () => Math.random(), // Use actual random for this test
        eps: 1e-9 
      });
      expect(result).toBe(0);
    }
  });

  // Test case for normalized probabilities
  test('should handle normalized probabilities correctly', () => {
    // These should be equivalent to [0.5, 0.5]
    const testCases = [
      [50, 50],
      [0.5, 0.5],
      [1, 1],
      [500, 500]
    ];

    testCases.forEach(weights => {
      const result1 = pickWeightedIndex(weights, { rng: () => 0.2 }); // Should pick first segment
      const result2 = pickWeightedIndex(weights, { rng: () => 0.6 }); // Should pick second segment
      
      expect(result1).toBe(0);
      expect(result2).toBe(1);
    });
  });

  // Test case for edge cases
  test('should handle edge cases', () => {
    // Empty weights array
    expect(pickWeightedIndex([])).toBe(0);
    
    // Single weight
    expect(pickWeightedIndex([1])).toBe(0);
    
    // All weights zero (should pick randomly)
    const result = pickWeightedIndex([0, 0, 0]);
    expect([0, 1, 2]).toContain(result);
  });
});
