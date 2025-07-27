import React, { useState } from 'react';
import { Sparkles, Upload, Loader2, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AIGeneratorPanelProps {
  onCampaignGenerated: (campaignData: any) => void;
}

const AIGeneratorPanel: React.FC<AIGeneratorPanelProps> = ({ onCampaignGenerated }) => {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    logoFile: null as File | null,
    backgroundFile: null as File | null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'L\'URL de la marque est obligatoire';
    } else if (!isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = 'L\'URL doit être valide (ex: https://example.com)';
    }
    
    if (!formData.logoFile) {
      newErrors.logoFile = 'Le logo de la marque est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = (type: 'logo' | 'background', file: File | null) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Le fichier doit faire moins de 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Le fichier doit être une image'
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });
  };

  const generateCampaign = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert files to base64 data URLs
      const logoDataUrl = formData.logoFile ? await fileToDataUrl(formData.logoFile) : null;
      const backgroundDataUrl = formData.backgroundFile ? await fileToDataUrl(formData.backgroundFile) : null;
      
      // Clean URL
      const cleanUrl = formData.websiteUrl.startsWith('http') 
        ? formData.websiteUrl 
        : `https://${formData.websiteUrl}`;

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

      // Call the edge function using the integrated Supabase client
      const { supabase } = await import('../../../integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('openai-branding-generator', {
        body: {
          prompt,
          websiteUrl: cleanUrl,
          logoUrl: logoDataUrl,
          backgroundUrl: backgroundDataUrl
        }
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de l\'appel de l\'API');
      }

      const result = data;
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération');
      }

      // Transform the AI result to campaign format
      const aiData = result.result;
      const campaignData = {
        title: aiData.wording_jeu_concours?.titre || aiData.campaignTitle || 'Campagne générée',
        subtitle: aiData.wording_jeu_concours?.sous_titre || aiData.campaignSubtitle || '',
        config: {
          roulette: {
            segments: aiData.wheelSegments || [
              { label: 'Prix 1', color: aiData.palette_couleurs?.[0]?.hexa || '#3b82f6', probability: 0.3 },
              { label: 'Prix 2', color: aiData.palette_couleurs?.[1]?.hexa || '#1e40af', probability: 0.2 },
              { label: 'Prix 3', color: aiData.palette_couleurs?.[2]?.hexa || '#0ea5e9', probability: 0.1 }
            ],
            borderColor: aiData.palette_couleurs?.[0]?.hexa || '#3b82f6'
          }
        },
        design: {
          customColors: {
            primary: aiData.palette_couleurs?.[0]?.hexa || '#3b82f6',
            secondary: aiData.palette_couleurs?.[1]?.hexa || '#1e40af',
            accent: aiData.palette_couleurs?.[2]?.hexa || '#0ea5e9'
          },
          fonts: aiData.polices || [
            { nom: 'Montserrat', utilisation: 'Titres' }
          ],
          ambiance: aiData.ambiance_et_keywords || ['moderne'],
          tone: aiData.extrait_du_ton_editorial || 'Professionnel et engageant'
        },
        buttonConfig: {
          text: aiData.wording_jeu_concours?.call_to_action || 'PARTICIPER',
          color: aiData.palette_couleurs?.[0]?.hexa || '#3b82f6'
        },
        aiGenerated: true,
        sourceData: {
          websiteUrl: cleanUrl,
          logoUrl: logoDataUrl,
          backgroundUrl: backgroundDataUrl,
          fullAIResponse: aiData
        }
      };

      onCampaignGenerated(campaignData);
      toast.success('🎨 Campagne générée avec succès!');
      
    } catch (error) {
      console.error('Erreur génération campagne:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Génération échouée'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          Générateur IA Studio
        </h3>
        <p className="text-sm text-gray-600">
          Créez automatiquement une campagne 100% brandée et professionnelle
        </p>
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-900">
          <Globe className="w-4 h-4 mr-2 text-gray-600" />
          URL de votre site web *
        </label>
        <input
          type="text"
          value={formData.websiteUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
          placeholder="https://www.monsite.com"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.websiteUrl ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.websiteUrl && (
          <p className="text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.websiteUrl}
          </p>
        )}
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-900">
          <Upload className="w-4 h-4 mr-2 text-gray-600" />
          Logo de la marque *
        </label>
        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          errors.logoFile ? 'border-red-300' : 'border-gray-300 hover:border-blue-400'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload('logo', e.target.files?.[0] || null)}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            {formData.logoFile ? (
              <div className="text-green-600">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{formData.logoFile.name}</p>
                <p className="text-xs">Cliquez pour changer</p>
              </div>
            ) : (
              <div className="text-gray-600">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Glissez votre logo ici</p>
                <p className="text-xs">PNG, JPG, SVG - Max 5MB</p>
              </div>
            )}
          </label>
        </div>
        {errors.logoFile && (
          <p className="text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.logoFile}
          </p>
        )}
      </div>

      {/* Background Upload */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-900">
          <Upload className="w-4 h-4 mr-2 text-gray-600" />
          Image de fond (optionnelle)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload('background', e.target.files?.[0] || null)}
            className="hidden"
            id="background-upload"
          />
          <label htmlFor="background-upload" className="cursor-pointer">
            {formData.backgroundFile ? (
              <div className="text-green-600">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{formData.backgroundFile.name}</p>
                <p className="text-xs">Cliquez pour changer</p>
              </div>
            ) : (
              <div className="text-gray-600">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Image d'ambiance (optionnelle)</p>
                <p className="text-xs">PNG, JPG - Max 5MB</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateCampaign}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Générer la campagne</span>
          </>
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>✨ IA GPT-4o • Niveau studio • 100% éditable</p>
      </div>
    </div>
  );
};

export default AIGeneratorPanel;