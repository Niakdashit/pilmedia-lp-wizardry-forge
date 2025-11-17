/**
 * Service d'intégration entre le système de dotation et le Jackpot
 * Détermine les symboles gagnants ou perdants selon la configuration
 */

import { wheelDotationIntegration, WheelSpinParams } from './WheelDotationIntegration';

export interface JackpotSpinResult {
  shouldWin: boolean;
  symbols: string[];
  prize?: any;
  reason: string;
}

class JackpotDotationIntegration {

  /**
   * Détermine les symboles du jackpot selon le système de dotation
   */
  async determineJackpotSpin(
    params: WheelSpinParams,
    availableSymbols: string[],
    symbolToPrizeMap?: Record<string, string>
  ): Promise<JackpotSpinResult> {
    try {
      console.log('🎰 [JackpotDotation] Determining spin result for:', params);

      // Utiliser le même système que la roue
      const spinResult = await wheelDotationIntegration.determineWheelSpin(params);

      console.log('🎲 [JackpotDotation] Spin result:', spinResult);

      // ⚠️ IMPORTANT
      // Pour la roue, on exige des segments assignés, donc WheelDotationIntegration
      // peut renvoyer shouldWin=false si le lot n'a pas de segments (raison PRIZE_NO_SEGMENTS)
      // même si le moteur d'attribution a effectivement accordé un lot.
      // Pour le jackpot, on ne dépend PAS des segments : on se base directement
      // sur le résultat d'attribution.
      const attribution = spinResult.attributionResult;
      const effectivePrize = attribution?.prize || spinResult.prize;
      const isWinner = !!(attribution?.isWinner && effectivePrize);

      if (isWinner && effectivePrize) {
        // GAGNANT : 3 symboles identiques
        const winningSymbol = this.selectWinningSymbol(effectivePrize, availableSymbols, symbolToPrizeMap);
        
        console.log('✅ [JackpotDotation] Winner! Symbol:', winningSymbol, 'Prize ID:', effectivePrize.id, 'reason:', spinResult.reason, 'attributionReason:', attribution?.reason);

        return {
          shouldWin: true,
          symbols: [winningSymbol, winningSymbol, winningSymbol],
          prize: effectivePrize,
          reason: attribution?.reason || spinResult.reason
        };
      } else {
        // PERDANT : 3 symboles différents
        const losingSymbols = this.selectLosingSymbols(availableSymbols);
        
        console.log('❌ [JackpotDotation] Loser! Symbols:', losingSymbols);

        return {
          shouldWin: false,
          symbols: losingSymbols,
          reason: spinResult.reason
        };
      }
    } catch (error) {
      console.error('❌ [JackpotDotation] Error determining spin:', error);
      
      // En cas d'erreur, retourner des symboles perdants
      return {
        shouldWin: false,
        symbols: this.selectLosingSymbols(availableSymbols),
        reason: 'ERROR_SYSTEM'
      };
    }
  }

  /**
   * Sélectionne le symbole gagnant
   * Priorité : symbolToPrizeMap > metadata.winningSymbol > premier symbole premium
   */
  private selectWinningSymbol(
    prize: any, 
    availableSymbols: string[], 
    symbolToPrizeMap?: Record<string, string>
  ): string {
    // 1️⃣ PRIORITÉ : Chercher dans le symbolToPrizeMap (prizeId -> symbol)
    if (symbolToPrizeMap && prize.id) {
      const mappedSymbol = symbolToPrizeMap[prize.id];
      if (mappedSymbol && availableSymbols.includes(mappedSymbol)) {
        console.log('🎯 [JackpotDotation] Found symbol from map:', mappedSymbol, 'for prize:', prize.id);
        return mappedSymbol;
      }
    }

    // 2️⃣ Si le lot a un symbole spécifique configuré dans metadata
    if (prize.metadata?.winningSymbol && availableSymbols.includes(prize.metadata.winningSymbol)) {
      return prize.metadata.winningSymbol;
    }

    // 3️⃣ Si le lot a une image configurée
    if (prize.imageUrl) {
      return prize.imageUrl; // Utiliser l'URL de l'image comme symbole
    }

    // 4️⃣ Sinon, choisir le premier symbole "premium" (💎, ⭐, 7️⃣)
    const premiumSymbols = ['💎', '⭐', '7️⃣'];
    const premiumSymbol = availableSymbols.find(s => premiumSymbols.includes(s));
    
    if (premiumSymbol) {
      return premiumSymbol;
    }

    // 5️⃣ Fallback : premier symbole disponible
    return availableSymbols[0] || '💎';
  }

  /**
   * Sélectionne 3 symboles différents pour une perte
   */
  private selectLosingSymbols(availableSymbols: string[]): string[] {
    if (availableSymbols.length < 3) {
      // Pas assez de symboles, utiliser les symboles par défaut
      return ['🍒', '🍋', '🍊'];
    }

    // Mélanger et prendre les 3 premiers (tous différents)
    const shuffled = [...availableSymbols].sort(() => Math.random() - 0.5);
    const symbols = [shuffled[0], shuffled[1], shuffled[2]];

    // S'assurer qu'ils sont tous différents
    if (symbols[0] === symbols[1]) symbols[1] = shuffled[3] || shuffled[0];
    if (symbols[1] === symbols[2]) symbols[2] = shuffled[4] || shuffled[1];
    if (symbols[0] === symbols[2]) symbols[2] = shuffled[5] || shuffled[2];

    return symbols;
  }
}

// Export singleton instance
export const jackpotDotationIntegration = new JackpotDotationIntegration();
