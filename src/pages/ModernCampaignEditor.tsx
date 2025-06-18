import React, { useState, useEffect } from 'react';
import { Loader, Save, Eye, ChevronLeft, Settings, Edit, BarChart2, Users } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useCampaigns } from '../hooks/useCampaigns';
import ModernEditorSidebar from '../components/ModernEditor/ModernEditorSidebar';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';
import ModernGeneralTab from '../components/ModernEditor/ModernGeneralTab';
import ModernGameTab from '../components/ModernEditor/ModernGameTab';
import ModernLayoutTab from '../components/ModernEditor/ModernLayoutTab';
import ModernDesignTab from '../components/ModernEditor/ModernDesignTab';
import ModernFormTab from '../components/ModernEditor/ModernFormTab';
import ModernMobileTab from '../components/ModernEditor/ModernMobileTab';

const TAB_OPTIONS = [
  { label: 'Général', icon: <Edit />, key: 'general' },
  { label: 'Jeu', icon: <Settings />, key: 'game' },
  { label: 'Layout', icon: <BarChart2 />, key: 'layout' },
  { label: 'Design', icon: <BarChart2 />, key: 'design' },
  { label: 'Formulaire', icon: <Users />, key: 'form' },
  { label: 'Mobile', icon: <BarChart2 />, key: 'mobile' },
];

const ModernCampaignEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { getCampaign, saveCampaign } = useCampaigns();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setCampaign({
        name: '',
        description: '',
        type: 'quiz',
        config: {},
        design: {},
      });
      return;
    }
    if (id) {
      getCampaign(id)
        .then((data) => data && setCampaign(data))
        .catch(() => toast.error('Erreur lors du chargement de la campagne'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew, getCampaign]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCampaign({ ...campaign, id: isNew ? undefined : id });
      toast.success('Campagne sauvegardée avec succès !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <ModernGeneralTab campaign={campaign} setCampaign={setCampaign} />;
      case 'game':
        return <ModernGameTab campaign={campaign} setCampaign={setCampaign} />;
      case 'layout':
        return <ModernLayoutTab campaign={campaign} setCampaign={setCampaign} />;
      case 'design':
        return <ModernDesignTab campaign={campaign} setCampaign={setCampaign} />;
      case 'form':
        return <ModernFormTab campaign={campaign} setCampaign={setCampaign} />;
      case 'mobile':
        return <ModernMobileTab campaign={campaign} setCampaign={setCampaign} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin w-10 h-10 text-[#841b60]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-40px)]">
      <ModernEditorSidebar
        tabs={TAB_OPTIONS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        campaignName={campaign?.name}
        onBack={() => navigate('/campaigns')}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b bg-white shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="text-gray-500 hover:text-[#841b60] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#841b60]">{campaign?.name || 'Nouvelle campagne'}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreview(true)}
              className="px-5 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Prévisualiser</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#841b60] text-white font-semibold shadow-lg hover:bg-[#6d164f] transition-all flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-b from-[#f9f1f9] to-[#f7fafc] p-8 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
      {showPreview && (
        <ModernPreviewModal campaign={campaign} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default ModernCampaignEditor;
