import React, { useState } from 'react';
import { Eye, Send, Save, Sparkles } from 'lucide-react';
import { EnhancedModulesList } from '../components/Newsletter/EnhancedModulesList';
import { EnhancedEditorCanvas } from '../components/Newsletter/EnhancedEditorCanvas';
import { PropertiesPanel } from '../components/Newsletter/PropertiesPanel';
import PageHeader from '../components/Layout/PageHeader';
import NewsletterPreviewModal from '../components/Newsletter/NewsletterPreviewModal';
import { SettingsTab } from '@/components/Newsletter/properties/Tab/SettingsTab';
import PageContainer from '../components/Layout/PageContainer';

const Newsletter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'settings' | 'send' | 'automate'>('edit');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Mock campaign data for preview
  const mockCampaign = {
    name: 'Newsletter Test',
    description: 'Newsletter de test',
    design: {
      background: '#ffffff',
      primaryColor: '#841b60'
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Éditeur de Newsletter"
        size="sm"
        actions={
          <div>
            {/* Actions mobiles et desktop */}
            <div className="md:hidden w-full flex justify-center">
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white font-semibold rounded-2xl hover:from-[#6d164f] hover:to-[#841b60] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Aperçu
                </button>
                <div className="flex gap-3 w-full">
                  <button className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex gap-4">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white font-semibold rounded-2xl hover:from-[#6d164f] hover:to-[#841b60] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Eye className="w-5 h-5 mr-2" />
                Aperçu
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Save className="w-5 h-5 mr-2" />
                Enregistrer
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Send className="w-5 h-5 mr-2" />
                Envoyer
              </button>
            </div>
          </div>
        }
      />

      {/* Navigation tabs */}
      <div className="bg-gradient-to-r from-[#ebf4f7] to-[#f0f9ff] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-6">
            {[
              { id: 'edit', label: 'Modifier', icon: '✏️' },
              { id: 'settings', label: 'Paramètres', icon: '⚙️' },
              { id: 'send', label: 'Envoyer ou planifier', icon: '📤' },
              { id: 'automate', label: 'Automatiser', icon: '🤖' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#841b60] border-b-2 border-[#841b60] shadow-sm'
                    : 'text-gray-600 hover:text-[#841b60] hover:bg-white/50 rounded-t-md'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-200px)]">
        {activeTab === 'edit' && (
          <>
            <EnhancedModulesList />
            <EnhancedEditorCanvas />
            <PropertiesPanel />
          </>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 bg-gradient-to-br from-white to-gray-50 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#841b60] mb-2 flex items-center">
                  <Sparkles className="w-7 h-7 mr-3" />
                  Générateur IA et Paramètres
                </h2>
                <p className="text-gray-600 mb-6">Créez du contenu automatiquement avec l'IA ou configurez vos paramètres</p>
                <SettingsTab />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="flex-1 p-6 bg-gradient-to-br from-white to-gray-50 text-gray-600">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Envoyer ou planifier</h2>
                <p className="text-gray-600">Fonctionnalité à venir - Envoi et planification de newsletters</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'automate' && (
          <div className="flex-1 p-6 bg-gradient-to-br from-white to-gray-50 text-gray-600">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Automatiser</h2>
                <p className="text-gray-600">Fonctionnalité à venir - Automatisation des campagnes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <NewsletterPreviewModal 
        isOpen={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)} 
        campaign={mockCampaign} 
      />
    </PageContainer>
  );
};

export default Newsletter;
