
import React from 'react';
import {
  TEMPLATE_TILE_HEIGHT_CLASS,
  TEMPLATE_TILE_RADIUS_CLASS,
} from '../../../config/templateThumb';
import { Eye, Copy, Edit, Trash2 } from 'lucide-react';
import { getCampaignTypeIcon, CampaignType } from '../../../utils/campaignTypes';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  thumbnail: string;
  isPrivate: boolean;
  usageCount: number;
  createdAt: string;
  createdBy: string;
  tags: string[];
}

interface AdminTemplateCardProps {
  template: GameTemplate;
  onUse?: (template: GameTemplate) => void;
}

const AdminTemplateCard: React.FC<AdminTemplateCardProps> = ({ template, onUse }) => {
  const CampaignIcon = getCampaignTypeIcon(template.type);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className={`relative overflow-hidden ${TEMPLATE_TILE_HEIGHT_CLASS} ${TEMPLATE_TILE_RADIUS_CLASS}`}>
        <img
          src={template.thumbnail}
          alt={template.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <CampaignIcon />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            template.isPrivate 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {template.isPrivate ? 'Privé' : 'Public'}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{template.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4">
          <span className="truncate">Utilisé {template.usageCount} fois</span>
          <span className="truncate ml-2">Par {template.createdBy}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 truncate">
            {new Date(template.createdAt).toLocaleDateString('fr-FR')}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {onUse && (
              <button
                onClick={() => onUse(template)}
                className="px-2.5 py-1.5 text-xs sm:text-sm bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg hover:opacity-95 transition-colors"
              >
                Utiliser ce modèle
              </button>
            )}
            <button className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTemplateCard;
export type { GameTemplate };

