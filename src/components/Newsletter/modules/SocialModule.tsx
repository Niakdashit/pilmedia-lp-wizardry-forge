
import React from 'react';

export const SocialModule: React.FC = () => {
  return (
    <div className="text-center bg-white p-4 border border-gray-200 rounded">
      <p className="mb-4 text-sm text-gray-600">Suivez-nous sur les réseaux sociaux</p>
      <div className="flex justify-center space-x-4">
        {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((network) => (
          <div
            key={network}
            className="w-10 h-10 rounded-full bg-[#841b60] flex items-center justify-center text-white text-xs font-bold"
          >
            {network[0]}
          </div>
        ))}
      </div>
    </div>
  );
};
