
import React from 'react';
import { Gamepad2, Trophy, Palette, Sparkles } from 'lucide-react';
import { GeneratedGameConcept } from '../../services/openAIGameGeneratorService';

interface GeneratedGamePreviewProps {
  gameConcept: GeneratedGameConcept;
}

const GeneratedGamePreview: React.FC<GeneratedGamePreviewProps> = ({ gameConcept }) => {
  const gameTypeIcons = {
    wheel: '🎡',
    quiz: '❓',
    scratch: '🎫',
    jackpot: '🎰',
    dice: '🎲',
    memory: '🧠',
    puzzle: '🧩'
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Generated Game Concept
      </h4>

      <div className="space-y-4">
        {/* Game Type & Name */}
        <div 
          className="p-4 rounded-lg border-2"
          style={{ 
            backgroundColor: gameConcept.colors.background,
            borderColor: gameConcept.colors.primary 
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{gameTypeIcons[gameConcept.gameType]}</span>
            <div>
              <h5 className="font-bold text-lg" style={{ color: gameConcept.colors.primary }}>
                {gameConcept.gameName}
              </h5>
              <p className="text-sm capitalize text-gray-600">
                {gameConcept.gameType} Game • {gameConcept.tone} Tone
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: gameConcept.colors.secondary }}>
            {gameConcept.theme}
          </p>
        </div>

        {/* Content */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Campaign Content</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Title:</strong> {gameConcept.content.title}</p>
            <p><strong>Description:</strong> {gameConcept.content.description}</p>
            <p><strong>CTA:</strong> {gameConcept.content.buttonText}</p>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Generated Colors
          </h5>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: gameConcept.colors.primary }}
              />
              <span className="text-xs text-gray-600">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: gameConcept.colors.secondary }}
              />
              <span className="text-xs text-gray-600">Secondary</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: gameConcept.colors.accent }}
              />
              <span className="text-xs text-gray-600">Accent</span>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Prizes
          </h5>
          <div className="text-sm text-gray-600">
            {gameConcept.gameConfig.prizes.slice(0, 3).map((prize, index) => (
              <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-2 mb-1">
                {prize}
              </span>
            ))}
          </div>
        </div>

        {/* Game Config Preview */}
        {gameConcept.gameType === 'wheel' && gameConcept.gameConfig.segments && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Wheel Segments</h5>
            <div className="space-y-1">
              {gameConcept.gameConfig.segments.slice(0, 4).map((segment, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-gray-600">{segment.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameConcept.gameType === 'quiz' && gameConcept.gameConfig.questions && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Sample Questions</h5>
            <div className="text-sm text-gray-600">
              {gameConcept.gameConfig.questions.slice(0, 2).map((q, index) => (
                <p key={index} className="mb-1">
                  <strong>Q{index + 1}:</strong> {q.question}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Design */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Design Style</h5>
          <div className="text-sm text-gray-600">
            <p><strong>Font:</strong> {gameConcept.design.fontFamily}</p>
            <p><strong>Style:</strong> {gameConcept.design.shadows ? 'With shadows' : 'Flat'}, {gameConcept.design.animations ? 'Animated' : 'Static'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedGamePreview;
