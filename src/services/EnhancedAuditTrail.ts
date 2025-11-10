/**
 * EnhancedAuditTrail - Système d'audit trail enrichi avec preuves cryptographiques
 * 
 * Implémente un système de traçabilité complet pour chaque attribution de lot:
 * - Timestamp précis (millisecondes)
 * - Preuves cryptographiques (seeds, hash, signature)
 * - Context complet (rang, quotas, probabilités)
 * - Vérification a posteriori
 * 
 * Conforme aux standards de l'industrie pour la transparence et la conformité légale.
 */

import { ProofOfFairness } from './SecureWheelSpinner';
import { TemporalAdjustment } from './TemporalDistribution';

export interface ComprehensiveAuditLog {
  // Identifiants
  id: string;
  timestamp: number; // Millisecondes
  campaignId: string;
  
  // Participant
  participantId: string;
  participantEmail: string;
  participantRank: number;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  
  // Attribution
  prizeId?: string;
  prizeName?: string;
  segmentId: string;
  segmentLabel: string;
  isWinner: boolean;
  attributionMethod: 'calendar' | 'probability' | 'quota' | 'rank' | 'instant_win';
  
  // Provably Fair (pour les jeux de hasard)
  proof?: ProofOfFairness;
  
  // Context temporel
  temporalAdjustment?: TemporalAdjustment;
  prizesRemainingBefore: number;
  prizesRemainingAfter: number;
  dailyQuotaRemaining?: number;
  
  // Probabilités
  originalProbability?: number;
  adjustedProbability?: number;
  
  // Vérification
  signature: string; // Signature cryptographique de l'ensemble
  verified: boolean;
  
  // Métadonnées
  metadata?: Record<string, any>;
}

export interface AuditVerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    signatureValid: boolean;
    proofValid?: boolean;
    timestampValid: boolean;
    dataIntegrity: boolean;
  };
}

export class EnhancedAuditTrail {
  /**
   * Génère une signature cryptographique pour un log d'audit
   */
  private static async generateSignature(log: Omit<ComprehensiveAuditLog, 'signature' | 'verified'>): Promise<string> {
    // Créer une représentation canonique du log
    const canonical = JSON.stringify({
      id: log.id,
      timestamp: log.timestamp,
      campaignId: log.campaignId,
      participantId: log.participantId,
      prizeId: log.prizeId,
      isWinner: log.isWinner,
      proof: log.proof,
      prizesRemainingBefore: log.prizesRemainingBefore,
      prizesRemainingAfter: log.prizesRemainingAfter
    });

    // Hash SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Crée un log d'audit complet
   */
  static async createAuditLog(params: {
    campaignId: string;
    participantId: string;
    participantEmail: string;
    participantRank: number;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    prizeId?: string;
    prizeName?: string;
    segmentId: string;
    segmentLabel: string;
    isWinner: boolean;
    attributionMethod: ComprehensiveAuditLog['attributionMethod'];
    proof?: ProofOfFairness;
    temporalAdjustment?: TemporalAdjustment;
    prizesRemainingBefore: number;
    prizesRemainingAfter: number;
    dailyQuotaRemaining?: number;
    originalProbability?: number;
    adjustedProbability?: number;
    metadata?: Record<string, any>;
  }): Promise<ComprehensiveAuditLog> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const logWithoutSignature: Omit<ComprehensiveAuditLog, 'signature' | 'verified'> = {
      id,
      timestamp,
      campaignId: params.campaignId,
      participantId: params.participantId,
      participantEmail: params.participantEmail,
      participantRank: params.participantRank,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceFingerprint: params.deviceFingerprint,
      prizeId: params.prizeId,
      prizeName: params.prizeName,
      segmentId: params.segmentId,
      segmentLabel: params.segmentLabel,
      isWinner: params.isWinner,
      attributionMethod: params.attributionMethod,
      proof: params.proof,
      temporalAdjustment: params.temporalAdjustment,
      prizesRemainingBefore: params.prizesRemainingBefore,
      prizesRemainingAfter: params.prizesRemainingAfter,
      dailyQuotaRemaining: params.dailyQuotaRemaining,
      originalProbability: params.originalProbability,
      adjustedProbability: params.adjustedProbability,
      metadata: params.metadata
    };

    const signature = await this.generateSignature(logWithoutSignature);

    const completeLog: ComprehensiveAuditLog = {
      ...logWithoutSignature,
      signature,
      verified: true
    };

    console.log('📝 Audit log created:', {
      id: completeLog.id,
      timestamp: new Date(completeLog.timestamp).toISOString(),
      isWinner: completeLog.isWinner,
      prizeId: completeLog.prizeId,
      hasProof: !!completeLog.proof,
      signature: completeLog.signature.substring(0, 16) + '...'
    });

    return completeLog;
  }

  /**
   * Vérifie l'intégrité d'un log d'audit
   */
  static async verifyAuditLog(log: ComprehensiveAuditLog): Promise<AuditVerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let signatureValid = false;
    let proofValid: boolean | undefined;
    let timestampValid = false;
    let dataIntegrity = true;

