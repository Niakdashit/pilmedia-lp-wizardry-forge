// @ts-nocheck
/**
 * Interface complète de gestion de la dotation
 * Pour l'onglet "Dotation" des paramètres de campagne
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import { Prize, DotationConfig } from '@/types/dotation';
import { toast } from 'sonner';
import PrizeModal from './PrizeModal';

interface DotationManagementProps {
  campaignId: string;
  segments?: Array<{ id: string; label: string }>;
}

const DotationManagement: React.FC<DotationManagementProps> = ({
  campaignId,
  segments = []
}) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  // Charger la config existante
  useEffect(() => {
    loadDotationConfig();
  }, [campaignId]);

  const loadDotationConfig = async () => {
    try {
      setLoading(true);
      // @ts-ignore - Table créée par migration
      const { data, error } = await supabase
        .from('dotation_configs')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.prizes) {
        setPrizes(data.prizes as Prize[]);
      }
    } catch (error) {
      console.error('Error loading dotation config:', error);
      toast.error('Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveDotationConfig = async () => {
    try {
      setSaving(true);

      const config: Partial<DotationConfig> = {
        campaign_id: campaignId,
        prizes,
        global_strategy: {
          priorityOrder: 'sequential',
          allowMultipleWins: false
        },
        anti_fraud: {
          maxWinsPerEmail: 1,
          maxWinsPerIP: 3,
          maxWinsPerDevice: 2,
          verificationPeriod: 24
        }
      };

      // @ts-ignore - Table créée par migration
      const { error } = await supabase
        .from('dotation_configs')
        .upsert(config, {
          onConflict: 'campaign_id'
        })
        .select();

      if (error) throw error;

      toast.success('La configuration de dotation a été enregistrée');
    } catch (error) {
      console.error('Error saving dotation config:', error);
      toast.error('Impossible de sauvegarder la configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrize = () => {
    setEditingPrize(null);
    setShowModal(true);
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setShowModal(true);
  };

  const handleDeletePrize = (prizeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      setPrizes(prizes.filter(p => p.id !== prizeId));
    }
  };

  const handleSavePrize = (prize: Prize) => {
    if (editingPrize) {
      // Modification
      setPrizes(prizes.map(p => p.id === prize.id ? prize : p));
    } else {
      // Nouveau lot
      setPrizes([...prizes, prize]);
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Gestion de la Dotation
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les lots et les règles d'attribution pour votre campagne
          </p>
        </div>
        <button
          onClick={saveDotationConfig}
          disabled={saving || prizes.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Liste des lots */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">
            Lots disponibles ({prizes.length})
          </h4>
          <button
            onClick={handleAddPrize}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un lot
          </button>
        </div>

        {prizes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun lot configuré</p>
            <p className="text-sm mt-1">Commencez par ajouter un lot</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h5 className="font-medium text-foreground">{prize.name}</h5>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        prize.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {prize.status === 'active' ? 'Actif' : prize.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {prize.attribution.method === 'probability'
                        ? `📊 ${prize.attribution.winProbability}% de chance`
                        : `📅 ${prize.attribution.method}`}
                    </span>
                    <span>
                      📦 {prize.awardedQuantity}/{prize.totalQuantity} attribués
                    </span>
                    {prize.assignedSegments && prize.assignedSegments.length > 0 && (
                      <span>
                        🎯 {prize.assignedSegments.length} segment
                        {prize.assignedSegments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPrize(prize)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePrize(prize.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <PrizeModal
          prize={editingPrize}
          segments={segments}
          onSave={handleSavePrize}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DotationManagement;
