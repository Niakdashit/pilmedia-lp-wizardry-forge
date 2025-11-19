import React, { useState } from 'react';
import { X, UserPlus, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationRole } from '@/types/organization';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('member');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        alert('Aucun utilisateur trouvé avec cet email');
        setLoading(false);
        return;
      }

      const userId = profiles[0].id;

      // Check if already member
      const { data: existing } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single();

      if (existing) {
        alert('Cet utilisateur est déjà membre de l\'organisation');
        setLoading(false);
        return;
      }

      // Add member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role
        });

      if (memberError) throw memberError;

      // Update user profile with organization_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: organizationId })
        .eq('id', userId);

      if (updateError) throw updateError;

      setEmail('');
      setRole('member');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error inviting member:', err);
      alert('Erreur lors de l\'invitation du membre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Inviter un membre
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
              Email de l'utilisateur *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="utilisateur@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              L'utilisateur doit déjà avoir un compte
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrganizationRole)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="viewer">Observateur</option>
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
              <option value="owner">Propriétaire</option>
            </select>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p><strong>Observateur:</strong> Peut voir les campagnes</p>
              <p><strong>Membre:</strong> Peut créer et gérer ses campagnes</p>
              <p><strong>Administrateur:</strong> Peut gérer toutes les campagnes</p>
              <p><strong>Propriétaire:</strong> Contrôle total de l'organisation</p>
            </div>
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
              disabled={loading || !email}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invitation...' : 'Inviter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
