import React from 'react';
import { Settings } from 'lucide-react';
import { useNewsletterStore } from '@/stores/newsletterStore';
import { TextProperties } from './properties/TextProperties';
import { ImageProperties } from './properties/ImageProperties';
import { ButtonProperties } from './properties/ButtonProperties';
import { DividerProperties } from './properties/DividerProperties';
import { SocialProperties } from './properties/SocialProperties';
import { FooterProperties } from './properties/FooterProperties';
import { HeaderProperties } from './properties/HeaderProperties';
import { HTMLProperties } from './properties/HTMLProperties';

export const PropertiesPanel: React.FC = () => {
  const { modules, selectedModuleId, updateModule } = useNewsletterStore();
  const selectedModule = modules.find(m => m.id === selectedModuleId);

  if (!selectedModule) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <Settings className="w-8 h-8 mx-auto mb-2" />
          <p>Sélectionnez un élément pour modifier ses propriétés</p>
        </div>
      </div>
    );
  }

  const renderProperties = () => {
    switch (selectedModule.type) {
      case 'text':
        return <TextProperties module={selectedModule} onUpdate={updateModule} />;
      case 'image':
        return <ImageProperties module={selectedModule} onUpdate={updateModule} />;
      case 'button':
        return <ButtonProperties module={selectedModule} onUpdate={updateModule} />;
      case 'divider':
        return <DividerProperties module={selectedModule} onUpdate={updateModule} />;
      case 'social':
        return <SocialProperties module={selectedModule} onUpdate={updateModule} />;
      case 'footer':
        return <FooterProperties module={selectedModule} onUpdate={updateModule} />;
      case 'header':
        return <HeaderProperties module={selectedModule} onUpdate={updateModule} />;
      case 'html':
        return <HTMLProperties module={selectedModule} onUpdate={updateModule} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Propriétés non disponibles pour ce type de module</p>
          </div>
        );
    }
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg text-gray-700">Propriétés</h2>
        <p className="text-sm text-gray-500">Personnalisez l'élément sélectionné</p>
      </div>
      
      <div className="p-4">
        {renderProperties()}
      </div>
    </div>
  );
};