
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';
import { generateBrandThemeFromFile } from '../utils/BrandStyleAnalyzer';

interface LogoUploaderProps {
  className?: string;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ className }) => {
  const {
    setLogoFile,
    setLogoUrl,
    setCustomColors,
    setJackpotColors,
    jackpotColors,
    selectedGameType
  } = useQuickCampaignStore();

  const [dragActive, setDragActive] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);

  const applyThemeFromFile = async (file: File) => {
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
    try {
      const theme = await generateBrandThemeFromFile(file);
      setPalette([
        theme.customColors.primary,
        theme.customColors.secondary,
        '#ffffff'
      ]);
      setCustomColors({
        primary: theme.customColors.primary,
        secondary: theme.customColors.secondary,
        accent: '#ffffff',
        textColor: theme.customColors.text
      });
      if (selectedGameType === 'jackpot') {
        setJackpotColors({
          ...jackpotColors,
          containerBackgroundColor: '#ffffff30',
          backgroundColor: '#ffffff30',
          borderColor: theme.customColors.primary,
          slotBorderColor: theme.customColors.secondary,
          slotBackgroundColor: '#ffffff'
        });
      }
    } catch (err) {
      console.error('Failed to extract palette', err);
    }
  };

  const handleUpload = (files: FileList | null) => {
    if (files && files[0]) {
      applyThemeFromFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      applyThemeFromFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-gray-50 ${dragActive ? 'border-[#841b60] bg-[#841b60]/5' : 'border-gray-300'} ${className || ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          <label className="text-[#841b60] cursor-pointer hover:text-[#841b60]/80 transition-colors">
            Cliquez pour télécharger
            <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files)} className="hidden" />
          </label>{' '}
          ou glissez-déposez votre logo
        </p>
        <p className="text-gray-400 text-sm">PNG, JPG, JPEG ou SVG jusqu'à 10MB</p>
      </div>
      {palette.length > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          {palette.map(color => (
            <div key={color} className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
