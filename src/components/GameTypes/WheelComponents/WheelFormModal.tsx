
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

  return (
    <Modal
      onClose={onClose}
      title={campaign.screens?.[1]?.title || 'Vos informations'}
      contained={true}
    >
      <DynamicContactForm
        fields={fields}
        submitLabel={participationLoading ? 'Chargement...' : campaign.screens?.[1]?.buttonText || "C'est parti !"}
        onSubmit={onSubmit}
        textStyles={{
          label: campaign.design?.textStyles?.label,
          button: campaign.design?.textStyles?.button
        }}
      />
    </Modal>
  );
};

export default WheelFormModal;
