import React from 'react';
import DynamicContactForm, { type FieldConfig } from '../forms/DynamicContactForm';

interface ArticleConfig {
  banner?: { imageUrl?: string };
  title?: string;
  description?: string;
  cta?: { text?: string; style?: any };
  layout?: { maxWidth?: number };
}

interface ArticleCanvasProps {
  articleConfig: ArticleConfig;
  onBannerChange?: (imageUrl: string) => void;
  onBannerRemove?: () => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onCTAClick?: () => void;
  onFormSubmit?: (data: Record<string, string>) => void;
  onGameComplete?: () => void;
  currentStep?: 'article' | 'form' | 'game' | 'result';
  editable?: boolean;
  maxWidth?: number;
  campaignType?: string;
  formFields?: FieldConfig[];
  campaign?: any;
  wheelModalConfig?: any;
  gameModalConfig?: any;
}

const ArticleCanvas: React.FC<ArticleCanvasProps> = ({
  articleConfig,
  onCTAClick,
  onFormSubmit,
  onGameComplete,
  currentStep = 'article',
  editable = false,
  maxWidth = 810,
  campaignType = 'wheel',
  formFields,
  campaign,
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 'article':
        return (
          <div className="w-full max-w-[810px] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Bannière */}
            {articleConfig.banner?.imageUrl && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={articleConfig.banner.imageUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contenu */}
            <div className="p-8">
              {/* Titre */}
              {articleConfig.title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {articleConfig.title}
                </h1>
              )}

              {/* Description */}
              {articleConfig.description && (
                <div className="text-gray-700 mb-6 whitespace-pre-wrap">
                  {articleConfig.description}
                </div>
              )}

              {/* Bouton CTA */}
              <button
                onClick={onCTAClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                style={articleConfig.cta?.style}
              >
                {articleConfig.cta?.text || 'PARTICIPER'}
              </button>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="w-full max-w-[810px] bg-white rounded-lg shadow-lg overflow-hidden p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Remplissez le formulaire
            </h2>
            <DynamicContactForm
              fields={formFields || [
                { id: 'firstName', label: 'Prénom', type: 'text', required: true },
                { id: 'lastName', label: 'Nom', type: 'text', required: true },
                { id: 'email', label: 'Email', type: 'email', required: true },
                { id: 'phone', label: 'Téléphone', type: 'tel', required: false },
              ]}
              onSubmit={(data) => {
                console.log('📝 Form submitted:', data);
                onFormSubmit?.(data);
              }}
              submitButtonText="Valider"
            />
          </div>
        );

      case 'game':
        return (
          <div className="w-full max-w-[810px] bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {campaignType === 'wheel' && '🎡 Roue de la Fortune'}
              {campaignType === 'jackpot' && '🎰 Jackpot'}
              {campaignType === 'scratch' && '🎫 Carte à Gratter'}
              {campaignType === 'quiz' && '📝 Quiz'}
            </h2>
            <p className="text-gray-600 mb-6">
              Le jeu s'affiche ici...
            </p>
            <button
              onClick={onGameComplete}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Continuer
            </button>
          </div>
        );

      case 'result':
        return (
          <div className="w-full max-w-[810px] bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Merci d'avoir participé !
            </h2>
            <p className="text-gray-600">
              Vous recevrez une confirmation par email.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      {renderStep()}
    </div>
  );
};

export default ArticleCanvas;
