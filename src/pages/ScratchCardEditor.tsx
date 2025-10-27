import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScratchCardEditorLayout from '../components/ScratchCardEditor/ScratchCardEditorLayout';
import { clearTempCampaignData, isTempCampaignId } from '../utils/tempCampaignId';

const ScratchCardEditor: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Force clean temp campaign residues (backgrounds, zoom, modular, etc.) on entry
  useEffect(() => {
    const campaignId = searchParams.get('campaign');
    if (campaignId && isTempCampaignId(campaignId)) {
      clearTempCampaignData(campaignId);
    }
  }, [searchParams]);

  return <ScratchCardEditorLayout />;
};

export default ScratchCardEditor;