import React from 'react';

const RulesButton: React.FC = () => {
  return (
    <button 
      className="px-4 py-2 text-white text-sm font-medium rounded shadow-lg hover:opacity-90 transition-opacity"
      style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
    >
      Règlement
    </button>
  );
};

export default RulesButton;