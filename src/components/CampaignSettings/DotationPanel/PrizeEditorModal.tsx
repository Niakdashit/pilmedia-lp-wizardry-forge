import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Prize, PrizeStatus } from '@/types/dotation';
import { AttributionMethodEditor } from './AttributionMethodEditor';
import { useEditorStore } from '@/stores/editorStore';
import { WheelSegment } from '@/types/PrizeSystem';

interface PrizeEditorModalProps {
  prize: Prize;
  onSave: (prize: Prize) => void;
  onCancel: () => void;
}

export const PrizeEditorModal: React.FC<PrizeEditorModalProps> = ({ prize, onSave, onCancel }) => {
  const [editedPrize, setEditedPrize] = useState<Prize>(prize);
  const [activeTab, setActiveTab] = useState<'general' | 'attribution' | 'segments'>('general');
  const campaignData = useEditorStore((state) => state.campaignData);
  const campaign = useEditorStore((state) => state.campaign);
  const setCampaign = useEditorStore((state) => state.setCampaign);
  const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>([]);

  // Récupérer les segments de la roue depuis différents chemins possibles
  useEffect(() => {
    console.log('🔍 [PrizeEditorModal] Searching for wheel segments');
    console.log('🔍 [PrizeEditorModal] campaign:', campaign);
    console.log('🔍 [PrizeEditorModal] campaignData:', campaignData);
    
    // Essayer plusieurs chemins possibles
    const paths = {
      'campaign.wheelConfig.segments': campaign?.wheelConfig?.segments,
      'campaignData.segments': campaignData?.segments,
      'campaignData.gameConfig.wheel.segments': campaignData?.gameConfig?.wheel?.segments,
      'campaignData.gameConfig.segments': campaignData?.gameConfig?.segments,
      'campaignData.config.roulette.segments': campaignData?.config?.roulette?.segments,
      'campaignData.config.segments': campaignData?.config?.segments,
    };
    
    console.log('🔍 [PrizeEditorModal] Checking paths:', paths);
    
    const segments = 
      campaign?.wheelConfig?.segments ||  // GameManagementPanel format (PRIORITAIRE)
      campaignData?.segments ||  // Chemin direct
      campaignData?.gameConfig?.wheel?.segments ||  // Wheel editor
      campaignData?.gameConfig?.segments ||  // Design editor
      campaignData?.config?.roulette?.segments ||  // Ancien format
      campaignData?.config?.segments ||  // Autre format
      [];
    
    console.log('✅ [PrizeEditorModal] Found segments:', segments);
    console.log('✅ [PrizeEditorModal] Segments count:', Array.isArray(segments) ? segments.length : 0);
    
    const formattedSegments: WheelSegment[] = segments.map((seg: any, index: number) => ({
      id: seg.id || `segment-${index}`,
      label: seg.label || seg.text || `Segment ${index + 1}`,
      value: seg.label || seg.text || `Segment ${index + 1}`,
      color: seg.color || seg.backgroundColor || '#000000',
      textColor: seg.textColor || seg.color || '#FFFFFF',
      prizeId: seg.prizeId || seg.prize_id,
      imageUrl: seg.imageUrl || seg.image,
      probability: seg.probability || 0,
      isWinning: !!(seg.prizeId || seg.prize_id)
    }));
    
    console.log('📊 [PrizeEditorModal] Formatted segments:', formattedSegments);
    setWheelSegments(formattedSegments);
  }, [campaign, campaignData]);

  const handleSave = () => {
    if (!editedPrize.name.trim()) {
      alert('Le nom du lot est obligatoire');
      return;
    }
    if (editedPrize.totalQuantity < 1) {
      alert('La quantité doit être au moins 1');
      return;
    }
    
    // Synchroniser les segments : mettre à jour prizeId des segments assignés
    if (editedPrize.assignedSegments && editedPrize.assignedSegments.length > 0 && campaign) {
      const currentSegments = (campaign as any)?.wheelConfig?.segments || 
                             (campaign as any)?.gameConfig?.wheel?.segments ||
                             (campaign as any)?.config?.roulette?.segments ||
                             [];
      
      if (currentSegments.length > 0) {
        const updatedSegments = currentSegments.map((segment: WheelSegment) => {
          // Si le segment est assigné à ce lot, mettre à jour son prizeId
          if (editedPrize.assignedSegments?.includes(segment.id)) {
            return { ...segment, prizeId: editedPrize.id };
          }
          // Si le segment avait ce lot mais n'est plus assigné, retirer le prizeId
          if (segment.prizeId === editedPrize.id && !editedPrize.assignedSegments?.includes(segment.id)) {
            return { ...segment, prizeId: undefined };
          }
          return segment;
        });
        
        // Mettre à jour tous les emplacements
        setCampaign({
          ...campaign,
          wheelConfig: {
            ...(campaign as any).wheelConfig,
            segments: updatedSegments
          },
          gameConfig: {
            ...(campaign as any).gameConfig,
            wheel: {
              ...(campaign as any).gameConfig?.wheel,
              segments: updatedSegments
            }
          },
          config: {
            ...(campaign as any).config,
            roulette: {
              ...(campaign as any).config?.roulette,
              segments: updatedSegments
            }
          }
        });
        
        console.log('✅ [PrizeEditorModal] Synchronized segments with prize', {
          prizeId: editedPrize.id,
          assignedSegments: editedPrize.assignedSegments,
          updatedSegments: updatedSegments.map((s: WheelSegment) => ({ id: s.id, label: s.label, prizeId: s.prizeId }))
        });
      }
    }
    
    onSave(editedPrize);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {prize.name === 'Nouveau lot' ? 'Créer un lot' : 'Modifier le lot'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-[#841b60] text-[#841b60]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Informations générales
            </button>
            <button
              onClick={() => setActiveTab('attribution')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'attribution'
                  ? 'border-[#841b60] text-[#841b60]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Méthode d'attribution
            </button>
            <button
              onClick={() => setActiveTab('segments')}
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'segments'
                  ? 'border-[#841b60] text-[#841b60]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Segments de roue 🎡
            </button>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du lot *
                </label>
                <input
                  type="text"
                  value={editedPrize.name}
                  onChange={(e) => setEditedPrize({ ...editedPrize, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  placeholder="Ex: iPhone 15 Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editedPrize.description || ''}
                  onChange={(e) => setEditedPrize({ ...editedPrize, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  placeholder="Description du lot..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité totale *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editedPrize.totalQuantity}
                    onChange={(e) => setEditedPrize({ ...editedPrize, totalQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur (affichage)
                  </label>
                  <input
                    type="text"
                    value={editedPrize.value || ''}
                    onChange={(e) => setEditedPrize({ ...editedPrize, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                    placeholder="Ex: 1000€"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône gagnante (Jackpot) 🎰
                </label>
                <input
                  type="text"
                  value={editedPrize.metadata?.winningSymbol || ''}
                  onChange={(e) => setEditedPrize({
                    ...editedPrize,
                    metadata: {
                      ...editedPrize.metadata,
                      winningSymbol: e.target.value
                    }
                  })}
                  placeholder="💎 ou URL d'image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Emoji (💎, ⭐, 7️⃣) ou URL d'une image à afficher quand le participant gagne au jackpot
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={editedPrize.status}
                  onChange={(e) => setEditedPrize({ ...editedPrize, status: e.target.value as PrizeStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="scheduled">Programmé</option>
                  <option value="paused">En pause</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début (optionnel)
                  </label>
                  <input
                    type="date"
                    value={editedPrize.startDate?.split('T')[0] || ''}
                    onChange={(e) => setEditedPrize({ ...editedPrize, startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={editedPrize.endDate?.split('T')[0] || ''}
                    onChange={(e) => setEditedPrize({ ...editedPrize, endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Attribution Tab */}
          {activeTab === 'attribution' && (
            <AttributionMethodEditor
              prize={editedPrize}
              onChange={setEditedPrize}
            />
          )}

          {/* Segments Tab */}
          {activeTab === 'segments' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>🎯 Association aux segments de la roue</strong><br />
                  Sélectionnez les segments de la roue qui afficheront ce lot quand le participant gagne.
                  Si aucun segment n'est sélectionné, le lot ne sera jamais affiché sur la roue.
                </p>
              </div>

              {wheelSegments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun segment de roue configuré.</p>
                  <p className="text-sm mt-2">Configurez d'abord les segments dans l'onglet "Jeu" de l'éditeur.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Segments assignés à ce lot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {wheelSegments.map((segment) => {
                      const isSelected = editedPrize.assignedSegments?.includes(segment.id) || false;
                      
                      return (
                        <label
                          key={segment.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#841b60] bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentSegments = editedPrize.assignedSegments || [];
                              const newSegments = e.target.checked
                                ? [...currentSegments, segment.id]
                                : currentSegments.filter(id => id !== segment.id);
                              setEditedPrize({ ...editedPrize, assignedSegments: newSegments });
                            }}
                            className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: segment.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {segment.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  {editedPrize.assignedSegments && editedPrize.assignedSegments.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ {editedPrize.assignedSegments.length} segment(s) sélectionné(s)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d1550] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
