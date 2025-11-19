import React from 'react';
import { useCampaignCreator } from '@/hooks/useCampaignCreator';
import { User } from 'lucide-react';

interface CampaignCreatorTooltipProps {
  createdBy: string | null;
  children: React.ReactNode;
}

export const CampaignCreatorTooltip: React.FC<CampaignCreatorTooltipProps> = ({
  createdBy,
  children
}) => {
  const { creator, loading } = useCampaignCreator(createdBy);

  if (!createdBy || loading) {
    return <>{children}</>;
  }

  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap">
          <div className="flex items-center gap-2">
            {creator?.avatar_url ? (
              <img 
                src={creator.avatar_url} 
                alt={creator.full_name || creator.email}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium">{creator?.full_name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground">{creator?.email}</p>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
        </div>
      </div>
    </div>
  );
};
