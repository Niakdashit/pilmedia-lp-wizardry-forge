import React, { useState } from 'react';
import { User, Mail, Lock, Building, BellRing, Shield, UserCircle } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const [profile, setProfile] = useState({
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    company: 'Prosplay',
    role: 'Administrateur',
    avatar: ''
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the profile
  };

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Mon compte"
        size="sm"
        // Pas d'actions (ou adapter ici si besoin)
      />

      <div className="px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="flex border-b border-gray-200">
              <button onClick={() => setActiveTab('profile')} className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'profile' ? 'border-[#841b60] text-[#841b60]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <User className="mr-2 h-5 w-5" />
                Profil
              </button>
              <button onClick={() => setActiveTab('security')} className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'security' ? 'border-[#841b60] text-[#841b60]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Lock className="mr-2 h-5 w-5" />
                Sécurité
              </button>
              <button onClick={() => setActiveTab('notifications')} className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'notifications' ? 'border-[#841b60] text-[#841b60]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <BellRing className="mr-2 h-5 w-5" />
                Notifications
              </button>
            </div>
            <div className="p-6">
              {/* PROFIL */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-8 flex flex-col md:flex-row items-start md:items-center">
                    <div className="mr-6 mb-4 md:mb-0">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-12 h-12" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-medium mb-1">{profile.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{profile.email}</p>
                      <button type="button" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-[#841b60] hover:text-white transition-colors duration-200">
                        Changer la photo
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            value={profile.email}
                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                          Organisation
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            id="company"
                            value={profile.company}
                            onChange={e => setProfile({ ...profile, company: e.target.value })}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Rôle
                        </label>
                        <select
                          id="role"
                          value={profile.role}
                          onChange={e => setProfile({ ...profile, role: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                        >
                          <option>Administrateur</option>
                          <option>Responsable marketing</option>
                          <option>Éditeur</option>
                          <option>Lecteur</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
                        Sauvegarder les modifications
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SÉCURITÉ */}
              {activeTab === 'security' && (
                <div>
                  <div className="bg-[#f9f0f5] border border-[#e9d0e5] rounded-lg p-4 mb-6">
                    <p className="text-[#841b60] text-sm">
                      Nous vous recommandons de changer votre mot de passe régulièrement pour assurer la sécurité de votre compte.
                    </p>
                  </div>
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input type="password" id="current-password" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]" placeholder="Entrez votre mot de passe actuel" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input type="password" id="new-password" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]" placeholder="Entrez un nouveau mot de passe" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input type="password" id="confirm-password" className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]" placeholder="Confirmez le nouveau mot de passe" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
                        Changer le mot de passe
                      </button>
                    </div>
                  </form>
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sessions actives</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">MacBook Pro - Paris</p>
                            <p className="text-sm text-gray-500">Dernière activité: il y a 2 minutes</p>
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Actuelle
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">iPhone - Lyon</p>
                            <p className="text-sm text-gray-500">Dernière activité: il y a 3 jours</p>
                          </div>
                        </div>
                        <button className="text-red-500 text-sm hover:underline">
                          Déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Campagnes</h3>
                    <div className="space-y-4">
                      {['Nouvelles participations', 'Campagne terminée', 'Statistiques hebdomadaires', 'Commentaires et feedback'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">{item}</span>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center space-x-2">
                              <input type="checkbox" defaultChecked={index < 2} className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]" />
                              <span className="text-sm text-gray-500">Email</span>
                            </label>
                            <label className="inline-flex items-center space-x-2">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]" />
                              <span className="text-sm text-gray-500">App</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-700 mb-3">Système</h3>
                    <div className="space-y-4">
                      {['Mises à jour de sécurité', 'Nouvelles fonctionnalités', 'Maintenance planifiée'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">{item}</span>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center space-x-2">
                              <input type="checkbox" defaultChecked={index === 0} className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]" />
                              <span className="text-sm text-gray-500">Email</span>
                            </label>
                            <label className="inline-flex items-center space-x-2">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]" />
                              <span className="text-sm text-gray-500">App</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
                      Sauvegarder les préférences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
