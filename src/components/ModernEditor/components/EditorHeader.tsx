import React from 'react';
import { Eye, Save, Share2, MoreHorizontal, Archive } from 'lucide-react';
import PreviewDeviceButtons from './PreviewDeviceButtons';
import { OfflineSyncIndicator } from '@/components/OfflineSyncIndicator';
import { useNavigate } from 'react-router-dom';

interface EditorHeaderProps {
  campaign: any;
  onSave: () => void;
  onPreview: () => void;
  isLoading?: boolean;
  isNewCampaign?: boolean;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
  // Offline sync props
  isOnline?: boolean;
  queueSize?: number;
  isSyncing?: boolean;
}
const EditorHeader: React.FC<EditorHeaderProps> = ({
  campaign,
  onSave,
  onPreview,
  isLoading = false,
  isNewCampaign = false,
  selectedDevice = 'desktop',
  onDeviceChange = () => {},
  isOnline = true,
  queueSize = 0,
  isSyncing = false,
}) => {
  const navigate = useNavigate();
  
  return <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 flex-shrink-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Bouton retour et titre */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {campaign.name || (isNewCampaign ? 'Nouvelle Campagne' : 'Campagne')}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Dernière modification: maintenant</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {campaign.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <span>•</span>
                <OfflineSyncIndicator
                  isOnline={isOnline}
                  queueSize={queueSize}
                  isSyncing={isSyncing}
                />
              </div>
            </div>
          </div>

          {/* Center section - Device buttons */}
          <div className="flex items-center justify-center flex-1">
            <PreviewDeviceButtons selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button onClick={onPreview} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              <Eye className="w-4 h-4" />
              <span>Aperçu</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>

            {!isNewCampaign && campaign?.id && (
              <button 
                onClick={() => navigate(`/campaign/${campaign.id}/backups`)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Archive className="w-4 h-4" />
                <span>Sauvegardes</span>
              </button>
            )}

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <button onClick={onSave} disabled={isLoading} className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] hover:bg-[#6d164f] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50">
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default EditorHeader;