import React from 'react';
import { 
  Palette, 
  Square, 
  Type, 
  Image, 
  Upload, 
  Wrench, 
  FolderOpen, 
  Grid3X3
} from 'lucide-react';

interface CanvaSidebarProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  collapsed: boolean;
}

const CanvaSidebar: React.FC<CanvaSidebarProps> = ({
  campaign,
  setCampaign,
  collapsed
}) => {
  const sidebarItems = [
    { id: 'design', icon: Palette, label: 'Design' },
    { id: 'elements', icon: Square, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'brand', icon: Image, label: 'Brand' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'apps', icon: Grid3X3, label: 'Apps' },
  ];

  const addTextElement = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Nouveau texte',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal'
    };

    setCampaign(prev => ({
      ...prev,
      texts: [...(prev.texts || []), newText]
    }));
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: `image-${Date.now()}`,
          type: 'image',
          url: e.target?.result as string,
          x: 50,
          y: 100,
          width: 200,
          height: 150
        };

        setCampaign(prev => ({
          ...prev,
          images: [...(prev.images || []), newImage]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="p-3 text-[#9ca3af] hover:text-white hover:bg-[#515356] transition-colors mx-2 rounded-lg"
              title={item.label}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sidebar Items */}
      <div className="py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="mb-2 mx-4">
              <button className="w-full flex items-center gap-3 p-3 text-[#9ca3af] hover:text-white hover:bg-[#515356] transition-colors rounded-lg">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-[#515356] mt-4 pt-4 px-4">
        <h3 className="text-white text-sm font-medium mb-3">Actions rapides</h3>
        
        <button
          onClick={addTextElement}
          className="w-full flex items-center gap-2 p-2 text-[#9ca3af] hover:text-white hover:bg-[#515356] transition-colors rounded text-sm mb-2"
        >
          <Type className="w-4 h-4" />
          Ajouter du texte
        </button>

        <label className="w-full flex items-center gap-2 p-2 text-[#9ca3af] hover:text-white hover:bg-[#515356] transition-colors rounded text-sm cursor-pointer">
          <Upload className="w-4 h-4" />
          Télécharger une image
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />
        </label>
      </div>

      {/* Campaign Settings */}
      <div className="border-t border-[#515356] mt-4 pt-4 px-4">
        <h3 className="text-white text-sm font-medium mb-3">Configuration</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-[#9ca3af] text-xs mb-1">Nom de la campagne</label>
            <input
              type="text"
              value={campaign.title || ''}
              onChange={(e) => setCampaign(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#515356] text-white text-sm p-2 rounded border-none outline-none"
              placeholder="Nom de la campagne"
            />
          </div>

          <div>
            <label className="block text-[#9ca3af] text-xs mb-1">Type de jeu</label>
            <select
              value={campaign.type || 'wheel'}
              onChange={(e) => setCampaign(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-[#515356] text-white text-sm p-2 rounded border-none outline-none"
            >
              <option value="wheel">Roue de la fortune</option>
              <option value="quiz">Quiz</option>
              <option value="scratch">Carte à gratter</option>
            </select>
          </div>

          <div>
            <label className="block text-[#9ca3af] text-xs mb-1">Mode d'affichage</label>
            <select
              value={campaign.displayMode || 'popup'}
              onChange={(e) => setCampaign(prev => ({ ...prev, displayMode: e.target.value }))}
              className="w-full bg-[#515356] text-white text-sm p-2 rounded border-none outline-none"
            >
              <option value="popup">Popup</option>
              <option value="embedded">Intégré</option>
              <option value="fullscreen">Plein écran</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaSidebar;