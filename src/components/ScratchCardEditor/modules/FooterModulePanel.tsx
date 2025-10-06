import React from 'react';
import { Footprints, AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';
import type { BlocPiedDePage, FooterLink } from '@/types/modularEditor';
import ImageUpload from '../../common/ImageUpload';

interface FooterModulePanelProps {
  module: BlocPiedDePage;
  onUpdate: (patch: Partial<BlocPiedDePage>) => void;
  onBack?: () => void;
}

const alignmentOptions: Array<{ id: BlocPiedDePage['align']; label: string; icon: React.ComponentType<any> }> = [
  { id: 'left', label: 'Gauche', icon: AlignLeft },
  { id: 'center', label: 'Centre', icon: AlignCenter },
  { id: 'right', label: 'Droite', icon: AlignRight }
];

const FooterModulePanel: React.FC<FooterModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const currentAlign = module.align || 'center';
  const bandHeight = module.bandHeight ?? 60;
  const bandColor = module.bandColor ?? '#ffffff';
  const bandPadding = module.bandPadding ?? 16;
  const logoWidth = module.logoWidth ?? 120;
  const logoHeight = module.logoHeight ?? 120;
  const footerText = module.footerText ?? '';
  const footerLinks = module.footerLinks ?? [];
  const textColor = module.textColor ?? '#666666';
  const linkColor = module.linkColor ?? '#841b60';
  const fontSize = module.fontSize ?? 14;
  const separator = module.separator ?? '|';

  const addFooterLink = () => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      text: 'Nouveau lien',
      url: '#',
      openInNewTab: false
    };
    onUpdate({ footerLinks: [...footerLinks, newLink] });
  };

  const updateFooterLink = (linkId: string, updates: Partial<FooterLink>) => {
    const updatedLinks = footerLinks.map(link => 
      link.id === linkId ? { ...link, ...updates } : link
    );
    onUpdate({ footerLinks: updatedLinks });
  };

  const removeFooterLink = (linkId: string) => {
    const updatedLinks = footerLinks.filter(link => link.id !== linkId);
    onUpdate({ footerLinks: updatedLinks });
  };

  return (
    <div className="h-full overflow-y-auto pb-12">
      {onBack && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[#841b60] hover:underline"
            onClick={onBack}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux éléments
          </button>
        </div>
      )}
      <div className="px-4 py-5 space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Pied de page</p>
            <p className="text-xs text-gray-500">Personnalisez votre bande de pied de page</p>
          </div>
        </div>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Logo</h4>
          <ImageUpload
            value={module.logoUrl || ''}
            onChange={(value) => onUpdate({ logoUrl: value })}
            label="Télécharger votre logo"
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Largeur du logo</h4>
            <span className="text-xs font-semibold text-gray-600">{logoWidth}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={300}
            value={logoWidth}
            onChange={(e) => onUpdate({ logoWidth: Number(e.target.value) })}
            className="w-full"
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hauteur du logo</h4>
            <span className="text-xs font-semibold text-gray-600">{logoHeight}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={300}
            value={logoHeight}
            onChange={(e) => onUpdate({ logoHeight: Number(e.target.value) })}
            className="w-full"
          />
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Texte du pied de page</h4>
          <textarea
            value={footerText}
            onChange={(e) => onUpdate({ footerText: e.target.value })}
            placeholder="© 2024 Mon entreprise. Tous droits réservés."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60] resize-none"
            rows={3}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Liens du pied de page</h4>
            <button
              type="button"
              onClick={addFooterLink}
              className="flex items-center gap-1 text-xs text-[#841b60] hover:underline"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {footerLinks.map((link) => (
              <div key={link.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => updateFooterLink(link.id, { text: e.target.value })}
                    placeholder="Texte du lien"
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#841b60] focus:ring-[#841b60]"
                  />
                  <button
                    type="button"
                    onClick={() => removeFooterLink(link.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateFooterLink(link.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#841b60] focus:ring-[#841b60]"
                />
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={link.openInNewTab || false}
                    onChange={(e) => updateFooterLink(link.id, { openInNewTab: e.target.checked })}
                    className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]"
                  />
                  Ouvrir dans un nouvel onglet
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Séparateur entre les liens</h4>
          <input
            type="text"
            value={separator}
            onChange={(e) => onUpdate({ separator: e.target.value })}
            placeholder="|"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
          />
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur de la bande</h4>
          <div className="flex gap-2">
            <input
              type="color"
              value={bandColor}
              onChange={(e) => onUpdate({ bandColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={bandColor}
              onChange={(e) => onUpdate({ bandColor: e.target.value })}
              placeholder="#ffffff"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur du texte</h4>
          <div className="flex gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              placeholder="#666666"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur des liens</h4>
          <div className="flex gap-2">
            <input
              type="color"
              value={linkColor}
              onChange={(e) => onUpdate({ linkColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={linkColor}
              onChange={(e) => onUpdate({ linkColor: e.target.value })}
              placeholder="#841b60"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taille de police</h4>
            <span className="text-xs font-semibold text-gray-600">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hauteur de la bande</h4>
            <span className="text-xs font-semibold text-gray-600">{bandHeight}px</span>
          </div>
          <input
            type="range"
            min={60}
            max={300}
            value={bandHeight}
            onChange={(e) => onUpdate({ bandHeight: Number(e.target.value) })}
            className="w-full"
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Espacement interne</h4>
            <span className="text-xs font-semibold text-gray-600">{bandPadding}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={bandPadding}
            onChange={(e) => onUpdate({ bandPadding: Number(e.target.value) })}
            className="w-full"
          />
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alignement</h4>
          <div className="grid grid-cols-3 gap-2">
            {alignmentOptions.map(({ id, label, icon: Icon }) => {
              const isActive = currentAlign === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ align: id })}
                  className={`flex flex-col items-center rounded-lg border px-3 py-2 text-[11px] leading-tight transition ${
                    isActive
                      ? 'border-[#841b60] bg-[#841b60]/10 text-[#841b60] shadow-sm shadow-[#841b60]/30'
                      : 'border-gray-200 text-gray-600 hover:border-[#841b60]/40 hover:text-[#841b60]'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FooterModulePanel;