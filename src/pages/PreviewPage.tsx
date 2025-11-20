import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Monitor, Smartphone, Tablet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GameCanvasPreview from '@/components/ModernEditor/components/GameCanvasPreview';
import { createSynchronizedQuizCampaign } from '@/utils/quizConfigSync';
import PreviewLoadingState from '@/components/ModernEditor/components/PreviewLoadingState';
import DeviceTransition from '@/components/ModernEditor/components/DeviceTransition';
import PreviewErrorBoundary from '@/components/ModernEditor/components/ErrorBoundary';

/**
 * PreviewPage - Page dédiée pour l'aperçu de campagne
 * Route: /preview/:campaignId
 */
const PreviewPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingDevice, setIsChangingDevice] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();

        if (error) throw error;
        setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Impossible de charger la campagne');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const handleDeviceChange = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
    if (newDevice === device) return;
    
    setIsChangingDevice(true);
    setIsLoading(true);
    
    setTimeout(() => {
      setDevice(newDevice);
      setTimeout(() => {
        setIsLoading(false);
        setIsChangingDevice(false);
      }, 300);
    }, 300);
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const deviceDimensions = {
    desktop: { width: '1200px', height: '80vh' },
    tablet: { width: '768px', height: '80vh' },
    mobile: { width: '375px', height: '80vh' }
  };

  const currentDimensions = deviceDimensions[device];
  const synchronizedCampaign = campaign ? createSynchronizedQuizCampaign(campaign) : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-[9999] overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-lg font-semibold">
            Aperçu - {campaign?.name || 'Chargement...'}
          </h2>
        </div>

        {/* Device selector */}
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => handleDeviceChange('desktop')}
            className={`p-2 rounded transition-all ${
              device === 'desktop'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Desktop"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeviceChange('tablet')}
            className={`p-2 rounded transition-all ${
              device === 'tablet'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Tablette"
          >
            <Tablet className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeviceChange('mobile')}
            className={`p-2 rounded transition-all ${
              device === 'mobile'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleClose}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          title="Fermer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <DeviceTransition device={device} isChanging={isChangingDevice}>
          <div
            style={{
              width: currentDimensions.width,
              height: currentDimensions.height,
              transition: 'all 0.3s ease-in-out'
            }}
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {isLoading ? (
              <PreviewLoadingState device={device} />
            ) : synchronizedCampaign ? (
              <PreviewErrorBoundary>
                <GameCanvasPreview
                  campaign={synchronizedCampaign}
                  previewDevice={device}
                  disableForm={true}
                />
              </PreviewErrorBoundary>
            ) : null}
          </div>
        </DeviceTransition>
      </div>
    </div>
  );
};

export default PreviewPage;
