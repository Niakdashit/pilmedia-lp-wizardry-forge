
import React from 'react';
import { Globe } from 'lucide-react';

interface WebsiteUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const WebsiteUrlInput: React.FC<WebsiteUrlInputProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-[#5a5a63]/10 rounded-xl flex items-center justify-center">
          <Globe className="w-4 h-4 text-[#951b6d]" />
        </div>
        <h3 className="font-semibold text-[#141e29]">URL de votre site internet</h3>
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.monsite.com"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#951b6d]/20 focus:border-[#951b6d] transition-colors"
      />
    </div>
  );
};

export default WebsiteUrlInput;
