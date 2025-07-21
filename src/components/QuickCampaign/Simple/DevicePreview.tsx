
import React from 'react';
import { motion } from 'framer-motion';

interface DevicePreviewProps {
  device: 'desktop' | 'tablet' | 'mobile';
  logoUrl: string;
  backgroundUrl?: string;
  extractedColors: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  extractedFont?: string;
  customTexts: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    style: any;
  }>;
  onUpdateTexts: (texts: any[]) => void;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({
  device,
  logoUrl,
  backgroundUrl,
  extractedColors,
  extractedFont,
  customTexts,
  onUpdateTexts
}) => {
  const getDeviceDimensions = () => {
    switch (device) {
      case 'desktop':
        return { width: 800, height: 600, scale: 1 };
      case 'tablet':
        return { width: 600, height: 800, scale: 0.8 };
      case 'mobile':
        return { width: 400, height: 700, scale: 0.7 };
      default:
        return { width: 800, height: 600, scale: 1 };
    }
  };

  const { width, height, scale } = getDeviceDimensions();

  const containerStyle = {
    width: width * scale,
    height: height * scale,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  };

  const backgroundStyle = {
    background: backgroundUrl 
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundUrl})`
      : `linear-gradient(135deg, 
          ${extractedColors?.primary || '#3B82F6'} 0%, 
          ${extractedColors?.secondary || '#8B5CF6'} 50%, 
          ${extractedColors?.primary || '#3B82F6'} 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as const
  };

  return (
    <div className="flex justify-center items-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gray-100 rounded-2xl p-4 shadow-2xl"
        style={{ width: width * scale + 32, height: height * scale + 32 }}
      >
        {/* Device Frame */}
        <div
          className="relative w-full h-full rounded-xl overflow-hidden shadow-lg"
          style={containerStyle}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={backgroundStyle}
          >
            {/* Premium Overlay Effects */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${extractedColors?.accent || '#ffffff'}33, transparent 50%),
                            radial-gradient(circle at 70% 80%, ${extractedColors?.secondary || '#8B5CF6'}33, transparent 50%)`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
            {/* Logo */}
            {logoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-w-24 max-h-24 object-contain filter drop-shadow-2xl"
                  style={{
                    maxWidth: device === 'mobile' ? '60px' : '80px',
                    maxHeight: device === 'mobile' ? '60px' : '80px'
                  }}
                />
              </motion.div>
            )}

            {/* Premium Campaign Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-6 max-w-md"
            >
              {/* Badge/Tag */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-block"
              >
                <div 
                  className="px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase border-2"
                  style={{
                    backgroundColor: extractedColors?.accent || '#ffffff',
                    color: extractedColors?.primary || '#000000',
                    borderColor: extractedColors?.secondary || '#ffffff'
                  }}
                >
                  🎉 Jeu Concours
                </div>
              </motion.div>
              
              {/* Main Title - Premium Typography */}
              <h1 
                className="font-black leading-tight tracking-tight"
                style={{
                  fontSize: device === 'mobile' ? '32px' : '48px',
                  fontFamily: extractedFont || '"Montserrat", "Inter", sans-serif',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  background: `linear-gradient(135deg, ${extractedColors?.accent || '#ffffff'}, ${extractedColors?.secondary || '#ffffff'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                TOURNEZ LA ROUE
                <br />
                <span 
                  className="block text-shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${extractedColors?.primary || '#ffff00'}, ${extractedColors?.accent || '#ffffff'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  DE LA CHANCE
                </span>
              </h1>
              
              {/* Subtitle */}
              <p 
                className="text-xl font-semibold leading-relaxed"
                style={{
                  fontSize: device === 'mobile' ? '18px' : '24px',
                  fontFamily: extractedFont || '"Montserrat", "Inter", sans-serif',
                  color: extractedColors?.accent || '#ffffff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.7)'
                }}
              >
                Gagnez à coup sûr un cadeau mystère
              </p>

              {/* Premium CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden px-12 py-4 rounded-2xl font-black text-xl tracking-wide uppercase transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${extractedColors?.primary || '#ffff00'}, ${extractedColors?.secondary || '#ff6600'})`,
                    color: '#000000',
                    fontSize: device === 'mobile' ? '18px' : '22px',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 2px ${extractedColors?.accent || '#ffffff'}`,
                    border: `3px solid ${extractedColors?.accent || '#ffffff'}`
                  }}
                >
                  <span className="relative z-10">TOURNER LA ROUE →</span>
                  <div 
                    className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${extractedColors?.accent || '#ffffff'}, transparent)`
                    }}
                  />
                </motion.button>
              </motion.div>

              {/* Additional Premium Elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center space-x-4 pt-4"
              >
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: extractedColors?.accent || '#ffffff',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Custom Texts */}
            {customTexts.map((text) => (
              <motion.div
                key={text.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${text.position.x}%`,
                  top: `${text.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  ...text.style
                }}
                drag
                onDragEnd={(_, info) => {
                  const updatedTexts = customTexts.map(t => 
                    t.id === text.id 
                      ? {
                          ...t,
                          position: {
                            x: Math.max(0, Math.min(100, text.position.x + (info.offset.x / width) * 100)),
                            y: Math.max(0, Math.min(100, text.position.y + (info.offset.y / height) * 100))
                          }
                        }
                      : t
                  );
                  onUpdateTexts(updatedTexts);
                }}
              >
                {text.text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Device Label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
            {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablette' : 'Mobile'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default DevicePreview;
