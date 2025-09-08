import React from 'react';
import ScratchEditor3Layout from '../components/ScratchEditor3/ScratchEditor3Layout';

const ScratchEditor3: React.FC = () => {
  // Masquer l'onglet de la roue de la fortune pour se concentrer sur les cartes à gratter
  return <ScratchEditor3Layout hiddenTabs={['wheel']} />;
};

export default ScratchEditor3;
