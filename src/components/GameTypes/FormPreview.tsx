
import React, { useState } from 'react';
import DynamicContactForm from '../forms/DynamicContactForm';
import { DEFAULT_FIELDS } from '../../utils/wheelConfig';

interface FormPreviewProps {
  campaign: any;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  campaign,
  gameSize = 'medium',
  className = ""
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fields = React.useMemo(() => {
    if (Array.isArray(campaign.formFields) && campaign.formFields.length > 0) {
      return campaign.formFields;
    }
    return DEFAULT_FIELDS;
  }, [campaign.formFields, campaign._lastUpdate]);

  const design = campaign.design || {};
  const buttonColor = design.buttonColor || "#841b60";
  const buttonTextColor = design.buttonTextColor || "#fff";
  const borderColor = design.borderColor || "#E5E7EB";
  const focusColor = buttonColor;
  const containerBackground = design.blockColor || "#ffffff";
  const containerBorderRadius = design.borderRadius || "16px";

  const buttonLabel = campaign.buttonConfig?.text || campaign.gameConfig?.form?.buttonLabel || 'Valider le formulaire';

  const handleFormSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 2000);
  };

  const getSizeStyles = () => {
    switch (gameSize) {
      case 'small':
        return { maxWidth: '300px', padding: '16px' };
      case 'large':
        return { maxWidth: '600px', padding: '20px' };
      case 'xlarge':
        return { maxWidth: '800px', padding: '24px' };
      default:
        return { maxWidth: '450px', padding: '16px' };
    }
  };

  const containerStyle = {
    width: '100%',
    backgroundColor: containerBackground,
    borderColor: borderColor,
    borderRadius: containerBorderRadius,
    borderWidth: '2px',
    borderStyle: 'solid',
    boxShadow: design.enableShadow !== false 
      ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
      : 'none',
    ...getSizeStyles()
  };

  if (isSubmitted) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div 
          className="text-center py-8"
          style={containerStyle}
        >
          <div className="text-green-500 text-2xl mb-4">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Formulaire soumis !
          </h3>
          <p className="text-gray-600">
            Merci pour votre participation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`form-preview-container ${className}`}>
      <div style={containerStyle}>
        <div className="form-preview-header">
          <h2 className="form-preview-title">
            {campaign.screens?.[1]?.title || 'Vos informations'}
          </h2>
          <p className="form-preview-description">
            {campaign.screens?.[1]?.description || 'Remplissez le formulaire ci-dessous'}
          </p>
        </div>
        
        <DynamicContactForm
          fields={fields}
          submitLabel={buttonLabel}
          onSubmit={handleFormSubmit}
          textStyles={{
            label: design.textStyles?.label,
            button: {
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderRadius: design.borderRadius,
              fontFamily: design.fontFamily,
              fontWeight: design.textStyles?.button?.fontWeight,
              fontSize: design.textStyles?.button?.fontSize,
            },
          }}
          inputBorderColor={borderColor}
          inputFocusColor={focusColor}
        />
      </div>
    </div>
  );
};

export default FormPreview;
