import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ArticleBannerProps {
  imageUrl?: string;
  onImageChange?: (url: string) => void;
  onImageRemove?: () => void;
  editable?: boolean;
  aspectRatio?: '2215/1536' | '1500/744'; // Ratios supportés
  maxWidth?: number; // Max 810px
}

/**
 * ArticleBanner - Bannière visible à toutes les étapes du funnel Article
 * 
 * Caractéristiques:
 * - Largeur 100% du conteneur (max 810px)
 * - Deux ratios possibles: 2215×1536px ou 1500×744px
 * - Toujours visible pendant toute la navigation du funnel
 * - Upload/remplacement d'image en mode édition
 */
const ArticleBanner: React.FC<ArticleBannerProps> = ({
  imageUrl,
  onImageChange,
  onImageRemove,
  editable = true,
  aspectRatio = '2215/1536',
  maxWidth = 810,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Calcul du ratio en pourcentage pour padding-bottom
  const paddingBottom = aspectRatio === '2215/1536' 
    ? `${(1536 / 2215) * 100}%`  // ~69.3%
    : `${(744 / 1500) * 100}%`;   // ~49.6%

  const handleFileChange = async (file: File) => {
    if (!file || !onImageChange) return;
    
    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Conversion en base64 pour preview instantané
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Erreur lors du chargement de l\'image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur upload bannière:', error);
      alert('Erreur lors du chargement de l\'image');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editable) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!editable) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDoubleClick = () => {
    if (!editable) return;
    
    // Créer un input file temporaire et le déclencher
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileChange(file);
      }
    };
    input.click();
  };

  return (
    <div 
      className="article-banner relative w-full"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div 
        className="relative w-full overflow-hidden"
        style={{ 
          paddingBottom,
          background: imageUrl ? 'transparent' : 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={handleDoubleClick}
      >
        {imageUrl ? (
          <>
            {/* Image de bannière */}
            <img
              src={imageUrl}
              alt="Bannière article"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Bouton de suppression (mode édition) */}
            {editable && onImageRemove && (
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
                title="Supprimer l'image"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Overlay pour remplacer (mode édition) */}
            {editable && (
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all cursor-pointer group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Remplacer l'image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            )}
          </>
        ) : (
          /* Zone d'upload vide */
          editable && (
            <label 
              className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-transparent hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className={`p-4 rounded-full ${
                  isDragging ? 'bg-white' : 'bg-white bg-opacity-80'
                }`}>
                  <Upload className={`w-8 h-8 ${
                    isDragging ? 'text-[#841b60]' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isUploading ? 'Chargement...' : 'Ajouter une bannière'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Glissez une image ou cliquez pour parcourir
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Ratio recommandé: {aspectRatio === '2215/1536' ? '2215×1536px' : '1500×744px'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Format: JPG, PNG, WebP • Max 5MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )
        )}
      </div>
    </div>
  );
};

export default ArticleBanner;
