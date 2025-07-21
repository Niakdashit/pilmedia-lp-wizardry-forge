
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
      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundUrl})`
      : `linear-gradient(135deg, ${extractedColors?.primary || '#3B82F6'}, ${extractedColors?.secondary || '#8B5CF6'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
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
          />

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
                  className="max-w-32 max-h-32 object-contain filter drop-shadow-lg"
                  style={{
                    maxWidth: device === 'mobile' ? '80px' : '120px',
                    maxHeight: device === 'mobile' ? '80px' : '120px'
                  }}
                />
              </motion.div>
            )}

            {/* Default Campaign Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-6"
            >
              <h1 
                className="font-bold text-white drop-shadow-lg"
                style={{
                  fontSize: device === 'mobile' ? '28px' : '42px',
                  fontFamily: extractedFont || 'Inter, sans-serif'
                }}
              >
                Gagnez des Prix Incroyables !
              </h1>
              
              <p 
                className="text-white/90 drop-shadow-md"
                style={{
                  fontSize: device === 'mobile' ? '16px' : '20px',
                  fontFamily: extractedFont || 'Inter, sans-serif'
                }}
              >
                Tentez votre chance et découvrez ce que vous pourriez gagner
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all"
                style={{
                  backgroundColor: extractedColors?.accent || '#FFFFFF',
                  color: extractedColors?.primary || '#000000',
                  fontSize: device === 'mobile' ? '16px' : '20px'
                }}
              >
                Jouer Maintenant
              </motion.button>
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
