
import React from 'react';
import { ModuleData } from '@/stores/newsletterStore';

interface ButtonModuleProps {
  module: ModuleData;
}

export const ButtonModule: React.FC<ButtonModuleProps> = ({ module }) => {
  return (
    <div className="text-center">
      <button className="px-6 py-3 bg-[#841b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
        {module.content || 'Bouton'}
      </button>
    </div>
  );
};
