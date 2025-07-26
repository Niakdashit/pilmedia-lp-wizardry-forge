
import React from 'react';
import { Code, Tag, Eye, Download, Upload } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';

interface FinalizationTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FinalizationTab: React.FC<FinalizationTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const handleExportConfig = () => {
    const exportData = {
      version: '1.0',
      config: config,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          if (importData.config) {
            onConfigUpdate(importData.config);
          }
        } catch (error) {
          console.error('Erreur lors de l\'importation:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Finalisation</h3>
      
      {/* CSS personnalisé */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          CSS personnalisé
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Code CSS</label>
            <textarea
              value={config.customCSS || ''}
              onChange={e => onConfigUpdate({ customCSS: e.target.value })}
              placeholder="/* Votre CSS personnalisé */
.ma-classe {
  color: #ff6b35;
  font-weight: bold;
}"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Attention :</strong> Le CSS personnalisé peut affecter l'apparence de votre campagne.
              Testez toujours vos modifications avant la publication.
            </p>
          </div>
        </div>
      </div>

      {/* JavaScript personnalisé */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          JavaScript personnalisé
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Code JavaScript</label>
            <textarea
              value={config.customJS || ''}
              onChange={e => onConfigUpdate({ customJS: e.target.value })}
              placeholder="// Votre JavaScript personnalisé
console.log('Campagne de jeu chargée');

// Exemple d'événement personnalisé
document.addEventListener('game:gameComplete', function(event) {
  console.log('Jeu terminé:', event.detail);
});"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-800">
              🚨 <strong>Sécurité :</strong> Assurez-vous que votre code JavaScript est sécurisé.
              Évitez d'inclure des scripts externes non vérifiés.
            </p>
          </div>
        </div>
      </div>

      {/* Tags de tracking */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags de tracking
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Code de tracking (Google Analytics, Facebook Pixel, etc.)</label>
            <textarea
              value={config.trackingTags || ''}
              onChange={e => onConfigUpdate({ trackingTags: e.target.value })}
              placeholder="<!-- Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>"
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              📊 <strong>Analytics :</strong> Ces tags vous permettent de suivre les performances de votre campagne.
              Remplacez les ID par vos vrais identifiants de tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Download className="w-4 h-4" />
          Import/Export
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportConfig}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter la config
            </button>
            
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              Importer une config
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">
              💾 <strong>Sauvegarde :</strong> Exportez votre configuration pour la sauvegarder ou la réutiliser.
              L'import remplacera la configuration actuelle.
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu final */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Aperçu final
        </h4>
        
        <div className="space-y-4">
          <div className="text-center">
            <button
              onClick={() => {
                const encoded = encodeURIComponent(JSON.stringify(config));
                window.open(`${window.location.origin}/live-preview?config=${encoded}`, '_blank');
              }}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Aperçu en plein écran
            </button>
          </div>
          
          <div className="p-3 bg-brand-accent border border-brand-primary/20 rounded">
            <p className="text-xs text-brand-primary">
              🎯 <strong>Vérification finale :</strong> Testez votre campagne sur différents appareils avant publication.
              Vérifiez que tous les éléments s'affichent correctement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizationTab;
