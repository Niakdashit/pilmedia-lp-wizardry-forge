# 🔐 GUIDE D'IMPLÉMENTATION - SÉCURITÉ CAMPAGNES PUBLIQUES

**Date**: 10 Novembre 2025  
**Priorité**: 🔴 CRITIQUE  
**Temps estimé**: 2-3 semaines

---

## 🎯 OBJECTIF

Sécuriser les campagnes publiques contre la fraude, assurer la conformité RGPD, et optimiser les performances.

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Phase 1: Sécurité Anti-Fraude (Semaine 1) 🔴

- [ ] Rate Limiting par IP/Email
- [ ] Device Fingerprinting
- [ ] Récupération vraie IP
- [ ] Contrainte unique participation
- [ ] Logs de sécurité

### Phase 2: Conformité RGPD (Semaine 2) 🟠

- [ ] Table consentements
- [ ] Bannière cookies
- [ ] Droit à l'oubli
- [ ] Export données utilisateur
- [ ] Politique de rétention

### Phase 3: Performance & Monitoring (Semaine 3) 🟡

- [ ] Cache Redis
- [ ] Monitoring Sentry
- [ ] Analytics events
- [ ] Optimisation requêtes
- [ ] CDN pour assets

---

## 🚀 IMPLÉMENTATION DÉTAILLÉE

### 1. Rate Limiting

Créer `/src/services/RateLimiter.ts`:

```typescript
import { supabase } from '@/lib/supabase';

interface RateLimitConfig {
  maxParticipationsPerDay: number;
  maxParticipationsPerHour: number;
  maxParticipationsPerIP: number;
}

export class RateLimiter {
  private static defaultConfig: RateLimitConfig = {
    maxParticipationsPerDay: 3,
    maxParticipationsPerHour: 1,
    maxParticipationsPerIP: 5
  };

  static async checkLimit(
    campaignId: string,
    email: string,
    ipAddress: string,
    config: Partial<RateLimitConfig> = {}
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // 1. Vérifier limite par email (24h)
    const emailCheck = await this.checkEmailLimit(
      campaignId,
      email,
      finalConfig.maxParticipationsPerDay
    );
    if (!emailCheck.allowed) return emailCheck;
    
    // 2. Vérifier limite par email (1h)
    const hourlyCheck = await this.checkHourlyLimit(
      campaignId,
      email,
      finalConfig.maxParticipationsPerHour
    );
    if (!hourlyCheck.allowed) return hourlyCheck;
    
    // 3. Vérifier limite par IP
    const ipCheck = await this.checkIPLimit(
      campaignId,
      ipAddress,
      finalConfig.maxParticipationsPerIP
    );
    if (!ipCheck.allowed) return ipCheck;
    
    return { allowed: true };
  }

  private static async checkEmailLimit(
    campaignId: string,
    email: string,
    maxCount: number
  ) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('user_email', email)
      .gte('created_at', oneDayAgo.toISOString());
    
    if (error) throw error;
    
    if (count && count >= maxCount) {
      return {
        allowed: false,
        reason: `Limite atteinte: ${maxCount} participations max par 24h`,
        retryAfter: this.getRetryAfter(oneDayAgo)
      };
    }
    
    return { allowed: true };
  }

  private static async checkHourlyLimit(
    campaignId: string,
    email: string,
    maxCount: number
  ) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('user_email', email)
      .gte('created_at', oneHourAgo.toISOString());
    
    if (error) throw error;
    
    if (count && count >= maxCount) {
      return {
        allowed: false,
        reason: `Trop rapide: ${maxCount} participation max par heure`,
        retryAfter: this.getRetryAfter(oneHourAgo)
      };
    }
    
    return { allowed: true };
  }

  private static async checkIPLimit(
    campaignId: string,
    ipAddress: string,
    maxCount: number
  ) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('ip_address', ipAddress)
      .gte('created_at', oneDayAgo.toISOString());
    
    if (error) throw error;
    
    if (count && count >= maxCount) {
      return {
        allowed: false,
        reason: `Limite IP atteinte: ${maxCount} participations max par IP`,
        retryAfter: this.getRetryAfter(oneDayAgo)
      };
    }
    
    return { allowed: true };
  }

  private static getRetryAfter(since: Date): number {
    const elapsed = Date.now() - since.getTime();
    const windowMs = 24 * 60 * 60 * 1000; // 24h
    return Math.ceil((windowMs - elapsed) / 1000); // Secondes
  }
}
```

### 2. Device Fingerprinting

Installer la dépendance:
```bash
npm install @fingerprintjs/fingerprintjs
```

Créer `/src/utils/deviceFingerprint.ts`:

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  try {
    // Initialiser une seule fois
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    const result = await fp.get();
    
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return 'unknown';
  }
}

