import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useProfile } from '../../hooks/useProfile';
import { User, Mail, Calendar, Shield, ShieldCheck, Users, UserPlus, Crown } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, loading, error, updateUserRole } = useUsers();
  const { profile: currentUser } = useProfile();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (!currentUser?.is_admin) {
    return null; // Ne rien afficher si pas admin
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      alert(`Erreur lors de la mise à jour du rôle: ${result.error}`);
    }
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
    users: users.filter(u => u.role === 'user').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#841b60]"></div>
          <span className="ml-3 text-gray-600">Chargement des utilisateurs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#841b60] to-[#b41b60] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Gestion des Utilisateurs</h2>
              <p className="text-white/80 text-sm">Administration des comptes et rôles</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-white/80">Utilisateurs actifs</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-800">{stats.admins}</div>
          <div className="text-sm text-yellow-700">Administrateurs</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-800">{stats.moderators}</div>
          <div className="text-sm text-blue-700">Modérateurs</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.users}</div>
          <div className="text-sm text-gray-700">Utilisateurs</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <UserPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-800">{stats.total}</div>
          <div className="text-sm text-green-700">Total</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.slice(0, 10).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <div className="w-10 h-10 rounded-full bg-[#841b60] flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.id === currentUser.id && '(Vous)'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {selectedUser === user.id ? (
                    <div className="flex space-x-2">
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin' | 'moderator')}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedUser(user.id)}
                      className="text-[#841b60] hover:text-[#6d164f] font-medium text-sm"
                      disabled={user.id === currentUser.id} // Can't change own role
                    >
                      {user.id === currentUser.id ? 'Votre compte' : 'Modifier'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length > 10 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Affichage de 10 utilisateurs sur {users.length} total.{' '}
            <button
              onClick={() => window.open('/admin', '_blank')}
              className="text-[#841b60] hover:text-[#6d164f] font-medium"
            >
              Voir tous les utilisateurs →
            </button>
          </p>
        </div>
      )}

      {users.length === 0 && (
        <div className="px-6 py-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-500">Les utilisateurs apparaîtront ici une fois inscrits.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
