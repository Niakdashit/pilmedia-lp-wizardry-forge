
import React from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface GenerationStatusProps {
  error: string | null;
  progress: number;
  debugInfo: string;
}

const GenerationStatus: React.FC<GenerationStatusProps> = ({
  error,
  progress,
  debugInfo
}) => {
  const getStatusColor = () => {
    if (error && error.includes('Mode démonstration')) return 'text-blue-600';
    if (error) return 'text-orange-600';
    if (progress === 100) return 'text-emerald-600';
    return 'text-[#951b6d]';
  };

  const getProgressColor = () => {
    if (error && error.includes('Mode démonstration')) return 'bg-blue-500';
    if (error) return 'bg-orange-500';
    if (progress === 100) return 'bg-emerald-500';
    return 'bg-[#5a5a63]';
  };

  const getIcon = () => {
    if (error && error.includes('Mode démonstration')) {
      return <CheckCircle className="w-8 h-8 text-blue-500" />;
    }
    if (error) {
      return <AlertCircle className="w-8 h-8 text-orange-500" />;
    }
    if (progress === 100) {
      return <CheckCircle className="w-8 h-8 text-emerald-500" />;
    }
    return <Loader className="w-8 h-8 text-[#951b6d] animate-spin" />;
  };

  const getTitle = () => {
    if (error && error.includes('Mode démonstration')) return 'Mode démonstration activé';
    if (error) return 'Mode dégradé activé';
    if (progress === 100) return 'Génération terminée';
    return 'Génération en cours...';
  };

  const getDescription = () => {
    if (error && error.includes('Mode démonstration')) {
      return 'Quiz de test généré pour la démonstration';
    }
    if (error) {
      return 'Quiz généré avec des données par défaut';
    }
    if (progress === 100) {
      return 'Votre campagne est prête !';
    }
    return 'Configuration des paramètres et personnalisation';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
      <div className="space-y-6">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          {getIcon()}
        </div>
        <div className="text-center">
          <h3 className={`font-semibold mb-2 ${getStatusColor()}`}>
            {getTitle()}
          </h3>
          <p className="text-gray-600 mb-2">
            {getDescription()}
          </p>
          {debugInfo && (
            <p className="text-xs text-gray-500 font-mono bg-gray-50 rounded px-3 py-2 mt-3 inline-block">
              {debugInfo}
            </p>
          )}
          {error && !error.includes('Mode démonstration') && (
            <p className="text-sm text-orange-600 mt-2">
              L'API n'est pas accessible - Données de test utilisées
            </p>
          )}
          {error && error.includes('Mode démonstration') && (
            <p className="text-sm text-blue-600 mt-2">
              Parfait pour tester l'interface et les fonctionnalités
            </p>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GenerationStatus;
