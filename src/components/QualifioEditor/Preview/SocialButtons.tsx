import React from 'react';
import { Facebook, X } from 'lucide-react';

const SocialButtons: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 flex gap-2">
      <button className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg">
        <Facebook className="w-4 h-4 text-white" />
      </button>
      <button className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-lg">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

export default SocialButtons;