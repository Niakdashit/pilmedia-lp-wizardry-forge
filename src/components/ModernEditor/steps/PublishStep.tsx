
import React, { useState } from 'react';
import { Share2, Copy, ExternalLink } from 'lucide-react';

interface PublishStepProps {
  campaign: any;
  onPrev?: () => void;
}

const PublishStep: React.FC<PublishStepProps> = ({
  campaign,
  onPrev
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublished(true);
    setIsPublishing(false);
  };

  const campaignUrl = `https://campaign.example.com/${campaign.id || 'demo'}`;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Share2 className="w-6 h-6 mr-2 text-[#841b60]" />
            Publication et partage
          </h2>
          <p className="text-gray-600">Publiez votre campagne et partagez-la avec votre audience</p>
        </div>

        {!isPublished ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Prêt à publier</h3>
              <p className="text-blue-700 text-sm">
                Votre campagne "{campaign.name}" est prête à être publiée. 
                Une fois publiée, elle sera accessible via un lien unique.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50"
              >
                {isPublishing ? 'Publication en cours...' : 'Publier la campagne'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-2">🎉 Campagne publiée !</h3>
              <p className="text-green-700 text-sm">
                Votre campagne est maintenant en ligne et accessible via le lien ci-dessous.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien de la campagne
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={campaignUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                />
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Précédent
          </button>
          {isPublished && (
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
              Voir les statistiques
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishStep;
