import React from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import GradientBand from '../../components/shared/GradientBand';

const steps = [
  { path: '', label: 'Canaux' },
  { path: 'parameters', label: 'Paramètres' },
  { path: 'output', label: 'Sortie' },
  { path: 'virality', label: 'Viralité' },
];

const CampaignSettingsLayout: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editorUrl = id ? `/design-editor?id=${id}` : '/design-editor';

  const handleSaveAndClose = () => {
    // Let pages listen and persist
    window.dispatchEvent(new CustomEvent('campaign:saveAndClose'));
    // Navigate back to visual editor for this campaign
    navigate(editorUrl);
  };
  return (
    <div className="min-h-screen bg-[#eaf5f6]">
      {/* Bande dégradée identique au dashboard (magenta) */}
      <GradientBand heightClass="h-[5cm]" zIndex={1} className="pointer-events-none" />
      {/* Carré #eaf5f6 avec coins supérieurs arrondis, identique au dashboard */}
      <div 
        className="fixed z-20"
        style={{
          borderRadius: '28px 28px 0 0',
          margin: '0',
          top: 'calc(1.16cm - 1px)',
          bottom: '0',
          left: '0',
          right: '0',
          boxSizing: 'border-box',
          backgroundColor: '#eaf5f6',
        }}
      />
      {/* Sticky top banner + centered stepper (no action buttons) */}
      <div className="sticky top-[1.16cm] z-30 -mt-px">
        {/* Action band styled like DesignToolbar, tabs centered */}
        <div className="bg-white border-b border-gray-200 px-4 py-1 flex items-center justify-center shadow-sm rounded-tl-[28px] rounded-tr-[28px] toolbar-compact mb-4 relative">
          {/* Center: Tabs (reserve space on the right for the 'Mode édition' button) */}
          <div className="flex-1 min-w-0 px-3 pr-36 sm:pr-40 md:pr-52 max-w-6xl">
            <div className="flex overflow-x-auto no-scrollbar divide-x divide-gray-200">
              {steps.map((s) => (
                <NavLink
                  key={s.label}
                  to={s.path}
                  end={s.path === ''}
                  className={({ isActive }) =>
                    `sidebar-tab-horizontal min-w-[110px] flex-1 text-center ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="truncate">{s.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          {/* Right: Mode édition button */}
          <button
            type="button"
            onClick={() => navigate(editorUrl)}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 inline-flex items-center gap-2 rounded-md px-3.5 text-white shadow-md hover:opacity-95 transition-opacity bg-[radial-gradient(circle_at_0%_0%,_#b41b60,_#841b60_70%)]"
          >
            Mode édition
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 pt-6 pb-24">
        <Outlet />
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white border-t border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(editorUrl)}
              className="h-8 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[hsl(var(--text))] px-2.5 transition-colors"
            >
              <span aria-hidden>←</span>
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="h-8 inline-flex items-center gap-2 rounded-md px-3.5 text-white shadow-md hover:opacity-95 transition-opacity bg-[radial-gradient(circle_at_0%_0%,_#b41b60,_#841b60_70%)]"
            >
              <span>Enregistrer et fermer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSettingsLayout;
