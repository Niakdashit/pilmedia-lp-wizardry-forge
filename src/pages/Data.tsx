import React, { useState } from 'react';
import { Download, Filter, RefreshCw } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
const Data: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Données"
        size="sm"
        actions={
          <select
            value={selectedCampaign}
            onChange={e => setSelectedCampaign(e.target.value)}
            className="w-64 bg-white border-gray-300 text-gray-700 py-2 px-4 rounded-xl"
          >
            <option value="">Sélectionner une campagne</option>
            <option value="1">Quiz Marketing Digital</option>
            <option value="2">Roue de la fortune Soldes</option>
            <option value="3">Carte à gratter</option>
          </select>
        }
      />
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tirage au sort</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pool de participants
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]">
                  <option>Tous les participants</option>
                  <option>Participants du jour</option>
                  <option>Participants de la semaine</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
                  Lancer le tirage
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Exports</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                <span>Exporter les participations</span>
                <Download className="w-5 h-5" />
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                <span>Exporter les opt-ins</span>
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Tableau de bord interactif</h2>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-[#841b60] rounded-lg hover:bg-gray-100">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-[#841b60] rounded-lg hover:bg-gray-100">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Top 10 réponses</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <span className="text-gray-400">Graphique</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Répartition H/F</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <span className="text-gray-400">Graphique</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Âges</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                  <span className="text-gray-400">Graphique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Data;
