import React, { useState, useCallback, useMemo } from 'react';
import { Save, ArrowLeft, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { toast } from 'react-toastify';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';
import GameSidebar from '../components/GameEditor/GameSidebar';
import GameContentPanel from '../components/GameEditor/GameContentPanel';
import GamePreview from '../components/GameEditor/GamePreview';
import DeviceSelector from '../components/GameEditor/DeviceSelector';
import { AnimationProvider } from '../components/GameEditor/Animation/AnimationProvider';
import type { DeviceType, EditorConfig } from '../components/GameEditor/GameEditorLayout';

const QuickCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { saveCampaign } = useCampaigns();
  const store = useQuickCampaignStore();
  
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [activeTab, setActiveTab] = useState<string>('configuration');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  // Convertir les données du store QuickCampaign vers le format EditorConfig
  const config: EditorConfig = useMemo(() => ({
    width: 810,
    height: 1200,
    anchor: 'fixed',
    gameType: (store.selectedGameType as any) || 'wheel',
    gameMode: 'mode1-sequential',
    displayMode: 'mode1-banner-game',
    storyText: '',
    publisherLink: '',
    prizeText: '',
    customTexts: [],
    centerText: false,
    centerForm: true,
    centerGameZone: true,
    backgroundColor: '#ffffff',
    outlineColor: store.customColors.primary || '#841b60',
    borderStyle: 'classic',
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: store.customColors.primary || '#ff6b35',
    participateButtonTextColor: '#ffffff',
    footerText: '',
    footerColor: '#f8f9fa',
    customCSS: '',
    customJS: '',
    trackingTags: '',
    campaignName: store.campaignName,
    brandAssets: {
      logo: store.logoUrl || undefined,
      primaryColor: store.customColors.primary,
      secondaryColor: store.customColors.secondary,
      accentColor: store.customColors.accent,
    },
    deviceConfig: {
      mobile: {
        fontSize: 14,
        backgroundImage: store.backgroundImageUrl || undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      tablet: {
        fontSize: 16,
        backgroundImage: store.backgroundImageUrl || undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      desktop: {
        fontSize: 18,
        backgroundImage: store.backgroundImageUrl || undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      }
    },
    wheelSegments: store.segmentCount ? Array.from({ length: store.segmentCount }, (_, i) => ({
      id: `segment-${i}`,
      label: `Segment ${i + 1}`,
      value: `prize-${i + 1}`,
      color: i % 2 === 0 ? store.customColors.primary : store.customColors.secondary
    })) : [],
    quizQuestions: store.quizQuestions,
    autoSyncOnDeviceChange: false,
    autoSyncRealTime: false,
    autoSyncBaseDevice: 'desktop'
  }), [store]);

  // Fonction pour mettre à jour le store QuickCampaign depuis les modifications
  const updateConfig = useCallback((updates: Partial<EditorConfig>) => {
    if (updates.campaignName) {
      store.setCampaignName(updates.campaignName);
    }
    if (updates.gameType) {
      store.setSelectedGameType(updates.gameType);
    }
    if (updates.brandAssets) {
      const colors = updates.brandAssets;
      if (colors.primaryColor || colors.secondaryColor || colors.accentColor) {
        store.setCustomColors({
          primary: colors.primaryColor || store.customColors.primary,
          secondary: colors.secondaryColor || store.customColors.secondary,
          accent: colors.accentColor || store.customColors.accent,
        });
      }
      if (colors.logo) {
        store.setLogoUrl(colors.logo);
      }
    }
    if (updates.wheelSegments && updates.wheelSegments.length !== store.segmentCount) {
      store.setSegmentCount(updates.wheelSegments.length);
    }
    if (updates.quizQuestions) {
      store.setQuizQuestions(updates.quizQuestions);
    }
  }, [store]);

  // Fonction pour transférer vers l'éditeur avancé
  const handleAdvancedSettings = useCallback(() => {
    // Sauvegarder la configuration actuelle dans localStorage pour le transfert
    const transferData = {
      ...config,
      fromQuickCampaign: true,
      timestamp: Date.now()
    };
    
    localStorage.setItem('game_editor_transfer_data', JSON.stringify(transferData));
    navigate('/campaign-editor');
  }, [config, navigate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    
    try {
      const campaignData = {
        name: config.campaignName || 'Nouvelle campagne rapide',
        description: '',
        type: config.gameType as any,
        status: 'draft' as const,
        config: {
          width: config.width,
          height: config.height,
          anchor: config.anchor,
          gameMode: config.gameMode,
          displayMode: config.displayMode,
          backgroundColor: config.backgroundColor,
          centerText: config.centerText,
          centerForm: config.centerForm,
          centerGameZone: config.centerGameZone,
        },
        game_config: {
          gameType: config.gameType,
          wheelSegments: config.wheelSegments,
          quizQuestions: config.quizQuestions,
        },
        design: {
          outlineColor: config.outlineColor,
          borderStyle: config.borderStyle,
          participateButtonText: config.participateButtonText,
          participateButtonColor: config.participateButtonColor,
          participateButtonTextColor: config.participateButtonTextColor,
          brandAssets: config.brandAssets
        },
        form_fields: [
          { name: 'email', label: 'Email', type: 'email', required: true }
        ]
      };

      await saveCampaign(campaignData);
      toast.success('Campagne sauvegardée avec succès !');
      navigate('/campaigns');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la campagne');
    } finally {
      setSaving(false);
    }
  }, [config, saveCampaign, navigate]);

  return (
    <AnimationProvider>
      <div className="min-h-screen bg-brand-accent">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="text-xl font-semibold text-brand-primary">Création Rapide</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <DeviceSelector 
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdvancedSettings}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres avancés
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <GameSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* Content Panel */}
          {!isSidebarCollapsed && (
            <GameContentPanel 
              activeTab={activeTab}
              config={config}
              onConfigUpdate={updateConfig}
              triggerAutoSync={() => {}}
            />
          )}
          
          {/* Preview Area */}
          <div className="flex-1 relative">
            <div className="h-full p-6">
              <GamePreview
                device={selectedDevice}
                config={config}
                onConfigUpdate={updateConfig}
                triggerAutoSync={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default QuickCampaign;
