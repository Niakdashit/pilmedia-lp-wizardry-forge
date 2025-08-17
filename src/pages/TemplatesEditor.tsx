import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TemplateGallery, TemplateItem } from '@/components/TemplateGallery';
import { getDefaultCampaign } from '@/components/ModernEditor/utils/defaultCampaign';
import type { CampaignType } from '@/utils/campaignTypes';

type TemplateKind = 'campaign' | 'mechanic';
type Orientation = 'portrait' | 'landscape';
type Size = 'sm' | 'lg';
interface CampaignTemplateItem {
  id: string;
  name: string;
  thumbnail: string;
  description?: string;
  categories: string[]; // e.g., ['Concours', 'Giveaway']
  kind: TemplateKind; // filter to 'campaign' only
  orientation: Orientation; // portrait or landscape
  size?: Size; // optional preferred display size
}

// Gallery now uses the reusable TemplateGallery component

// Mocked templates for gallery. Replace with API fetch later.
const galleryTemplates: CampaignTemplateItem[] = [
  {
    id: 'tpl-concours-minimal-cream',
    name: 'Concours Minimal Crème',
    thumbnail: '/assets/wheel/ring-gold.png',
    description: 'Affiche concours minimaliste, titres forts, CTA clair.',
    categories: ['Concours', 'Brand'],
    kind: 'campaign',
    orientation: 'portrait',
    size: 'lg',
  },
  {
    id: 'tpl-concours-violet-punchy',
    name: 'Concours Violet Punchy',
    thumbnail: '/assets/wheel/ring-silver.png',
    description: 'Couleurs vives, grande photo, CTA visible.',
    categories: ['Concours', 'Promo'],
    kind: 'campaign',
    orientation: 'portrait',
  },
  {
    id: 'tpl-giveaway-joyful',
    name: 'Giveaway Joyeux',
    thumbnail: '/assets/wheel/ring-gold.png',
    description: 'Style coloré type réseau social.',
    categories: ['Giveaway', 'Social'],
    kind: 'campaign',
    orientation: 'landscape',
    size: 'lg',
  },
  {
    id: 'tpl-concours-photo',
    name: 'Jeu Concours Photo',
    thumbnail: '/assets/wheel/ring-silver.png',
    description: 'Mise en avant visuelle, instructions simples.',
    categories: ['Concours', 'UGC'],
    kind: 'campaign',
    orientation: 'landscape',
  },
];

