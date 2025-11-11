import React, { useRef } from 'react';
import { Upload, Edit2, Trash2 } from 'lucide-react';
import { Prize } from '@/types/dotation';

interface WinningImage {
  id: string;
  imageUrl?: string;
  prizeId?: string;
  name?: string;
}

interface WinningImagesTabProps {
  prize: Prize;
  winningImages: WinningImage[];
  onUpdateWinningImage: (imageId: string, updates: Partial<WinningImage>) => void;
  onAddWinningImage: () => void;
  onRemoveWinningImage: (imageId: string) => void;
  gameType: 'jackpot' | 'scratch';
}

export const WinningImagesTab: React.FC<WinningImagesTabProps> = ({
  prize,
  winningImages,
  onUpdateWinningImage,
  onAddWinningImage,
  onRemoveWinningImage,
  gameType
}) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleImageUpload = async (imageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validation du fichier
      const { validateImageFile, optimizeImageForSegment } = await import('@/utils/imageOptimizer');
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Optimiser l'image
      const optimizedImage = await optimizeImageForSegment(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        format: 'png'
      });

      // Mettre à jour l'image gagnante
      onUpdateWinningImage(imageId, { 
        imageUrl: optimizedImage.dataUrl
      });

      console.log(`✅ Image optimisée: ${optimizedImage.width}x${optimizedImage.height}, ${Math.round(optimizedImage.size / 1024)}KB`);
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'image:', error);
      alert('Erreur lors du traitement de l\'image');
    }
    
    // Reset input
    event.target.value = '';
  };

  const assignedImages = winningImages.filter(img => img.prizeId === prize.id);
  const unassignedImages = winningImages.filter(img => !img.prizeId || img.prizeId === prize.id);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>
            {gameType === 'jackpot' ? '🎰 Symboles gagnants' : '🎫 Cartes gagnantes'}
          </strong><br />
          {gameType === 'jackpot' 
            ? 'Uploadez les images des symboles qui afficheront ce lot quand le participant gagne au jackpot.'
            : 'Uploadez les images des cartes à gratter qui révéleront ce lot quand le participant gagne.'}
        </p>
      </div>

      {/* Images assignées à ce lot */}
      {assignedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Images assignées à ce lot ({assignedImages.length})
          </h4>
          {assignedImages.map((image) => (
            <div key={image.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-start gap-4">
                {/* Preview de l'image */}
                <div className="flex-shrink-0">
                  {image.imageUrl ? (
                    <div className="relative">
                      <img
                        src={image.imageUrl}
                        alt={image.name || 'Image gagnante'}
                        className="w-20 h-20 object-cover rounded border-2 border-gray-300"
                      />
                      <button
                        onClick={() => fileInputRefs.current[image.id]?.click()}
                        className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                        title="Changer l'image"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRefs.current[image.id]?.click()}
                      className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </button>
                  )}
                  <input
                    ref={(el) => fileInputRefs.current[image.id] = el}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageUpload(image.id, e)}
                    className="hidden"
                  />
                </div>

                {/* Configuration */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nom de l'image
                    </label>
                    <input
                      type="text"
                      value={image.name || ''}
                      onChange={(e) => onUpdateWinningImage(image.id, { name: e.target.value })}
                      placeholder={gameType === 'jackpot' ? 'Ex: Triple 7' : 'Ex: Carte Or'}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Retirer cette image de ce lot ?')) {
                        onUpdateWinningImage(image.id, { prizeId: undefined });
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Retirer de ce lot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Images disponibles non assignées */}
      {unassignedImages.filter(img => img.prizeId !== prize.id).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Images disponibles
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {unassignedImages
              .filter(img => img.prizeId !== prize.id)
              .map((image) => (
                <div
                  key={image.id}
                  className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onUpdateWinningImage(image.id, { prizeId: prize.id })}
                >
                  <div className="flex items-center gap-3">
                    {image.imageUrl ? (
                      <img
                        src={image.imageUrl}
                        alt={image.name || 'Image'}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.name || 'Sans nom'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cliquer pour assigner
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bouton ajouter une nouvelle image */}
      <button
        onClick={onAddWinningImage}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#841b60] hover:text-[#841b60] hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Ajouter une nouvelle image gagnante
      </button>

      {assignedImages.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Aucune image assignée à ce lot. Les participants ne pourront pas gagner ce lot tant qu'aucune image n'est configurée.
          </p>
        </div>
      )}

      {assignedImages.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ {assignedImages.length} image(s) assignée(s) à ce lot
          </p>
        </div>
      )}
    </div>
  );
};
