import React from 'react';
import { Upload } from 'lucide-react';

interface LogoUploaderProps {
  onLogoChange: (file: File | null) => void;
  currentLogo?: string | null;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onLogoChange, currentLogo }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onLogoChange(e.target.files?.[0] || null)}
        className="hidden"
        id="logo-upload"
      />
      <label htmlFor="logo-upload" className="cursor-pointer">
        {currentLogo ? (
          <img src={currentLogo} alt="Logo" className="max-h-20 mx-auto" />
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Cliquez pour uploader un logo</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default LogoUploader;