// Map template id -> campaign payload compatible with DesignEditorLayout expectations
const campaignsById: Record<string, any> = {
  'tpl-concours-minimal-cream': {
    id: 'wheel-design-preview',
    type: 'wheel',
    design: {
      background: { type: 'color', value: 'linear-gradient(135deg, #841b60 0%, #b41b60 100%)' },
      customTexts: [
        { id: 'title-1', type: 'text', role: 'title', content: 'Concours Exclusif', x: 160, y: 80, width: 530, height: 60, fontSize: 36, fontWeight: 'bold', style: { color: '#ffffff' } },
        { id: 'desc-1', type: 'text', role: 'description', content: 'Participez et gagnez', x: 160, y: 150, width: 530, height: 40, fontSize: 18, style: { color: '#ffffff' } },
        { id: 'btn-1', type: 'text', role: 'button', content: 'Participer', x: 320, y: 540, width: 210, height: 45, fontSize: 18, style: { color: '#ffffff' } }
      ],
      customImages: [],
      extractedColors: ['#841b60', '#ffffff', '#b41b60'],
      customColors: { primary: '#841b60', secondary: '#ffffff', accent: '#b41b60' },
      wheelConfig: { borderStyle: 'classic', borderColor: '#841b60', scale: 1 }
    },
    gameConfig: { wheel: { segments: [], winProbability: 0.75 } },
    canvasConfig: {
      elements: [
        { id: 'title-1', type: 'text', role: 'title', content: 'Concours Exclusif', x: 160, y: 80, width: 530, height: 60, fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
        { id: 'desc-1', type: 'text', role: 'description', content: 'Participez et gagnez', x: 160, y: 150, width: 530, height: 40, fontSize: 18, textAlign: 'center' },
        { id: 'btn-1', type: 'text', role: 'button', content: 'Participer', x: 320, y: 540, width: 210, height: 45, fontSize: 18, textAlign: 'center' }
      ],
      background: { type: 'color', value: 'linear-gradient(135deg, #841b60 0%, #b41b60 100%)' },
      device: 'desktop'
    }
  },
  'tpl-concours-violet-punchy': {
    id: 'wheel-design-preview',
    type: 'wheel',
    design: {
      background: { type: 'color', value: 'linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%)' },
      customTexts: [
        { id: 'title-2', type: 'text', role: 'title', content: 'Grand Jeu Concours', x: 180, y: 90, width: 480, height: 60, fontSize: 34, fontWeight: 'bold', style: { color: '#222222' } },
        { id: 'desc-2', type: 'text', role: 'description', content: 'De super cadeaux à gagner', x: 240, y: 150, width: 360, height: 40, fontSize: 18, style: { color: '#333333' } },
        { id: 'btn-2', type: 'text', role: 'button', content: 'Participer', x: 340, y: 560, width: 160, height: 45, fontSize: 18, style: { color: '#ffffff' } }
      ],
      customImages: [],
      extractedColors: ['#841b60', '#222222', '#333333'],
      customColors: { primary: '#841b60', secondary: '#222222', accent: '#b41b60' },
      wheelConfig: { borderStyle: 'classic', borderColor: '#841b60', scale: 1 }
    },
    gameConfig: { wheel: { segments: [], winProbability: 0.5 } },
    canvasConfig: {
      elements: [
        { id: 'title-2', type: 'text', role: 'title', content: 'Grand Jeu Concours', x: 180, y: 90, width: 480, height: 60, fontSize: 34, fontWeight: 'bold', textAlign: 'center' },
        { id: 'desc-2', type: 'text', role: 'description', content: 'De super cadeaux à gagner', x: 240, y: 150, width: 360, height: 40, fontSize: 18, textAlign: 'center' },
        { id: 'btn-2', type: 'text', role: 'button', content: 'Participer', x: 340, y: 560, width: 160, height: 45, fontSize: 18, textAlign: 'center' }
      ],
      background: { type: 'color', value: 'linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%)' },
      device: 'desktop'
    }
  }
};

const TemplatesEditor: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch, sidebarCollapsed } = useAppContext();

  // UI state: category filter and search
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [query, setQuery] = useState('');
  const [orientation, setOrientation] = useState<'all' | Orientation>('all');

  // Collapse sidebar by default on this page
  useEffect(() => {
    if (!sidebarCollapsed) {
      dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => {
    const cats = new Set<string>();
    galleryTemplates.forEach(t => t.categories.forEach(c => cats.add(c)));
    return ['Tous', ...Array.from(cats)];
  }, []);

  const filteredTemplates = useMemo(() => {
    return galleryTemplates
      .filter(t => t.kind === 'campaign')
      .filter(t => activeCategory === 'Tous' || t.categories.includes(activeCategory))
      .filter(t => orientation === 'all' || t.orientation === orientation)
      .filter(t => !query || t.name.toLowerCase().includes(query.toLowerCase()));
  }, [activeCategory, query, orientation]);

  const galleryItems: TemplateItem[] = useMemo(() => {
    return filteredTemplates.map((t) => ({
      id: t.id,
      title: t.name,
      coverUrl: t.thumbnail,
      // Laisse TemplateGallery gérer l'alternance (pair -> desktop, impair -> mobile)
    }));
  }, [filteredTemplates]);

  const handleUseTemplate = (tpl: { id: string }) => {
    const campaign = campaignsById[tpl.id];
    navigate('/template-editor', { state: { templateCampaign: campaign } });
  };

  const handleCreateTemplate = () => {
    const defaultType: CampaignType = 'wheel';
    const campaign = getDefaultCampaign(defaultType, true);
    navigate('/template-editor', { state: { templateCampaign: campaign } });
  };

  return (
    <div className="w-full">
      <main className="w-full max-w-none px-6 pb-16 bg-[#eaf7f5]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Modèles</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateTemplate}
              className="px-3 py-1.5 text-sm rounded-lg text-white bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95"
            >
              Créer un modèle
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white border-transparent'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="mx-2 h-5 w-px bg-gray-200 hidden sm:block" />
            <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
              {(['all','portrait','landscape'] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setOrientation(key)}
                  className={`px-3 py-1.5 text-sm ${orientation===key ? 'bg-[#841b60] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {key === 'all' ? 'Tous' : key === 'portrait' ? 'Portrait' : 'Paysage'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b41b60]"
            />
          </div>
        </div>

        {/* Gallery using reusable component with enforced orientation */}
        <TemplateGallery
          items={galleryItems}
          onSelect={(t) => handleUseTemplate({ id: t.id })}
        />
      </main>
    </div>
  );
};

export default TemplatesEditor;
