import React from 'react';
import { Facebook, X } from 'lucide-react';
import type { DeviceType, EditorConfig } from './QualifioEditorLayout';
import { SmartWheel } from '../SmartWheel';
import summerBeachImage from '../../assets/summer-beach.jpg';
interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
}
const QualifioPreview: React.FC<QualifioPreviewProps> = ({
  device,
  config
}) => {
  // Segments pour la roue
  const wheelSegments = [{
    id: '1',
    label: 'Prix 3',
    color: '#4ECDC4'
  }, {
    id: '2',
    label: 'Dommage',
    color: '#F7B731'
  }, {
    id: '3',
    label: 'Prix 1',
    color: '#E74C3C'
  }, {
    id: '4',
    label: 'Prix 2',
    color: '#26D0CE'
  }];
  const handleWheelResult = (segment: any) => {
    console.log('Segment sélectionné:', segment);
  };
  const getWheelSize = () => {
    switch (device) {
      case 'mobile':
        return 200;
      case 'tablet':
        return 280;
      case 'desktop':
      default:
        return 320;
    }
  };
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          margin: '20px auto',
          border: '12px solid #333',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      case 'desktop':
      default:
        return {
          width: '1200px',
          height: '800px',
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        };
    }
  };
  const getContentDimensions = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '100%',
          height: '100%'
        };
      case 'tablet':
        return {
          width: '100%',
          height: '100%'
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%'
        };
    }
  };
  const containerStyles = {
    backgroundColor: 'hsl(210, 20%, 98%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };
  return;
};
export default QualifioPreview;