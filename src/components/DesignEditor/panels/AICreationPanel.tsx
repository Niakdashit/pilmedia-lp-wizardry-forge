import React, { useState, useRef } from 'react';
import { Upload, Wand2, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CAMPAIGN_TEMPLATES, getTemplateByIndex } from '../templates/CampaignTemplates';

interface AICreationPanelProps {
  onCampaignGenerated: (campaignData: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
}

interface BrandAnalysis {
  styleChoisi?: string;
  campaignTitle?: string;
  campaignSubtitle?: string;
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

  // Fonction pour extraire les couleurs dominantes d'une image
  const extractColorsFromImage = async (imageFile: File): Promise<string[]> => {
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
          resolve(['#3498db', '#2c3e50', '#e74c3c']);
          return;
        }

        const colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 200) {
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
        }
        
        const sortedColors = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color);
        
        resolve(sortedColors.length > 0 ? sortedColors : ['#3498db', '#2c3e50', '#e74c3c']);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Gestion de l'upload du logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      
      try {
        const colors = await extractColorsFromImage(file);
        onExtractedColorsChange?.(colors);
        toast.success('Couleurs extraites du logo avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'extraction des couleurs:', error);
      }
    }
  };

  // Gestion de l'upload du background
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const preview = URL.createObjectURL(file);
      setBackgroundPreview(preview);
      
      const dataURL = await convertFileToDataURL(file);
      onBackgroundChange?.({ type: 'image', value: dataURL });
      toast.success('Image de fond appliquée !');
    }
  };

  // Conversion du file en dataURL
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Génération de la campagne IA
  const generateAICampaign = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Veuillez saisir une URL de site web');
      return;
    }

    setIsGenerating(true);
    
    try {
      let logoDataURL = '';
      let backgroundDataURL = '';

      if (logoFile) {
        logoDataURL = await convertFileToDataURL(logoFile);
      }

      if (backgroundFile) {
        backgroundDataURL = await convertFileToDataURL(backgroundFile);
      }

      const prompt = `
Tu es un directeur artistique expert. Analyse ce site web et génère une campagne de jeu-concours visuellement impactante.

SECTEURS D'ACTIVITÉ ET STYLES ASSOCIÉS:
- Bio/Santé/Beauté/Wellness → Style NATUREL (couleurs organiques, design épuré)
- Sport/Fitness/Outdoor/Jeunesse → Style SPORTIF (couleurs énergiques, design dynamique)
- Voyage/Luxe/Hôtellerie/Premium → Style VOYAGE (couleurs sophistiquées, design premium)
- Tech/Digital/Finance/Moderne → Style MODERNE (couleurs tech, design minimaliste)

INSTRUCTIONS:
1. Identifie le secteur d'activité principal
2. Choisis le style le plus adapté parmi: naturel, sportif, voyage, moderne
3. Génère une palette de couleurs cohérente avec la marque
4. Crée des textes accrocheurs et brandés
5. Assure une hiérarchie visuelle claire

Réponds UNIQUEMENT avec le JSON demandé, sans texte supplémentaire.
`;

      console.log('🎨 Calling AI branding generator...');
      
      const { data, error } = await supabase.functions.invoke('openai-branding-generator', {
        body: {
          prompt,
          websiteUrl,
          logoUrl: logoDataURL || undefined,
          backgroundUrl: backgroundDataURL || undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success && data.result) {
        console.log('✅ AI analysis successful:', data.result);
        const campaignData = createCampaignFromAIAnalysis(data.result);
        onCampaignGenerated(campaignData);
        toast.success('Campagne IA générée avec succès !');
      } else {
        throw new Error('Réponse invalide de l\'IA');
      }

    } catch (error) {
      console.error('❌ Erreur lors de la génération IA:', error);
      console.log('🔄 Utilisation du fallback...');
      
      const fallbackCampaign = createFallbackCampaign();
      onCampaignGenerated(fallbackCampaign);
      toast.warning('Campagne de secours générée (erreur IA)');
    } finally {
      setIsGenerating(false);
    }
  };

  const createCampaignFromAIAnalysis = (analysis: BrandAnalysis) => {
    console.log('Creating campaign from AI analysis:', analysis);
    
    const canvasWidth = 600;
    const canvasHeight = 800;
    
    // Sélection du template basé sur le style choisi par l'IA ou rotation automatique
    let template;
    if (analysis.styleChoisi) {
      template = CAMPAIGN_TEMPLATES.find(t => t.id === analysis.styleChoisi) || getTemplateByIndex(0);
    } else {
      // Rotation automatique basée sur un compteur local
      const generationCount = parseInt(localStorage.getItem('ai-generation-count') || '0');
      template = getTemplateByIndex(generationCount);
      localStorage.setItem('ai-generation-count', (generationCount + 1).toString());
    }

    console.log('Using template:', template.name);

    // Couleurs du template ou de l'IA
    const primaryColor = analysis.palette_couleurs?.[0]?.hexa || template.style.colors.primary;
    const secondaryColor = analysis.palette_couleurs?.[1]?.hexa || template.style.colors.secondary;
    const accentColor = analysis.palette_couleurs?.[2]?.hexa || template.style.colors.accent;
    const backgroundColor = template.style.colors.background;
    const textColor = template.style.colors.text;

    // Polices du template
    const titleFont = template.style.typography.titleFont;
    const textFont = template.style.typography.textFont;

    // Wording optimisé
    const gameWording = analysis.wording_jeu_concours || {};
    const title = gameWording.titre || analysis.campaignTitle || 'Tentez Votre Chance';
    const subtitle = gameWording.sous_titre || analysis.campaignSubtitle || 'Une expérience unique vous attend';
    const mechanics = gameWording.mecanique || 'Tournez la roue et découvrez votre prix';
    const benefit = gameWording.avantage_client || 'Des récompenses exclusives à gagner';
    const cta = gameWording.call_to_action || 'JOUER MAINTENANT';

    // Calcul des positions basées sur le template
    const titlePos = {
      x: canvasWidth * template.style.layout.titlePosition.x,
      y: canvasHeight * template.style.layout.titlePosition.y
    };
    const subtitlePos = {
      x: canvasWidth * template.style.layout.subtitlePosition.x,
      y: canvasHeight * template.style.layout.subtitlePosition.y
    };
    const mechanicsPos = {
      x: canvasWidth * template.style.layout.mechanicsPosition.x,
      y: canvasHeight * template.style.layout.mechanicsPosition.y
    };
    const benefitPos = {
      x: canvasWidth * template.style.layout.benefitPosition.x,
      y: canvasHeight * template.style.layout.benefitPosition.y
    };
    const ctaPos = {
      x: canvasWidth * template.style.layout.ctaPosition.x,
      y: canvasHeight * template.style.layout.ctaPosition.y
    };
    const wheelPos = {
      x: canvasWidth * template.style.layout.wheelPosition.x,
      y: canvasHeight * template.style.layout.wheelPosition.y
    };

    // Styles avancés basés sur le template
    const shadowStyle = template.style.effects.shadows ? '0 4px 20px rgba(0,0,0,0.15)' : 'none';
    const titleShadow = template.style.effects.shadows ? '2px 2px 8px rgba(0,0,0,0.2)' : 'none';

    return {
      canvasElements: [
        // Titre principal avec effets stylisés avancés
        {
          id: 'ai-title',
          type: 'text',
          role: 'title',
          content: title,
          position: titlePos,
          style: {
            fontSize: template.style.typography.titleSize,
            fontWeight: template.style.typography.titleWeight,
            color: template.style.effects.titleStyle === 'gradient' ? 'transparent' : (template.style.effects.titleStyle === 'stroke' ? textColor : primaryColor),
            textAlign: 'center',
            fontFamily: titleFont,
            textShadow: template.style.effects.titleStyle === 'stroke' ? 'none' : titleShadow,
            width: `${canvasWidth - 80}px`,
            lineHeight: '1.1',
            letterSpacing: template.style.typography.letterSpacing,
            fontStyle: template.style.effects.titleStyle === 'italic' ? 'italic' : 'normal',
            textDecoration: template.style.effects.titleStyle === 'underline' ? 'underline' : 'none',
            background: template.style.effects.titleBackground || 'transparent',
            backgroundImage: template.style.effects.titleGradient || 'none',
            backgroundClip: template.style.effects.titleStyle === 'gradient' ? 'text' : 'border-box',
            WebkitBackgroundClip: template.style.effects.titleStyle === 'gradient' ? 'text' : 'border-box',
            WebkitTextFillColor: template.style.effects.titleStyle === 'gradient' ? 'transparent' : 'inherit',
            WebkitTextStroke: template.style.effects.titleStyle === 'stroke' ? `3px ${template.style.effects.titleStroke}` : 'none',
            padding: template.style.effects.titleBackground ? '16px 24px' : '8px 16px',
            borderRadius: template.style.effects.titleBackground ? '15px' : '0',
            textTransform: template.name === 'Sportif & Dynamique' ? 'uppercase' : 'none',
            transform: template.name === 'Sportif & Dynamique' ? 'rotate(-1deg)' : 'none',
            boxShadow: template.style.effects.shadows && template.style.effects.titleBackground ? 
              '0 8px 32px rgba(0,0,0,0.2)' : 'none'
          }
        },
        
        // Sous-titre stylisé
        {
          id: 'ai-subtitle',
          type: 'text',
          role: 'description',
          content: subtitle,
          position: subtitlePos,
          style: {
            fontSize: template.style.typography.subtitleSize,
            fontWeight: '400',
            color: textColor,
            textAlign: 'center',
            fontFamily: textFont,
            width: `${canvasWidth - 100}px`,
            lineHeight: '1.4',
            opacity: '0.9'
          }
        },
        
        // Mécanique du jeu avec style template
        {
          id: 'ai-mechanics',
          type: 'text',
          role: 'mechanics',
          content: mechanics,
          position: mechanicsPos,
          style: {
            fontSize: '16px',
            fontWeight: '500',
            color: secondaryColor,
            textAlign: 'center',
            fontFamily: textFont,
            backgroundColor: `${secondaryColor}12`,
            padding: '10px 20px',
            borderRadius: '20px',
            border: template.style.effects.borders ? `1px solid ${secondaryColor}30` : 'none',
            boxShadow: template.style.effects.shadows ? shadowStyle : 'none',
            width: 'auto'
          }
        },
        
        // Avantage client premium
        {
          id: 'ai-benefit',
          type: 'text',
          role: 'benefit',
          content: benefit,
          position: benefitPos,
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: accentColor,
            textAlign: 'center',
            fontFamily: textFont,
            backgroundColor: template.style.effects.gradients ? 
              `linear-gradient(45deg, ${accentColor}20, ${primaryColor}15)` : 
              `${accentColor}15`,
            padding: '14px 28px',
            borderRadius: '30px',
            border: template.style.effects.borders ? `2px solid ${accentColor}50` : 'none',
            boxShadow: template.style.effects.shadows ? `0 6px 25px ${accentColor}25` : 'none',
            width: 'auto'
          }
        },
        
        // Call-to-action avec style template
        {
          id: 'ai-cta',
          type: 'text',
          role: 'button',
          content: cta,
          position: ctaPos,
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: template.style.effects.gradients ? 
              `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : 
              primaryColor,
            padding: '18px 36px',
            borderRadius: '40px',
            textAlign: 'center',
            fontFamily: textFont,
            boxShadow: template.style.effects.shadows ? `0 8px 30px ${primaryColor}40` : 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            width: 'auto',
            border: template.style.effects.borders ? `3px solid ${primaryColor}` : 'none'
          }
        }
      ],
      wheelConfig: {
        segments: analysis.wheelSegments?.map((segment, index) => ({
          id: (index + 1).toString(),
          label: segment.label,
          color: segment.color,
          probability: segment.probability,
          isWinning: segment.isWinning
        })) || [
          { id: '1', label: 'Prix Premium', color: primaryColor, probability: 0.3, isWinning: true },
          { id: '2', label: 'Cadeau Surprise', color: secondaryColor, probability: 0.25, isWinning: true },
          { id: '3', label: 'Bon d\'achat', color: accentColor, probability: 0.25, isWinning: true },
          { id: '4', label: 'Réessayez', color: template.style.colors.text, probability: 0.2, isWinning: false }
        ],
        borderStyle: 'premium',
        borderColor: primaryColor,
        scale: 1.2,
        center: wheelPos
      },
      design: {
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
          background: backgroundColor,
          text: textColor
        },
        fonts: {
          title: titleFont,
          text: textFont
        },
        template: template
      },
      metadata: {
        aiGenerated: true,
        templateUsed: template.name,
        brandAnalysis: analysis,
        generatedAt: new Date().toISOString()
      }
    };
  };

  const createFallbackCampaign = () => {
    const canvasWidth = 600;
    const canvasHeight = 800;

    // Utilisation du template moderne par défaut pour le fallback
    const fallbackTemplate = CAMPAIGN_TEMPLATES.find(t => t.id === 'modern') || CAMPAIGN_TEMPLATES[0];
    
    // Positions basées sur le template
    const titlePos = {
      x: canvasWidth * fallbackTemplate.style.layout.titlePosition.x,
      y: canvasHeight * fallbackTemplate.style.layout.titlePosition.y
    };
    const subtitlePos = {
      x: canvasWidth * fallbackTemplate.style.layout.subtitlePosition.x,
      y: canvasHeight * fallbackTemplate.style.layout.subtitlePosition.y
    };
    const benefitPos = {
      x: canvasWidth * fallbackTemplate.style.layout.benefitPosition.x,
      y: canvasHeight * fallbackTemplate.style.layout.benefitPosition.y
    };
    const ctaPos = {
      x: canvasWidth * fallbackTemplate.style.layout.ctaPosition.x,
      y: canvasHeight * fallbackTemplate.style.layout.ctaPosition.y
    };
    const wheelPos = {
      x: canvasWidth * fallbackTemplate.style.layout.wheelPosition.x,
      y: canvasHeight * fallbackTemplate.style.layout.wheelPosition.y
    };

    const primaryColor = fallbackTemplate.style.colors.primary;
    const secondaryColor = fallbackTemplate.style.colors.secondary;
    const accentColor = fallbackTemplate.style.colors.accent;

    return {
      canvasElements: [
        // Titre principal avec style template
        {
          id: 'fallback-title',
          type: 'text',
          role: 'title',
          content: 'Tentez Votre Chance',
          position: titlePos,
          style: {
            fontSize: fallbackTemplate.style.typography.titleSize,
            fontWeight: fallbackTemplate.style.typography.titleWeight,
            color: primaryColor,
            textAlign: 'center',
            fontFamily: fallbackTemplate.style.typography.titleFont,
            textShadow: '2px 2px 8px rgba(108, 92, 231, 0.3)',
            width: `${canvasWidth - 80}px`,
            lineHeight: '1.2',
            letterSpacing: fallbackTemplate.style.typography.letterSpacing,
            background: 'linear-gradient(135deg, #6c5ce715, #fd79a810)',
            padding: '8px 16px',
            borderRadius: '12px'
          }
        },
        
        // Sous-titre moderne
        {
          id: 'fallback-subtitle',
          type: 'text',
          role: 'description',
          content: 'Une expérience unique vous attend',
          position: subtitlePos,
          style: {
            fontSize: fallbackTemplate.style.typography.subtitleSize,
            fontWeight: '400',
            color: fallbackTemplate.style.colors.text,
            textAlign: 'center',
            fontFamily: fallbackTemplate.style.typography.textFont,
            width: `${canvasWidth - 100}px`,
            lineHeight: '1.4',
            opacity: '0.9'
          }
        },
        
        // Avantage stylisé
        {
          id: 'fallback-benefit',
          type: 'text',
          role: 'benefit',
          content: '🎁 Des récompenses exclusives à gagner',
          position: benefitPos,
          style: {
            fontSize: '18px',
            fontWeight: '600',
            color: accentColor,
            textAlign: 'center',
            fontFamily: fallbackTemplate.style.typography.textFont,
            backgroundColor: 'linear-gradient(45deg, #fd79a820, #6c5ce715)',
            padding: '14px 28px',
            borderRadius: '30px',
            boxShadow: '0 6px 25px #fd79a825',
            width: 'auto'
          }
        },
        
        // Bouton CTA moderne
        {
          id: 'fallback-cta',
          type: 'text',
          role: 'button',
          content: 'JOUER MAINTENANT',
          position: ctaPos,
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
            padding: '18px 36px',
            borderRadius: '40px',
            textAlign: 'center',
            fontFamily: fallbackTemplate.style.typography.textFont,
            boxShadow: '0 8px 30px #6c5ce740',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            width: 'auto'
          }
        }
      ],
      wheelConfig: {
        segments: [
          { id: '1', label: 'Prix Premium', color: primaryColor, probability: 0.3, isWinning: true },
          { id: '2', label: 'Cadeau Surprise', color: secondaryColor, probability: 0.25, isWinning: true },
          { id: '3', label: 'Bon d\'achat', color: accentColor, probability: 0.25, isWinning: true },
          { id: '4', label: 'Réessayez', color: fallbackTemplate.style.colors.text, probability: 0.2, isWinning: false }
        ],
        borderStyle: 'premium',
        borderColor: primaryColor,
        scale: 1.2,
        center: wheelPos
      },
      design: {
        colors: fallbackTemplate.style.colors,
        fonts: {
          title: fallbackTemplate.style.typography.titleFont,
          text: fallbackTemplate.style.typography.textFont
        },
        template: fallbackTemplate
      },
      metadata: {
        websiteUrl,
        fallback: true,
        templateUsed: fallbackTemplate.name,
        brandOptimized: true
      }
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎨 Création IA Studio Premium
        </h3>
        <p className="text-sm text-gray-600">
          4 styles professionnels • Templates rotatifs • 100% brandé
        </p>
      </div>

      {/* Aperçu des templates */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {CAMPAIGN_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="p-2 text-xs text-center rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${template.style.colors.primary}20, ${template.style.colors.accent}15)`,
              borderColor: template.style.colors.primary + '30'
            }}
          >
            <div className="font-semibold" style={{ color: template.style.colors.primary }}>
              {template.name}
            </div>
            <div className="text-gray-600 text-xs">
              {template.industries.slice(0, 2).join(', ')}
            </div>
          </div>
        ))}
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
          {isGenerating ? 'Génération IA en cours...' : 'Générer Campagne IA Studio'}
        </span>
      </button>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">🚀 Nouveau système IA Studio</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>• 4 styles professionnels adaptés à chaque secteur</li>
          <li>• Rotation automatique entre les templates</li>
          <li>• Design brandé avec couleurs extraites du logo</li>
          <li>• Typographies et effets optimisés par template</li>
          <li>• Qualité studio pour tous vos projets</li>
        </ol>
      </div>
    </div>
  );
};

export default AICreationPanel;