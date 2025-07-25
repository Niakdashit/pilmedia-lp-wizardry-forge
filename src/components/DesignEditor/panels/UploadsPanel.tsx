import React, { useState } from 'react';
import { Upload, X, Scissors } from 'lucide-react';
import { removeBackground } from '../../../utils/backgroundRemoval';
import { toast } from 'sonner';

interface UploadsPanelProps {
  onElementsChange: (elements: any[]) => void;
  elements: any[];
}

const UploadsPanel: React.FC<UploadsPanelProps> = ({ onElementsChange, elements }) => {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} dépasse la taille limite de 10MB`);
        return;
      }

      const url = URL.createObjectURL(file);
      const newImage = {
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        url,
        size: file.size
      };

      setUploadedImages(prev => [...prev, newImage]);
    });

    event.target.value = '';
  };

  const addImageToCanvas = (image: { id: string; name: string; url: string }) => {
    const newElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      src: image.url,
      alt: image.name,
      zIndex: elements.length + 1
    };

    onElementsChange([...elements, newElement]);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleRemoveBackground = async (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId);
    if (!image) return;

    setIsProcessing(imageId);
    try {
      // Create image element from URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.url;
      });

      // Remove background
      const resultBlob = await removeBackground(img);
      const newUrl = URL.createObjectURL(resultBlob);

      // Update the image with background removed
      setUploadedImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, url: newUrl, name: `${img.name}_no_bg` }
          : img
      ));

      toast.success('Arrière-plan supprimé avec succès');
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Erreur lors de la suppression de l\'arrière-plan');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-foreground">Uploads</h3>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2"
        >
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Télécharger des images</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {uploadedImages.map((image) => (
          <div key={image.id} className="relative group">
            <img 
              src={image.url} 
              alt={image.name}
              className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
              onClick={() => addImageToCanvas(image)}
            />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleRemoveBackground(image.id)}
                disabled={isProcessing === image.id}
                className={`w-5 h-5 text-white rounded-full text-xs flex items-center justify-center ${
                  isProcessing === image.id 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
                title="Supprimer l'arrière-plan"
              >
                {isProcessing === image.id ? (
                  <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Scissors className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => removeImage(image.id)}
                className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                title="Supprimer l'image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-1">
              <p className="text-xs text-foreground truncate">{image.name}</p>
              <p className="text-xs text-muted-foreground">{(image.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ))}
        
        {uploadedImages.length === 0 && (
          <div className="col-span-2 text-center py-4 text-xs text-muted-foreground">
            Aucune image téléchargée
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsPanel;