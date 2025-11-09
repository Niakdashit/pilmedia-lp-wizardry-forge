import React, { useState } from 'react';
import { X, Plus, Trash2, Send, AlertCircle } from 'lucide-react';
import { Media, PartnershipRequest } from '../../types/partnership';

interface PartnershipRequestFormProps {
  media: Media;
  onSubmit: (request: Omit<PartnershipRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => void;
  onClose: () => void;
}

interface Dotation {
  type: string;
  description: string;
  valeur_estimee: number;
  quantite: number;
}

export const PartnershipRequestForm: React.FC<PartnershipRequestFormProps> = ({ 
  media, 
  onSubmit, 
  onClose 
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [dotations, setDotations] = useState<Dotation[]>([
    { type: '', description: '', valeur_estimee: 0, quantite: 1 }
  ]);
  
  const [formData, setFormData] = useState({
    annonceur_nom: '',
    annonceur_email: '',
    annonceur_telephone: '',
    annonceur_entreprise: '',
    duree_souhaitee: media.conditions.duree_min,
    date_debut_souhaitee: '',
    message: '',
    objectifs: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const addDotation = () => {
    setDotations([...dotations, { type: '', description: '', valeur_estimee: 0, quantite: 1 }]);
  };

  const removeDotation = (index: number) => {
    if (dotations.length > 1) {
      setDotations(dotations.filter((_, i) => i !== index));
    }
  };

  const updateDotation = (index: number, field: keyof Dotation, value: any) => {
    const updated = [...dotations];
    updated[index] = { ...updated[index], [field]: value };
    setDotations(updated);
  };

  const totalDotationsValue = dotations.reduce((sum, d) => sum + (d.valeur_estimee * d.quantite), 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.annonceur_nom.trim()) newErrors.annonceur_nom = 'Le nom est requis';
    if (!formData.annonceur_email.trim()) newErrors.annonceur_email = 'L\'email est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.annonceur_email)) {
      newErrors.annonceur_email = 'Email invalide';
    }
    if (!formData.annonceur_entreprise.trim()) newErrors.annonceur_entreprise = 'L\'entreprise est requise';
    if (selectedSlots.length === 0) newErrors.slots = 'Sélectionnez au moins un emplacement';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    
    if (dotations.some(d => !d.type.trim() || !d.description.trim() || d.valeur_estimee <= 0)) {
      newErrors.dotations = 'Toutes les dotations doivent être complètes';
    }

    if (totalDotationsValue < media.conditions.valeur_dotation_min) {
      newErrors.dotations = `La valeur totale doit être d'au moins ${media.conditions.valeur_dotation_min}€`;
    }

    if (media.conditions.valeur_dotation_max && totalDotationsValue > media.conditions.valeur_dotation_max) {
      newErrors.dotations = `La valeur totale ne doit pas dépasser ${media.conditions.valeur_dotation_max}€`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit({
      media_id: media.id,
      annonceur_id: 'current-user-id', // À remplacer par l'ID utilisateur réel
      slot_ids: selectedSlots,
      dotations: dotations.filter(d => d.type && d.description && d.valeur_estimee > 0),
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demande de partenariat</h2>
            <p className="text-gray-600 mt-1">Avec {media.nom}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Informations annonceur */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Vos informations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.annonceur_nom}
                  onChange={(e) => setFormData({ ...formData, annonceur_nom: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                    errors.annonceur_nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.annonceur_nom && (
                  <p className="text-red-500 text-xs mt-1">{errors.annonceur_nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.annonceur_email}
                  onChange={(e) => setFormData({ ...formData, annonceur_email: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                    errors.annonceur_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.annonceur_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.annonceur_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.annonceur_telephone}
                  onChange={(e) => setFormData({ ...formData, annonceur_telephone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.annonceur_entreprise}
                  onChange={(e) => setFormData({ ...formData, annonceur_entreprise: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                    errors.annonceur_entreprise ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.annonceur_entreprise && (
                  <p className="text-red-500 text-xs mt-1">{errors.annonceur_entreprise}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sélection des emplacements */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Emplacements souhaités <span className="text-red-500">*</span>
            </h3>
            {errors.slots && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{errors.slots}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.slots.map(slot => (
                <label
                  key={slot.id}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedSlots.includes(slot.id)
                      ? 'border-gray-700 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSlots.includes(slot.id)}
                      onChange={() => toggleSlot(slot.id)}
                      className="mt-1 w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{slot.nom}</p>
                      <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{slot.format}</span>
                        <span>{slot.disponibilites} disponible{slot.disponibilites > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dotations proposées */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">
                Dotations proposées <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={addDotation}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter une dotation
              </button>
            </div>

            {errors.dotations && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{errors.dotations}</p>
              </div>
            )}

            <div className="space-y-4">
              {dotations.map((dotation, index) => (
                <div key={index} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Dotation {index + 1}</span>
                    {dotations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDotation(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Type de dotation</label>
                      <input
                        type="text"
                        placeholder="Ex: Produits, Services, Bons d'achat..."
                        value={dotation.type}
                        onChange={(e) => updateDotation(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Ex: iPhone 15 Pro, Séjour 2 nuits..."
                        value={dotation.description}
                        onChange={(e) => updateDotation(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Valeur unitaire (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={dotation.valeur_estimee || ''}
                        onChange={(e) => updateDotation(index, 'valeur_estimee', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        value={dotation.quantite}
                        onChange={(e) => updateDotation(index, 'quantite', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <span className="text-gray-600">Valeur totale: </span>
                    <span className="font-semibold text-gray-900">
                      {(dotation.valeur_estimee * dotation.quantite).toFixed(2)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Valeur totale des dotations:</span>
                <span className="text-xl font-bold text-gray-900">{totalDotationsValue.toFixed(2)}€</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Minimum requis: {media.conditions.valeur_dotation_min}€
                {media.conditions.valeur_dotation_max && ` • Maximum: ${media.conditions.valeur_dotation_max}€`}
              </p>
            </div>
          </div>

          {/* Durée et date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée souhaitée (jours)
              </label>
              <input
                type="number"
                min={media.conditions.duree_min}
                max={media.conditions.duree_max}
                value={formData.duree_souhaitee}
                onChange={(e) => setFormData({ ...formData, duree_souhaitee: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Entre {media.conditions.duree_min} et {media.conditions.duree_max} jours
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début souhaitée
              </label>
              <input
                type="date"
                value={formData.date_debut_souhaitee}
                onChange={(e) => setFormData({ ...formData, date_debut_souhaitee: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Message et objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              placeholder="Présentez votre demande de partenariat..."
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs du partenariat
            </label>
            <textarea
              value={formData.objectifs}
              onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
              rows={3}
              placeholder="Décrivez vos objectifs (visibilité, notoriété, acquisition...)..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#44444d] focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Send className="w-4 h-4" />
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
