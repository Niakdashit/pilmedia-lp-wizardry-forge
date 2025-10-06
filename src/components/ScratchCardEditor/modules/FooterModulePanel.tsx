import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BlocPiedDePage, FooterLink, FooterSocialLink } from '@/types/modularEditor';

export interface FooterModulePanelProps {
  module: BlocPiedDePage;
  onUpdate: (updates: Partial<BlocPiedDePage>) => void;
  onBack: () => void;
}

const FooterModulePanel: React.FC<FooterModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const currentAlign = module.align || 'center';
  const bandHeight = module.bandHeight ?? 60;
  const bandColor = module.bandColor ?? '#ffffff';
  const bandPadding = module.bandPadding ?? 16;
  const footerText = module.footerText ?? '';
  const footerLinks = module.footerLinks ?? [];
  const textColor = module.textColor ?? '#000000';
  const linkColor = module.linkColor ?? '#841b60';
  const fontSize = module.fontSize ?? 14;
  const separator = module.separator ?? '|';
  const socialLinks = module.socialLinks ?? [];
  const socialIconSize = module.socialIconSize ?? 24;
  const socialIconColor = module.socialIconColor ?? '#000000';

  const [activeTab, setActiveTab] = useState<'text' | 'links' | 'social'>('text');


  const handleAddLink = () => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      text: 'Nouveau lien',
      url: 'https://',
      openInNewTab: true
    };
    onUpdate({ footerLinks: [...footerLinks, newLink] });
  };

  const handleUpdateLink = (id: string, updates: Partial<FooterLink>) => {
    const updatedLinks = footerLinks.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    onUpdate({ footerLinks: updatedLinks });
  };

  const handleDeleteLink = (id: string) => {
    const updatedLinks = footerLinks.filter(link => link.id !== id);
    onUpdate({ footerLinks: updatedLinks });
  };

  const handleAddSocialLink = (platform: FooterSocialLink['platform']) => {
    const newSocialLink: FooterSocialLink = {
      id: `social-${Date.now()}`,
      platform,
      url: 'https://'
    };
    onUpdate({ socialLinks: [...socialLinks, newSocialLink] });
  };

  const handleUpdateSocialLink = (id: string, updates: Partial<FooterSocialLink>) => {
    const updatedSocialLinks = socialLinks.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    onUpdate({ socialLinks: updatedSocialLinks });
  };

  const handleDeleteSocialLink = (id: string) => {
    const updatedSocialLinks = socialLinks.filter(link => link.id !== id);
    onUpdate({ socialLinks: updatedSocialLinks });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-sm font-semibold">Pied de page</h3>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'text'
              ? 'border-b-2 border-[#841b60] text-[#841b60]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Texte
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'links'
              ? 'border-b-2 border-[#841b60] text-[#841b60]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Liens
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'border-b-2 border-[#841b60] text-[#841b60]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Réseaux sociaux
        </button>
      </div>

      <div className="space-y-4">
        {/* Onglet Texte */}
        {activeTab === 'text' && (
          <>
            <div>
              <Label className="text-xs">Texte du footer</Label>
              <textarea
                value={footerText}
                onChange={(e) => onUpdate({ footerText: e.target.value })}
                placeholder="Ex: © 2024 Mon entreprise. Tous droits réservés."
                className="mt-1 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#841b60] text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">Couleur du texte</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Taille de police (px)</Label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 14 })}
                className="mt-1"
              />
            </div>
          </>
        )}

        {/* Onglet Liens */}
        {activeTab === 'links' && (
          <>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Liens du footer</Label>
              <Button
                onClick={handleAddLink}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {footerLinks.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Aucun lien. Cliquez sur "Ajouter" pour créer un lien.
              </div>
            ) : (
              <div className="space-y-3">
                {footerLinks.map((link) => (
                  <div key={link.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Lien</Label>
                      <Button
                        onClick={() => handleDeleteLink(link.id)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Texte du lien</Label>
                      <Input
                        value={link.text}
                        onChange={(e) => handleUpdateLink(link.id, { text: e.target.value })}
                        placeholder="Ex: Politique de confidentialité"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`new-tab-${link.id}`}
                        checked={link.openInNewTab ?? true}
                        onChange={(e) => handleUpdateLink(link.id, { openInNewTab: e.target.checked })}
                        className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
                      />
                      <label htmlFor={`new-tab-${link.id}`} className="text-xs text-gray-700 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Ouvrir dans un nouvel onglet
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label className="text-xs">Séparateur entre les liens</Label>
              <Input
                value={separator}
                onChange={(e) => onUpdate({ separator: e.target.value })}
                placeholder="Ex: | ou •"
                className="mt-1"
                maxLength={3}
              />
            </div>

            <div>
              <Label className="text-xs">Couleur des liens</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={linkColor}
                  onChange={(e) => onUpdate({ linkColor: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={linkColor}
                  onChange={(e) => onUpdate({ linkColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </>
        )}

        {/* Onglet Réseaux sociaux */}
        {activeTab === 'social' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs">Liens des réseaux sociaux</Label>
              </div>

              {/* Liste des plateformes disponibles */}
              <div className="space-y-2 mb-4">
                <Label className="text-xs text-gray-600">Ajouter un réseau social</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['facebook', 'linkedin', 'twitter', 'instagram', 'youtube', 'tiktok'] as const).map((platform) => {
                    const alreadyAdded = socialLinks.some(link => link.platform === platform);
                    return (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        onClick={() => !alreadyAdded && handleAddSocialLink(platform)}
                        disabled={alreadyAdded}
                        className="capitalize"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {platform === 'twitter' ? 'X' : platform}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Liste des réseaux sociaux ajoutés */}
              {socialLinks.length > 0 && (
                <div className="space-y-2">
                  {socialLinks.map((socialLink) => (
                    <div key={socialLink.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {socialLink.platform === 'twitter' ? 'X (Twitter)' : socialLink.platform}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSocialLink(socialLink.id)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <Input
                          type="url"
                          value={socialLink.url}
                          onChange={(e) => handleUpdateSocialLink(socialLink.id, { url: e.target.value })}
                          placeholder={`https://${socialLink.platform}.com/...`}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {socialLinks.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  Aucun réseau social ajouté. Cliquez sur un bouton ci-dessus pour en ajouter.
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs">Taille des icônes (px)</Label>
              <Input
                type="number"
                value={socialIconSize}
                onChange={(e) => onUpdate({ socialIconSize: parseInt(e.target.value) || 24 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Couleur des icônes</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={socialIconColor}
                  onChange={(e) => onUpdate({ socialIconColor: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={socialIconColor}
                  onChange={(e) => onUpdate({ socialIconColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </>
        )}

        {/* Paramètres communs */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div>
            <Label className="text-xs">Hauteur de la bande (px)</Label>
            <Input
              type="number"
              value={bandHeight}
              onChange={(e) => onUpdate({ bandHeight: parseInt(e.target.value) || 60 })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Couleur de fond</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={bandColor}
                onChange={(e) => onUpdate({ bandColor: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={bandColor}
                onChange={(e) => onUpdate({ bandColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Padding vertical (px)</Label>
            <Input
              type="number"
              value={bandPadding}
              onChange={(e) => onUpdate({ bandPadding: parseInt(e.target.value) || 16 })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Alignement</Label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((a) => (
                <Button
                  key={a}
                  size="sm"
                  variant={currentAlign === a ? 'default' : 'outline'}
                  onClick={() => onUpdate({ align: a })}
                  className="capitalize flex-1"
                >
                  {a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterModulePanel;
