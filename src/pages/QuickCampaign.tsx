import React, { useEffect } from 'react';
import QuickCampaignCreator from '../components/QuickCampaign/QuickCampaignCreator';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';
// 👇 Importe l'image depuis les assets
import FondQuick from '../assets/FondQuick.jpg';
const QuickCampaign: React.FC = () => {
  const {
    reset
  } = useQuickCampaignStore();
  useEffect(() => {
    reset();
  }, [reset]);
  return <div style={{
    backgroundImage: `url(${FondQuick})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }} className="min-h-screen flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="w-full">
        <QuickCampaignCreator />
      </div>
    </div>;
};
export default QuickCampaign;