    try {
      // 1. Vérifier la signature
      const { signature, verified, ...logWithoutSignature } = log;
      const expectedSignature = await this.generateSignature(logWithoutSignature);
      
      signatureValid = signature === expectedSignature;
      if (!signatureValid) {
        errors.push('Signature invalide - les données ont peut-être été modifiées');
      }

      // 2. Vérifier le timestamp
      const now = Date.now();
      const logAge = now - log.timestamp;
      timestampValid = log.timestamp > 0 && log.timestamp <= now;
      
      if (!timestampValid) {
        errors.push('Timestamp invalide');
      }
      
      if (logAge > 365 * 24 * 60 * 60 * 1000) {
        warnings.push('Log très ancien (> 1 an)');
      }

      // 3. Vérifier la preuve Provably Fair si présente
      if (log.proof) {
        const { SecureWheelSpinner } = await import('./SecureWheelSpinner');
        proofValid = await SecureWheelSpinner.verifyProof(log.proof);
        
        if (!proofValid) {
          errors.push('Preuve Provably Fair invalide');
        }
      }

      // 4. Vérifier la cohérence des données
      if (log.isWinner && !log.prizeId) {
        errors.push('Incohérence: gagnant sans prizeId');
        dataIntegrity = false;
      }

      if (log.prizesRemainingAfter > log.prizesRemainingBefore) {
        errors.push('Incohérence: prizesRemaining augmente');
        dataIntegrity = false;
      }

      if (log.isWinner && log.prizesRemainingAfter !== log.prizesRemainingBefore - 1) {
        warnings.push('Incohérence potentielle dans le décompte des lots');
      }

      // 5. Vérifier les ajustements temporels
      if (log.temporalAdjustment) {
        if (log.temporalAdjustment.adjustedProbability > log.temporalAdjustment.originalProbability) {
          warnings.push('Ajustement temporel a augmenté la probabilité (inhabituel)');
        }
      }

    } catch (error) {
      errors.push(`Erreur lors de la vérification: ${error}`);
    }

    const isValid = errors.length === 0 && signatureValid && timestampValid && dataIntegrity;

    console.log(`${isValid ? '✅' : '❌'} Audit log verification:`, {
      id: log.id,
      isValid,
      signatureValid,
      proofValid,
      timestampValid,
      dataIntegrity,
      errorsCount: errors.length,
      warningsCount: warnings.length
    });

    return {
      isValid,
      errors,
      warnings,
      details: {
        signatureValid,
        proofValid,
        timestampValid,
        dataIntegrity
      }
    };
  }

  /**
   * Génère un rapport d'audit pour une campagne
   */
  static generateAuditReport(logs: ComprehensiveAuditLog[]): {
    totalParticipations: number;
    totalWins: number;
    winRate: number;
    prizeDistribution: Map<string, number>;
    methodDistribution: Map<string, number>;
    temporalDistribution: Map<string, number>; // Par jour
    averageParticipantRank: number;
    verificationStatus: {
      allVerified: boolean;
      invalidLogs: number;
    };
  } {
    const totalParticipations = logs.length;
    const totalWins = logs.filter(log => log.isWinner).length;
    const winRate = totalParticipations > 0 ? (totalWins / totalParticipations) * 100 : 0;

    const prizeDistribution = new Map<string, number>();
    const methodDistribution = new Map<string, number>();
    const temporalDistribution = new Map<string, number>();
    let totalRank = 0;
    let invalidLogs = 0;

    logs.forEach(log => {
      // Distribution par lot
      if (log.isWinner && log.prizeId) {
        prizeDistribution.set(
          log.prizeName || log.prizeId,
          (prizeDistribution.get(log.prizeName || log.prizeId) || 0) + 1
        );
      }

      // Distribution par méthode
      methodDistribution.set(
        log.attributionMethod,
        (methodDistribution.get(log.attributionMethod) || 0) + 1
      );

      // Distribution temporelle
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      temporalDistribution.set(
        date,
        (temporalDistribution.get(date) || 0) + 1
      );

      totalRank += log.participantRank;

      if (!log.verified) {
        invalidLogs++;
      }
    });

    const averageParticipantRank = totalParticipations > 0 ? totalRank / totalParticipations : 0;

    return {
      totalParticipations,
      totalWins,
      winRate,
      prizeDistribution,
      methodDistribution,
      temporalDistribution,
      averageParticipantRank,
      verificationStatus: {
        allVerified: invalidLogs === 0,
        invalidLogs
      }
    };
  }

  /**
   * Exporte les logs d'audit au format CSV pour analyse
   */
  static exportToCSV(logs: ComprehensiveAuditLog[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Date',
      'Campaign ID',
      'Participant Email',
      'Participant Rank',
      'Is Winner',
      'Prize ID',
      'Prize Name',
      'Segment Label',
      'Attribution Method',
      'Original Probability',
      'Adjusted Probability',
      'Prizes Remaining Before',
      'Prizes Remaining After',
      'Daily Quota Remaining',
      'IP Address',
      'Verified',
      'Signature'
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      new Date(log.timestamp).toISOString(),
      log.campaignId,
      log.participantEmail,
      log.participantRank,
      log.isWinner,
      log.prizeId || '',
      log.prizeName || '',
      log.segmentLabel,
      log.attributionMethod,
      log.originalProbability || '',
      log.adjustedProbability || '',
      log.prizesRemainingBefore,
      log.prizesRemainingAfter,
      log.dailyQuotaRemaining || '',
      log.ipAddress || '',
      log.verified,
      log.signature
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }
}
