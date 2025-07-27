import React, { useState, useRef } from 'react';
import { Upload, Wand2, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AICreationPanelProps {
  onCampaignGenerated: (campaignData: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
}

interface BrandAnalysis {
  palette_couleurs: Array<{ nom: string; hexa: string }>;
  polices: Array<{ nom: string; utilisation: string }>;
  ambiance_et_keywords: string[];
  extrait_du_ton_editorial: string;
  wording_jeu_concours: {
    titre: string;
    sous_titre: string;
    mecanique: string;
    avantage_client: string;
    call_to_action: string;
  };
  wheelSegments: Array<{
    label: string;
    color: string;
    probability: number;
    isWinning?: boolean;
  }>;
  designElements: {
    backgroundStyle: string;
    graphicElements: string[];
    layoutStyle: string;
  };
  commentaires_design: string;
}

const AICreationPanel: React.FC<AICreationPanelProps> = ({
  onCampaignGenerated,
  onBackgroundChange,
  onExtractedColorsChange,
}) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Fonction d'extraction de couleurs à partir d'une image
  const extractColorsFromImage = (imageFile: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData?.data;
        
        if (!data) {
          resolve(['#3b82f6', '#1e40af', '#0ea5e9']);
          return;
        }
        
        // Analyse simplifiée des couleurs dominantes
        const colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 128) { // Ignorer les pixels transparents
            // Regrouper les couleurs similaires
            const groupedR = Math.floor(r / 32) * 32;
            const groupedG = Math.floor(g / 32) * 32;
            const groupedB = Math.floor(b / 32) * 32;
            
            const hex = `#${groupedR.toString(16).padStart(2, '0')}${groupedG.toString(16).padStart(2, '0')}${groupedB.toString(16).padStart(2, '0')}`;
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
        }
        
        // Trier par fréquence et prendre les 3 plus dominantes
        const sortedColors = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color);
        
        resolve(sortedColors.length > 0 ? sortedColors : ['#3b82f6', '#1e40af', '#0ea5e9']);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      
      // Extraire les couleurs du logo
      try {
        const colors = await extractColorsFromImage(file);
        onExtractedColorsChange?.(colors);
        toast.success('Couleurs extraites du logo !');
      } catch (error) {
        console.error('Erreur extraction couleurs:', error);
      }
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const preview = URL.createObjectURL(file);
      setBackgroundPreview(preview);
      
      // Appliquer directement comme background
      onBackgroundChange?.({
        type: 'image',
        value: preview
      });
      
      // Extraire les couleurs si pas de logo
      if (!logoFile) {
        try {
          const colors = await extractColorsFromImage(file);
          onExtractedColorsChange?.(colors);
          toast.success('Couleurs extraites de l\'image de fond !');
        } catch (error) {
          console.error('Erreur extraction couleurs:', error);
        }
      }
    }
  };

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateAICampaign = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Veuillez saisir une URL de marque');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convertir les fichiers en data URLs
      let logoDataURL = '';
      let backgroundDataURL = '';
      
      if (logoFile) {
        logoDataURL = await convertFileToDataURL(logoFile);
      }
      
      if (backgroundFile) {
        backgroundDataURL = await convertFileToDataURL(backgroundFile);
      }

      const prompt = `Génère une campagne promotionnelle de niveau studio basée sur cette marque. 
        
        CONTRAINTES QUALITÉ:
        - Niveau graphique équivalent aux meilleures agences créatives
        - Visuel principal cohérent avec l'identité de marque
        - Titre accrocheur et sous-titre complémentaire avec hiérarchie typographique
        - Éléments graphiques harmonieux (formes, icônes, couleurs)
        - Roue de la fortune personnalisée aux couleurs de la marque
        - Typographie extraite de l'univers de marque
        
        RÉSULTAT ATTENDU (JSON strict):
        {
          "campaignTitle": "Titre accrocheur principal",
          "campaignSubtitle": "Sous-titre complémentaire engageant",
          "palette_couleurs": [
            {"nom": "Couleur principale", "hexa": "#..."},
            {"nom": "Couleur secondaire", "hexa": "#..."},
            {"nom": "Couleur d'accent", "hexa": "#..."}
          ],
          "polices": [
            {"nom": "Police principale", "utilisation": "Titres"},
            {"nom": "Police secondaire", "utilisation": "Texte"}
          ],
          "ambiance_et_keywords": ["moderne", "professionnel", "engageant"],
          "extrait_du_ton_editorial": "Description du ton de communication",
          "wording_jeu_concours": {
            "titre": "Titre du jeu-concours",
            "sous_titre": "Sous-titre engageant", 
            "mecanique": "Description de la mécanique",
            "avantage_client": "Avantage pour le participant",
            "call_to_action": "TEXTE DU BOUTON"
          },
          "wheelSegments": [
            {"label": "Prix 1", "color": "#...", "probability": 0.2},
            {"label": "Prix 2", "color": "#...", "probability": 0.15},
            {"label": "Prix 3", "color": "#...", "probability": 0.1}
          ],
          "designElements": {
            "backgroundStyle": "Description style arrière-plan",
            "graphicElements": ["élément1", "élément2"],
            "layoutStyle": "Description disposition"
          },
          "commentaires_design": "Recommandations pour le design final"
        }`;

      const { data, error } = await supabase.functions.invoke('openai-branding-generator', {
        body: {
          prompt,
          websiteUrl,
          logoUrl: logoDataURL,
          backgroundUrl: backgroundDataURL,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const brandAnalysis: BrandAnalysis = data.result;
      
      // Créer une campagne complète basée sur l'analyse IA
      const generatedCampaign = createCampaignFromAIAnalysis(brandAnalysis);
      
      // Transmettre la campagne générée
      onCampaignGenerated(generatedCampaign);
      
      toast.success('Campagne générée avec succès !');
      
    } catch (error: any) {
      console.error('Erreur génération IA:', error);
      
      // Fallback avec une campagne par défaut basée sur l'URL
      const fallbackCampaign = createFallbackCampaign();
      onCampaignGenerated(fallbackCampaign);
      
      toast.warning('Campagne générée en mode fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const createCampaignFromAIAnalysis = (analysis: BrandAnalysis) => {
    const primaryColor = analysis.palette_couleurs[0]?.hexa || '#3b82f6';
    const secondaryColor = analysis.palette_couleurs[1]?.hexa || '#1e40af';
    const accentColor = analysis.palette_couleurs[2]?.hexa || '#0ea5e9';
    
    // Extraire les couleurs pour le système
    onExtractedColorsChange?.([primaryColor, secondaryColor, accentColor]);
    
    // Appliquer un background généré si pas d'image de fond
    if (!backgroundFile) {
      const gradientBackground = `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`;
      onBackgroundChange?.({
        type: 'color',
        value: gradientBackground
      });
    }

    return {
      // Éléments canvas pour l'éditeur
      elements: [
        {
          id: 'ai-title',
          type: 'text',
          role: 'title',
          content: analysis.wording_jeu_concours.titre,
          position: { x: 400, y: 100 },
          style: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: primaryColor,
            textAlign: 'center',
            fontFamily: analysis.polices.find(p => p.utilisation.includes('Titre'))?.nom || 'Montserrat'
          }
        },
        {
          id: 'ai-subtitle',
          type: 'text',
          role: 'description',
          content: analysis.wording_jeu_concours.sous_titre,
          position: { x: 400, y: 180 },
          style: {
            fontSize: '24px',
            fontWeight: 'normal',
            color: secondaryColor,
            textAlign: 'center',
            fontFamily: analysis.polices.find(p => p.utilisation.includes('Texte'))?.nom || 'Roboto'
          }
        },
        {
          id: 'ai-button',
          type: 'text',
          role: 'button',
          content: analysis.wording_jeu_concours.call_to_action,
          position: { x: 400, y: 500 },
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: primaryColor,
            padding: '16px 32px',
            borderRadius: '12px',
            textAlign: 'center'
          }
        },
        // Ajouter le logo si fourni
        ...(logoPreview ? [{
          id: 'ai-logo',
          type: 'image',
          src: logoPreview,
          position: { x: 50, y: 50 },
          style: {
            width: '120px',
            height: 'auto'
          }
        }] : [])
      ],
      
      // Configuration de la roue
      wheelConfig: {
        segments: analysis.wheelSegments.map((segment, index) => ({
          id: `segment-${index}`,
          label: segment.label,
          color: segment.color,
          probability: segment.probability,
          isWinning: segment.isWinning ?? true
        })),
        borderStyle: 'premium',
        borderColor: primaryColor,
        scale: 1
      },
      
      // Données de marque
      brandData: {
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor
        },
        fonts: analysis.polices,
        tone: analysis.extrait_du_ton_editorial,
        keywords: analysis.ambiance_et_keywords
      },
      
      // Métadonnées
      metadata: {
        websiteUrl,
        hasLogo: !!logoFile,
        hasBackground: !!backgroundFile,
        aiGenerated: true,
        designElements: analysis.designElements,
        comments: analysis.commentaires_design
      }
    };
  };

  const createFallbackCampaign = () => {
    const fallbackColors = ['#3b82f6', '#1e40af', '#0ea5e9'];
    onExtractedColorsChange?.(fallbackColors);
    
    if (!backgroundFile) {
      onBackgroundChange?.({
        type: 'color',
        value: 'linear-gradient(135deg, #3b82f620 0%, #1e40af20 100%)'
      });
    }

    return {
      elements: [
        {
          id: 'fallback-title',
          type: 'text',
          role: 'title',
          content: 'Tentez votre chance !',
          position: { x: 400, y: 100 },
          style: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#3b82f6',
            textAlign: 'center',
            fontFamily: 'Montserrat'
          }
        },
        {
          id: 'fallback-subtitle',
          type: 'text',
          role: 'description',
          content: 'Participez à notre jeu-concours et gagnez des prix exceptionnels',
          position: { x: 400, y: 180 },
          style: {
            fontSize: '24px',
            fontWeight: 'normal',
            color: '#1e40af',
            textAlign: 'center',
            fontFamily: 'Roboto'
          }
        },
        {
          id: 'fallback-button',
          type: 'text',
          role: 'button',
          content: 'PARTICIPER',
          position: { x: 400, y: 500 },
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            padding: '16px 32px',
            borderRadius: '12px',
            textAlign: 'center'
          }
        }
      ],
      wheelConfig: {
        segments: [
          { id: '1', label: 'Prix 1', color: '#3b82f6', probability: 0.25, isWinning: true },
          { id: '2', label: 'Prix 2', color: '#1e40af', probability: 0.25, isWinning: true },
          { id: '3', label: 'Prix 3', color: '#0ea5e9', probability: 0.25, isWinning: true },
          { id: '4', label: 'Dommage', color: '#6b7280', probability: 0.25, isWinning: false }
        ],
        borderStyle: 'classic',
        borderColor: '#3b82f6',
        scale: 1
      },
      metadata: {
        websiteUrl,
        fallback: true
      }
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Création IA Studio
        </h3>
        <p className="text-sm text-gray-600">
          Générez une campagne professionnelle brandée automatiquement
        </p>
      </div>

      {/* URL de la marque */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4 inline mr-2" />
          URL de la marque *
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Upload Logo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Upload className="w-4 h-4 inline mr-2" />
          Logo de la marque (optionnel)
        </label>
        <div
          onClick={() => logoInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="max-h-24 max-w-full object-contain"
            />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Cliquez pour uploader le logo</span>
            </>
          )}
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Upload Background */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Upload className="w-4 h-4 inline mr-2" />
          Image de fond (optionnel)
        </label>
        <div
          onClick={() => backgroundInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {backgroundPreview ? (
            <img
              src={backgroundPreview}
              alt="Background preview"
              className="max-h-24 max-w-full object-contain"
            />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Cliquez pour uploader l'image de fond</span>
            </>
          )}
        </div>
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="hidden"
        />
      </div>

      {/* Bouton de génération */}
      <button
        onClick={generateAICampaign}
        disabled={isGenerating || !websiteUrl.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
      >
        <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
        <span>
          {isGenerating ? 'Génération en cours...' : 'Générer la campagne IA'}
        </span>
      </button>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Comment ça marche ?</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Saisissez l'URL de la marque à analyser</li>
          <li>2. Uploadez le logo (les couleurs seront extraites)</li>
          <li>3. Uploadez une image de fond (optionnel)</li>
          <li>4. L'IA génère une campagne 100% brandée</li>
          <li>5. Modifiez ensuite les éléments selon vos besoins</li>
        </ol>
      </div>
    </div>
  );
};

export default AICreationPanel;