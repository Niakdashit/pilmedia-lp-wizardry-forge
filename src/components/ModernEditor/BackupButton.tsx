import React from 'react';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackupButtonProps {
  campaignId: string;
}

const BackupButton: React.FC<BackupButtonProps> = ({ campaignId }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/campaign/${campaignId}/backups`)}
      className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm"
      title="Gérer les sauvegardes"
    >
      <Save className="w-4 h-4" />
      Sauvegardes
    </button>
  );
};

export default BackupButton;
