import React, { useState } from 'react';
import { DollarSign, Crown, Zap, Gift, Target, TrendingUp } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const MonetizationFeatures: React.FC = () => {
  const { 
    monetization, 
    setPricingPlan, 
    setLeadCapture, 
    setAnalytics
  } = useQuickCampaignStore();
  
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise'>(
    monetization.selectedPlan as 'basic' | 'premium' | 'enterprise' || 'basic'
  );

  const handlePlanChange = (plan: 'basic' | 'premium' | 'enterprise') => {
    setSelectedPlan(plan);
    setPricingPlan(plan);
  };

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basique',
      price: '0€',
      period: 'Gratuit',
      color: 'gray',
      features: [
        'Roue simple avec 8 segments max',
        'Thèmes prédéfinis',
        'Export basique',
        'Formulaire de contact simple'
      ]
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '29€',
      period: '/mois',
      color: 'blue',
      features: [
        'Roue illimitée avec segments infinis',
        'Effets 3D et animations premium',
        'Overlays et personnalisation avancée',
        'Analytics détaillées',
        'Export haute qualité',
        'Intégrations CRM',
        'Support prioritaire'
      ]
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: '99€',
      period: '/mois',
      color: 'purple',
      features: [
        'Tout du Premium',
        'White-label complet',
        'API personnalisée',
        'Multi-domaines',
        'Support dédié 24/7',
        'Formations personnalisées',
        'SLA garantie 99.9%'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Monétisation & Plans Pro</h3>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handlePlanChange(plan.id)}
            className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? `border-${plan.color}-500 bg-${plan.color}-50 ring-2 ring-${plan.color}-200`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {plan.id === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Populaire
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">{plan.name}</h4>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 text-sm">{plan.period}</span>
              </div>
              
              <ul className="space-y-2 text-sm text-gray-600 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Features Showcase */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Fonctionnalités Premium Débloquées</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <Target className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Ciblage Avancé</p>
                <p className="text-sm text-gray-600">Segmentation par comportement et géolocalisation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Analytics Pro</p>
                <p className="text-sm text-gray-600">Tableaux de bord temps réel avec KPIs</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <Gift className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Récompenses Dynamiques</p>
                <p className="text-sm text-gray-600">Système de points et cadeaux automatisés</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <DollarSign className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">ROI Tracking</p>
                <p className="text-sm text-gray-600">Suivi des conversions et revenus générés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Optimization */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h4 className="font-medium text-gray-900">Optimisation des revenus</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">A/B Testing</h5>
            <p className="text-sm text-gray-600 mb-3">
              Testez différentes variantes pour maximiser les conversions
            </p>
            <button 
              onClick={() => setAnalytics(!monetization.analytics)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              {monetization.analytics ? 'Désactiver' : 'Configurer les tests'}
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">Lead Scoring</h5>
            <p className="text-sm text-gray-600 mb-3">
              Qualifiez automatiquement vos prospects selon leur engagement
            </p>
            <button 
              onClick={() => setLeadCapture(!monetization.leadCapture)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {monetization.leadCapture ? 'Désactiver' : 'Activer le scoring'}
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {selectedPlan === 'basic' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-center">
            <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Débloquez le potentiel complet !</h4>
            <p className="text-gray-600 mb-4">
              Passez au Premium pour accéder à toutes les fonctionnalités avancées et multiplier vos résultats.
            </p>
            <button 
              onClick={() => handlePlanChange('premium')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
            >
              Passer au Premium - 29€/mois
            </button>
            <p className="text-xs text-gray-500 mt-2">Essai gratuit 14 jours • Annulation à tout moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonetizationFeatures;
