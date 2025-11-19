import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  User, Mail, Calendar, LogOut, Shield, 
  FileDown, Trash2, Settings, ChevronRight 
} from 'lucide-react';
import Spinner from '../components/shared/Spinner';
import { GDPRSettings } from '@/components/GDPR/GDPRSettings';
import { DataExportRequest } from '@/components/GDPR/DataExportRequest';
import { DataDeletionRequest } from '@/components/GDPR/DataDeletionRequest';
import { Button } from '@/components/ui/button';

type ProfileSection = 'personal' | 'privacy' | 'data-export' | 'data-deletion';

const Profile: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // La redirection sera gérée par le ProtectedRoute
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
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

  const menuItems = [
    {
      id: 'personal' as ProfileSection,
      icon: User,
      label: 'Informations personnelles',
      description: 'Gérez vos informations de compte'
    },
    {
      id: 'privacy' as ProfileSection,
      icon: Shield,
      label: 'Respect de la vie privée',
      description: 'Cookies et consentements'
    },
    {
      id: 'data-export' as ProfileSection,
      icon: FileDown,
      label: 'Exporter mes données',
      description: 'Téléchargez vos données personnelles'
    },
    {
      id: 'data-deletion' as ProfileSection,
      icon: Trash2,
      label: 'Supprimer mon compte',
      description: 'Suppression définitive de vos données'
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Informations personnelles</h2>
              <p className="text-muted-foreground">
                Gérez vos informations de compte et vos préférences.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {user.user_metadata?.first_name || 'Utilisateur'} {user.user_metadata?.last_name || ''}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Informations */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Membre depuis</p>
                      <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Statut du compte</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                        {user.email_confirmed_at ? 'Confirmé' : 'En attente de confirmation'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Activité</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Campagnes</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
              </div>
            </div>

            {/* Déconnexion */}
            <div className="pt-6 border-t border-border">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Respect de la vie privée</h2>
              <p className="text-muted-foreground">
                Vous gardez toujours le contrôle de vos paramètres et pouvez les gérer ici à tout moment.
              </p>
            </div>
            <GDPRSettings />
          </div>
        );

      case 'data-export':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Exporter mes données</h2>
              <p className="text-muted-foreground">
                Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données personnelles.
              </p>
            </div>
            <DataExportRequest />
          </div>
        );

      case 'data-deletion':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Supprimer mon compte</h2>
              <p className="text-muted-foreground">
                La suppression de votre compte est définitive et irréversible. Toutes vos données seront supprimées.
              </p>
            </div>
            <DataDeletionRequest />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-r border-border bg-background">
            <div className="p-6">
              <h1 className="text-xl font-bold text-foreground mb-6">Paramètres</h1>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                        transition-colors text-left group
                        ${isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate hidden sm:block">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isActive ? 'text-primary' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="p-6 lg:py-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
