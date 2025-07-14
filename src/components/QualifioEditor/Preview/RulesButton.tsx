import React from 'react';

const RulesButton: React.FC = () => {
  return (
    <div className="absolute top-4 right-4">
      <button 
        className="px-4 py-2 text-white text-sm font-medium rounded shadow-lg"
        style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
      >
        Règlement
      </button>
    </div>
  );
};

export default RulesButton;