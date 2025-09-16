export interface FormFieldBase {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  validation?: FormFieldValidation;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'number' 
  | 'date';

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customMessage?: string;
}

export interface TextFormField extends FormFieldBase {
  type: 'text';
  minLength?: number;
  maxLength?: number;
}

export interface EmailFormField extends FormFieldBase {
  type: 'email';
  validateDomain?: boolean;
}

export interface TelFormField extends FormFieldBase {
  type: 'tel';
  format?: 'international' | 'national';
}

export interface TextareaFormField extends FormFieldBase {
  type: 'textarea';
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

export interface SelectFormField extends FormFieldBase {
  type: 'select';
  options: FormFieldOption[];
  multiple?: boolean;
}

export interface RadioFormField extends FormFieldBase {
  type: 'radio';
  options: FormFieldOption[];
}

export interface CheckboxFormField extends FormFieldBase {
  type: 'checkbox';
  options: FormFieldOption[];
}

export interface NumberFormField extends FormFieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFormField extends FormFieldBase {
  type: 'date';
  min?: string;
  max?: string;
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
  selected?: boolean;
}

export type FormField = 
  | TextFormField 
  | EmailFormField 
  | TelFormField 
  | TextareaFormField 
  | SelectFormField 
  | RadioFormField 
  | CheckboxFormField 
  | NumberFormField 
  | DateFormField;

export interface FormStructure {
  fields: FormField[];
  submitButtonText: string;
  title?: string;
  description?: string;
}

// Utilitaires pour créer des champs par défaut
export const createDefaultField = (type: FormFieldType, order: number): FormField => {
  const baseField = {
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: getDefaultLabel(type),
    placeholder: getDefaultPlaceholder(type),
    required: false,
    order
  };

  switch (type) {
    case 'text':
      return { ...baseField, type: 'text' } as TextFormField;
    case 'email':
      return { ...baseField, type: 'email' } as EmailFormField;
    case 'tel':
      return { ...baseField, type: 'tel' } as TelFormField;
    case 'textarea':
      return { ...baseField, type: 'textarea', rows: 3 } as TextareaFormField;
    case 'select':
      return { 
        ...baseField, 
        type: 'select', 
        options: [
          { id: 'opt1', label: 'Option 1', value: 'option1' },
          { id: 'opt2', label: 'Option 2', value: 'option2' }
        ]
      } as SelectFormField;
    case 'radio':
      return { 
        ...baseField, 
        type: 'radio', 
        options: [
          { id: 'opt1', label: 'Choix 1', value: 'choice1' },
          { id: 'opt2', label: 'Choix 2', value: 'choice2' }
        ]
      } as RadioFormField;
    case 'checkbox':
      return { 
        ...baseField, 
        type: 'checkbox', 
        options: [
          { id: 'opt1', label: 'Option 1', value: 'option1' },
          { id: 'opt2', label: 'Option 2', value: 'option2' }
        ]
      } as CheckboxFormField;
    case 'number':
      return { ...baseField, type: 'number' } as NumberFormField;
    case 'date':
      return { ...baseField, type: 'date' } as DateFormField;
    default:
      return { ...baseField, type: 'text' } as TextFormField;
  }
};

const getDefaultLabel = (type: FormFieldType): string => {
  switch (type) {
    case 'text': return 'Texte';
    case 'email': return 'Email';
    case 'tel': return 'Téléphone';
    case 'textarea': return 'Message';
    case 'select': return 'Sélection';
    case 'radio': return 'Choix unique';
    case 'checkbox': return 'Cases à cocher';
    case 'number': return 'Nombre';
    case 'date': return 'Date';
    default: return 'Champ';
  }
};

const getDefaultPlaceholder = (type: FormFieldType): string => {
  switch (type) {
    case 'text': return 'Saisissez votre texte';
    case 'email': return 'votre@email.com';
    case 'tel': return '06 12 34 56 78';
    case 'textarea': return 'Votre message...';
    case 'number': return '0';
    case 'date': return '';
    default: return '';
  }
};
