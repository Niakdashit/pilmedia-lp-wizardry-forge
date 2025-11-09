import React from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import GradientBand from '../../components/shared/GradientBand';
import { useCampaignsList } from '@/hooks/useCampaignsList';
import { getEditorUrl } from '@/utils/editorRouting';

const steps = [
  { path: '', label: 'Canaux' },
  { path: 'parameters', label: 'Paramètres' },
  { path: 'output', label: 'Sortie' },
  { path: 'virality', label: 'Viralité' },
];

const CampaignSettingsLayout: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { campaigns } = useCampaignsList();
  
  // Get campaign to determine its type
  const campaign = campaigns.find((c: any) => c.id === id);
  const editorUrl = id && campaign ? getEditorUrl(campaign.type, id) : '/design-editor';

  const handleSaveAndClose = () => {
    // Let pages listen and persist
    window.dispatchEvent(new CustomEvent('campaign:saveAndClose'));
    // Navigate back to visual editor for this campaign
    navigate(editorUrl);
  };
  return (
    <div className="h-[100dvh] bg-[#2e353e]">
      {/* Bande dégradée identique au dashboard (magenta) */}
      <GradientBand heightClass="h-[5cm]" zIndex={1} className="pointer-events-none" />
      
      {/* Background container with design-editor styling */}
      <div 
        className="fixed z-20 bg-[hsl(var(--sidebar-surface))]"
        style={{
          borderRadius: '18px',
          margin: '0',
          top: 'calc(1.16cm - 1px)',
          bottom: '9px',
          left: '9px',
          right: '9px',
          boxSizing: 'border-box',
        }}
      />
      
      {/* Main layout container */}
      <div className="relative z-30 h-[100dvh] flex flex-col" style={{ marginTop: '1.16cm', height: 'calc(100dvh - 1.16cm - 9px)', marginLeft: '9px', marginRight: '9px', borderRadius: '18px', overflow: 'hidden' }}>
        
        {/* Top toolbar matching DesignToolbar */}
        <div className="bg-white border-b border-[hsl(var(--sidebar-border))] px-4 py-2 flex items-center justify-between shadow-sm rounded-tl-[18px] rounded-tr-[18px]">
          {/* Left: Back button */}
          <button
            type="button"
            onClick={() => navigate(editorUrl)}
            className="p-1.5 rounded-lg transition-all duration-200 hover:bg-[hsl(var(--sidebar-hover))] text-gray-600 hover:text-black"
            title="Retour à l'éditeur"
          >
            <span className="text-sm">← Retour</span>
          </button>

          {/* Center: Navigation tabs */}
          <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
            {steps.map((s) => (
              <NavLink
                key={s.label}
                to={s.path}
                end={s.path === ''}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                    isActive 
                      ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                      : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                  }`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>

          {/* Right: Save button */}
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="h-8 inline-flex items-center gap-2 rounded-md px-3.5 text-white shadow-md hover:opacity-95 transition-opacity bg-[#44444d]"
          >
            Enregistrer
          </button>
        </div>

        {/* Content area with sidebar-like styling */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSettingsLayout;
