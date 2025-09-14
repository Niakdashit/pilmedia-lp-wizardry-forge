// @ts-nocheck
import React, { useState } from 'react';
import { Type, Shapes, Upload, Search } from 'lucide-react';
import TextPanel from './TextPanel';

interface AssetsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const AssetsPanel: React.FC<AssetsPanelProps> = ({ onAddElement, selectedElement, onElementUpdate, selectedDevice = 'desktop' }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const categories = [
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'shapes', label: 'Formes', icon: Shapes },
    { id: 'uploads', label: 'Uploads', icon: Upload }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newImage = {
          id: Date.now(),
          url: imageUrl,
          name: file.name
        };
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'text':
        return <TextPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />;
      
      default:
        return <div className="text-center py-8 text-gray-500">Fonctionnalité en développement</div>;
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                activeTab === category.id
                  ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AssetsPanel;