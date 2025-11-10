# 🚀 GUIDE D'IMPLÉMENTATION - SYSTÈME D'ATTRIBUTION V2.0

**Date**: 10 Novembre 2025  
**Version**: 2.0  
**Auteur**: Équipe Développement

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Nouvelles fonctionnalités](#nouvelles-fonctionnalités)
3. [Guide d'utilisation](#guide-dutilisation)
4. [Exemples de code](#exemples-de-code)
5. [Migration depuis v1.0](#migration-depuis-v10)
6. [FAQ](#faq)

---

## 🎯 VUE D'ENSEMBLE

La version 2.0 du système d'attribution de lots apporte trois améliorations majeures :

### 1. **SecureWheelSpinner** - Provably Fair Gaming
RNG cryptographiquement sûr avec preuve de fairness vérifiable.

### 2. **TemporalDistribution** - Lissage Temporel Intelligent
Distribution uniforme des lots sur toute la durée de la campagne.

### 3. **EnhancedAuditTrail** - Audit Trail Complet
Traçabilité totale avec preuves cryptographiques.

---

## 🆕 NOUVELLES FONCTIONNALITÉS

### SecureWheelSpinner

#### Avantages
- ✅ RNG cryptographique (crypto.getRandomValues)
- ✅ Système de seeds (serveur + client)
- ✅ Hash SHA-256 pour vérification
- ✅ Reproductibilité des résultats
- ✅ Transparence totale

#### Cas d'usage
- Roue de la fortune
- Jeux de hasard
- Tirages au sort
- Sélection aléatoire sécurisée

### TemporalDistribution

#### Avantages
- ✅ Évite l'épuisement prématuré des lots
- ✅ Distribution uniforme sur la période
- ✅ Quotas journaliers adaptatifs
- ✅ Système de carry-over
- ✅ 3 stratégies de distribution

#### Cas d'usage
- Campagnes longues (> 7 jours)
- Gros volumes de participants
- Lots en quantité limitée
- Événements planifiés

### EnhancedAuditTrail

#### Avantages
- ✅ Traçabilité complète
- ✅ Preuves cryptographiques
- ✅ Vérification a posteriori
- ✅ Conformité légale
- ✅ Export CSV pour analyse

#### Cas d'usage
- Conformité RGPD
- Résolution de litiges
- Analyse de campagne
- Audit externe

---

## 📖 GUIDE D'UTILISATION

### 1. SecureWheelSpinner

#### Installation de base

```typescript
import { SecureWheelSpinner } from '@/services/SecureWheelSpinner';

// Créer une instance
const spinner = new SecureWheelSpinner();

// Ou avec un client seed personnalisé
const customSpinner = new SecureWheelSpinner('my-custom-seed-12345');
```

#### Effectuer un spin sécurisé

```typescript
const segments = [
  { id: '1', label: 'Prize 1', probability: 25, prizeId: 'prize-1' },
  { id: '2', label: 'Prize 2', probability: 25, prizeId: 'prize-2' },
  { id: '3', label: 'Prize 3', probability: 25, prizeId: 'prize-3' },
  { id: '4', label: 'Lose', probability: 25 }
];

const result = await spinner.spin(segments);

console.log('Winning segment:', result.winningSegment);
console.log('Proof:', result.proof);
```

#### Vérifier une preuve

```typescript
const isValid = await SecureWheelSpinner.verifyProof(result.proof);

if (isValid) {
  console.log('✅ Proof is valid - game was fair!');
} else {
  console.log('❌ Proof is invalid - possible tampering!');
}
```

#### Afficher les seeds pour transparence

```typescript
// AVANT le spin (pour prouver que le seed n'a pas été changé)
const serverSeedHash = spinner.getServerSeedHash();
console.log('Server seed hash (before spin):', serverSeedHash);

// APRÈS le spin (pour permettre la vérification)
const serverSeed = spinner.revealServerSeed();
const clientSeed = spinner.getClientSeed();
console.log('Server seed (after spin):', serverSeed);
console.log('Client seed:', clientSeed);
```

#### Permettre au joueur de choisir son seed

```typescript
// Interface utilisateur
<input 
  type="text" 
  placeholder="Enter your lucky seed (optional)"
  onChange={(e) => spinner.setClientSeed(e.target.value)}
/>

// Le joueur peut vérifier que son seed a bien été utilisé
```

---

### 2. TemporalDistribution

#### Configuration de base

```typescript
import { TemporalDistribution } from '@/services/TemporalDistribution';

const config = {
  campaignStartDate: new Date('2025-01-01'),
  campaignEndDate: new Date('2025-01-31'), // Campagne de 31 jours
  totalParticipantsEstimated: 10000,
  distributionStrategy: 'uniform' // ou 'weighted' ou 'peak_hours'
};

const temporal = new TemporalDistribution(config);
```

#### Calculer le quota journalier

```typescript
const prize = {
  id: 'prize-1',
  name: 'iPhone 15',
  totalUnits: 31, // 1 par jour
  awardedUnits: 0,
  method: 'probability',
  probabilityPercent: 10
};

const dailyQuota = temporal.calculateDailyQuota(prize);
console.log(`Daily quota: ${dailyQuota} prizes`);
```

#### Vérifier si un lot peut être attribué

```typescript
const canAward = temporal.canAwardPrize(prize);

if (canAward.canAward) {
  console.log(`✅ Can award prize (${canAward.quotaRemaining} remaining today)`);
  // Attribuer le lot
} else {
  console.log(`❌ Daily quota reached: ${canAward.reason}`);
  // Refuser l'attribution
}
```

#### Ajuster les probabilités

```typescript
const originalProbability = 10; // 10%
const adjustment = temporal.adjustProbability(prize, originalProbability);

console.log(`Original: ${adjustment.originalProbability}%`);
console.log(`Adjusted: ${adjustment.adjustedProbability}%`);
console.log(`Reason: ${adjustment.reason}`);

// Utiliser la probabilité ajustée
const finalProbability = adjustment.adjustedProbability;
```

#### Enregistrer une attribution

```typescript
// Quand un lot est gagné
temporal.recordAttribution(prize.id);

// Vérifier le quota restant
const remaining = temporal.canAwardPrize(prize);
console.log(`Remaining today: ${remaining.quotaRemaining}`);
```

#### Appliquer le carry-over

```typescript
// À la fin de chaque journée (cron job)
temporal.applyCarryOver(new Date());

// Les lots non gagnés aujourd'hui seront reportés sur demain
```

#### Obtenir des statistiques

```typescript
const stats = temporal.getDistributionStats();

console.log(`Total days: ${stats.totalDays}`);
console.log(`Days remaining: ${stats.daysRemaining}`);
console.log(`Average awards/day: ${stats.averageAwardsPerDay}`);
console.log(`Projected total: ${stats.projectedTotalAwards}`);
```

---

### 3. EnhancedAuditTrail

#### Créer un log d'audit

```typescript
import { EnhancedAuditTrail } from '@/services/EnhancedAuditTrail';

const auditLog = await EnhancedAuditTrail.createAuditLog({
  campaignId: 'campaign-123',
  participantId: 'user-456',
  participantEmail: 'user@example.com',
  participantRank: 42,
  ipAddress: '192.168.1.1',
  userAgent: navigator.userAgent,
  prizeId: 'prize-1',
  prizeName: 'iPhone 15',
  segmentId: 'segment-1',
  segmentLabel: 'Prize 1',
  isWinner: true,
  attributionMethod: 'probability',
  proof: spinResult.proof, // Preuve du SecureWheelSpinner
  prizesRemainingBefore: 10,
  prizesRemainingAfter: 9,
  dailyQuotaRemaining: 3,
  originalProbability: 10,
  adjustedProbability: 8.5,
  metadata: {
    wheelSize: 400,
    gameSize: 'medium'
  }
});

console.log('Audit log created:', auditLog.id);
console.log('Signature:', auditLog.signature);
```

#### Vérifier un log d'audit

```typescript
const verification = await EnhancedAuditTrail.verifyAuditLog(auditLog);

if (verification.isValid) {
  console.log('✅ Audit log is valid');
} else {
  console.log('❌ Audit log is invalid');
  console.log('Errors:', verification.errors);
}

console.log('Details:', verification.details);
```

#### Générer un rapport d'audit

```typescript
const allLogs = [...]; // Récupérer tous les logs de la campagne

const report = EnhancedAuditTrail.generateAuditReport(allLogs);

console.log(`Total participations: ${report.totalParticipations}`);
console.log(`Total wins: ${report.totalWins}`);
console.log(`Win rate: ${report.winRate}%`);
console.log('Prize distribution:', report.prizeDistribution);
console.log('Method distribution:', report.methodDistribution);
console.log('Temporal distribution:', report.temporalDistribution);
```

#### Exporter en CSV

```typescript
const csv = EnhancedAuditTrail.exportToCSV(allLogs);

// Télécharger le fichier
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `audit-campaign-${campaignId}.csv`;
a.click();
```

---

## 💡 EXEMPLES DE CODE

### Exemple complet : Roue avec Provably Fair + Temporal + Audit

```typescript
import { SecureWheelSpinner } from '@/services/SecureWheelSpinner';
import { TemporalDistribution } from '@/services/TemporalDistribution';
import { EnhancedAuditTrail } from '@/services/EnhancedAuditTrail';

async function handleWheelSpin(campaign, participant) {
  // 1. Initialiser les systèmes
  const spinner = new SecureWheelSpinner(participant.customSeed);
  
  const temporal = new TemporalDistribution({
    campaignStartDate: campaign.startDate,
    campaignEndDate: campaign.endDate,
    distributionStrategy: 'uniform'
  });

  // 2. Ajuster les probabilités selon le quota temporel
  const adjustedSegments = campaign.segments.map(segment => {
    if (!segment.prizeId) return segment;
    
    const prize = campaign.prizes.find(p => p.id === segment.prizeId);
    if (!prize) return segment;
    
    const adjustment = temporal.adjustProbability(
      prize,
      segment.probability
    );
    
    return {
      ...segment,
      probability: adjustment.adjustedProbability
    };
  });

  // 3. Effectuer le spin sécurisé
  const spinResult = await spinner.spin(adjustedSegments);
  const winningSegment = spinResult.winningSegment;
  const proof = spinResult.proof;

  // 4. Vérifier le quota
  const prize = campaign.prizes.find(p => p.id === winningSegment.prizeId);
  if (prize) {
    const canAward = temporal.canAwardPrize(prize);
    
    if (!canAward.canAward) {
      console.log('Daily quota reached, selecting losing segment');
      // Sélectionner un segment perdant
      const losingSegments = adjustedSegments.filter(s => !s.prizeId);
      const losingResult = await spinner.spin(losingSegments);
      winningSegment = losingResult.winningSegment;
      proof = losingResult.proof;
    } else {
      // Enregistrer l'attribution
      temporal.recordAttribution(prize.id);
    }
  }

  // 5. Créer l'audit trail
  const auditLog = await EnhancedAuditTrail.createAuditLog({
    campaignId: campaign.id,
    participantId: participant.id,
    participantEmail: participant.email,
    participantRank: await getParticipantRank(campaign.id),
    ipAddress: participant.ip,
    userAgent: navigator.userAgent,
    prizeId: prize?.id,
    prizeName: prize?.name,
    segmentId: winningSegment.id,
    segmentLabel: winningSegment.label,
    isWinner: !!prize,
    attributionMethod: 'probability',
    proof: proof,
    prizesRemainingBefore: prize ? prize.totalUnits - prize.awardedUnits : 0,
    prizesRemainingAfter: prize ? prize.totalUnits - prize.awardedUnits - 1 : 0,
    dailyQuotaRemaining: prize ? temporal.canAwardPrize(prize).quotaRemaining : 0
  });

  // 6. Sauvegarder en base de données
  await saveAuditLog(auditLog);

  // 7. Retourner le résultat
  return {
    winningSegment,
    proof,
    auditLog,
    canVerify: true,
    verificationUrl: `/verify?proof=${proof.resultHash}`
  };
}
```

### Exemple : Page de vérification Provably Fair

```typescript
// Page /verify
async function verifyGameResult(proofHash: string) {
  // 1. Récupérer la preuve depuis la base de données
  const auditLog = await getAuditLogByProofHash(proofHash);
  
  if (!auditLog || !auditLog.proof) {
    return { error: 'Proof not found' };
  }

  // 2. Vérifier la preuve
  const isValid = await SecureWheelSpinner.verifyProof(auditLog.proof);

  // 3. Vérifier l'audit log
  const verification = await EnhancedAuditTrail.verifyAuditLog(auditLog);

  // 4. Afficher les résultats
  return {
    isValid,
    verification,
    proof: auditLog.proof,
    details: {
      serverSeed: auditLog.proof.serverSeed,
      clientSeed: auditLog.proof.clientSeed,
      nonce: auditLog.proof.nonce,
      result: auditLog.proof.result,
      resultHash: auditLog.proof.resultHash,
      timestamp: new Date(auditLog.timestamp).toISOString()
    }
  };
}
```

---

## 🔄 MIGRATION DEPUIS V1.0

### Étape 1 : Mise à jour des imports

```typescript
// Avant (v1.0)
import { ProbabilityEngine } from '@/services/ProbabilityEngine';

// Après (v2.0)
import { ProbabilityEngine } from '@/services/ProbabilityEngine';
import { SecureWheelSpinner } from '@/services/SecureWheelSpinner';
import { TemporalDistribution } from '@/services/TemporalDistribution';
import { EnhancedAuditTrail } from '@/services/EnhancedAuditTrail';
```

### Étape 2 : Remplacer Math.random() par SecureWheelSpinner

```typescript
// Avant (v1.0) - INSÉCURISÉ
const randomIndex = Math.floor(Math.random() * segments.length);
const winningSegment = segments[randomIndex];

// Après (v2.0) - SÉCURISÉ
const spinner = new SecureWheelSpinner();
const result = await spinner.spin(segments);
const winningSegment = result.winningSegment;
const proof = result.proof; // Preuve de fairness
```

### Étape 3 : Ajouter la distribution temporelle

```typescript
// Avant (v1.0) - Pas de lissage temporel
const probabilities = ProbabilityEngine.calculateSegmentProbabilities(
  segments,
  prizes
);

// Après (v2.0) - Avec lissage temporel
const probabilities = ProbabilityEngine.calculateSegmentProbabilitiesWithTemporal(
  segments,
  prizes,
  {
    campaignStartDate: campaign.startDate,
    campaignEndDate: campaign.endDate,
    distributionStrategy: 'uniform'
  }
);
```

### Étape 4 : Enrichir l'audit trail

```typescript
// Avant (v1.0) - Audit basique
await saveAttributionHistory({
  campaignId,
  prizeId,
  participantEmail,
  isWinner
});

// Après (v2.0) - Audit complet
const auditLog = await EnhancedAuditTrail.createAuditLog({
  campaignId,
  participantId,
  participantEmail,
  participantRank,
  prizeId,
  prizeName,
  segmentId,
  segmentLabel,
  isWinner,
  attributionMethod: 'probability',
  proof: spinResult.proof,
  prizesRemainingBefore,
  prizesRemainingAfter
});

await saveAuditLog(auditLog);
```

---

## ❓ FAQ

### Q: Le SecureWheelSpinner ralentit-il les performances ?

**R**: Non. Le calcul du hash SHA-256 prend < 1ms. L'impact sur les performances est négligeable.

### Q: Dois-je utiliser la distribution temporelle pour toutes les campagnes ?

**R**: Non. Elle est recommandée pour :
- Campagnes > 7 jours
- Lots en quantité limitée
- Volume élevé de participants

Pour les campagnes courtes (< 3 jours), elle est optionnelle.

### Q: Comment stocker les audit logs en base de données ?

**R**: Créez une table `audit_logs` avec les colonnes du type `ComprehensiveAuditLog`. Exemple SQL :

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  campaign_id UUID NOT NULL,
  participant_id TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  prize_id UUID,
  segment_id TEXT NOT NULL,
  is_winner BOOLEAN NOT NULL,
  proof JSONB,
  signature TEXT NOT NULL,
  verified BOOLEAN NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_audit_campaign ON audit_logs(campaign_id);
CREATE INDEX idx_audit_participant ON audit_logs(participant_email);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

### Q: Puis-je personnaliser le client seed ?

**R**: Oui ! Permettez aux joueurs de choisir leur propre seed :

```typescript
const playerSeed = prompt('Enter your lucky seed (optional)');
const spinner = new SecureWheelSpinner(playerSeed || undefined);
```

### Q: Comment gérer le carry-over automatiquement ?

**R**: Utilisez un cron job qui s'exécute à minuit :

```typescript
// Cron job quotidien à 00:00
cron.schedule('0 0 * * *', async () => {
  const activeCampaigns = await getActiveCampaigns();
  
  for (const campaign of activeCampaigns) {
    const temporal = new TemporalDistribution(campaign.temporalConfig);
    temporal.applyCarryOver(new Date());
  }
});
```

### Q: Les preuves sont-elles stockées indéfiniment ?

**R**: C'est à vous de décider. Recommandations :
- **Minimum**: Durée de la campagne + 6 mois
- **Optimal**: 2 ans (conformité légale)
- **Archivage**: Après 2 ans, compresser et archiver

### Q: Comment afficher la preuve aux joueurs ?

**R**: Créez une page de vérification :

```typescript
<div className="proof-display">
  <h3>🔐 Proof of Fairness</h3>
  <div>
    <strong>Server Seed Hash:</strong> {proof.serverSeedHash}
  </div>
  <div>
    <strong>Client Seed:</strong> {proof.clientSeed}
  </div>
  <div>
    <strong>Nonce:</strong> {proof.nonce}
  </div>
  <div>
    <strong>Result Hash:</strong> {proof.resultHash}
  </div>
  <button onClick={() => verifyProof(proof)}>
    Verify Proof
  </button>
</div>
```

---

## 🎓 RESSOURCES SUPPLÉMENTAIRES

- [Audit complet du système](/AUDIT_PRIZE_ATTRIBUTION_SYSTEM.md)
- [Tests unitaires](/test/SecureWheelSpinner.test.ts)
- [Documentation API](/docs/API.md)
- [Standards Provably Fair](https://www.nsoft.com/news/provably-fair)

---

## 📞 SUPPORT

Pour toute question ou problème :
1. Consultez la FAQ ci-dessus
2. Vérifiez les tests unitaires pour des exemples
3. Contactez l'équipe de développement

---

**Version**: 2.0  
**Dernière mise à jour**: 10 Novembre 2025  
**Auteur**: Équipe Développement
