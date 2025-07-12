import React from 'react';
import { Code, Tag } from 'lucide-react';

interface QualifioCodeTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioCodeTab: React.FC<QualifioCodeTabProps> = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          CSS personnalisé
        </h3>
        
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Ajoutez votre CSS personnalisé ici
          </label>
          <textarea
            placeholder="/* Votre CSS personnalisé */
.custom-style {
  /* Styles personnalisés */
}"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono h-32"
          />
          <p className="text-xs text-gray-500 mt-1">
            Le CSS sera appliqué à l'iframe du jeu
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          JavaScript personnalisé
        </h3>
        
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Code JavaScript personnalisé
          </label>
          <textarea
            placeholder="// Votre JavaScript personnalisé
console.log('Jeu chargé');

// Exemple d'événement personnalisé
document.addEventListener('DOMContentLoaded', function() {
  // Votre code ici
});"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono h-32"
          />
          <p className="text-xs text-gray-500 mt-1">
            Le JavaScript sera exécuté au chargement du jeu
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Tags de suivi
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Google Analytics
            </label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Facebook Pixel
            </label>
            <input
              type="text"
              placeholder="123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Code de suivi personnalisé
            </label>
            <textarea
              placeholder="<!-- Votre code de suivi personnalisé -->
<script>
  // Code de tracking
</script>"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono h-20"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Meta tags</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Titre de la page
            </label>
            <input
              type="text"
              placeholder="Grand Jeu Lectures de l'été"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Description meta
            </label>
            <textarea
              placeholder="Participez au grand jeu et tentez de gagner des livres..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-16"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Mots-clés
            </label>
            <input
              type="text"
              placeholder="jeu, concours, livre, lecture, été"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Open Graph</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Image de partage (URL)
            </label>
            <input
              type="url"
              placeholder="https://example.com/image-partage.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Titre de partage
            </label>
            <input
              type="text"
              placeholder="Participez au Grand Jeu Lectures de l'été !"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Description de partage
            </label>
            <textarea
              placeholder="Tentez votre chance et gagnez de superbes livres pour votre été !"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioCodeTab;