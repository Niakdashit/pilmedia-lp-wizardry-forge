import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface MobileBottomSidebarTab {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface MobileBottomSidebarLayoutProps {
  themeVars: React.CSSProperties;
  tabs: MobileBottomSidebarTab[];
  internalActiveTab: string | null;
  handleTabClick: (tabId: string) => void;
  prefetchTab: (tabId: string) => void;
  renderPanel: (tabId: any) => React.ReactNode;
  currentScreen?: string | null;
  onCloseActiveTab: () => void;
  debugNamespace?: string;
}

export const MobileBottomSidebarLayout: React.FC<MobileBottomSidebarLayoutProps> = ({
  themeVars,
  tabs,
  internalActiveTab,
  handleTabClick,
  prefetchTab,
  renderPanel,
  currentScreen,
  onCloseActiveTab,
  debugNamespace = 'HybridSidebar',
}) => {
  // Panneau + barre horizontale pour le mode mobile portrait
  return (
    <>
      {/* Panneau de contenu modal au-dessus de la sidebar */}
      {internalActiveTab && (
        <div
          className="fixed inset-0 z-[60] flex flex-col"
          onClick={onCloseActiveTab}
        >
          {/* Overlay semi-transparent */}
          <div className="flex-1 bg-black/50" />

          {/* Panneau de contenu */}
          <div
            className="bg-white border-t border-[hsl(var(--sidebar-border))] flex flex-col max-h-[60vh] mb-16"
            onClick={(e) => e.stopPropagation()}
            style={themeVars}
          >
            <div className="p-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))] flex items-center justify-between">
              {(() => {
                const activeTabData = tabs.find((t) => t.id === internalActiveTab);
                const screenTitle =
                  currentScreen === 'screen2'
                    ? 'Écran 2'
                    : currentScreen === 'screen3'
                    ? 'Écran 3'
                    : 'Écran 1';
                return (
                  <>
                    <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
                      {activeTabData?.label || screenTitle}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseActiveTab();
                      }}
                      className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[hsl(var(--sidebar-icon))]" />
                    </button>
                  </>
                );
              })()}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              {renderPanel(internalActiveTab)}
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation horizontale en bas */}
      <div
        data-hybrid-sidebar="horizontal-bottom"
        className="fixed bottom-0 left-0 right-0 h-16 bg-[hsl(var(--sidebar-bg))] border-t border-[hsl(var(--sidebar-border))] flex items-center justify-around z-50 shadow-lg"
        style={themeVars}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = internalActiveTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              onMouseEnter={() => prefetchTab(tab.id)}
              onTouchStart={() => prefetchTab(tab.id)}
              className={`flex-1 h-full flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))] border-t-2 border-t-[hsl(var(--sidebar-active))]'
                  : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
