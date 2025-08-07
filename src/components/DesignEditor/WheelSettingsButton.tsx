import React from 'react';

interface WheelSettingsButtonProps {
  onClick: () => void;
}

const WheelSettingsButton: React.FC<WheelSettingsButtonProps> = ({ onClick }) => (
  <button
    onClick={(e) => {
      console.log('🔘 WheelSettingsButton onClick appelé');
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    onMouseDown={(e) => {
      console.log('🔘 WheelSettingsButton onMouseDown appelé');
      e.preventDefault();
      e.stopPropagation();
    }}
    onTouchStart={(e) => {
      console.log('🔘 WheelSettingsButton onTouchStart appelé');
      e.preventDefault();
      e.stopPropagation();
    }}
    className="fixed bottom-3 right-3 z-[70] w-9 h-9 flex items-center justify-center bg-white border-2 border-[#0074E0] rounded-[10px] shadow-md hover:bg-[#E5F3FF] transition cursor-pointer"
    aria-label="Configurer la roue de la fortune"
    title="Configurer la roue de la fortune"
    style={{ 
      minWidth: 0, 
      minHeight: 0, 
      boxSizing: 'border-box',
      pointerEvents: 'auto',
      userSelect: 'none'
    }}
  >
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
      <circle cx="12" cy="12" r="9" stroke="#0074E0" strokeWidth="1.5" fill="#F8FCFF" />
      <path d="M12 6v6l4 2" stroke="#0074E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export default WheelSettingsButton;
