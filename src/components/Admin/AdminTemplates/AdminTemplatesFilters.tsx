
import React from 'react';
import { Search, Filter } from 'lucide-react';

interface AdminTemplatesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterVisibility: string;
  setFilterVisibility: (visibility: string) => void;
}

const AdminTemplatesFilters: React.FC<AdminTemplatesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterVisibility,
  setFilterVisibility
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom, description ou tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm text-gray-600 whitespace-nowrap">Filtres :</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#44444d] text-sm bg-white min-w-0 flex-1 sm:flex-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="quiz">Quiz</option>
                <option value="wheel">Roue</option>
                <option value="survey">Sondage</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#44444d] text-sm bg-white min-w-0 flex-1 sm:flex-none"
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
              >
                <option value="all">Toute visibilité</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTemplatesFilters;
