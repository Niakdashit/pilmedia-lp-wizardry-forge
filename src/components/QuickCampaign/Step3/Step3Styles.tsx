
import React from 'react';

const Step3Styles: React.FC = () => {
  return (
    <style>{`
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: linear-gradient(45deg, #3B82F6, #8B5CF6);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
      .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: linear-gradient(45deg, #3B82F6, #8B5CF6);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
    `}</style>
  );
};

export default Step3Styles;
