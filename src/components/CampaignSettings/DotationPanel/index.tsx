/**
 * Panneau de Configuration de Dotation
 * Interface UI pour gérer l'attribution des lots
 */

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { DotationConfig } from '@/types/dotation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PrizeList } from './PrizeList';
import { PrizeEditorModal } from './PrizeEditorModal';
import { AdvancedSettings } from './AdvancedSettings';
import type { Prize } from '@/types/dotation';

// Détecter les IDs de campagne temporaires / mode preview qui ne doivent pas être utilisés côté base (uuid invalide)
const isTemporaryCampaignId = (id: string | undefined) => {
  if (!id) return true;
  if (id === 'new' || id === 'preview') return true;
  // Cas des éditeurs design: "wheel-design-preview" ou similaires
  if (id.endsWith('-preview')) return true;
  // Cas des campagnes générées temporairement: "temp-jackpot-...", "temp-wheel-...", etc.
  if (id.startsWith('temp-')) return true;
  return false;
};

interface DotationPanelProps {
  campaignId: string;
  campaignType: 'wheel' | 'jackpot' | 'scratch';
}

export const DotationPanel: React.FC<DotationPanelProps> = ({ campaignId, campaignType }) => {
  const [config, setConfig] = useState<DotationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  // Charger la configuration
  useEffect(() => {
    loadConfig();
  }, [campaignId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      console.log('📥 [DotationPanel] Loading config for campaign:', campaignId);
      
      // Si pas d'ID persisté (mode preview / nouveau brouillon), créer une config locale par défaut
      if (isTemporaryCampaignId(campaignId)) {
        console.log('ℹ️ [DotationPanel] Temporary or preview campaign ID, creating local default config');
        setConfig({
          campaignId: campaignId || 'temp',
          prizes: [],
          globalStrategy: {
            priorityOrder: 'sequential',
            allowMultipleWins: false,
            minDelayBetweenWins: 0
          },
          antiFraud: {
            maxWinsPerIP: 1,
            maxWinsPerEmail: 1,
            maxWinsPerDevice: 1,
            verificationPeriod: 24
          }
        });
        setLoading(false);
        return;
      }
      
      // @ts-ignore - Table créée par migration, types à régénérer
      const { data, error } = await supabase
        .from('dotation_configs')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [DotationPanel] Load error:', error);
        // Ne pas throw, créer une config par défaut à la place
        console.log('ℹ️ [DotationPanel] Error loading, creating default config');
        setConfig({
          campaignId,
          prizes: [],
          globalStrategy: {
            priorityOrder: 'sequential',
            allowMultipleWins: false,
            minDelayBetweenWins: 0
          },
          antiFraud: {
            maxWinsPerIP: 1,
            maxWinsPerEmail: 1,
            maxWinsPerDevice: 1,
            verificationPeriod: 24
          }
        });
        setLoading(false);
        return;
      }

      if (data) {
        console.log('✅ [DotationPanel] Config loaded:', data.prizes?.length || 0, 'prizes');
        setConfig({
          campaignId: data.campaign_id,
          prizes: data.prizes || [],
          globalStrategy: data.global_strategy,
          antiFraud: data.anti_fraud,
          notifications: data.notifications
        });
      } else {
        console.log('ℹ️ [DotationPanel] No config found, creating default');
        // Créer une config par défaut
        setConfig({
          campaignId,
          prizes: [],
          globalStrategy: {
            priorityOrder: 'sequential',
            allowMultipleWins: false,
            minDelayBetweenWins: 0
          },
          antiFraud: {
            maxWinsPerIP: 1,
            maxWinsPerEmail: 1,
            maxWinsPerDevice: 1,
            verificationPeriod: 24
          }
        });
      }
    } catch (error) {
      console.error('Error loading dotation config:', error);
      // Ne pas afficher de toast d'erreur, créer une config par défaut
      console.log('ℹ️ [DotationPanel] Exception caught, creating default config');
      setConfig({
        campaignId: campaignId || 'temp',
        prizes: [],
        globalStrategy: {
          priorityOrder: 'sequential',
          allowMultipleWins: false,
          minDelayBetweenWins: 0
        },
        antiFraud: {
          maxWinsPerIP: 1,
          maxWinsPerEmail: 1,
          maxWinsPerDevice: 1,
          verificationPeriod: 24
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      console.log('💾 [DotationPanel] Saving config:', config);

      // En mode preview / ID temporaire, ne pas tenter d'écrire en base (évite 22P02 sur UUID)
      if (isTemporaryCampaignId(campaignId)) {
        console.log('ℹ️ [DotationPanel] Skipping remote save for temporary campaign ID:', campaignId);
        toast.error("Vous devez d'abord sauvegarder la campagne avant d'enregistrer la dotation.");
        return;
      }
      
      // @ts-ignore - Table créée par migration, types à régénérer
      const { data, error } = await supabase
        .from('dotation_configs')
        .upsert({
          campaign_id: campaignId,
          prizes: config.prizes,
          global_strategy: config.globalStrategy,
          anti_fraud: config.antiFraud,
          notifications: config.notifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'campaign_id'
        })
        .select();

      if (error) {
        console.error('❌ [DotationPanel] Save error:', error);
        console.error('❌ [DotationPanel] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [DotationPanel] Config saved successfully:', data);
      toast.success('Configuration sauvegardée avec succès');
      
      // Recharger pour confirmer
      await loadConfig();
    } catch (error: any) {
      console.error('❌ [DotationPanel] Error saving dotation config:', error);
      toast.error(`Erreur: ${error.message || 'Sauvegarde impossible'}`);
    } finally {
      setSaving(false);
    }
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      name: 'Nouveau lot',
      description: '',
      totalQuantity: 1,
      awardedQuantity: 0,
      attribution: {
        method: 'probability',
        winProbability: 10,
        distribution: 'uniform'
      },
      status: 'active',
      priority: (config?.prizes.length || 0) + 1
    };

    setEditingPrize(newPrize);
  };

  const savePrize = async (prize: Prize) => {
    if (!config) return;

    const existingIndex = config.prizes.findIndex(p => p.id === prize.id);
    const newPrizes = [...config.prizes];

    if (existingIndex >= 0) {
      newPrizes[existingIndex] = prize;
    } else {
      newPrizes.push(prize);
    }

    const updatedConfig = { ...config, prizes: newPrizes };
    setConfig(updatedConfig);
    setEditingPrize(null);
    
    // Sauvegarder automatiquement en base de données (si ID de campagne persistant)
    try {
      if (isTemporaryCampaignId(campaignId)) {
        console.log('ℹ️ [DotationPanel] Skipping prize autosave for temporary campaign ID:', campaignId);
        toast.error("Les lots sont modifiables, mais ne seront enregistrés en base qu'après sauvegarde de la campagne.");
        return;
      }
      console.log('💾 [DotationPanel] Auto-saving after prize add/edit');
      console.log('📦 [DotationPanel] Data to save:', {
        campaign_id: campaignId,
        prizes_count: newPrizes.length,
        prizes: newPrizes
      });
      
      // @ts-ignore
      const { data, error } = await supabase
        .from('dotation_configs')
        .upsert({
          campaign_id: campaignId,
          prizes: newPrizes,
          global_strategy: config.globalStrategy,
          anti_fraud: config.antiFraud,
          notifications: config.notifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'campaign_id'
        })
        .select();

      if (error) {
        console.error('❌ [DotationPanel] Supabase error:', error);
        throw error;
      }
      
      console.log('✅ [DotationPanel] Prize saved to database');
      toast.success('Lot enregistré avec succès');
    } catch (error: any) {
      console.error('❌ [DotationPanel] Error auto-saving prize:', error);
      console.error('❌ [DotationPanel] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Erreur: ${error.message || 'Sauvegarde impossible'}`);
    }
  };

  const deletePrize = async (prizeId: string) => {
    if (!config) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) return;

    const newPrizes = config.prizes.filter(p => p.id !== prizeId);
    setConfig({
      ...config,
      prizes: newPrizes
    });
    
    // Sauvegarder automatiquement en base de données (si ID de campagne persistant)
    try {
      if (isTemporaryCampaignId(campaignId)) {
        console.log('ℹ️ [DotationPanel] Skipping prize delete autosave for temporary campaign ID:', campaignId);
        toast.error("Les suppressions de lots seront définitivement enregistrées après sauvegarde de la campagne.");
        return;
      }
      console.log('💾 [DotationPanel] Auto-saving after prize delete');
      // @ts-ignore
      const { data, error } = await supabase
        .from('dotation_configs')
        .upsert({
          campaign_id: campaignId,
          prizes: newPrizes,
          global_strategy: config.globalStrategy,
          anti_fraud: config.antiFraud,
          notifications: config.notifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'campaign_id'
        })
        .select();

      if (error) {
        console.error('❌ [DotationPanel] Delete error:', error);
        throw error;
      }
      
      console.log('✅ [DotationPanel] Prize deleted from database');
      toast.success('Lot supprimé');
    } catch (error: any) {
      console.error('❌ [DotationPanel] Error auto-saving after delete:', error);
      toast.error(`Erreur: ${error.message || 'Suppression impossible'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#841b60]"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement de la configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion de la Dotation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configurez les lots et les règles d'attribution pour votre campagne {campaignType}
          </p>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d1550] disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Liste des lots */}
      <PrizeList
        prizes={config.prizes}
        onAdd={addPrize}
        onEdit={setEditingPrize}
        onDelete={deletePrize}
      />

      {/* Paramètres avancés */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Paramètres avancés
        </button>

        {showAdvanced && (
          <AdvancedSettings
            config={config}
            onChange={setConfig}
          />
        )}
      </div>

      {/* Modal d'édition de lot */}
      {editingPrize && (
        <PrizeEditorModal
          prize={editingPrize}
          onSave={savePrize}
          onCancel={() => setEditingPrize(null)}
          campaignType={campaignType}
        />
      )}
    </div>
  );
};
