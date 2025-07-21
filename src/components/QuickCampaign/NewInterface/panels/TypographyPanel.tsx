
import React from 'react';
import { motion } from 'framer-motion';
import { Type, Download } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const TypographyPanel: React.FC = () => {
  const { campaignName } = useQuickCampaignStore();

  const fontPairs = [
    {
      id: 'modern',
      name: 'Moderne',
      heading: 'Inter',
      body: 'Inter',
      description: 'Clean et professionnel',
      preview: 'Aa'
    },
    {
      id: 'elegant',
      name: 'Élégant',
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
      description: 'Sophistiqué et raffiné',
      preview: 'Aa'
    },
    {
      id: 'friendly',
      name: 'Amical',
      heading: 'Poppins',
      body: 'Open Sans',
      description: 'Accessible et chaleureux',
      preview: 'Aa'
    },
    {
      id: 'tech',
      name: 'Tech',
      heading: 'JetBrains Mono',
      body: 'Roboto',
      description: 'Moderne et technique',
      preview: 'Aa'
    }
  ];

  const [selectedFont, setSelectedFont] = React.useState('modern');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Typographie
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choisissez le style typographique qui correspond à votre marque.
        </p>
      </div>

      {/* Font Pairs */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Styles disponibles</h4>
        
        {fontPairs.map((font, index) => (
          <motion.button
            key={font.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedFont(font.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedFont === font.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span 
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: font.heading }}
                  >
                    {font.preview}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {font.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {font.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {font.heading} • {font.body}
                  </p>
                </div>
              </div>
              
              {selectedFont === font.id && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Typography Preview */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center">
          <Type className="w-4 h-4 mr-2" />
          Aperçu typographique
        </h4>
        
        <div className="space-y-4">
          <div>
            <h1 
              className="text-2xl font-bold text-foreground"
              style={{ 
                fontFamily: fontPairs.find(f => f.id === selectedFont)?.heading 
              }}
            >
              {campaignName || 'Ma Nouvelle Campagne'}
            </h1>
          </div>
          
          <div>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontFamily: fontPairs.find(f => f.id === selectedFont)?.body 
              }}
            >
              Voici un aperçu du texte de votre campagne avec la typographie sélectionnée. 
              Cette police sera utilisée pour tous les éléments de texte.
            </p>
          </div>
          
          <div>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              style={{ 
                fontFamily: fontPairs.find(f => f.id === selectedFont)?.body 
              }}
            >
              Bouton d'exemple
            </button>
          </div>
        </div>
      </div>

      {/* Font Loading Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Polices web optimisées
        </h4>
        <p className="text-xs text-blue-800">
          Toutes les polices sont automatiquement optimisées pour le web et se chargent rapidement 
          sur tous les appareils.
        </p>
      </div>
    </div>
  );
};

export default TypographyPanel;
