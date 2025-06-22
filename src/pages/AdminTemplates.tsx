
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/common/Button';
import AdminTemplatesStats from '../components/Admin/AdminTemplates/AdminTemplatesStats';
import AdminTemplatesFilters from '../components/Admin/AdminTemplates/AdminTemplatesFilters';
import AdminTemplatesGrid from '../components/Admin/AdminTemplates/AdminTemplatesGrid';
import AdminTemplatesEmptyState from '../components/Admin/AdminTemplates/AdminTemplatesEmptyState';
import { GameTemplate } from '../components/Admin/AdminTemplates/AdminTemplateCard';
import { CampaignType } from '../utils/campaignTypes';

const AdminTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');

  // Mock data
  const mockTemplates: GameTemplate[] = [
    {
      id: 'template1',
      name: 'Roue de la Fortune Luxe',
      description: 'Template premium avec design élégant pour secteur luxe',
      type: 'wheel' as CampaignType,
      thumbnail: '/api/placeholder/300/200',
      isPrivate: false,
      usageCount: 23,
      createdAt: '2025-01-05',
      createdBy: 'Admin',
      tags: ['luxe', 'premium', 'élégant']
    },
    {
      id: 'template2',
      name: 'Quiz Marketing B2B',
      description: 'Quiz prêt à l\'emploi pour lead generation B2B',
      type: 'quiz' as CampaignType,
      thumbnail: '/api/placeholder/300/200',
      isPrivate: true,
      usageCount: 8,
      createdAt: '2025-01-03',
      createdBy: 'Admin',
      tags: ['b2b', 'leads', 'professionnel']
    },
    {
      id: 'template3',
      name: 'Jackpot E-commerce',
      description: 'Jeu de jackpot optimisé pour sites e-commerce',
      type: 'quiz' as CampaignType,
      thumbnail: '/api/placeholder/300/200',
      isPrivate: false,
      usageCount: 45,
      createdAt: '2024-12-28',
      createdBy: 'Admin',
      tags: ['ecommerce', 'conversion', 'promo']
    }
  ];

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesVisibility = 
      filterVisibility === 'all' ||
      (filterVisibility === 'private' && template.isPrivate) ||
      (filterVisibility === 'public' && !template.isPrivate);
    return matchesSearch && matchesType && matchesVisibility;
  });

  const publicTemplates = mockTemplates.filter(t => !t.isPrivate).length;
  const privateTemplates = mockTemplates.filter(t => t.isPrivate).length;
  const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div className="-mx-6 -mt-6 min-h-screen">
      <PageHeader
        title="Modèles de Jeux"
        size="sm"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link to="/admin">
              <Button
                variant="primary"
                className="px-4 sm:px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Retour Dashboard</span>
                <span className="sm:hidden">Retour</span>
              </Button>
            </Link>
            <Button
              variant="primary"
              className="px-4 sm:px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Créer un Modèle</span>
              <span className="sm:hidden">Créer</span>
            </Button>
          </div>
        }
      />

      <div className="px-3 sm:px-6 pb-6 max-w-full overflow-hidden">
        <AdminTemplatesStats
          totalTemplates={mockTemplates.length}
          publicTemplates={publicTemplates}
          privateTemplates={privateTemplates}
          totalUsage={totalUsage}
        />

        <AdminTemplatesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterVisibility={filterVisibility}
          setFilterVisibility={setFilterVisibility}
        />

        {filteredTemplates.length === 0 ? (
          <AdminTemplatesEmptyState />
        ) : (
          <AdminTemplatesGrid templates={filteredTemplates} />
        )}
      </div>
    </div>
  );
};

export default AdminTemplates;
