# 🔍 AUDIT COMPLET - CAMPAGNES PUBLIQUES

**Date**: 10 Novembre 2025  
**Périmètre**: Fonctionnement des campagnes en production (côté public)  
**Objectif**: Identifier tous les points critiques de sécurité, performance et conformité

---

## 📊 RÉSUMÉ EXÉCUTIF

### Score Global: **5.8/10** ⚠️

**Points critiques identifiés**: 12  
**Recommandations prioritaires**: 8  
**Conformité RGPD**: ⚠️ Partielle

---

## 1. SÉCURITÉ ET ANTI-FRAUDE

### 1.1 Protection Anti-Fraude ❌ **2/10**

#### État Actuel
```typescript
// SecurityPanel.tsx - UI SEULEMENT, pas d'implémentation
- Limitation par IP: UI présente, AUCUNE logique backend
- Empreinte device: UI présente, AUCUNE logique
- CAPTCHA: UI présente, AUCUNE intégration
- Géolocalisation: UI présente, AUCUNE vérification
```

#### Problèmes Critiques
1. **Aucune limitation de participations par IP**
   - Un utilisateur peut participer 1000x avec le même email
   - Pas de détection de bots
   
2. **Pas de device fingerprinting**
   - Impossible de détecter les multi-comptes
   - Pas de tracking des devices suspects

3. **Pas de CAPTCHA**
   - Vulnérable aux attaques automatisées
   - Bots peuvent spammer les participations

4. **Pas de géolocalisation**
   - Impossible de restreindre par pays
   - Pas de conformité avec les lois locales

#### Recommandations CRITIQUES

**A. Implémenter Rate Limiting**
```typescript
// services/RateLimiter.ts
export class RateLimiter {
  private static participations = new Map<string, number[]>();
  
  static async checkParticipationLimit(
    campaignId: string,
    ipAddress: string,
    email: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const key = `${campaignId}:${ipAddress}:${email}`;
    const now = Date.now();
    const window = 24 * 60 * 60 * 1000; // 24h
    
    // Récupérer les participations récentes
    const recent = this.participations.get(key) || [];
    const validParticipations = recent.filter(t => now - t < window);
    
    // Limite: 3 participations par IP/email par campagne par 24h
    if (validParticipations.length >= 3) {
      return {
        allowed: false,
        reason: 'Limite de participations atteinte (3 max par 24h)'
      };
    }
    
    // Enregistrer la participation
    validParticipations.push(now);
    this.participations.set(key, validParticipations);
    
    return { allowed: true };
  }
}
```

**B. Ajouter Device Fingerprinting**
```typescript
// utils/deviceFingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getDeviceFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
```

**C. Intégrer reCAPTCHA v3**
```typescript
// components/forms/DynamicContactForm.tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const { executeRecaptcha } = useGoogleReCaptcha();

const handleSubmit = async (data) => {
  // Vérifier reCAPTCHA
  const token = await executeRecaptcha('submit_form');
  
  // Envoyer au backend pour vérification
  const verification = await verifyRecaptcha(token);
  if (verification.score < 0.5) {
    throw new Error('Vérification échouée - activité suspecte');
  }
  
  // Continuer la soumission
};
```

---

### 1.2 Validation des Données ⚠️ **6/10**

#### État Actuel
```typescript
// useParticipations.ts - Validation Zod présente
const validation = participationSchema.safeParse({
  campaign_id, user_email, form_data, ...
});
```

#### Problèmes
1. **Validation email basique uniquement**
   - Pas de vérification de domaine jetable
   - Pas de vérification DNS MX
   
2. **Pas de sanitization des inputs**
   - Risque XSS dans form_data
   - Pas de protection contre injection

3. **IP address hardcodée**
   ```typescript
   const ip_address = '127.0.0.1'; // ❌ FAUX - toujours localhost
   ```

#### Recommandations

**A. Améliorer validation email**
```typescript
// utils/emailValidation.ts
import { isDisposableEmail } from 'disposable-email-domains';

export async function validateEmail(email: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  // 1. Format basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Format invalide' };
  }
  
  // 2. Domaine jetable
  const domain = email.split('@')[1];
  if (isDisposableEmail(domain)) {
    return { valid: false, reason: 'Email jetable non autorisé' };
  }
  
  // 3. Vérification DNS MX (optionnel)
  try {
    const hasMX = await checkMXRecords(domain);
    if (!hasMX) {
      return { valid: false, reason: 'Domaine invalide' };
    }
  } catch (e) {
    // Ignorer si vérification DNS échoue
  }
  
  return { valid: true };
}
```

