
import React from 'react';
import { ModuleData } from '@/stores/newsletterStore';

interface ButtonModuleProps {
  module: ModuleData;
}

export const ButtonModule: React.FC<ButtonModuleProps> = ({ module }) => {
  return (
    <div className="text-center">
      <button className="px-6 py-3 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
        {module.content || 'Bouton'}
      </button>
    </div>
  );
};
