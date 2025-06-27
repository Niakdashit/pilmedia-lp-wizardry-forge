
import React from 'react';
import { Palette, Type, Image, Globe } from 'lucide-react';
import { BrandData } from '../../services/scrapingBeeService';

interface BrandPreviewProps {
  brandData: BrandData;
}

const BrandPreview: React.FC<BrandPreviewProps> = ({ brandData }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Extracted Brand Data
      </h4>

      <div className="space-y-4">
        {/* Brand Info */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Brand Information</h5>
          <div className="text-sm text-gray-600">
            <p><strong>Title:</strong> {brandData.title}</p>
            <p><strong>Description:</strong> {brandData.description}</p>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Colors
          </h5>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: brandData.colors.primary }}
              />
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: brandData.colors.secondary }}
              />
              <span className="text-sm text-gray-600">Secondary</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: brandData.colors.accent }}
              />
              <span className="text-sm text-gray-600">Accent</span>
            </div>
          </div>
        </div>

        {/* Fonts */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </h5>
          <div className="text-sm text-gray-600">
            <p><strong>Primary Font:</strong> {brandData.fonts.primary}</p>
            {brandData.fonts.secondary && (
              <p><strong>Secondary Font:</strong> {brandData.fonts.secondary}</p>
            )}
          </div>
        </div>

        {/* Logos */}
        {(brandData.logos.favicon || brandData.logos.logo) && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Visual Assets
            </h5>
            <div className="flex gap-4">
              {brandData.logos.favicon && (
                <div className="text-center">
                  <img 
                    src={brandData.logos.favicon} 
                    alt="Favicon" 
                    className="w-8 h-8 mx-auto mb-1"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-xs text-gray-500">Favicon</span>
                </div>
              )}
              {brandData.logos.logo && (
                <div className="text-center">
                  <img 
                    src={brandData.logos.logo} 
                    alt="Logo" 
                    className="h-8 mx-auto mb-1 max-w-20"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-xs text-gray-500">Logo</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Samples */}
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Content Samples</h5>
          <div className="text-xs text-gray-600 space-y-1">
            {brandData.content.headings.length > 0 && (
              <p><strong>Headings:</strong> {brandData.content.headings.slice(0, 2).join(', ')}</p>
            )}
            {brandData.content.ctaTexts.length > 0 && (
              <p><strong>CTAs:</strong> {brandData.content.ctaTexts.slice(0, 3).join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPreview;
