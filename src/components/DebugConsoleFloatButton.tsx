import React from 'react';

const DebugConsoleFloatButton: React.FC = () => {
  const handleClick = () => {
    console.error(new Error('[MANUAL_DEBUG_ERROR_FLOAT] Snapshot demandé depuis le bouton flottant'));
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: '12px',
        bottom: '12px',
        zIndex: 99999,
      }}
      className="px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white hover:bg-black/90 shadow-lg backdrop-blur-sm"
    >
      Debug console
    </button>
  );
};

export default DebugConsoleFloatButton;
