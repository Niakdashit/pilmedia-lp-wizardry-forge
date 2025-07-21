
import React from 'react';
import { Palette, Sparkles, ArrowLeft } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const Step3Header: React.FC = () => {
  const { setCurrentStep, campaignName } = useQuickCampaignStore();

  return (
    <div className="bg-card rounded-3xl shadow-lg border p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Retour</span>
          </button>
          
          <div className="h-8 w-px bg-border" />
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-sm">
              <Palette className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Style & Personnalisation</h1>
              <p className="text-muted-foreground text-lg">Créez l'identité visuelle de "{campaignName}"</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-5 py-3 bg-primary/10 rounded-xl border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Étape 3/4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Header;
