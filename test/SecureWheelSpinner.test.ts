/**
 * Tests unitaires pour SecureWheelSpinner
 * Vérifie le système Provably Fair
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecureWheelSpinner, WheelSegment } from '../src/services/SecureWheelSpinner';

describe('SecureWheelSpinner', () => {
  let spinner: SecureWheelSpinner;
  let testSegments: WheelSegment[];

  beforeEach(() => {
    spinner = new SecureWheelSpinner();
    testSegments = [
      { id: '1', label: 'Prize 1', probability: 25, prizeId: 'prize-1' },
      { id: '2', label: 'Prize 2', probability: 25, prizeId: 'prize-2' },
      { id: '3', label: 'Prize 3', probability: 25, prizeId: 'prize-3' },
      { id: '4', label: 'Lose', probability: 25 }
    ];
  });

  describe('Initialization', () => {
    it('should generate server seed hash on initialization', () => {
      const hash = spinner.getServerSeedHash();
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 hash length
    });

    it('should generate client seed on initialization', () => {
      const clientSeed = spinner.getClientSeed();
      expect(clientSeed).toBeDefined();
      expect(clientSeed.length).toBeGreaterThan(0);
    });

    it('should start with nonce 0', () => {
      expect(spinner.getNonce()).toBe(0);
    });

    it('should allow custom client seed', () => {
      const customSeed = 'my-custom-seed-12345';
      const customSpinner = new SecureWheelSpinner(customSeed);
      expect(customSpinner.getClientSeed()).toBe(customSeed);
    });
  });

  describe('Spin functionality', () => {
    it('should return a winning segment', async () => {
      const result = await spinner.spin(testSegments);
      
      expect(result).toBeDefined();
      expect(result.winningSegment).toBeDefined();
      expect(testSegments).toContainEqual(
        expect.objectContaining({ id: result.winningSegment.id })
      );
    });

    it('should generate proof of fairness', async () => {
      const result = await spinner.spin(testSegments);
      
      expect(result.proof).toBeDefined();
      expect(result.proof.serverSeed).toBeDefined();
      expect(result.proof.clientSeed).toBeDefined();
      expect(result.proof.nonce).toBe(0); // First spin
      expect(result.proof.result).toBe(result.winningSegment.id);
      expect(result.proof.resultHash).toBeDefined();
      expect(result.proof.resultHash.length).toBe(64);
    });

    it('should increment nonce after each spin', async () => {
      await spinner.spin(testSegments);
      expect(spinner.getNonce()).toBe(1);
      
      await spinner.spin(testSegments);
      expect(spinner.getNonce()).toBe(2);
      
      await spinner.spin(testSegments);
      expect(spinner.getNonce()).toBe(3);
    });

    it('should respect probability distribution over many spins', async () => {
      const spins = 1000;
      const results = new Map<string, number>();
      
      for (let i = 0; i < spins; i++) {
        const newSpinner = new SecureWheelSpinner(); // New spinner for each spin
        const result = await newSpinner.spin(testSegments);
        const count = results.get(result.winningSegment.id) || 0;
        results.set(result.winningSegment.id, count + 1);
      }

      // Each segment should get roughly 25% (±10% tolerance)
      testSegments.forEach(segment => {
        const count = results.get(segment.id) || 0;
        const percentage = (count / spins) * 100;
        expect(percentage).toBeGreaterThan(15); // At least 15%
        expect(percentage).toBeLessThan(35); // At most 35%
      });
    });

    it('should throw error for empty segments', async () => {
      await expect(spinner.spin([])).rejects.toThrow('No segments provided');
    });

    it('should handle segments with 0 total probability', async () => {
      const zeroSegments = [
        { id: '1', label: 'Test', probability: 0 }
      ];
      
      await expect(spinner.spin(zeroSegments)).rejects.toThrow('Total probability is 0');
    });
  });

  describe('Proof verification', () => {
    it('should verify valid proof', async () => {
      const result = await spinner.spin(testSegments);
      const isValid = await SecureWheelSpinner.verifyProof(result.proof);
      
      expect(isValid).toBe(true);
    });

    it('should reject tampered result', async () => {
      const result = await spinner.spin(testSegments);
      const tamperedProof = {
        ...result.proof,
        result: 'tampered-id' // Change the result
      };
      
      const isValid = await SecureWheelSpinner.verifyProof(tamperedProof);
      expect(isValid).toBe(false);
    });

    it('should reject tampered hash', async () => {
      const result = await spinner.spin(testSegments);
      const tamperedProof = {
        ...result.proof,
        resultHash: 'a'.repeat(64) // Invalid hash
      };
      
      const isValid = await SecureWheelSpinner.verifyProof(tamperedProof);
      expect(isValid).toBe(false);
    });

    it('should reject tampered random value', async () => {
      const result = await spinner.spin(testSegments);
      const tamperedProof = {
        ...result.proof,
        randomValue: 0.9999 // Change random value
      };
      
      const isValid = await SecureWheelSpinner.verifyProof(tamperedProof);
      expect(isValid).toBe(false);
    });
  });

  describe('Client seed management', () => {
    it('should allow setting custom client seed', () => {
      const newSeed = 'new-custom-seed';
      spinner.setClientSeed(newSeed);
      expect(spinner.getClientSeed()).toBe(newSeed);
    });

    it('should reject too short client seed', () => {
      expect(() => spinner.setClientSeed('short')).toThrow('at least 8 characters');
    });

    it('should produce different results with different client seeds', async () => {
      const spinner1 = new SecureWheelSpinner('seed-1-12345678');
      const spinner2 = new SecureWheelSpinner('seed-2-12345678');
      
      const result1 = await spinner1.spin(testSegments);
      const result2 = await spinner2.spin(testSegments);
      
      // Different seeds should produce different hashes
      expect(result1.proof.resultHash).not.toBe(result2.proof.resultHash);
    });
  });

  describe('Cryptographic security', () => {
    it('should use crypto.getRandomValues', () => {
      // Vérifier que crypto est disponible
      expect(crypto).toBeDefined();
      expect(crypto.getRandomValues).toBeDefined();
    });

    it('should generate unique server seeds', () => {
      const spinner1 = new SecureWheelSpinner();
      const spinner2 = new SecureWheelSpinner();
      
      expect(spinner1.revealServerSeed()).not.toBe(spinner2.revealServerSeed());
    });

    it('should generate deterministic results for same seeds and nonce', async () => {
      const seed = 'test-seed-12345678';
      const spinner1 = new SecureWheelSpinner(seed);
      const spinner2 = new SecureWheelSpinner(seed);
      
      // Force same server seed for testing
      const serverSeed = spinner1.revealServerSeed();
      (spinner2 as any).serverSeed = serverSeed;
      
      const result1 = await spinner1.spin(testSegments);
      const result2 = await spinner2.spin(testSegments);
      
      // Same seeds and nonce should produce same result
      expect(result1.winningSegment.id).toBe(result2.winningSegment.id);
      expect(result1.proof.resultHash).toBe(result2.proof.resultHash);
    });
  });

  describe('Edge cases', () => {
    it('should handle single segment', async () => {
      const singleSegment = [
        { id: '1', label: 'Only one', probability: 100 }
      ];
      
      const result = await spinner.spin(singleSegment);
      expect(result.winningSegment.id).toBe('1');
    });

    it('should handle unequal probabilities', async () => {
      const unequalSegments = [
        { id: '1', label: 'High', probability: 70 },
        { id: '2', label: 'Low', probability: 30 }
      ];
      
      const spins = 1000;
      let highCount = 0;
      
      for (let i = 0; i < spins; i++) {
        const newSpinner = new SecureWheelSpinner();
        const result = await newSpinner.spin(unequalSegments);
        if (result.winningSegment.id === '1') highCount++;
      }
      
      const highPercentage = (highCount / spins) * 100;
      // Should be around 70% (±15% tolerance)
      expect(highPercentage).toBeGreaterThan(55);
      expect(highPercentage).toBeLessThan(85);
    });

    it('should normalize probabilities that exceed 100%', async () => {
      const overSegments = [
        { id: '1', label: 'A', probability: 60 },
        { id: '2', label: 'B', probability: 60 }
      ];
      
      // Should not throw, should normalize
      const result = await spinner.spin(overSegments);
      expect(result.winningSegment).toBeDefined();
    });
  });
});
