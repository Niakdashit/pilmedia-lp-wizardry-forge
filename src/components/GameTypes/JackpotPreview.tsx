import React from 'react';

interface JackpotPreviewProps {
  style?: React.CSSProperties;
}

const JackpotPreview: React.FC<JackpotPreviewProps> = ({ style }) => {
  return (
    <div style={style} className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
      <p className="text-gray-600">Jeu Jackpot - En développement</p>
    </div>
  );
};

export default JackpotPreview;