export async function getDeviceInfo(): Promise<{
  fingerprint: string;
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
}> {
  const fingerprint = await getDeviceFingerprint();
  
  return {
    fingerprint,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
```

### 3. Récupération IP Côté Client

Créer `/src/utils/getClientIP.ts`:

```typescript
export async function getClientIP(): Promise<string> {
  try {
    // Utiliser un service tiers pour récupérer l'IP publique
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
}

// Alternative: utiliser Cloudflare
export function getCloudflareIP(): string | null {
  // Si derrière Cloudflare, l'IP est dans les headers
  // Ceci doit être géré côté serveur/edge function
  return null;
}
```

### 4. Intégration dans useParticipations

Modifier `/src/hooks/useParticipations.ts`:

```typescript
import { RateLimiter } from '@/services/RateLimiter';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { getClientIP } from '@/utils/getClientIP';

export const useParticipations = () => {
  const createParticipation = async (participation: {
    campaign_id: string;
    user_email: string;
    form_data: Record<string, any>;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Récupérer IP et fingerprint
      const [ipAddress, deviceFingerprint] = await Promise.all([
        getClientIP(),
        getDeviceFingerprint()
      ]);
      
      console.log('🔐 Security check:', { ipAddress, deviceFingerprint });
      
      // 2. Vérifier rate limiting
      const rateLimitCheck = await RateLimiter.checkLimit(
        participation.campaign_id,
        participation.user_email,
        ipAddress
      );
      
      if (!rateLimitCheck.allowed) {
        throw new Error(rateLimitCheck.reason);
      }
      
      // 3. Valider les données
      const validation = participationSchema.safeParse({
        campaign_id: participation.campaign_id,
        user_email: participation.user_email,
        form_data: participation.form_data,
      });
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error.message}`);
      }

      // 4. Préparer les données avec sécurité
      const participationData = {
        ...validation.data,
        ip_address: ipAddress, // ✅ Vraie IP
        user_agent: navigator.userAgent,
        device_fingerprint: deviceFingerprint, // ✅ Nouveau
      };

      // 5. Insérer en base
      const { error } = await supabase
        .from('participations')
        .insert(participationData);
      
      if (error) {
        // Gérer erreur de contrainte unique
        if (error.code === '23505') {
          throw new Error('Vous avez déjà participé à cette campagne');
        }
        throw error;
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createParticipation, loading, error };
};
```

### 5. Migration Base de Données

Créer `/supabase/migrations/20251110120000_add_security_fields.sql`:

```sql
-- Ajouter device_fingerprint à participations
ALTER TABLE participations 
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- Modifier ip_address pour utiliser le bon type
ALTER TABLE participations 
ALTER COLUMN ip_address TYPE TEXT;

-- Index pour rate limiting
CREATE INDEX IF NOT EXISTS idx_participations_ip_created 
ON participations(campaign_id, ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_participations_email_created 
ON participations(campaign_id, user_email, created_at);

CREATE INDEX IF NOT EXISTS idx_participations_fingerprint 
ON participations(device_fingerprint);

-- Contrainte unique: 1 participation par email par campagne
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_participation 
ON participations(campaign_id, user_email)
WHERE user_email IS NOT NULL AND user_email != '';

-- Table pour logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'rate_limit', 'suspicious_activity', 'blocked'
  campaign_id UUID REFERENCES campaigns(id),
  ip_address TEXT,
  device_fingerprint TEXT,
  email TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_logs_created ON security_logs(created_at);
CREATE INDEX idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX idx_security_logs_email ON security_logs(email);
```

---

## 📊 RÉSULTAT ATTENDU

Après implémentation complète:

| Aspect | Avant | Après | Amélioration |
|--------|-------|-------|--------------|
| Anti-fraude | 2/10 | 9/10 | +350% |
| Sécurité | 6/10 | 9/10 | +50% |
| RGPD | 6/10 | 9/10 | +50% |
| **Score Global** | **5.8/10** | **9.0/10** | **+55%** |

---

## 🧪 TESTS

Créer `/test/RateLimiter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../src/services/RateLimiter';

describe('RateLimiter', () => {
  it('should allow first participation', async () => {
    const result = await RateLimiter.checkLimit(
      'campaign-1',
      'test@example.com',
      '192.168.1.1'
    );
    
    expect(result.allowed).toBe(true);
  });

  it('should block after max participations', async () => {
    // Simuler 3 participations
    for (let i = 0; i < 3; i++) {
      await createTestParticipation();
    }
    
    const result = await RateLimiter.checkLimit(
      'campaign-1',
      'test@example.com',
      '192.168.1.1'
    );
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Limite atteinte');
  });
});
```

---

**Prochaine étape**: Implémenter Phase 1 (Rate Limiting) cette semaine !
