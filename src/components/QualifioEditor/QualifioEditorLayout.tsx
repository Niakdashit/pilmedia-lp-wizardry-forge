import React from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type DisplayMode = 'mode1-banner-game' | 'mode2-background';

export interface EditorConfig {
  displayMode: DisplayMode;
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  customTexts?: CustomText[];
  design?: {
    customImages?: any[];
  };
}

export interface CustomText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

interface QualifioEditorLayoutProps {
}

const QualifioEditorLayout: React.FC<QualifioEditorLayoutProps> = () => {
  return (
    <div>
      {/* Contenu de l'éditeur Qualifio */}
    </div>
  );
};

export default QualifioEditorLayout;
