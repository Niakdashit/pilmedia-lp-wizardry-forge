
import React from 'react';

export const HeaderModule: React.FC = () => {
  return (
    <div className="bg-white p-6 border border-gray-200 rounded">
      <div className="flex justify-between items-center">
        <div className="w-32 h-10 bg-[#841b60] rounded flex items-center justify-center text-white font-bold">
          LOGO
        </div>
        <div className="flex space-x-4 text-sm">
          <a href="#" className="text-[#841b60] hover:underline">Accueil</a>
          <a href="#" className="text-[#841b60] hover:underline">Produits</a>
          <a href="#" className="text-[#841b60] hover:underline">Contact</a>
        </div>
      </div>
    </div>
  );
};
