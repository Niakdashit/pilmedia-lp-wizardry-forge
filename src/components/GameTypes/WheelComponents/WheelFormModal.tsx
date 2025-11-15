
import React from 'react';
import Modal from '../../common/Modal';
import DynamicContactForm, { FieldConfig } from '../../forms/DynamicContactForm';

interface WheelFormModalProps {
  showFormModal: boolean;
  onClose: () => void;
  campaign: any;
  fields: FieldConfig[];
  participationLoading: boolean;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
}

const WheelFormModal: React.FC<WheelFormModalProps> = ({
  showFormModal,
  onClose,
  campaign,
  fields,
  participationLoading,
  onSubmit
}) => {
  if (!showFormModal) return null;

  // Récupérer les couleurs de design de la campagne
  const design = campaign.design || {};
  const customColors = design.customColors || {};
  const buttonColor = customColors.primary || design.buttonColor || "#44444d";
  const borderColor = customColors.primary || design.borderColor || "#E5E7EB";
  const focusColor = buttonColor;

  return (
    <Modal
      onClose={onClose}
      title={campaign.screens?.[1]?.title || 'Vos informations'}
    >
      <DynamicContactForm
        fields={fields}
        submitLabel={participationLoading ? 'Chargement...' : campaign.screens?.[1]?.buttonText || "C'est parti !"}
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
        buttonAlign="center"
      />
    </Modal>
  );
};

export default WheelFormModal;
