/**
 * Wrapper pour ScratchCard avec intégration du système de dotation
 */

import React, { useState, useEffect } from 'react';
import { ScratchCard } from './ScratchCard';
import { ScratchCardProps } from './types';
import { scratchCardDotationIntegration } from '@/services/ScratchCardDotationIntegration';

interface ScratchCardWrapperProps extends Omit<ScratchCardProps, 'revealContent'> {
  campaign?: any;
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
  
  // Contenu gagnant
  winningContent?: {
    text?: string;
    imageUrl?: string;
    customContent?: React.ReactNode;
  };
  
  // Contenu perdant
  losingContent?: {
    text?: string;
    imageUrl?: string;
    customContent?: React.ReactNode;
  };
  
  // Fallback si dotation désactivée
  defaultContent?: React.ReactNode;
}

export const ScratchCardWrapper: React.FC<ScratchCardWrapperProps> = ({
  campaign,
  participantEmail,
  participantId,
  useDotationSystem = false,
  winningContent,
  losingContent,
  defaultContent,
  onComplete,
  ...scratchCardProps
}) => {
  const [revealContent, setRevealContent] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scratchResult, setScratchResult] = useState<any>(null);

  useEffect(() => {
    const determineContent = async () => {
      console.log('🎫 [ScratchCardWrapper] Determining content', {
        useDotationSystem,
        hasCampaign: !!campaign,
        hasEmail: !!participantEmail
      });

      if (useDotationSystem && campaign?.id && participantEmail) {
        try {
          setIsLoading(true);
          
          const result = await scratchCardDotationIntegration.determineScratchResult(
            {
              campaignId: campaign.id,
              participantEmail,
              participantId,
              userAgent: navigator.userAgent
            },
            winningContent,
            losingContent
          );

          console.log('🎲 [ScratchCardWrapper] Dotation result:', result);
          
          setScratchResult(result);

          // Construire le contenu à révéler
          if (result.imageUrl) {
            setRevealContent(
              <div className="flex flex-col items-center justify-center h-full p-4">
                <img 
                  src={result.imageUrl} 
                  alt={result.shouldWin ? 'Gagné' : 'Perdu'}
                  className="max-w-full max-h-32 object-contain mb-4"
                />
                <p className={`text-lg font-bold text-center ${result.shouldWin ? 'text-green-600' : 'text-gray-600'}`}>
                  {result.content}
                </p>
                {result.prize && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {result.prize.description || result.prize.name}
                  </p>
                )}
              </div>
            );
          } else {
            setRevealContent(
              <div className="flex items-center justify-center h-full p-4">
                <p className={`text-xl font-bold text-center ${result.shouldWin ? 'text-green-600' : 'text-gray-600'}`}>
                  {result.content}
                </p>
              </div>
            );
          }
        } catch (error) {
          console.error('❌ [ScratchCardWrapper] Error determining content:', error);
          
          // Fallback en cas d'erreur
          setRevealContent(
            defaultContent || (
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-lg text-gray-600">Grattez pour découvrir !</p>
              </div>
            )
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        // Mode sans dotation
        console.log('🎲 [ScratchCardWrapper] Using default content (no dotation)');
        
        setRevealContent(
          defaultContent || (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-lg text-gray-600">Grattez pour découvrir !</p>
            </div>
          )
        );
        setIsLoading(false);
      }
    };

    determineContent();
  }, [campaign, participantEmail, participantId, useDotationSystem, winningContent, losingContent, defaultContent]);

  const handleComplete = (percentage: number) => {
    console.log('✅ [ScratchCardWrapper] Scratch completed:', {
      percentage,
      result: scratchResult
    });

    // Appeler le callback original
    onComplete?.(percentage);
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width: scratchCardProps.width || 300, height: scratchCardProps.height || 200 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ScratchCard
      {...scratchCardProps}
      revealContent={revealContent}
      onComplete={handleComplete}
    />
  );
};

export default ScratchCardWrapper;
