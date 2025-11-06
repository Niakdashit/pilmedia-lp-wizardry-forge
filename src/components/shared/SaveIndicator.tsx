import React, { useEffect, useState } from 'react';
import { Check, Save, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  isSaving: boolean;
  error?: Error | null;
  lastSavedAt?: Date;
}

/**
 * SaveIndicator - Indicateur visuel de l'état de sauvegarde
 * 
 * Affiche:
 * - "Sauvegarde..." quand isSaving = true
 * - "Sauvegardé il y a X" quand terminé
 * - "Erreur de sauvegarde" en cas d'erreur
 */
const SaveIndicator: React.FC<SaveIndicatorProps> = ({ isSaving, error, lastSavedAt }) => {
  const [timeSinceSave, setTimeSinceSave] = useState<string>('');

  useEffect(() => {
    if (!lastSavedAt || isSaving) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);

      if (diff < 10) {
        setTimeSinceSave('à l\'instant');
      } else if (diff < 60) {
        setTimeSinceSave('il y a quelques secondes');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeSinceSave(`il y a ${minutes} min`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeSinceSave(`il y a ${hours}h`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [lastSavedAt, isSaving]);

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Erreur de sauvegarde</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        <Save className="w-3.5 h-3.5 animate-pulse" />
        <span>Sauvegarde...</span>
      </div>
    );
  }

  if (lastSavedAt && timeSinceSave) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
        <Check className="w-3.5 h-3.5" />
        <span>Sauvegardé {timeSinceSave}</span>
      </div>
    );
  }

  return null;
};

export default SaveIndicator;
