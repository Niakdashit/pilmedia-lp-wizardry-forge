
import React from 'react';
import { Save, ChevronRight, Eye } from 'lucide-react';

interface CampaignEditorHeaderProps {
  isNewCampaign: boolean;
  campaignName: string;
  onPreview: () => void;
  onSave: (continueEditing?: boolean) => void;
}

const CampaignEditorHeader: React.FC<CampaignEditorHeaderProps> = ({
  isNewCampaign,
  campaignName,
  onPreview,
  onSave
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isNewCampaign ? 'Nouvelle Campagne' : campaignName}
        </h1>
        <p className="text-gray-500">{isNewCampaign ? 'Création' : 'Modification'}</p>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onPreview}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          Aperçu
        </button>
        
        <button
          onClick={() => onSave(true)}
          className="inline-flex items-center px-3 py-1.5 border border-[#841b60] text-sm font-medium rounded-lg text-[#841b60] bg-white hover:bg-[#f8f0f5] transition-colors duration-200"
        >
          <Save className="w-4 h-4 mr-1.5" />
          Enregistrer
        </button>
        
        <button
          onClick={() => onSave(false)}
          className="inline-flex items-center px-3 py-1.5 bg-[#841b60] text-white text-sm font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200"
        >
          Publier
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
};

export default CampaignEditorHeader;
