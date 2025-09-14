import React, { useState } from 'react';
import { WizardData } from '../ModernWizard';
import { CheckCircle, Rocket, Copy, ExternalLink, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PublishStepProps {
  wizardData: WizardData;
  prevStep: () => void;
}

const PublishStep: React.FC<PublishStepProps> = ({
  wizardData,
  prevStep
}) => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [campaignUrl] = useState(`https://campaign.leadya.com/${Date.now()}`);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publishing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPublishing(false);
    setIsPublished(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(campaignUrl);
  };

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Publication de votre campagne
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Votre campagne est prête ! Publiez-la pour commencer à collecter des participations.
          </p>
        </div>

        {/* Publish Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center mb-8">
          {isPublishing ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#951b6d]/10 rounded-full flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8 text-[#951b6d]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Publication en cours...</h3>
                <p className="text-gray-600">Votre campagne est en cours de déploiement</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#951b6d] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          ) : isPublished ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Campagne publiée avec succès !</h3>
                <p className="text-gray-600">Votre campagne est maintenant accessible à vos participants</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#951b6d]/10 rounded-full flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8 text-[#951b6d]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Prêt à publier</h3>
                <p className="text-gray-600">Votre campagne "{wizardData.productName || 'Ma Campagne'}" est configurée et prête</p>
              </div>
              <button
                onClick={handlePublish}
                className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md text-lg"
              >
                Publier maintenant
              </button>
            </div>
          )}
        </div>

        {/* Campaign URL */}
        {isPublished && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-[#141e29] mb-4">Lien de votre campagne</h3>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="text"
                value={campaignUrl}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-gray-700"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-[#951b6d] transition-colors"
                title="Copier le lien"
              >
                <Copy className="w-5 h-5" />
              </button>
              <a
                href={campaignUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-[#951b6d] transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {isPublished && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <h3 className="font-semibold text-[#141e29] mb-4">Prochaines étapes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#951b6d]/30 hover:bg-[#951b6d]/5 transition-colors"
              >
                <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center mb-3">
                  <Share className="w-4 h-4 text-[#951b6d]" />
                </div>
                <h4 className="font-medium text-[#141e29] mb-1">Gérer la campagne</h4>
                <p className="text-sm text-gray-600">Voir les statistiques et modifier les paramètres</p>
              </button>

              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#951b6d]/30 hover:bg-[#951b6d]/5 transition-colors">
                <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center mb-3">
                  <Share className="w-4 h-4 text-[#951b6d]" />
                </div>
                <h4 className="font-medium text-[#141e29] mb-1">Partager</h4>
                <p className="text-sm text-gray-600">Diffuser votre campagne sur vos canaux</p>
              </button>

              <button
                onClick={() => navigate('/quick-campaign')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#951b6d]/30 hover:bg-[#951b6d]/5 transition-colors"
              >
                <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center mb-3">
                  <Rocket className="w-4 h-4 text-[#951b6d]" />
                </div>
                <h4 className="font-medium text-[#141e29] mb-1">Nouvelle campagne</h4>
                <p className="text-sm text-gray-600">Créer une autre expérience interactive</p>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {!isPublished && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-[#841b60] hover:text-white transition-colors"
            >
              Retour
            </button>
          )}
          {isPublished && (
            <button
              onClick={() => navigate('/campaigns')}
              className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md ml-auto"
            >
              Voir mes campagnes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishStep;