**B. Récupérer vraie IP**
```typescript
// utils/getClientIP.ts
export function getClientIP(request: Request): string {
  // Vérifier headers proxy
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  
  // Fallback (Cloudflare)
  return request.headers.get('cf-connecting-ip') || 'unknown';
}
```

**C. Sanitizer les inputs**
```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Nettoyer HTML/scripts
      sanitized[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // Pas de HTML
        ALLOWED_ATTR: []
      });
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

---

## 2. CONFORMITÉ RGPD ⚠️ **6/10**

### 2.1 Consentement et Transparence

#### État Actuel
```typescript
// SecurityPanel.tsx - UI pour RGPD présente
- Consentement explicite: UI présente
- Politique de confidentialité: UI présente
- Droit à l'oubli: UI présente
```

#### Problèmes
1. **Pas de bannière de consentement cookies**
2. **Pas de tracking du consentement en base**
3. **Pas d'implémentation du droit à l'oubli**
4. **Pas de politique de rétention des données**

#### Recommandations

**A. Ajouter table consentements**
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID REFERENCES participations(id),
  email TEXT NOT NULL,
  consent_type TEXT NOT NULL, -- 'data_processing', 'marketing', 'cookies'
  consented BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_consents_email ON user_consents(email);
CREATE INDEX idx_consents_participation ON user_consents(participation_id);
```

**B. Implémenter droit à l'oubli**
```typescript
// services/GDPRService.ts
export class GDPRService {
  static async deleteUserData(email: string): Promise<void> {
    // 1. Anonymiser les participations
    await supabase
      .from('participations')
      .update({
        user_email: 'anonymized@deleted.com',
        form_data: { anonymized: true },
        user_agent: null,
        user_ip: null
      })
      .eq('user_email', email);
    
    // 2. Supprimer les consentements
    await supabase
      .from('user_consents')
      .delete()
      .eq('email', email);
    
    // 3. Logger la suppression
    await supabase
      .from('gdpr_deletions')
      .insert({
        email,
        deleted_at: new Date(),
        reason: 'user_request'
      });
  }
  
  static async exportUserData(email: string): Promise<any> {
    // Exporter toutes les données utilisateur
    const participations = await supabase
      .from('participations')
      .select('*')
      .eq('user_email', email);
    
    const consents = await supabase
      .from('user_consents')
      .select('*')
      .eq('email', email);
    
    return {
      email,
      participations: participations.data,
      consents: consents.data,
      exported_at: new Date()
    };
  }
}
```

---

## 3. PERFORMANCE ET SCALABILITÉ ⚠️ **7/10**

### 3.1 Gestion de la Charge

#### Problèmes Potentiels
1. **Pas de cache pour les campagnes publiques**
2. **Requêtes non optimisées**
3. **Pas de CDN pour les assets**
4. **Pas de pagination pour les participations**

#### Recommandations

**A. Implémenter cache Redis**
```typescript
// services/CampaignCache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CampaignCache {
  static async getCampaign(id: string): Promise<Campaign | null> {
    // 1. Vérifier cache
    const cached = await redis.get(`campaign:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 2. Récupérer de la DB
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      // 3. Mettre en cache (TTL 5 min)
      await redis.setex(
        `campaign:${id}`,
        300,
        JSON.stringify(data)
      );
    }
    
    return data;
  }
  
  static async invalidate(id: string): Promise<void> {
    await redis.del(`campaign:${id}`);
  }
}
```

**B. Optimiser requêtes**
```typescript
// Avant - N+1 queries
const participations = await supabase
  .from('participations')
  .select('*, campaigns(*)') // ❌ Joint inutile
  .eq('campaign_id', id);

// Après - 1 query optimisée
const participations = await supabase
  .from('participations')
  .select('id, user_email, created_at, form_data')
  .eq('campaign_id', id)
  .order('created_at', { ascending: false })
  .limit(100); // Pagination
