import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/Layout/PageContainer';
import AdminTemplatesGrid from '../components/Admin/AdminTemplates/AdminTemplatesGrid';
import type { GameTemplate } from '../components/Admin/AdminTemplates/AdminTemplateCard';
import AdminTemplatesFilters from '../components/Admin/AdminTemplates/AdminTemplatesFilters';
import { useAppContext } from '../context/AppContext';

// Mock templates for now
const MOCK_TEMPLATES: GameTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Jackpot Violet Premium',
    description: 'Un template Jackpot élégant aux couleurs Prosplay.',
    type: 'jackpot',
    thumbnail: '/src/assets/templates/Tjackpot1.svg',
    orientation: 'landscape',
    isPrivate: false,
    usageCount: 23,
    createdAt: new Date().toISOString(),
    createdBy: 'Prosplay',
    tags: ['Jackpot', 'Violet', 'Premium']
  },
  {
    id: 'tpl-2',
    name: 'Jackpot Minimal',
    description: 'Version minimaliste et lumineuse.',
    type: 'jackpot',
    thumbnail: '/src/assets/templates/Tjackpot2.svg',
    orientation: 'portrait',
    isPrivate: false,
    usageCount: 11,
    createdAt: new Date().toISOString(),
    createdBy: 'Prosplay',
    tags: ['Jackpot', 'Light']
  },
  {
    id: 'tpl-3',
    name: 'Jackpot Compact',
    description: 'Format compact pour mobile-first.',
    type: 'jackpot',
    thumbnail: '/src/assets/templates/Tjackpot4.svg',
    orientation: 'portrait',
    isPrivate: true,
    usageCount: 5,
    createdAt: new Date().toISOString(),
    createdBy: 'Prosplay',
    tags: ['Privé', 'Mobile']
  }
];

const TemplatesEditor: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  // Collapse sidebar for a focused gallery view
  useEffect(() => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: true });
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');

  const templates = MOCK_TEMPLATES;
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch = [t.name, t.description, ...(t.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === (filterType as any);
      const matchesVisibility =
        filterVisibility === 'all' ||
        (filterVisibility === 'public' && !t.isPrivate) ||
        (filterVisibility === 'private' && t.isPrivate);
      return matchesSearch && matchesType && matchesVisibility;
    });
  }, [templates, searchTerm, filterType, filterVisibility]);

  return (
    <PageContainer>
      <div className="px-[25px] pt-6 pb-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Modèles</h1>
          <button
            onClick={() => navigate('/template-editor')}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-[#44444d] text-white hover:opacity-95"
          >
            Créer un modèle
          </button>
        </div>

        {/* Filtres uniquement */}
        <div className="mb-4">
          <AdminTemplatesFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterVisibility={filterVisibility}
            setFilterVisibility={setFilterVisibility}
          />
        </div>

        {/* Uniquement les formes sous la barre de recherche et filtres */}
        <AdminTemplatesGrid
          templates={filteredTemplates}
          onUse={(tpl) => navigate('/design-editor', { state: { templateCampaign: tpl } })}
          variant="shape"
        />
      </div>
    </PageContainer>
  );
};

export default TemplatesEditor;
