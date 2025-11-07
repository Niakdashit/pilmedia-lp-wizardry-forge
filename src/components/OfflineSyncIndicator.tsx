import { CloudOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineSyncIndicatorProps {
  isOnline: boolean;
  queueSize: number;
  isSyncing: boolean;
  className?: string;
}

export const OfflineSyncIndicator = ({
  isOnline,
  queueSize,
  isSyncing,
  className,
}: OfflineSyncIndicatorProps) => {
  // Determine status
  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        text: 'Hors ligne',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
      };
    }
    
    if (isSyncing) {
      return {
        icon: Loader2,
        text: 'Synchronisation...',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        animate: 'animate-spin',
      };
    }
    
    if (queueSize > 0) {
      return {
        icon: AlertCircle,
        text: `${queueSize} en attente`,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
      };
    }
    
    return {
      icon: CheckCircle2,
      text: 'Synchronisé',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        status.bg,
        status.color,
        className
      )}
      title={
        !isOnline
          ? 'Mode hors ligne - Les modifications seront synchronisées au retour en ligne'
          : isSyncing
          ? 'Synchronisation en cours...'
          : queueSize > 0
          ? `${queueSize} modification(s) en attente de synchronisation`
          : 'Toutes les modifications sont synchronisées'
      }
    >
      <Icon className={cn('h-4 w-4', status.animate)} />
      <span>{status.text}</span>
    </div>
  );
};