```

---

## 4. MONITORING ET ANALYTICS ❌ **3/10**

### 4.1 Tracking des Événements

#### État Actuel
- ❌ Pas de tracking des conversions
- ❌ Pas de funnel analytics
- ❌ Pas de monitoring des erreurs
- ❌ Pas d'alertes en temps réel

#### Recommandations

**A. Implémenter Event Tracking**
```typescript
// services/Analytics.ts
export class Analytics {
  static trackEvent(event: {
    type: 'page_view' | 'form_start' | 'form_submit' | 'game_start' | 'game_complete';
    campaignId: string;
    userId?: string;
    metadata?: Record<string, any>;
  }): void {
    // 1. Google Analytics
    if (window.gtag) {
      window.gtag('event', event.type, {
        campaign_id: event.campaignId,
        ...event.metadata
      });
    }
    
    // 2. Enregistrer en base pour analytics internes
    supabase.from('analytics_events').insert({
      event_type: event.type,
      campaign_id: event.campaignId,
      user_id: event.userId,
      metadata: event.metadata,
      timestamp: new Date()
    });
  }
}
```

**B. Monitoring des erreurs**
```typescript
// utils/errorMonitoring.ts
import * as Sentry from '@sentry/react';

export function initErrorMonitoring(): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0
  });
}

export function logError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context
  });
}
```

---

## 5. EXPÉRIENCE UTILISATEUR ⚠️ **7/10**

### 5.1 Gestion des Erreurs

#### Problèmes
1. **Messages d'erreur génériques**
2. **Pas de retry automatique**
3. **Pas de mode offline**

#### Recommandations

**A. Messages d'erreur contextuels**
```typescript
// utils/errorMessages.ts
export function getErrorMessage(error: any): string {
  if (error.code === 'PGRST116') {
    return 'Cette campagne n\'existe plus ou a été supprimée';
  }
  
  if (error.message?.includes('duplicate')) {
    return 'Vous avez déjà participé à cette campagne';
  }
  
  if (error.message?.includes('rate limit')) {
    return 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
  }
  
  return 'Une erreur est survenue. Veuillez réessayer';
}
```

**B. Retry automatique**
```typescript
// utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Backoff exponentiel: 1s, 2s, 4s
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries reached');
}
```

---

## 6. SÉCURITÉ BASE DE DONNÉES ⚠️ **7/10**

### 6.1 Row Level Security (RLS)

#### État Actuel
```sql
-- participations - RLS activé ✅
- Lecture: Propriétaires uniquement ✅
- Insertion: Tous (anon + auth) ✅
- Update: Propriétaires uniquement ✅
```

#### Problèmes
1. **Pas de limite sur les insertions anonymes**
2. **Pas de validation côté base**
3. **Pas d'audit trail des modifications**

#### Recommandations

**A. Ajouter contraintes SQL**
```sql
-- Limite: 1 participation par email par campagne
CREATE UNIQUE INDEX idx_unique_participation 
ON participations(campaign_id, user_email)
WHERE user_email IS NOT NULL;

-- Validation email format
ALTER TABLE participations 
ADD CONSTRAINT check_email_format 
CHECK (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

**B. Audit trail**
```sql
CREATE TABLE participation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID REFERENCES participations(id),
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour audit automatique
CREATE OR REPLACE FUNCTION audit_participation_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO participation_audit (
    participation_id,
    action,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER participation_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON participations
FOR EACH ROW EXECUTE FUNCTION audit_participation_changes();
```

---

## 📋 PLAN D'ACTION PRIORITAIRE

### 🔴 URGENT (Semaine 1)
1. ✅ Implémenter Rate Limiting par IP/Email
2. ✅ Ajouter Device Fingerprinting
3. ✅ Corriger récupération IP (actuellement hardcodée)
4. ✅ Ajouter contrainte unique email/campagne

### 🟠 IMPORTANT (Semaine 2-3)
5. ✅ Intégrer reCAPTCHA v3
6. ✅ Améliorer validation email (domaines jetables)
7. ✅ Implémenter droit à l'oubli RGPD
8. ✅ Ajouter table consentements

### 🟡 MOYEN TERME (Mois 1)
9. ✅ Implémenter cache Redis
10. ✅ Ajouter monitoring Sentry
11. ✅ Créer analytics events
12. ✅ Optimiser requêtes DB

---

## 📊 SCORES DÉTAILLÉS

| Catégorie | Score | Priorité |
|-----------|-------|----------|
| Anti-fraude | 2/10 | 🔴 CRITIQUE |
| Validation données | 6/10 | 🟠 HAUTE |
| RGPD | 6/10 | 🟠 HAUTE |
| Performance | 7/10 | 🟡 MOYENNE |
| Monitoring | 3/10 | 🔴 CRITIQUE |
| UX | 7/10 | 🟡 MOYENNE |
| Sécurité DB | 7/10 | 🟡 MOYENNE |

**Score Global**: **5.8/10** ⚠️

---

**Conclusion**: Le système fonctionne mais nécessite des améliorations critiques en sécurité et conformité avant un déploiement à grande échelle.
