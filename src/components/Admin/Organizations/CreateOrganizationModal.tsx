import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug: slug || null,
          logo_url: logoUrl || null
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add current user as owner
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && org) {
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
          });

        if (memberError) throw memberError;

        // Update user profile with organization_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: org.id })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      setName('');
      setSlug('');
      setLogoUrl('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating organization:', err);
      alert('Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Créer une organisation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'organisation *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (optionnel)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="acme-inc"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du logo (optionnel)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
