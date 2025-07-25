import React, { useRef } from 'react';
import { Upload, Image, Video, Music, FileText } from 'lucide-react';

interface UploadsPanelProps {
  onAddElement: (element: any) => void;
}

const UploadsPanel: React.FC<UploadsPanelProps> = ({ onAddElement }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadTypes = [
    { type: 'image', icon: Image, label: 'Images', accept: 'image/*' },
    { type: 'video', icon: Video, label: 'Vidéos', accept: 'video/*' },
    { type: 'audio', icon: Music, label: 'Audio', accept: 'audio/*' },
    { type: 'document', icon: FileText, label: 'Documents', accept: '.pdf,.doc,.docx' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Determine element type based on file type
      let elementType = 'image';
      if (file.type.startsWith('video/')) {
        elementType = 'video';
      } else if (file.type.startsWith('audio/')) {
        elementType = 'audio';
      }

      onAddElement({
        id: `upload-${Date.now()}`,
        type: elementType,
        x: 100,
        y: 100,
        src: url,
        alt: file.name,
        width: elementType === 'image' ? 200 : undefined,
        height: elementType === 'image' ? 150 : undefined,
        zIndex: 10
      });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
      />

      <div>
        <button
          onClick={triggerFileUpload}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <div className="text-sm text-gray-600 mb-1">Télécharger des médias</div>
          <div className="text-xs text-gray-500">
            Glissez et déposez ou cliquez pour parcourir
          </div>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">TYPES DE FICHIERS</h3>
        <div className="grid grid-cols-2 gap-2">
          {uploadTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.type}
                onClick={triggerFileUpload}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Icon className="w-6 h-6 mx-auto text-gray-600 mb-1" />
                <div className="text-xs text-gray-600">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">MÉDIAS RÉCENTS</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Placeholder for recent uploads */}
          <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          Aucun média téléchargé
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">DOSSIERS</h3>
        <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded mr-3 flex items-center justify-center">
              📁
            </div>
            <span className="text-sm">Tous les uploads</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UploadsPanel;