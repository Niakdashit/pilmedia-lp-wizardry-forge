import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Copy,
  Pencil,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import type { BlocReseauxSociaux } from '@/types/modularEditor';
import {
  SOCIAL_OPTIONS,
  SOCIAL_PRESETS,
  SocialNetworkId,
  applyNetworkPresetToLink,
  getSocialIconUrl,
} from './socialIcons';

interface SocialModulePanelProps {
  module: BlocReseauxSociaux;
  onUpdate: (patch: Partial<BlocReseauxSociaux>) => void;
  onBack?: () => void;
}

const createLinkId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const ICON_STYLE_OPTIONS: Array<{ id: 'color' | 'grey' | 'black'; label: string }> = [
  { id: 'color', label: 'Couleur' },
  { id: 'grey', label: 'Gris' },
  { id: 'black', label: 'Noir' },
];

const SocialModulePanel: React.FC<SocialModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const links = useMemo(() => module.links ?? [], [module.links]);
  const editingLink = useMemo(
    () => (editingLinkId ? links.find((link) => link.id === editingLinkId) ?? null : null),
    [editingLinkId, links]
  );

  const updateLinks = (nextLinks: BlocReseauxSociaux['links']) => {
    onUpdate({ links: nextLinks });
  };

  const updateLink = (id: string, patch: Partial<BlocReseauxSociaux['links'][number]>) => {
    const next = links.map((link) => (link.id === id ? { ...link, ...patch } : link));
    updateLinks(next);
  };

  const reorderLink = (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex((link) => link.id === id);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;
    const next = [...links];
    const [link] = next.splice(index, 1);
    next.splice(targetIndex, 0, link);
    updateLinks(next);
  };

  const handleAddLink = () => {
    const defaultNetwork: SocialNetworkId = 'facebook';
    const preset = SOCIAL_PRESETS[defaultNetwork];
    const newLink = applyNetworkPresetToLink(defaultNetwork, {
      id: createLinkId(module.id || 'social'),
      label: preset.label,
      url: preset.defaultUrl,
      network: defaultNetwork,
      icon: defaultNetwork,
      iconUrl: getSocialIconUrl(defaultNetwork)
    });
    updateLinks([...links, newLink]);
    setEditingLinkId(newLink.id);
  };

  const handleCopyLink = (id: string) => {
    const original = links.find((link) => link.id === id);
    if (!original) return;
    const newLink = {
      ...original,
      id: createLinkId(module.id || 'social'),
      label: `${original.label} (copie)`
    };
    updateLinks([...links, newLink]);
  };

  const handleDeleteLink = (id: string) => {
    const next = links.filter((link) => link.id !== id);
    updateLinks(next);
    if (editingLinkId === id) {
      setEditingLinkId(null);
    }
  };

  const handleNetworkChange = (id: string, network: SocialNetworkId) => {
    const current = links.find((link) => link.id === id);
    if (!current) return;
    const updated = applyNetworkPresetToLink(network, current);
    updateLink(id, updated);
  };

  const renderContentTab = () => {
    if (editingLink && editingLinkId) {
      const networkValue = (editingLink.network as SocialNetworkId | undefined) || 'facebook';
      return (
        <div className="p-6 space-y-6">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[#0a66c2] hover:underline"
            onClick={() => setEditingLinkId(null)}
          >
            <ChevronLeft className="w-4 h-4" />
            Retour aux réseaux sociaux
          </button>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Réseau</label>
            <div className="relative">
              <select
                value={networkValue}
                onChange={(event) => handleNetworkChange(editingLinkId, event.target.value as SocialNetworkId)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0a66c2] focus:ring-[#0a66c2]"
              >
                {SOCIAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">URL *</label>
            <input
              type="url"
              value={editingLink.url || ''}
              onChange={(event) => updateLink(editingLinkId, { url: event.target.value })}
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0a66c2] focus:ring-[#0a66c2]"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Social Network</h3>
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0a66c2] hover:underline"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setEditingLinkId(link.id)}
                  className="text-sm text-slate-800 hover:underline"
                >
                  {link.label || `Réseau ${index + 1}`}
                </button>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  type="button"
                  onClick={() => reorderLink(link.id, 'up')}
                  className="p-1 hover:text-slate-700"
                  title="Monter"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => reorderLink(link.id, 'down')}
                  className="p-1 hover:text-slate-700"
                  title="Descendre"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLinkId(link.id)}
                  className="p-1 hover:text-slate-700"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(link.id)}
                  className="p-1 hover:text-slate-700"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1 hover:text-rose-600"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
              Aucun réseau social pour le moment. Cliquez sur « Ajouter » pour commencer.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStylesTab = () => {
    const iconSize = module.iconSize ?? 48;
    const iconSpacing = module.iconSpacing ?? 12;
    const align = module.align || 'center';
    const currentIconStyle = module.iconStyle ?? 'color';
    const previewNetwork = (links[0]?.network as SocialNetworkId | undefined) || 'facebook';

    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Couleur des icônes</label>
            <div className="grid grid-cols-3 gap-3">
              {ICON_STYLE_OPTIONS.map(({ id, label }) => {
                const isActive = currentIconStyle === id;

                // Déterminer la couleur d'icône
                const iconColor = id === 'color' ? 'default' : id;

                const previewStyle: React.CSSProperties = {
                  background: 'transparent',
                  borderRadius: '0px',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none'
                };

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ iconStyle: id })}
                    className={`group flex flex-col items-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--sidebar-bg))] focus:ring-[#0a66c2] ${
                      isActive ? 'border-[#0a66c2] bg-white/5 text-white' : 'border-slate-600/40 text-slate-300 hover:border-[#0a66c2]/60 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-center" style={previewStyle}>
                      <img
                        src={getSocialIconUrl(previewNetwork, iconColor)}
                        alt={label}
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: 'contain'
                        }}
                      />
                    </span>
                    <span className="text-[10px] uppercase tracking-wide">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Taille des icônes</label>
            <input
              type="range"
              min={20}
              max={96}
              step={2}
              value={iconSize}
              onChange={(event) => onUpdate({ iconSize: Number(event.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-slate-500">{iconSize}px</div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Espacement</label>
            <input
              type="range"
              min={0}
              max={40}
              value={iconSpacing}
              onChange={(event) => onUpdate({ iconSpacing: Number(event.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-slate-500">{iconSpacing}px</div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Alignement</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'left', label: 'Gauche' },
                  { id: 'center', label: 'Centre' },
                  { id: 'right', label: 'Droite' }
                ] as const
              ).map(({ id, label }) => {
                const isActive = align === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ align: id })}
                    className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'border-[#0a66c2] bg-[#0a66c2]/10 text-[#0a66c2]'
                        : 'border-slate-200 text-slate-600 hover:border-[#0a66c2]/50 hover:text-[#0a66c2]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--sidebar-surface))] text-[hsl(var(--sidebar-text-primary))]">
      {onBack && (
        <div className="px-4 py-3 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))]">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[hsl(var(--sidebar-icon))] hover:text-white hover:underline"
            onClick={onBack}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux éléments
          </button>
        </div>
      )}
      <div className="flex border-b border-[hsl(var(--sidebar-border))]">
        {(
          [
            { id: 'content', label: 'Contenu' },
            { id: 'styles', label: 'Styles' }
          ] as const
        ).map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-bg))] text-white'
                  : 'text-[hsl(var(--sidebar-icon))] hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text-primary))]">
        {activeTab === 'content' ? renderContentTab() : renderStylesTab()}
      </div>
    </div>
  );
};

export default SocialModulePanel;
