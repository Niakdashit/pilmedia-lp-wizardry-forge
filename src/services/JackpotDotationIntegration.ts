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
    availableSymbols: string[]
  ): Promise<JackpotSpinResult> {
    try {
      console.log('🎰 [JackpotDotation] Determining spin result for:', params);

      // Utiliser le même système que la roue
      const spinResult = await wheelDotationIntegration.determineWheelSpin(params);

      console.log('🎲 [JackpotDotation] Spin result:', spinResult);

      if (spinResult.shouldWin && spinResult.prize) {
        // GAGNANT : 3 symboles identiques
        const winningSymbol = this.selectWinningSymbol(spinResult.prize, availableSymbols);
        
        console.log('✅ [JackpotDotation] Winner! Symbol:', winningSymbol);

        return {
          shouldWin: true,
          symbols: [winningSymbol, winningSymbol, winningSymbol],
          prize: spinResult.prize,
          reason: spinResult.reason
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
   * Peut être configuré dans le lot (metadata.winningSymbol)
   */
  private selectWinningSymbol(prize: any, availableSymbols: string[]): string {
    // Si le lot a un symbole spécifique configuré
    if (prize.metadata?.winningSymbol && availableSymbols.includes(prize.metadata.winningSymbol)) {
      return prize.metadata.winningSymbol;
    }

    // Si le lot a une image configurée
    if (prize.imageUrl) {
      return prize.imageUrl; // Utiliser l'URL de l'image comme symbole
    }

    // Sinon, choisir le premier symbole "premium" (💎, ⭐, 7️⃣)
    const premiumSymbols = ['💎', '⭐', '7️⃣'];
    const premiumSymbol = availableSymbols.find(s => premiumSymbols.includes(s));
    
    if (premiumSymbol) {
      return premiumSymbol;
    }

    // Fallback : premier symbole disponible
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
