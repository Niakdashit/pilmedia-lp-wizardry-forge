/**
 * Service d'intégration entre le système de dotation et les Cartes à Gratter
 * Détermine l'image/contenu gagnant ou perdant selon la configuration
 */

import { wheelDotationIntegration, WheelSpinParams } from './WheelDotationIntegration';

export interface ScratchCardResult {
  shouldWin: boolean;
  content: React.ReactNode | string;
  imageUrl?: string;
  prize?: any;
  reason: string;
}

class ScratchCardDotationIntegration {

  /**
   * Détermine le contenu de la carte à gratter selon le système de dotation
   */
  async determineScratchResult(
    params: WheelSpinParams,
    winningContent?: {
      text?: string;
      imageUrl?: string;
      customContent?: React.ReactNode;
    },
    losingContent?: {
      text?: string;
      imageUrl?: string;
      customContent?: React.ReactNode;
    }
  ): Promise<ScratchCardResult> {
    try {
      console.log('🎫 [ScratchCardDotation] Determining scratch result for:', params);

      // Utiliser le même système que la roue
      const spinResult = await wheelDotationIntegration.determineWheelSpin(params);

      console.log('🎲 [ScratchCardDotation] Spin result:', spinResult);

      if (spinResult.shouldWin && spinResult.prize) {
        // GAGNANT : Afficher le contenu gagnant
        const content = this.getWinningContent(spinResult.prize, winningContent);
        
        console.log('✅ [ScratchCardDotation] Winner! Content:', content);

        return {
          shouldWin: true,
          content: content.content,
          imageUrl: content.imageUrl,
          prize: spinResult.prize,
          reason: spinResult.reason
        };
      } else {
        // PERDANT : Afficher le contenu perdant
        const content = this.getLosingContent(losingContent);
        
        console.log('❌ [ScratchCardDotation] Loser! Content:', content);

        return {
          shouldWin: false,
          content: content.content,
          imageUrl: content.imageUrl,
          reason: spinResult.reason
        };
      }
    } catch (error) {
      console.error('❌ [ScratchCardDotation] Error determining scratch:', error);
      
      // En cas d'erreur, retourner le contenu perdant
      return {
        shouldWin: false,
        content: this.getLosingContent(losingContent).content,
        reason: 'ERROR_SYSTEM'
      };
    }
  }

  /**
   * Récupère le contenu gagnant
   * Priorité : 1. Image du lot, 2. Contenu personnalisé, 3. Texte par défaut
   */
  private getWinningContent(
    prize: any,
    winningContent?: {
      text?: string;
      imageUrl?: string;
      customContent?: React.ReactNode;
    }
  ): { content: React.ReactNode | string; imageUrl?: string } {
    // 1. Si le lot a une image
    if (prize.imageUrl) {
      return {
        content: prize.name || 'Félicitations !',
        imageUrl: prize.imageUrl
      };
    }

    // 2. Si un contenu personnalisé est fourni
    if (winningContent?.customContent) {
      return {
        content: winningContent.customContent,
        imageUrl: winningContent.imageUrl
      };
    }

    // 3. Si une image gagnante est configurée
    if (winningContent?.imageUrl) {
      return {
        content: winningContent.text || prize.name || 'Félicitations !',
        imageUrl: winningContent.imageUrl
      };
    }

    // 4. Texte par défaut
    return {
      content: winningContent?.text || prize.name || '🎉 Félicitations ! Vous avez gagné !'
    };
  }

  /**
   * Récupère le contenu perdant
   */
  private getLosingContent(
    losingContent?: {
      text?: string;
      imageUrl?: string;
      customContent?: React.ReactNode;
    }
  ): { content: React.ReactNode | string; imageUrl?: string } {
    // 1. Si un contenu personnalisé est fourni
    if (losingContent?.customContent) {
      return {
        content: losingContent.customContent,
        imageUrl: losingContent.imageUrl
      };
    }

    // 2. Si une image perdante est configurée
    if (losingContent?.imageUrl) {
      return {
        content: losingContent.text || 'Dommage !',
        imageUrl: losingContent.imageUrl
      };
    }

    // 3. Texte par défaut
    return {
      content: losingContent?.text || '😔 Dommage ! Tentez votre chance une prochaine fois.'
    };
  }
}

// Export singleton instance
export const scratchCardDotationIntegration = new ScratchCardDotationIntegration();
