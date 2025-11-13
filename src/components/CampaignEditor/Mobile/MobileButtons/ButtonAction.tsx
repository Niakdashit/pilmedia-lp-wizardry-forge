
import React from 'react';
import { Send, ExternalLink } from 'lucide-react';

interface ButtonActionProps {
  actionType: string;
  actionLink: string;
  onActionTypeChange: (type: string) => void;
  onActionLinkChange: (link: string) => void;
}

const ButtonAction: React.FC<ButtonActionProps> = ({
  actionType,
  actionLink,
  onActionTypeChange,
  onActionLinkChange
}) => {
  const actions = [
    { value: 'submit', label: 'Soumettre', icon: Send },
    { value: 'link', label: 'Lien externe', icon: ExternalLink }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Action du bouton
      </label>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.value}
            onClick={() => onActionTypeChange(action.value)}
            className={`p-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              actionType === action.value
                ? 'border-[#44444d] bg-[#f5f5f7] text-[#44444d]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
      {actionType === 'link' && (
        <input
          type="url"
          placeholder="https://votre-lien.com"
          value={actionLink || ''}
          onChange={(e) => onActionLinkChange(e.target.value)}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#44444d]"
        />
      )}
    </div>
  );
};

export default ButtonAction;
