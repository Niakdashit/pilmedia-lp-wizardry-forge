
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Settings, BarChart3 } from 'lucide-react';

const AdminQuickAccess: React.FC = () => {
  const quickActions = [
    {
      title: 'Nouveau Client',
      description: 'Ajouter un nouveau client',
      icon: Users,
      href: '/admin/clients',
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Créer Campagne',
      description: 'Nouvelle campagne rapide',
      icon: Target,
      href: '/admin/campaigns',
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Voir Analytics',
      description: 'Tableau de bord analytique',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-brand-gradient hover:bg-[#6d164f]',
      iconBg: 'bg-[#fce7f3]',
      iconColor: 'text-[#841b60]'
    },
    {
      title: 'Paramètres',
      description: 'Configuration système',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Accès Rapide</h3>
        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminQuickAccess;
