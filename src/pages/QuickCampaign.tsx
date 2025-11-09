// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/shared/Spinner';
import { ArrowLeft, Sparkles, Target, Gamepad2, FileText, Trophy, Zap, PlayCircle } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import { useCampaigns } from '../hooks/useCampaigns';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: 'wheel' | 'jackpot' | 'quiz' | 'dice' | 'contest' | 'survey';
  icon: React.ReactNode;
  editorRoute: string;
  defaultConfig: Record<string, any>;
}

const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'wheel-basic',
    name: 'Roue de la Fortune',
    description: 'Campagne classique avec roue interactive',
    type: 'wheel',
    icon: <PlayCircle className="w-8 h-8 text-[#44444d]" />,
    editorRoute: '/design-editor',
    defaultConfig: {
      segments: [
        { label: 'Gagné!', color: '#44444d', probability: 20 },
        { label: 'Perdu', color: '#e5e7eb', probability: 80 }
      ]
    }
  },
  {
    id: 'quiz-interactive',
    name: 'Quiz Interactif',
    description: 'Évaluez les connaissances de vos visiteurs',
    type: 'quiz',
    icon: <Target className="w-8 h-8 text-[#44444d]" />,
    editorRoute: '/quiz-editor',
    defaultConfig: {
      questions: [
        {
          question: 'Quelle est votre couleur préférée?',
          answers: ['Rouge', 'Bleu', 'Vert', 'Jaune'],
          correct: 0
        }
      ]
    }
  },
  {
    id: 'scratch-card',
    name: 'Carte à Gratter',
    description: 'Découvrez instantanément vos gains',
    type: 'scratch',
    icon: <Zap className="w-8 h-8 text-[#44444d]" />,
    editorRoute: '/scratch-editor',
    defaultConfig: {
      prize: '10% de réduction'
    }
  },
  {
    id: 'jackpot-game',
    name: 'Jackpot',
    description: 'Tentez de gagner le jackpot ultime',
    type: 'jackpot',
    icon: <Trophy className="w-8 h-8 text-[#44444d]" />,
    editorRoute: '/jackpot-editor',
    defaultConfig: {
      jackpotAmount: 1000,
      basePrize: 50
    }
  },
  {
    id: 'contact-form',
    name: 'Formulaire de Contact',
    description: 'Collectez des informations clients',
    type: 'survey',
    icon: <FileText className="w-8 h-8 text-[#44444d]" />,
    editorRoute: '/form-editor',
    defaultConfig: {
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'text', required: true }
      ]
    }
  }
];

const QuickCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { saveCampaign, loading } = useCampaigns();
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');

  const handleCreateCampaign = async () => {
    if (!selectedTemplate || !campaignName.trim()) return;

    try {
      const campaignData = {
        name: campaignName.trim(),
        description: campaignDescription.trim(),
        type: selectedTemplate.type,
        status: 'draft' as const,
        config: selectedTemplate.defaultConfig,
        design: {},
        game_config: {},
        form_fields: []
      };

      const savedCampaign = await saveCampaign(campaignData);

      if (savedCampaign) {
        // Rediriger vers l'éditeur approprié avec l'ID de la campagne
        navigate(`${selectedTemplate.editorRoute}?campaign=${savedCampaign.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
    }
  };

  if (selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageContainer className="bg-transparent">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux templates
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-6">
                {selectedTemplate.icon}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h1>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la campagne *
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ex: Promotion Été 2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    placeholder="Décrivez brièvement votre campagne..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!campaignName.trim() || loading}
                    className="flex-1 bg-[#44444d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5a5a63] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        <span className="ml-2">Création...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Créer la campagne
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer className="bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Création rapide de campagne
            </h1>
            <p className="text-lg text-gray-600">
              Choisissez un template et commencez immédiatement à créer votre campagne interactive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#44444d] transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#44444d]/10 rounded-lg group-hover:bg-[#44444d]/20 transition-colors">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#44444d] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>

                <div className="text-center">
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-[#44444d] hover:text-white transition-colors">
                    Sélectionner
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/campaigns')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux campagnes
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default QuickCampaign;
