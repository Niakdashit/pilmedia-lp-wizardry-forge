
import React from 'react';
import { Zap, Plus } from 'lucide-react';

const AdminTemplatesEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modèle trouvé</h3>
      <p className="text-gray-500 mb-6">Aucun modèle ne correspond à votre recherche.</p>
      <button className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] text-white font-semibold rounded-xl hover:bg-[#6d164f] transition-colors">
        <Plus className="w-5 h-5 mr-2" />
        Créer le premier modèle
      </button>
    </div>
  );
};

export default AdminTemplatesEmptyState;
