import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { Eye, Send, Save } from 'lucide-react';
import { ModulesList } from '../components/Newsletter/ModulesList';
import { EditorCanvas } from '../components/Newsletter/EditorCanvas';
import { PropertiesPanel } from '../components/Newsletter/PropertiesPanel';
import PageHeader from '../components/Layout/PageHeader';
import { useNewsletterStore } from '../stores/newsletterStore';
import NewsletterPreviewModal from '../components/Newsletter/NewsletterPreviewModal';
import { SettingsTab } from '@/components/Newsletter/properties/Tab/SettingsTab';
const Newsletter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'settings' | 'send' | 'automate'>('edit');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const {
    addModule
  } = useNewsletterStore();
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && over.id === 'editor') {
      const moduleType = active.id as string;
      addModule({
        id: `module-${Date.now()}`,
        type: moduleType as any,
        content: '',
        settings: {}
      });
    }
  };

  // Mock campaign data for preview
  const mockCampaign = {
    name: 'Newsletter Test',
    description: 'Newsletter de test',
    design: {
      background: '#ffffff',
      primaryColor: '#841b60'
    }
  };
  return <div className="-mx-6 -mt-6">
      <PageHeader
        title="Éditeur de Newsletter"
        actions={
          <>
            <button onClick={() => setShowPreviewModal(true)} className="btn-secondary rounded-full flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Aperçu
            </button>
            <button className="btn-secondary rounded-full flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Enregistrer
            </button>
            <button className="btn-secondary rounded-full flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Envoyer
            </button>
          </>
        }
      />

      <div className="bg-[#ebf4f7] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-6">
            <button className={`px-6 py-3 font-semibold transition ${activeTab === 'edit' ? 'bg-white text-[#841b60] border-b-2 border-[#841b60]' : 'text-gray-600 hover:text-[#841b60] hover:bg-white rounded-t-md'}`} onClick={() => setActiveTab('edit')}>
              Modifier
            </button>
            <button className={`px-6 py-3 font-semibold transition ${activeTab === 'settings' ? 'bg-white text-[#841b60] border-b-2 border-[#841b60]' : 'text-gray-600 hover:text-[#841b60] hover:bg-white rounded-t-md'}`} onClick={() => setActiveTab('settings')}>
              Paramètres
            </button>
            <button className={`px-6 py-3 font-semibold transition ${activeTab === 'send' ? 'bg-white text-[#841b60] border-b-2 border-[#841b60]' : 'text-gray-600 hover:text-[#841b60] hover:bg-white rounded-t-md'}`} onClick={() => setActiveTab('send')}>
              Envoyer ou planifier
            </button>
            <button className={`px-6 py-3 font-semibold transition ${activeTab === 'automate' ? 'bg-white text-[#841b60] border-b-2 border-[#841b60]' : 'text-gray-600 hover:text-[#841b60] hover:bg-white rounded-t-md'}`} onClick={() => setActiveTab('automate')}>
              Automatiser
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)]">
        {activeTab === 'edit' && <DndContext onDragEnd={handleDragEnd}>
            <ModulesList />
            <EditorCanvas />
            <PropertiesPanel />
            <DragOverlay>{/* Preview during drag */}</DragOverlay>
          </DndContext>}

        {activeTab === 'settings' && <div className="flex-1 bg-white p-6 overflow-auto">
            <SettingsTab />
          </div>}

        {activeTab === 'send' && <div className="flex-1 p-6 bg-white text-gray-600">
            <h2>Envoyer ou planifier</h2>
          </div>}

        {activeTab === 'automate' && <div className="flex-1 p-6 bg-white text-gray-600">
            <h2>Automatiser</h2>
          </div>}
      </div>

      <NewsletterPreviewModal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} campaign={mockCampaign} />
    </div>;
};
export default Newsletter;