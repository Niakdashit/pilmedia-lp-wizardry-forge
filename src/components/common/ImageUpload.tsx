
import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { optimizeImageForSegment } from '../../utils/imageOptimizer';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  compact?: boolean;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  compact = false,
  accept = "image/*"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Preserve transparency when possible: PNG/WebP/SVG keep alpha.
        const mime = file.type || '';
        const isGif = mime === 'image/gif';
        const supportsAlpha = /image\/(png|webp|svg\+xml)/.test(mime);

        if (isGif) {
          // Do not optimize GIFs to avoid flattening animation; just load as-is
          const reader = new FileReader();
          reader.onload = () => {
            onChange(reader.result as string);
          };
          reader.onerror = () => {
            console.error('Error reading file');
          };
          reader.readAsDataURL(file);
        } else {
          // Use canvas optimization. For alpha-capable sources, export as PNG to keep transparency
          const optimized = await optimizeImageForSegment(file, {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 0.9,
            format: supportsAlpha ? 'png' : 'jpeg'
          });
          onChange(optimized.dataUrl);
        }
      } catch (err) {
        console.error('Error optimizing image', err);
        // Fallback to raw file read
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.onerror = () => console.error('Error reading file');
        reader.readAsDataURL(file);
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="w-16 h-16 object-cover rounded border border-gray-300"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleClick}
            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
            type="button"
          >
            <Upload className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="max-w-full h-32 object-cover rounded border border-gray-300"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as any);
            }
          }}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Cliquez pour ajouter une image
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG jusqu'à 10MB
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
};

export default ImageUpload;
