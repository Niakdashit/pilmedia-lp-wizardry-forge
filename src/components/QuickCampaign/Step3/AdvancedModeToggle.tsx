
import React from 'react';
import { Settings, Zap } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const AdvancedModeToggle: React.FC = () => {
  const { advancedMode, setAdvancedMode } = useQuickCampaignStore();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            {advancedMode ? (
              <Zap className="w-5 h-5 text-purple-600" />
            ) : (
              <Settings className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {advancedMode ? 'Mode Expert' : 'Mode Standard'}
            </h3>
            <p className="text-sm text-gray-600">
              {advancedMode 
                ? 'Personnalisation avancée activée' 
                : 'Activer pour plus d\'options de personnalisation'
              }
            </p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={advancedMode}
            onChange={(e) => setAdvancedMode(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>
      
      {advancedMode && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="flex items-center space-x-2 text-sm text-purple-700">
            <Zap className="w-4 h-4" />
            <span>Options avancées débloquées !</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedModeToggle;
