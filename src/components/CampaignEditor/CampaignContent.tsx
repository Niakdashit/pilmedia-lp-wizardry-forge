import React, { useState } from 'react';
import { Quiz, Scratch, Memory, Puzzle, Dice } from '../GameTypes';
import TabRoulette from '@/components/configurators/TabRoulette';
import TabJackpot from '@/components/configurators/TabJackpot';
import JackpotAppearance from '@/components/configurators/JackpotAppearance';
import ImageUpload from '../common/ImageUpload';
import GameCanvasPreview from './GameCanvasPreview';
import { Settings, Eye, Palette } from 'lucide-react';
import type { OptimizedCampaign, QuizQuestion } from '../ModernEditor/types/CampaignTypes';

interface CampaignContentProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const CampaignContent: React.FC<CampaignContentProps> = ({
  campaign,
  setCampaign,
}) => {
  const [activeSection, setActiveSection] = useState<'game' | 'visual'>('game');
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [previewQuestion, setPreviewQuestion] = useState<QuizQuestion | undefined>(
    campaign.gameConfig?.quiz?.questions?.[0]
  );

  const updateGameConfig = (gameType: string, config: unknown) => {
    setCampaign((prev) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        [gameType]: config,
      },
    }));
  };

  const getContentEditor = () => {
    switch (campaign.type) {
      case 'quiz':
        return (
          <Quiz
            isPreview={false}
            config={campaign.gameConfig?.quiz}
            onConfigChange={(config) => updateGameConfig('quiz', config)}
            activeQuestion={activeQuizQuestion}
            onActiveQuestionChange={setActiveQuizQuestion}
            onQuestionChange={setPreviewQuestion}
          />
        );
      case 'wheel':
        return <TabRoulette campaign={campaign} setCampaign={setCampaign} />;
      case 'scratch':
        return (
          <Scratch
            config={campaign.gameConfig?.scratch}
            onConfigChange={(config) => updateGameConfig('scratch', config)}
          />
        );
      case 'memory':
        return (
          <Memory
            config={campaign.gameConfig?.memory}
            onConfigChange={(config) => updateGameConfig('memory', config)}
          />
        );
      case 'puzzle':
        return (
          <Puzzle
            config={campaign.gameConfig?.puzzle}
            onConfigChange={(config) => updateGameConfig('puzzle', config)}
          />
        );
      case 'dice':
        return (
          <Dice
            config={campaign.gameConfig?.dice}
            onConfigChange={(config) => updateGameConfig('dice', config)}
          />
        );
      case 'jackpot':
        return <TabJackpot campaign={campaign} setCampaign={setCampaign} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500">
              Éditeur de contenu pour le type "{campaign.type}" en cours de développement.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#f9f0f5] border border-[#e9d0e5] rounded-lg p-4">
        <p className="text-[#841b60] text-sm">
          Configurez le contenu et l'apparence de votre {campaign.type}.
        </p>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('game')}
          className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
            activeSection === 'game'
              ? 'border-[#841b60] text-[#841b60]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuration du jeu</span>
        </button>
        <button
          onClick={() => setActiveSection('visual')}
          className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
            activeSection === 'visual'
              ? 'border-[#841b60] text-[#841b60]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Apparence visuelle</span>
        </button>
      </div>

      {activeSection === 'game' ? (
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-[#841b60]" />
              <h3 className="text-lg font-medium text-gray-900">Aperçu du jeu</h3>
            </div>
            <GameCanvasPreview
              campaign={{ ...campaign, activeQuizQuestion, previewQuestion }}
              gameSize={campaign.gameSize || 'large'}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres du jeu</h3>
            {getContentEditor()}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Si le type est jackpot, afficher JackpotAppearance */}
          {campaign.type === 'jackpot' ? (
            <JackpotAppearance campaign={campaign} setCampaign={setCampaign} />
          ) : (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-[#841b60]" />
                <h3 className="text-lg font-medium text-gray-900">Aperçu du jeu</h3>
              </div>
              <GameCanvasPreview
                campaign={{ ...campaign, activeQuizQuestion, previewQuestion }}
                gameSize={campaign.gameSize || 'large'}
              />

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Image de fond du jeu</h3>
                <ImageUpload
                  value={campaign.design.backgroundImage || ''}
                  onChange={(value) => {
                    setCampaign((prev) => ({
                      ...prev,
                      gameConfig: {
                        ...prev.gameConfig,
                        [campaign.type]: {
                          ...prev.gameConfig?.[campaign.type],
                          backgroundImage: value,
                        },
                      },
                    }));
                  }}
                  label="Téléchargez ou sélectionnez une image de fond pour votre jeu"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignContent;
