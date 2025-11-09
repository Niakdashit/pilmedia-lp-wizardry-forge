
import React from 'react';
import { Upload, X, LucideIcon } from 'lucide-react';

interface ImageUploadCardProps {
  title: string;
  icon: LucideIcon;
  value?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  placeholder: string;
  inputId: string;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({
  title,
  icon: Icon,
  value,
  onUpload,
  onRemove,
  placeholder,
  inputId
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-7 h-7 bg-[#5a5a63]/10 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#951b6d]" />
        </div>
        <h3 className="font-semibold text-[#141e29] text-sm">{title}</h3>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-[#5a5a63]/50 transition-colors">
        {value ? (
          <div className="relative">
            <img src={value} alt={title} className="max-h-12 mx-auto rounded-lg" />
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">{placeholder}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className="inline-block px-3 py-1.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer text-xs font-medium transition-colors"
            >
              Sélectionner un fichier
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadCard;
