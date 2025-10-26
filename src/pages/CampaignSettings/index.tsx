import React from 'react';
import CampaignSettingsLayout from './CampaignSettingsLayout';

/**
 * Standalone Campaign Settings Page
 * 
 * Can be accessed directly via /campaign/:id/settings
 * Provides a full-page settings experience outside of the editor context
 */
const CampaignSettingsPage: React.FC = () => {
  return <CampaignSettingsLayout />;
};

export default CampaignSettingsPage;
