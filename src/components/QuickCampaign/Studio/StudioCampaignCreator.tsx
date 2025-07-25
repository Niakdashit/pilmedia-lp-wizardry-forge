import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Upload, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import ColorThief from 'colorthief';
import StudioPreview from './StudioPreview';

interface StudioData {
  websiteUrl: string;
  logoFile: File | null;
  backgroundFile: File | null;
  campaignType: string;
  targetAudience: string;
  objective: string;
  logoUrl?: string;
  backgroundUrl?: string;
  extractedColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface GeneratedCampaign {
  brandAnalysis: any;
  content: any;
  design: any;
}

const StudioCampaignCreator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studioData, setStudioData] = useState<StudioData>({
    websiteUrl: '',
    logoFile: null,
    backgroundFile: null,
    campaignType: 'wheel',
    targetAudience: 'clients potentiels',
    objective: 'engagement et conversion'
  });
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);

  const extractColorsFromImage = async (imageUrl: string) => {
    try {
      console.log('🎨 Début d\'extraction des couleurs depuis l\'image:', imageUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const colorThief = new ColorThief();
            
            const dominantColor = colorThief.getColor(img);
            const palette = colorThief.getPalette(img, 3);
            
            console.log('🎯 Couleur dominante extraite:', dominantColor);
            console.log('🎨 Palette extraite:', palette);
            
            const rgbToHex = (r: number, g: number, b: number) => 
              "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            
            const extractedColors = {
              primary: rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]),
              secondary: palette[1] ? rgbToHex(palette[1][0], palette[1][1], palette[1][2]) : rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]),
              accent: palette[2] ? rgbToHex(palette[2][0], palette[2][1], palette[2][2]) : rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])
            };
            
            console.log('✅ Couleurs extraites avec succès:', extractedColors);
            resolve(extractedColors);
            
          } catch (error) {
            console.error('❌ Erreur lors de l\'extraction des couleurs:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('❌ Erreur lors du chargement de l\'image pour extraction de couleurs');
          reject(new Error('Impossible de charger l\'image'));
        };
        
        img.src = imageUrl;
      });
      
    } catch (error) {
      console.error('❌ Erreur générale extraction couleurs:', error);
      throw error;
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('campaign-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(fileName);

      if (type === 'logo') {
        setStudioData(prev => ({ ...prev, logoFile: file, logoUrl: publicUrl }));
      } else {
        // Pour l'image de fond, extraire les couleurs automatiquement
        setStudioData(prev => ({ ...prev, backgroundFile: file, backgroundUrl: publicUrl }));
        
        try {
          console.log('🚀 Début d\'extraction automatique des couleurs...');
          const extractedColors = await extractColorsFromImage(publicUrl) as any;
          console.log('🎨 Application des couleurs extraites:', extractedColors);
          
          setStudioData(prev => ({ 
            ...prev, 
            extractedColors 
          }));
          
          toast.success('Image de fond uploadée et couleurs extraites avec succès !');
        } catch (colorError) {
          console.warn('⚠️ Impossible d\'extraire les couleurs, upload de l\'image uniquement:', colorError);
          toast.success('Image de fond uploadée avec succès');
        }
        return;
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Image de fond'} uploadé avec succès`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload');
    }
  };

  const generateStudioCampaign = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('studio-campaign-generator', {
        body: {
          websiteUrl: studioData.websiteUrl,
          logoUrl: studioData.logoUrl,
          backgroundImageUrl: studioData.backgroundUrl,
          campaignType: studioData.campaignType,
          targetAudience: studioData.targetAudience,
          objective: studioData.objective
        }
      });

      if (error) throw error;

      setGeneratedCampaign(data);
      setCurrentStep(3);
      toast.success('Campagne studio générée avec succès !');
    } catch (error) {
      console.error('Error generating studio campaign:', error);
      toast.error('Erreur lors de la génération de la campagne');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analyse de votre marque</h2>
          <p className="text-muted-foreground">
            Entrez l'URL de votre site web pour extraire automatiquement les couleurs et le style de votre marque
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
              URL du site web *
            </label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://votre-site.com"
              value={studioData.websiteUrl}
              onChange={(e) => setStudioData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de campagne
              </label>
              <select
                value={studioData.campaignType}
                onChange={(e) => setStudioData(prev => ({ ...prev, campaignType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="wheel">Roue de la chance</option>
                <option value="scratch">Carte à gratter</option>
                <option value="jackpot">Jackpot</option>
                <option value="quiz">Quiz interactif</option>
                <option value="memory">Jeu de mémoire</option>
              </select>
            </div>

            <div>
              <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-2">
                Public cible
              </label>
              <Input
                id="target-audience"
                placeholder="ex: jeunes professionnels"
                value={studioData.targetAudience}
                onChange={(e) => setStudioData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
              Objectif de la campagne
            </label>
            <textarea
              id="objective"
              placeholder="ex: augmenter l'engagement et générer des leads qualifiés"
              value={studioData.objective}
              onChange={(e) => setStudioData(prev => ({ ...prev, objective: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!studioData.websiteUrl}
            className="px-8"
          >
            Continuer
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Assets de marque</h2>
          <p className="text-muted-foreground">
            Uploadez votre logo et une image de fond pour personnaliser votre campagne
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo de la marque
            </label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {studioData.logoFile ? studioData.logoFile.name : 'Cliquez pour uploader votre logo'}
                </p>
              </label>
            </div>
            {studioData.logoUrl && (
              <div className="mt-2">
                <img src={studioData.logoUrl} alt="Logo" className="h-16 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de fond
            </label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'background');
                }}
                className="hidden"
                id="background-upload"
              />
              <label htmlFor="background-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {studioData.backgroundFile ? studioData.backgroundFile.name : 'Cliquez pour uploader une image de fond'}
                </p>
              </label>
            </div>
            {studioData.backgroundUrl && (
              <div className="mt-2">
                <img src={studioData.backgroundUrl} alt="Background" className="h-32 w-full object-cover rounded" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <Button
            onClick={generateStudioCampaign}
            disabled={isGenerating}
            className="px-8"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 mr-2" />
                Générer la campagne studio
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="w-full">
      {generatedCampaign && (
        <StudioPreview
          campaignData={generatedCampaign}
          logoUrl={studioData.logoUrl}
          backgroundUrl={studioData.backgroundUrl}
          extractedColors={studioData.extractedColors}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec étapes */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Studio de Création de Campagne
          </h1>
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <span className={currentStep === 1 ? 'font-semibold text-primary' : ''}>
              Analyse de marque
            </span>
            <span className={currentStep === 2 ? 'font-semibold text-primary' : ''}>
              Assets
            </span>
            <span className={currentStep === 3 ? 'font-semibold text-primary' : ''}>
              Preview Studio
            </span>
          </div>
        </div>

        {/* Contenu des étapes */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default StudioCampaignCreator;