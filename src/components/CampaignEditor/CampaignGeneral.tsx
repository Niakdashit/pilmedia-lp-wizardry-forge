
import React from 'react';
import { Calendar, Link as LinkIcon, Clock } from 'lucide-react';

interface CampaignGeneralProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const CampaignGeneral: React.FC<CampaignGeneralProps> = ({ campaign, setCampaign }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? checked : value;
    setCampaign((prev: any) => ({ ...prev, [name]: newValue }));
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')     // Replace multiple - with single -
      .replace(/^-+/, '')         // Trim - from start of text
      .replace(/-+$/, '');        // Trim - from end of text
    
    setCampaign((prev: any) => ({ ...prev, url: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-[#f9f0f5] border border-[#e9d0e5] rounded-lg p-4 mb-4">
        <p className="text-[#841b60] text-sm">
          Remplissez les informations générales de votre campagne. Le nom et l'URL seront utilisés pour identifier et accéder à votre campagne.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la campagne
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={campaign.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Ex: Quiz Marketing Digital"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={campaign.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Décrivez brièvement votre campagne"
          />
        </div>
        
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL de la campagne
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LinkIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center pl-10 pointer-events-none text-gray-500">
              leadya.com/c/
            </div>
            <input
              type="text"
              id="url"
              name="url"
              value={campaign.url}
              onChange={handleUrlChange}
              className="w-full pl-[6.5rem] pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="votre-campagne"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Cette URL sera utilisée pour accéder à votre campagne.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={campaign.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={campaign.startTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={campaign.endDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={campaign.endTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Fuseau horaire
            </label>
            <select
              id="timezone"
              name="timezone"
              value={campaign.timezone || 'Europe/Paris'}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <input
              id="autoSchedule"
              type="checkbox"
              name="autoSchedule"
              checked={campaign.autoSchedule || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
            />
            <label htmlFor="autoSchedule" className="text-sm text-gray-700">
              Activer la planification automatique
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={campaign.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="draft">Brouillon</option>
              <option value="scheduled">Programmé</option>
              <option value="active">Actif</option>
              <option value="ended">Terminé</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de campagne
            </label>
            <select
              id="type"
              name="type"
              value={campaign.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="quiz">Quiz</option>
              <option value="survey">Sondage</option>
              <option value="contest">Concours</option>
              <option value="wheel">Roue de la fortune</option>
              <option value="scratch">Carte à gratter</option>
              <option value="memory">Jeu de mémoire</option>
              <option value="form">Formulaire dynamique</option>
              <option value="puzzle">Puzzle</option>
              <option value="dice">Dés chanceux</option>
              <option value="jackpot">Jackpot</option>
            </select>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="scheduling" className="block text-sm font-medium text-gray-700">
              Plages horaires
            </label>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">Optionnel</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Définissez des plages horaires spécifiques pendant lesquelles votre campagne sera active.
          </p>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-center text-gray-500 text-sm">
              Aucune plage horaire définie. Par défaut, la campagne sera active en continu entre les dates de début et de fin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignGeneral;
