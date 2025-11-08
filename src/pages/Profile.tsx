import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { User, Mail, Calendar, LogOut, Edit2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, signOut, loading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // La redirection sera gérée par le ProtectedRoute
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#841b60]"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#841b60] to-[#b41b60] px-8 py-12 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.user_metadata?.first_name || 'Utilisateur'}
              </h1>
              <p className="text-white/80 mt-1">
                {user.user_metadata?.last_name || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations personnelles */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="text-gray-900">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Statut du compte</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.email_confirmed_at ? 'Confirmé' : 'En attente de confirmation'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#841b60]">0</div>
                  <div className="text-sm text-gray-600">Campagnes</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#841b60]">0</div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions récentes</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#841b60] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Connexion à la plateforme</p>
                      <p className="text-xs text-gray-500">À l'instant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier le profil
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
