import React, { useRef } from 'react';
import { Upload, Image, Video, Music, FileText } from 'lucide-react';

interface UploadsPanelProps {
  onAddElement: (element: any) => void;
}

const UploadsPanel: React.FC<UploadsPanelProps> = ({ onAddElement }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const uploadTypes = [
    { type: 'image', icon: Image, label: 'Images', accept: 'image/*' },
    { type: 'video', icon: Video, label: 'Vidéos', accept: 'video/*' },
    { type: 'audio', icon: Music, label: 'Audio', accept: 'audio/*' },
    { type: 'document', icon: FileText, label: 'Documents', accept: '.pdf,.doc,.docx' },
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`Le fichier ${file.name} dépasse la taille limite de 10MB`);
        return;
      }

      const url = URL.createObjectURL(file);
      
      // Determine element type based on file type
      let elementType = 'image';
      if (file.type.startsWith('video/')) {
        elementType = 'video';
      } else if (file.type.startsWith('audio/')) {
        elementType = 'audio';
      }

      // Auto-size images
      if (elementType === 'image') {
        const img = new window.Image();
        img.onload = () => {
          const maxSize = 300;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          const width = img.width * ratio;
          const height = img.height * ratio;
          
          onAddElement({
            id: `upload-${Date.now()}`,
            type: elementType,
            x: 100,
            y: 100,
            src: url,
            alt: file.name,
            width,
            height,
            zIndex: 10
          });
        };
        img.src = url;
      } else {
        onAddElement({
          id: `upload-${Date.now()}`,
          type: elementType,
          x: 100,
          y: 100,
          src: url,
          alt: file.name,
          width: 200,
          height: 150,
          zIndex: 10
        });
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Reset input to allow same file upload
    event.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
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
        multiple
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <button
          onClick={triggerFileUpload}
          className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors group ${
            dragOver 
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' 
              : 'border-gray-300 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-white" />
          <div className="text-sm text-gray-600 group-hover:text-white mb-1">
            {dragOver ? 'Déposez vos fichiers ici' : 'Télécharger des médias'}
          </div>
          <div className="text-xs text-gray-500 group-hover:text-white">
            {dragOver ? 'Relâchez pour télécharger' : 'Glissez et déposez ou cliquez pour parcourir (max 10MB)'}
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
                className="p-3 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors group"
              >
                <Icon className="w-6 h-6 mx-auto mb-1 text-gray-600 group-hover:text-white" />
                <div className="text-xs text-gray-600 group-hover:text-white">{type.label}</div>
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
        <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[hsl(var(--primary))] text-white rounded mr-3 flex items-center justify-center">
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