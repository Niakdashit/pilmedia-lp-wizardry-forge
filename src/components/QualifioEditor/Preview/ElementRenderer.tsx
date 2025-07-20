import React from 'react';
import { 
  Circle, Square, Triangle, Hexagon, Heart, Star, MapPin, 
  Play, Music, BarChart3, PieChart, Activity 
} from 'lucide-react';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaApple, FaGoogle
} from 'react-icons/fa';

interface ElementData {
  type: string;
  color?: string;
  size?: number;
  iconName?: string;
  brand?: string;
  chartType?: string;
  gradient?: string;
}

interface ElementRendererProps {
  elementType?: string;
  elementData?: ElementData;
  width: number;
  height: number;
  className?: string;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
  elementType,
  elementData,
  width,
  height,
  className = ''
}) => {
  if (!elementType || !elementData) {
    return null;
  }

  const iconStyle = {
    width: width,
    height: height,
    color: elementData.color || '#000000'
  };

  const renderShape = () => {
    switch (elementData.type) {
      case 'circle':
        return <Circle style={iconStyle} className={className} />;
      case 'square':
        return <Square style={iconStyle} className={className} />;
      case 'triangle':
        return <Triangle style={iconStyle} className={className} />;
      case 'hexagon':
        return <Hexagon style={iconStyle} className={className} />;
      case 'heart':
        return <Heart style={iconStyle} className={className} />;
      case 'star':
        return <Star style={iconStyle} className={className} />;
      default:
        return null;
    }
  };

  const renderIcon = () => {
    switch (elementData.iconName) {
      case 'MapPin':
        return <MapPin style={iconStyle} className={className} />;
      case 'Heart':
        return <Heart style={iconStyle} className={className} />;
      case 'Star':
        return <Star style={iconStyle} className={className} />;
      case 'Play':
        return <Play style={iconStyle} className={className} />;
      case 'Music':
        return <Music style={iconStyle} className={className} />;
      default:
        return null;
    }
  };

  const renderLogo = () => {
    switch (elementData.brand) {
      case 'facebook':
        return <FaFacebook style={iconStyle} className={className} />;
      case 'twitter':
        return <FaTwitter style={iconStyle} className={className} />;
      case 'instagram':
        return <FaInstagram style={iconStyle} className={className} />;
      case 'linkedin':
        return <FaLinkedin style={iconStyle} className={className} />;
      case 'youtube':
        return <FaYoutube style={iconStyle} className={className} />;
      case 'apple':
        return <FaApple style={iconStyle} className={className} />;
      case 'google':
        return <FaGoogle style={iconStyle} className={className} />;
      default:
        return null;
    }
  };

  const renderChart = () => {
    switch (elementData.chartType) {
      case 'bar':
        return <BarChart3 style={iconStyle} className={className} />;
      case 'pie':
        return <PieChart style={iconStyle} className={className} />;
      case 'line':
        return <Activity style={iconStyle} className={className} />;
      default:
        return null;
    }
  };

  const renderBackground = () => {
    if (elementData.gradient) {
      return (
        <div
          style={{
            width: width,
            height: height,
            background: elementData.gradient,
            borderRadius: '8px'
          }}
          className={className}
        />
      );
    }
    return null;
  };

  switch (elementType) {
    case 'shape':
      return renderShape();
    case 'icon':
      if (elementData.type === 'logo') {
        return renderLogo();
      }
      return renderIcon();
    case 'chart':
      return renderChart();
    case 'graphic':
      if (elementData.type === 'background') {
        return renderBackground();
      }
      return null;
    default:
      return null;
  }
};

export default ElementRenderer;