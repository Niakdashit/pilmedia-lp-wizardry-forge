
import React from 'react';
import Modal from '../../common/Modal';
import DynamicContactForm, { FieldConfig } from '../../forms/DynamicContactForm';

interface FormHandlerProps {
  showFormModal: boolean;
  onClose: () => void;
  campaign: any;
  fields: FieldConfig[];
  participationLoading: boolean;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  launchButtonStyles?: React.CSSProperties;
}

const FormHandler: React.FC<FormHandlerProps> = ({
  showFormModal,
  onClose,
  campaign,
  fields,
  participationLoading,
  onSubmit,
  launchButtonStyles
}) => {
  if (!showFormModal) return null;

  // Récupérer les couleurs de design de la campagne
  const design = campaign.design || {};
  // Forcer le noir par défaut, ignorer les anciennes valeurs magenta
  const buttonColor = "#000000";
  const borderColor = design.borderColor || "#E5E7EB";
  const focusColor = "#000000";

  // Calculer la hauteur dynamique en fonction du nombre de champs
  // Formule : hauteur de base (200px) + (nombre de champs × hauteur par champ)
  // Hauteur par champ : ~100px (label + input + espacement)
  const calculateMaxHeight = () => {
    const baseHeight = 200; // Hauteur pour le titre et le bouton
    const fieldHeight = 100; // Hauteur approximative par champ
    const calculatedHeight = baseHeight + (fields.length * fieldHeight);
    const maxScreenHeight = window.innerHeight * 0.85; // Max 85% de la hauteur de l'écran
    
    return `${Math.min(calculatedHeight, maxScreenHeight)}px`;
  };

  return (
    <Modal
      onClose={onClose}
      title={campaign.screens?.[1]?.title || 'Vos informations'}
      maxHeight={calculateMaxHeight()}
    >
      <DynamicContactForm
        fields={fields}
        submitLabel={participationLoading ? 'Chargement...' : campaign.screens?.[1]?.buttonText || "Participer"}
        onSubmit={onSubmit}
        textStyles={{
          label: {
            color: design.textStyles?.label?.color || '#374151',
            fontFamily: design.fontFamily || 'inherit',
            ...design.textStyles?.label
          },
          button: {
            backgroundColor: buttonColor,
            color: '#ffffff',
            borderRadius: design.borderRadius || '8px',
            fontFamily: design.fontFamily || 'inherit',
            fontWeight: '600',
            ...design.textStyles?.button
          }
        }}
        inputBorderColor={borderColor}
        inputFocusColor={focusColor}
        launchButtonStyles={launchButtonStyles}
      />
    </Modal>
  );
};

export default FormHandler;
