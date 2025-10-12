
import React, { useState } from 'react';
import { Puzzle, Smartphone, Code, Database, BarChart3 } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

interface Extension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'integration' | 'analytics' | 'automation' | 'design';
  isPremium: boolean;
  isActive: boolean;
}

const ProExtensions: React.FC = () => {
  const { extensions, toggleExtension } = useQuickCampaignStore();
  const [activeCategory, setActiveCategory] = useState<'all' | 'integration' | 'analytics' | 'automation' | 'design'>('all');
  
  const [localExtensions, setLocalExtensions] = useState<Extension[]>([
    {
      id: 'zapier',
      name: 'Zapier Integration',
      description: 'Connectez votre roue à plus de 5000 applications',
      icon: <Puzzle className="w-5 h-5" />,
      category: 'integration',
      isPremium: true,
      isActive: extensions.some(ext => ext.id === 'zapier' && ext.enabled)
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: 'Tracking avancé des interactions et conversions',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'analytics',
      isPremium: false,
      isActive: extensions.some(ext => ext.id === 'google-analytics' && ext.enabled)
    },
    {
      id: 'crm-hubspot',
      name: 'HubSpot CRM',
      description: 'Intégration complète avec HubSpot',
      icon: <Database className="w-5 h-5" />,
      category: 'integration',
      isPremium: true,
      isActive: extensions.some(ext => ext.id === 'crm-hubspot' && ext.enabled)
    },
    {
      id: 'mobile-app',
      name: 'Application Mobile',
      description: 'Version mobile native de votre roue',
      icon: <Smartphone className="w-5 h-5" />,
      category: 'design',
      isPremium: true,
      isActive: extensions.some(ext => ext.id === 'mobile-app' && ext.enabled)
    },
    {
      id: 'custom-api',
      name: 'API Personnalisée',
      description: 'Développez vos propres intégrations',
      icon: <Code className="w-5 h-5" />,
      category: 'automation',
      isPremium: true,
      isActive: extensions.some(ext => ext.id === 'custom-api' && ext.enabled)
    }
  ]);

  const categories = [
    { id: 'all', name: 'Toutes', count: localExtensions.length },
    { id: 'integration', name: 'Intégrations', count: localExtensions.filter(e => e.category === 'integration').length },
    { id: 'analytics', name: 'Analytics', count: localExtensions.filter(e => e.category === 'analytics').length },
    { id: 'automation', name: 'Automation', count: localExtensions.filter(e => e.category === 'automation').length },
    { id: 'design', name: 'Design', count: localExtensions.filter(e => e.category === 'design').length }
  ];

  const filteredExtensions = activeCategory === 'all' 
    ? localExtensions 
    : localExtensions.filter(ext => ext.category === activeCategory);

  const handleToggleExtension = (id: string) => {
    toggleExtension(id);
    setLocalExtensions(prev => 
      prev.map(ext => 
        ext.id === id ? { ...ext, isActive: !ext.isActive } : ext
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Puzzle className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Extensions Professionnelles</h3>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Extensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExtensions.map((extension) => (
          <div
            key={extension.id}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              extension.isActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {extension.isPremium && (
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Premium
                </span>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                extension.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {extension.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{extension.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{extension.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    extension.category === 'integration' ? 'bg-blue-100 text-blue-800' :
                    extension.category === 'analytics' ? 'bg-green-100 text-green-800' :
                    extension.category === 'automation' ? 'bg-purple-100 text-purple-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {extension.category}
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={extension.isActive}
                      onChange={() => handleToggleExtension(extension.id)}
                      disabled={extension.isPremium && !extension.isActive}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Extensions Summary */}
      {localExtensions.some(e => e.isActive) && (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
          <h4 className="font-medium text-indigo-900 mb-3">Extensions actives</h4>
          <div className="space-y-2">
            {localExtensions.filter(e => e.isActive).map((extension) => (
              <div key={extension.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {extension.icon}
                  <span className="text-indigo-800">{extension.name}</span>
                </div>
                <span className="text-green-600 font-medium">✓ Actif</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension Marketplace */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <Puzzle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="font-bold text-gray-900 mb-2">Marketplace d'Extensions</h4>
          <p className="text-gray-600 mb-4">
            Découvrez des centaines d'extensions créées par la communauté
          </p>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Explorer le Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProExtensions;
