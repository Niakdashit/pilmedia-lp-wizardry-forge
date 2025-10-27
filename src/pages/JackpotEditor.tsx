import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JackpotEditorLayout from '../components/JackpotEditor/JackpotEditorLayout';
import { clearTempCampaignData, isTempCampaignId } from '../utils/tempCampaignId';

const JackpotEditor: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Force clean temp campaign residues (backgrounds, zoom, modular, etc.) on entry
  useEffect(() => {
    const campaignId = searchParams.get('campaign');
    if (campaignId && isTempCampaignId(campaignId)) {
      clearTempCampaignData(campaignId);
    }
  }, [searchParams]);

  return <JackpotEditorLayout mode="campaign" />;
};

export default JackpotEditor;