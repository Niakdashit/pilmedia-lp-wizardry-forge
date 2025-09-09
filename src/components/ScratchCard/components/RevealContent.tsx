
import React from 'react';
import { RevealContentProps } from '../types';

export const RevealContent: React.FC<RevealContentProps> = ({
  type,
  title,
  message,
  image,
  customContent,
  brandConfig
}) => {
  if (customContent) {
    return <>{customContent}</>;
  }

  const getEmoji = () => {
    switch (type) {
      case 'win': return '🎉';
      case 'lose': return '😊';
      default: return '✨';
    }
  };

  const getBackgroundGradient = () => {
    if (type === 'win') {
      return `linear-gradient(135deg, ${brandConfig?.primaryColor || '#4CAF50'}, ${brandConfig?.accentColor || '#81C784'})`;
    }
    return `linear-gradient(135deg, ${brandConfig?.secondaryColor || '#757575'}, ${brandConfig?.backgroundColor || '#BDBDBD'})`;
  };

  return (
    <div
      className="reveal-content"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: getBackgroundGradient(),
        color: brandConfig?.textColor || '#ffffff',
        fontFamily: brandConfig?.fontFamily || 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      {image && (
        <img
          src={image}
          alt="Prize"
          style={{
            maxWidth: '60%',
            maxHeight: '40%',
            marginBottom: '15px',
            borderRadius: '8px',
            objectFit: 'contain'
          }}
        />
      )}
      
      <div
        style={{
          fontSize: '36px',
          marginBottom: '10px',
          animation: 'bounce 0.6s ease-out'
        }}
      >
        {getEmoji()}
      </div>
      
      {title && (
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          {title}
        </h3>
      )}
      
      {message && (
        <p
          style={{
            fontSize: '14px',
            margin: 0,
            opacity: 0.9,
            lineHeight: 1.4
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};
