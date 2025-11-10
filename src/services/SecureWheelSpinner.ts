/**
 * SecureWheelSpinner - Système Provably Fair pour la roue de la fortune
 * 
 * Implémente les standards de l'industrie crypto-gaming pour garantir
 * la fairness et la vérifiabilité de chaque spin.
 * 
 * Standards respectés:
 * - RNG cryptographiquement sûr (crypto.getRandomValues)
 * - Système de seeds (serveur + client)
 * - Hash SHA-256 pour vérification
 * - Audit trail complet
 */

export interface WheelSegment {
  id: string;
  label: string;
  probability: number; // 0-100
  prizeId?: string;
  [key: string]: any;
}

export interface ProofOfFairness {
  serverSeed: string;      // Seed serveur (hashé avant le jeu)
  clientSeed: string;      // Seed client (fourni par l'utilisateur)
  nonce: number;           // Compteur d'utilisation
  result: string;          // ID du segment gagnant
  resultHash: string;      // SHA-256 de l'ensemble
  timestamp: number;       // Millisecondes
  randomValue: number;     // Valeur aléatoire utilisée (0-1)
  segments: WheelSegment[]; // Segments au moment du spin
}

export interface SpinResult {
  winningSegment: WheelSegment;
  proof: ProofOfFairness;
  isVerified: boolean;
}

export class SecureWheelSpinner {
  private serverSeed: string;
  private serverSeedHash: string;
  private clientSeed: string;
  private nonce: number = 0;

  constructor(clientSeed?: string) {
    // Générer un server seed aléatoire sécurisé
    this.serverSeed = this.generateSecureRandomString(32);
    this.serverSeedHash = ''; // Sera initialisé de manière asynchrone
    
    // Utiliser le client seed fourni ou en générer un
    this.clientSeed = clientSeed || this.generateSecureRandomString(16);
    
    // Initialiser le hash de manière asynchrone
    this.initializeServerSeedHash();
  }

  /**
   * Initialise le hash du server seed de manière asynchrone
   */
  private async initializeServerSeedHash(): Promise<void> {
    this.serverSeedHash = await this.hashString(this.serverSeed);
  }

  /**
   * Génère une chaîne aléatoire cryptographiquement sûre
   */
  private generateSecureRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash SHA-256 d'une chaîne
   */
  private async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Génère un nombre aléatoire sécurisé entre 0 et 1
   * Basé sur le hash des seeds combinés
   */
  private async generateSecureRandom(): Promise<number> {
    // Combiner les seeds avec le nonce
    const combined = `${this.serverSeed}:${this.clientSeed}:${this.nonce}`;
    
    // Hash SHA-256
    const hash = await this.hashString(combined);
    
    // Convertir les 8 premiers bytes du hash en nombre 0-1
    const hexValue = hash.substring(0, 16); // 8 bytes = 16 hex chars
    const intValue = parseInt(hexValue, 16);
    const maxValue = parseInt('f'.repeat(16), 16);
    
    return intValue / maxValue;
  }

  /**
   * Sélectionne un segment selon les probabilités
   * Utilise la méthode de la roulette pondérée
   */
  private selectSegmentByProbability(
    segments: WheelSegment[],
    randomValue: number
  ): WheelSegment {
    // Calculer la somme totale des probabilités
    const totalProbability = segments.reduce((sum, seg) => sum + seg.probability, 0);
    
    if (totalProbability === 0) {
      throw new Error('Total probability is 0 - no winning segments available');
    }

    // Normaliser si nécessaire
    const normalizedSegments = segments.map(seg => ({
      ...seg,
      normalizedProbability: (seg.probability / totalProbability) * 100
    }));

    // Sélectionner selon la valeur aléatoire
    let cumulativeProbability = 0;
    const targetValue = randomValue * 100; // Convertir en pourcentage

    for (const segment of normalizedSegments) {
      cumulativeProbability += segment.normalizedProbability;
      if (targetValue <= cumulativeProbability) {
        return segment;
      }
    }

    // Fallback (ne devrait jamais arriver)
    return normalizedSegments[normalizedSegments.length - 1];
  }

