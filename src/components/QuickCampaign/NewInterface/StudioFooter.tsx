
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Settings, 
  Save, 
  Clock, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

interface StudioFooterProps {
  onPublish: () => void;
  onAdvancedMode: () => void;
}

const StudioFooter: React.FC<StudioFooterProps> = ({ onPublish, onAdvancedMode }) => {
  const { 
    campaignName, 
    selectedGameType, 
    customColors,
    logoUrl 
  } = useQuickCampaignStore();

  // Calculate completion percentage
  const completionItems = [
    { key: 'name', completed: !!campaignName?.trim(), label: 'Nom de campagne' },
    { key: 'game', completed: !!selectedGameType, label: 'Type de jeu' },
    { key: 'colors', completed: !!customColors.primary, label: 'Couleurs' },
    { key: 'logo', completed: !!logoUrl, label: 'Logo (optionnel)' }
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const requiredCount = completionItems.filter(item => !item.label.includes('optionnel')).length;
  const completionPercentage = (completedCount / completionItems.length) * 100;
  const canPublish = completedCount >= requiredCount;

  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Auto-save indicator
  React.useEffect(() => {
    setLastSaved(new Date());
  }, [campaignName, selectedGameType, customColors]);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-background border-t border-border px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Progress & Status */}
        <div className="flex items-center space-x-6">
          {/* Completion Indicator */}
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercentage}, 100`}
                  className="text-primary"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {completedCount}/{completionItems.length} étapes
                </span>
                {canPublish && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {lastSaved && (
                  <>
                    <Save className="w-3 h-3" />
                    <span>Sauvegardé à {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status */}
          <div className="hidden md:flex items-center space-x-4">
            {completionItems.map((item) => (
              <div
                key={item.key}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs ${
                  item.completed
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.completed ? 'bg-green-500' : 'bg-muted-foreground'
                }`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Advanced Mode Button */}
          <button
            onClick={onAdvancedMode}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary/10 transition-all duration-200 font-medium"
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres avancés</span>
          </button>

          {/* Publish Button */}
          <motion.button
            onClick={onPublish}
            disabled={!canPublish}
            whileHover={canPublish ? { scale: 1.02 } : {}}
            whileTap={canPublish ? { scale: 0.98 } : {}}
            className={`flex items-center space-x-3 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              canPublish
                ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Rocket className="w-5 h-5" />
            <span>Publier la campagne</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Quick Tips */}
      {!canPublish && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              <strong>Presque fini !</strong> Complétez les étapes manquantes pour publier votre campagne.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudioFooter;
