/**
 * Service d'intégration entre le système de dotation et le Scratch Card
 * Détermine les cartes gagnantes ou perdantes selon la configuration
 */

import { wheelDotationIntegration, WheelSpinParams } from './WheelDotationIntegration';

export interface ScratchCard {
  id: string;
  imageUrl?: string;
  isWinning: boolean;
  prize?: any;
}

export interface ScratchResult {
  shouldWin: boolean;
  cards: ScratchCard[];
  winningCard?: ScratchCard;
  prize?: any;
  reason: string;
}

class ScratchDotationIntegration {

  /**
   * Détermine les cartes du scratch selon le système de dotation
   * @param params - Paramètres du participant
   * @param totalCards - Nombre total de cartes (généralement 3)
   * @param cardImages - Images disponibles pour les cartes
   */
  async determineScratchResult(
    params: WheelSpinParams,
    totalCards: number = 3,
    cardImages?: string[]
  ): Promise<ScratchResult> {
    try {
      console.log('🎴 [ScratchDotation] Determining scratch result for:', params);

      // Utiliser le même système que la roue
      const spinResult = await wheelDotationIntegration.determineWheelSpin(params);

      console.log('🎲 [ScratchDotation] Spin result:', spinResult);

      if (spinResult.shouldWin && spinResult.prize) {
        // GAGNANT : Une carte gagnante parmi les cartes
        const cards = this.createWinningCards(totalCards, spinResult.prize, cardImages);
        
        console.log('✅ [ScratchDotation] Winner! Prize:', spinResult.prize.name);

        return {
          shouldWin: true,
          cards,
          winningCard: cards.find(c => c.isWinning),
          prize: spinResult.prize,
          reason: spinResult.reason
        };
      } else {
        // PERDANT : Toutes les cartes sont perdantes
        const cards = this.createLosingCards(totalCards, cardImages);
        
        console.log('❌ [ScratchDotation] Loser! Reason:', spinResult.reason);

        return {
          shouldWin: false,
          cards,
          reason: spinResult.reason
        };
      }
    } catch (error) {
      console.error('❌ [ScratchDotation] Error determining scratch:', error);
      
      // En cas d'erreur, retourner des cartes perdantes
      return {
        shouldWin: false,
        cards: this.createLosingCards(totalCards, cardImages),
        reason: 'ERROR_SYSTEM'
      };
    }
  }

  /**
   * Crée les cartes avec une carte gagnante
   */
  private createWinningCards(
    totalCards: number,
    prize: any,
    cardImages?: string[]
  ): ScratchCard[] {
    const cards: ScratchCard[] = [];
    
    // Position aléatoire pour la carte gagnante (0 à totalCards-1)
    const winningPosition = Math.floor(Math.random() * totalCards);
    
    for (let i = 0; i < totalCards; i++) {
      const isWinning = i === winningPosition;
      
      cards.push({
        id: `card-${i}`,
        imageUrl: this.getCardImage(i, isWinning, prize, cardImages),
        isWinning,
        prize: isWinning ? prize : undefined
      });
    }
    
    console.log('🎴 [ScratchDotation] Created winning cards:', {
      totalCards,
      winningPosition,
      prizeName: prize.name
    });
    
    return cards;
  }

  /**
   * Crée des cartes toutes perdantes
   */
  private createLosingCards(
    totalCards: number,
    cardImages?: string[]
  ): ScratchCard[] {
    const cards: ScratchCard[] = [];
    
    for (let i = 0; i < totalCards; i++) {
      cards.push({
        id: `card-${i}`,
        imageUrl: this.getCardImage(i, false, null, cardImages),
        isWinning: false
      });
    }
    
    console.log('🎴 [ScratchDotation] Created losing cards:', { totalCards });
    
    return cards;
  }

  /**
   * Obtient l'image pour une carte
   */
  private getCardImage(
    index: number,
    isWinning: boolean,
    prize: any,
    cardImages?: string[]
  ): string | undefined {
    // 1️⃣ Si le lot a une image configurée et c'est une carte gagnante
    if (isWinning && prize?.imageUrl) {
      return prize.imageUrl;
    }

    // 2️⃣ Si le lot a une image de carte gagnante dans metadata
    if (isWinning && prize?.metadata?.winningCardImage) {
      return prize.metadata.winningCardImage;
    }

    // 3️⃣ Utiliser les images fournies
    if (cardImages && cardImages.length > 0) {
      return cardImages[index % cardImages.length];
    }

    // 4️⃣ Pas d'image (le composant utilisera une image par défaut)
    return undefined;
  }

  /**
   * Vérifie si une carte spécifique est gagnante
   * Utile pour les interactions utilisateur
   */
  isCardWinning(cardId: string, result: ScratchResult): boolean {
    const card = result.cards.find(c => c.id === cardId);
    return card?.isWinning || false;
  }

  /**
   * Obtient le lot associé à une carte
   */
  getPrizeForCard(cardId: string, result: ScratchResult): any | null {
    const card = result.cards.find(c => c.id === cardId);
    return card?.prize || null;
  }
}

// Export singleton instance
export const scratchDotationIntegration = new ScratchDotationIntegration();
