import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleEditorLayout from '@/components/ArticleEditor/ArticleEditorLayout';

interface ArticleEditorWrapperProps {
  campaignType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'dice' | 'memory' | 'puzzle';
}

/**
 * ArticleEditorWrapper - Page wrapper qui rend ArticleEditorLayout
 * 
 * Utilisé lorsque l'URL contient ?mode=article
 * Cette page est importée dynamiquement par les éditeurs existants
 * pour éviter de charger le code Article en mode fullscreen.
 */
const ArticleEditorWrapper: React.FC<ArticleEditorWrapperProps> = ({ campaignType }) => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id') || undefined;

  useEffect(() => {
    console.log('🎨 [ArticleEditorWrapper] Initialisation mode Article', {
      campaignType,
      campaignId,
    });
  }, [campaignType, campaignId]);

  return <ArticleEditorLayout campaignType={campaignType} campaignId={campaignId} />;
};

export default ArticleEditorWrapper;
