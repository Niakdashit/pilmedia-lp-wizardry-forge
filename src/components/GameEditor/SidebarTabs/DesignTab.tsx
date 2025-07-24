
import React, { useState } from 'react';
import { Palette, Image, Upload, Trash2, Sparkles, Globe } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';
import { supabase } from '@/integrations/supabase/client';

interface DesignTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [brandUrl, setBrandUrl] = useState('');
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [brandBackground, setBrandBackground] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBranding, setGeneratedBranding] = useState<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'banner') {
          onConfigUpdate({ bannerImage: imageUrl });
        } else {
          // Handle background image for device config
          const deviceConfig = config.deviceConfig || {
            mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
          };
          onConfigUpdate({
            deviceConfig: {
              ...deviceConfig,
              desktop: { ...deviceConfig.desktop, backgroundImage: imageUrl }
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandFileUpload = async (file: File, type: 'logo' | 'background') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const { data, error } = await supabase.functions.invoke('upload-asset', {
        body: formData,
      });

      if (error) throw error;
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const generateBrandingWithAI = async () => {
    if (!brandUrl) {
      alert('Veuillez entrer une URL de marque');
      return;
    }

    setIsGenerating(true);
    try {
      let logoUrl = '';
      let backgroundUrl = '';

      // Upload logo if provided
      if (brandLogo) {
        logoUrl = await handleBrandFileUpload(brandLogo, 'logo');
      }

      // Upload background if provided
      if (brandBackground) {
        backgroundUrl = await handleBrandFileUpload(brandBackground, 'background');
      }

      // Call GPT-4o API with the detailed prompt
      const prompt = `Génère une campagne de jeu concours digital adaptée à une marque donnée, prêt à l'emploi, en t'appuyant sur les éléments suivants : l'URL officielle du site de la marque (à explorer pour comprendre l'univers visuel/la tonalité), un logo fourni (à utiliser sans modification), et une image de fond fournie (ou à défaut, propose une ambiance en cohérence avec la marque). Le visuel doit être décliné pour trois formats (PC 16:9, tablette et mobile 9:16), respecter strictement la charte graphique et le ton de la marque, sans jamais paraître générique ou  IA généré.

Procède ainsi :
- Analyse l'URL pour identifier et extraire : 
    - Couleurs dominantes (en hexa) 
    - Polices principales (noms précis si trouvés)
    - Ambiance visuelle/mots-clés descriptifs 
    - Ton éditorial 
    - Slogan officiel de la marque (si existant et pertinent)
- Utilise obligatoirement (sans aucune modification ni génération) :
    - Le logo uploadé 
    - L'image de fond uploadée (ou, s'il n'y en a pas : crée une proposition d'ambiance fidèle à la marque)
- Structure le wording typique d'un jeu concours selon les usages français (évite tournures artificielles ou IA, reste professionnel et fluide) : 
    - Titre principal impactant 
    - Sous-titre/explanation 
    - Mécanique de participation claire (ex : "Tournez la roue", "Remplissez le formulaire…")
    - Avantage/bénéfice client 
    - Call-to-action percutant 
- Peaufine tout wording pour la cible (style moderne/sobre/ludique selon secteur).
- Propose une structure visuelle pour le rendu : 
    - Placement du logo
    - Positionnement de l'image de fond
    - Recommandations d'emplacement pour chaque bloc de texte, par version POS (PC / tablette / mobile)
- Le tout en garantissant un rendu niveau design studio.
- Assure-toi que le rendu final respecte à la lettre la charte, l'univers, et cible de la marque (jamais d'effet générique ou IA).

URL de la marque: ${brandUrl}
Logo fourni: ${logoUrl ? 'Oui' : 'Non'}
Image de fond fournie: ${backgroundUrl ? 'Oui' : 'Non'}

Réponds UNIQUEMENT avec un JSON valide suivant cette structure exacte (en français, structuré et exhaustif):
{
  "palette_couleurs": [
    {"nom": "[Nom ou brève description de la couleur]", "hexa": "[#RRGGBB]"}
  ],
  "polices": [
    {"nom": "[Nom exact de la police]", "utilisation": "[titres, texte courant, etc.]"}
  ],
  "ambiance_et_keywords": ["mot-clé1", "mot-clé2", "adjectif1"],
  "extrait_du_ton_editorial": "[court extrait ou description du registre et du ton de la marque identifié sur son site]",
  "slogan_officiel": "[slogan ou null]",
  "wording_jeu_concours": {
    "titre": "[Titre principal accrocheur]",
    "sous_titre": "[Phrase explicative ou incitative]",
    "mecanique": "[Description de la mécanique de participation]",
    "avantage_client": "[Formulation de l'avantage/lot ciblé]",
    "call_to_action": "[CTA engageant et concis]"
  },
  "structure_visuelle": {
    "format_pc_16_9": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    },
    "format_tablette": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    },
    "format_mobile_9_16": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    }
  },
  "commentaires_design": "[Consignes additionnelles pour studio : style, intégration, détails pour éviter l'effet template, etc.]"
}`;

      const { data, error } = await supabase.functions.invoke('openai-branding-generator', {
        body: {
          prompt,
          websiteUrl: brandUrl,
          logoUrl,
          backgroundUrl
        }
      });

      if (error) throw error;

      setGeneratedBranding(data.result);

      // Apply the generated branding to the config
      if (data.result.palette_couleurs && data.result.palette_couleurs.length > 0) {
        onConfigUpdate({
          backgroundColor: data.result.palette_couleurs[0]?.hexa || '#ffffff',
          outlineColor: data.result.palette_couleurs[1]?.hexa || '#000000',
          participateButtonColor: data.result.palette_couleurs[2]?.hexa || '#ff6b35',
          participateButtonText: data.result.wording_jeu_concours?.call_to_action || 'PARTICIPER !',
          bannerDescription: data.result.wording_jeu_concours?.titre || '',
          footerText: data.result.wording_jeu_concours?.sous_titre || ''
        });
      }

      // Create or update main title & subtitle custom texts with responsive design
      const updatedCustomTexts = [...(config.customTexts || [])];

      if (data.result.wording_jeu_concours?.titre) {
        const mainTitleIndex = updatedCustomTexts.findIndex(t => t.id === 'main-title');
        const mainTitle = {
          id: 'main-title',
          content: data.result.wording_jeu_concours.titre,
          x: 250,
          y: 60,
          fontSize: 32,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          color: '#ffffff',
          fontWeight: 'bold' as const,
          fontStyle: 'normal' as const,
          textDecoration: 'none',
          textAlign: 'center' as const,
          hasEffect: true,
          isAnimated: false,
          width: 300,
          height: 50,
          deviceConfig: {
            desktop: { x: 250, y: 60, fontSize: 32, width: 300, height: 50 },
            tablet: { x: 150, y: 50, fontSize: 24, width: 300, height: 40 },
            mobile: { x: 60, y: 80, fontSize: 18, width: 200, height: 35 }
          }
        } as const;

        if (mainTitleIndex !== -1) {
          updatedCustomTexts[mainTitleIndex] = { ...updatedCustomTexts[mainTitleIndex], ...mainTitle };
        } else {
          updatedCustomTexts.push(mainTitle);
        }
      }

      if (data.result.wording_jeu_concours?.sous_titre) {
        const subtitleIndex = updatedCustomTexts.findIndex(t => t.id === 'subtitle');
        const subtitle = {
          id: 'subtitle',
          content: data.result.wording_jeu_concours.sous_titre,
          x: 250,
          y: 130,
          fontSize: 18,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          color: '#ffffff',
          fontWeight: 'normal' as const,
          fontStyle: 'normal' as const,
          textDecoration: 'none',
          textAlign: 'center' as const,
          hasEffect: true,
          isAnimated: false,
          width: 300,
          height: 30,
          deviceConfig: {
            desktop: { x: 250, y: 130, fontSize: 18, width: 300, height: 30 },
            tablet: { x: 150, y: 110, fontSize: 16, width: 300, height: 28 },
            mobile: { x: 60, y: 130, fontSize: 14, width: 200, height: 25 }
          }
        } as const;

        if (subtitleIndex !== -1) {
          updatedCustomTexts[subtitleIndex] = { ...updatedCustomTexts[subtitleIndex], ...subtitle };
        } else {
          updatedCustomTexts.push(subtitle);
        }
      }

      if (data.result.wording_jeu_concours?.titre || data.result.wording_jeu_concours?.sous_titre) {
        onConfigUpdate({ customTexts: updatedCustomTexts });
      }

      if (logoUrl) {
        onConfigUpdate({ bannerImage: logoUrl });
      }

    } catch (error) {
      console.error('Error generating branding:', error);
      alert('Erreur lors de la génération du branding IA');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Design & Contenu</h3>
      
      {/* Branding IA */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Branding IA
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              URL de la marque
            </label>
            <input
              type="url"
              value={brandUrl}
              onChange={e => setBrandUrl(e.target.value)}
              placeholder="https://votremarque.com"
              className="w-full"
            />
          </div>

          <div className="form-group-premium">
            <label>Logo de marque</label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4" />
                {brandLogo ? 'Logo sélectionné' : 'Choisir un logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setBrandLogo(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {brandLogo && (
                <div className="text-sm text-gray-600">
                  {brandLogo.name}
                </div>
              )}
            </div>
          </div>

          <div className="form-group-premium">
            <label>Image de fond (optionnel)</label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4" />
                {brandBackground ? 'Image sélectionnée' : 'Choisir une image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setBrandBackground(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {brandBackground && (
                <div className="text-sm text-gray-600">
                  {brandBackground.name}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={generateBrandingWithAI}
            disabled={isGenerating || !brandUrl}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Générer le branding IA
              </>
            )}
          </button>

          {generatedBranding && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Branding généré avec succès!</h5>
              <div className="text-sm text-green-700">
                <p><strong>Titre:</strong> {generatedBranding.wording_jeu_concours?.titre}</p>
                <p><strong>Call-to-action:</strong> {generatedBranding.wording_jeu_concours?.call_to_action}</p>
                <div className="flex gap-2 mt-2">
                  {generatedBranding.palette_couleurs?.slice(0, 3).map((couleur: any, index: number) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: couleur.hexa }}
                      title={couleur.nom}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Couleurs principales */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs principales
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur de contour</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
              />
              <input
                type="text"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Image className="w-4 h-4" />
          Images
        </h4>
        
        <div className="space-y-4">
          {/* Image de bannière */}
          <div className="form-group-premium">
            <label>Image de bannière</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
                {config.bannerImage && (
                  <button
                    onClick={() => onConfigUpdate({ bannerImage: undefined })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {config.bannerImage && (
                <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={config.bannerImage}
                    alt="Aperçu bannière"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description de bannière */}
          <div className="form-group-premium">
            <label>Description de bannière</label>
            <textarea
              value={config.bannerDescription || ''}
              onChange={e => onConfigUpdate({ bannerDescription: e.target.value })}
              placeholder="Description courte pour accompagner la bannière..."
              rows={3}
            />
          </div>

          {/* Lien de bannière */}
          <div className="form-group-premium">
            <label>Lien de bannière</label>
            <input
              type="url"
              value={config.bannerLink || ''}
              onChange={e => onConfigUpdate({ bannerLink: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Style de bordure */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style de bordure</h4>
        
        <div className="form-group-premium">
          <label>Type de bordure</label>
          <select
            value={config.borderStyle || 'classic'}
            onChange={e => onConfigUpdate({ borderStyle: e.target.value })}
          >
            <option value="classic">Classique</option>
            <option value="rounded">Arrondie</option>
            <option value="modern">Moderne</option>
            <option value="none">Aucune</option>
          </select>
        </div>
      </div>

      {/* Bouton de participation */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Bouton de participation</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du bouton</label>
            <input
              type="text"
              value={config.participateButtonText || 'PARTICIPER !'}
              onChange={e => onConfigUpdate({ participateButtonText: e.target.value })}
              placeholder="PARTICIPER !"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group-premium">
              <label>Couleur du bouton</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                  placeholder="#ff6b35"
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label>Couleur du texte</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Pied de page</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du pied de page</label>
            <textarea
              value={config.footerText || ''}
              onChange={e => onConfigUpdate({ footerText: e.target.value })}
              placeholder="Mentions légales, conditions..."
              rows={3}
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond du pied de page</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
              />
              <input
                type="text"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
                placeholder="#f8f9fa"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
