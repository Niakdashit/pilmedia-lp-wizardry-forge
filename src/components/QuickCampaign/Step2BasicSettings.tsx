import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Target } from 'lucide-react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import LogoUploader from '../LogoUploader';

const Step2BasicSettings: React.FC = () => {
  const {
    campaignName,
    launchDate,
    marketingGoal,
    setCampaignName,
    setLaunchDate,
    setMarketingGoal,
    setCurrentStep
  } = useQuickCampaignStore();

  const marketingGoals = [
    { id: 'leads', label: 'Générer des leads', description: 'Collecter des contacts qualifiés' },
    { id: 'engagement', label: 'Engagement client', description: 'Fidéliser votre audience' },
    { id: 'brand', label: 'Notoriété de marque', description: 'Faire connaître votre marque' },
    { id: 'sales', label: 'Augmenter les ventes', description: 'Convertir plus de prospects' }
  ];

  // Les couleurs seront extraites automatiquement via le composant LogoUploader

  const canProceed = campaignName.trim() && launchDate && marketingGoal;

  return (
    <div className="min-h-screen bg-[#ebf4f7] py-12 px-0">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl mb-4 text-[#841b60] font-semibold">
              Paramètres essentiels
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl font-light text-[#991c6e]/[0.78]">
              Configurons les bases de votre campagne
            </motion.p>
          </div>

          <div className="space-y-12">
            {/* Campaign Name */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">Nom de la campagne</label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Ex: Jeu concours été 2024"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#841b60] focus:outline-none transition-all text-lg bg-gray-50"
              />
            </motion.div>


            {/* Launch Date */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Date de lancement
              </label>
              <input
                type="date"
                value={launchDate}
                onChange={e => setLaunchDate(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#841b60] focus:outline-none transition-all text-lg bg-gray-50"
              />
            </motion.div>

            {/* Marketing Goal */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-lg font-medium text-gray-900 mb-6">
                <Target className="w-5 h-5 inline mr-2" />
                Objectif marketing
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketingGoals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => setMarketingGoal(goal.id)}
                    className={`
                      p-6 rounded-2xl border-2 cursor-pointer transition-all
                      ${marketingGoal === goal.id ? 'border-[#841b60] bg-[#841b60]/5' : 'border-gray-200 hover:border-[#841b60]/50 bg-gray-50'}
                    `}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{goal.label}</h3>
                    <p className="text-gray-600 text-sm">{goal.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Logo Upload */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Logo <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <LogoUploader />
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-16">
            <button onClick={() => setCurrentStep(1)} className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceed}
              className={`
                flex items-center space-x-2 px-8 py-4 rounded-2xl font-medium transition-all
                ${canProceed ? 'bg-[#841b60] text-white hover:bg-[#841b60]/90 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-1 bg-[#841b60] rounded-full"></div>
              <div className="w-8 h-1 bg-[#841b60] rounded-full"></div>
              <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-light">Étape 2 sur 3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2BasicSettings;