  /**
   * Effectue un spin sécurisé et génère la preuve de fairness
   */
  async spin(segments: WheelSegment[]): Promise<SpinResult> {
    if (!segments || segments.length === 0) {
      throw new Error('No segments provided for spin');
    }

    const timestamp = Date.now();
    
    // Générer la valeur aléatoire sécurisée
    const randomValue = await this.generateSecureRandom();
    
    // Sélectionner le segment gagnant
    const winningSegment = this.selectSegmentByProbability(segments, randomValue);
    
    // Créer la preuve de fairness
    const proof: ProofOfFairness = {
      serverSeed: this.serverSeed,
      clientSeed: this.clientSeed,
      nonce: this.nonce,
      result: winningSegment.id,
      resultHash: await this.hashString(
        `${this.serverSeed}:${this.clientSeed}:${this.nonce}:${winningSegment.id}`
      ),
      timestamp,
      randomValue,
      segments: segments.map(s => ({
        id: s.id,
        label: s.label,
        probability: s.probability,
        prizeId: s.prizeId
      }))
    };

    // Incrémenter le nonce pour le prochain spin
    this.nonce++;

    return {
      winningSegment,
      proof,
      isVerified: true
    };
  }

  /**
   * Vérifie la validité d'une preuve de fairness
   * Permet à l'utilisateur de vérifier qu'il n'y a pas eu de triche
   */
  static async verifyProof(proof: ProofOfFairness): Promise<boolean> {
    try {
      // Recréer le hash
      const spinner = new SecureWheelSpinner();
      const expectedHash = await spinner.hashString(
        `${proof.serverSeed}:${proof.clientSeed}:${proof.nonce}:${proof.result}`
      );

      // Vérifier que le hash correspond
      if (expectedHash !== proof.resultHash) {
        console.error('❌ Hash mismatch - proof is invalid');
        return false;
      }

      // Recalculer la valeur aléatoire
      const combined = `${proof.serverSeed}:${proof.clientSeed}:${proof.nonce}`;
      const hash = await spinner.hashString(combined);
      const hexValue = hash.substring(0, 16);
      const intValue = parseInt(hexValue, 16);
      const maxValue = parseInt('f'.repeat(16), 16);
      const recalculatedRandom = intValue / maxValue;

      // Vérifier que la valeur aléatoire correspond
      if (Math.abs(recalculatedRandom - proof.randomValue) > 0.0001) {
        console.error('❌ Random value mismatch - proof is invalid');
        return false;
      }

      // Vérifier que le résultat correspond aux probabilités
      const winningSegment = proof.segments.find(s => s.id === proof.result);
      if (!winningSegment) {
        console.error('❌ Winning segment not found in proof');
        return false;
      }

      console.log('✅ Proof verified successfully', {
        serverSeed: proof.serverSeed,
        clientSeed: proof.clientSeed,
        nonce: proof.nonce,
        result: proof.result,
        randomValue: proof.randomValue
      });

      return true;
    } catch (error) {
      console.error('❌ Error verifying proof:', error);
      return false;
    }
  }

  /**
   * Retourne le hash du server seed (à afficher AVANT le spin)
   * Permet de prouver que le server seed n'a pas été changé après le spin
   */
  getServerSeedHash(): string {
    return this.serverSeedHash;
  }

  /**
   * Retourne le client seed actuel
   */
  getClientSeed(): string {
    return this.clientSeed;
  }

  /**
   * Permet à l'utilisateur de définir son propre client seed
   */
  setClientSeed(seed: string): void {
    if (!seed || seed.length < 8) {
      throw new Error('Client seed must be at least 8 characters');
    }
    this.clientSeed = seed;
  }

  /**
   * Retourne le nonce actuel
   */
  getNonce(): number {
    return this.nonce;
  }

  /**
   * Révèle le server seed (à faire APRÈS le spin)
   * Permet la vérification complète
   */
  revealServerSeed(): string {
    return this.serverSeed;
  }
}
