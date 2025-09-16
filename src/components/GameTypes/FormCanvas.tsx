import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { FormStructure } from '../../types/FormField';
import DynamicFormRenderer from './DynamicFormRenderer';

export interface FormConfig {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  borderRadius: number;
  fieldRadius: number;
  position: 'left' | 'right';
  widthPx: number;
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  textColor: '#111827',
  buttonColor: '#111827',
  buttonTextColor: '#FFFFFF',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 12,
  fieldRadius: 8,
  position: 'left',
  widthPx: 360
};

interface FormCanvasProps {
  config?: Partial<FormConfig>;
  formStructure?: FormStructure;
  onSubmit?: (formData: Record<string, string>) => void;
  onChange?: (propName: keyof FormConfig, value: any) => void;
  onFormStructureChange?: (structure: FormStructure) => void;
  onValidate?: (errors: Record<string, string>) => void;
  className?: string;
  isPreview?: boolean;
}

// Fonction de validation du contraste AA
const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

const FormCanvas: React.FC<FormCanvasProps> = ({
  config = {},
  formStructure,
  onSubmit,
  onChange,
  onFormStructureChange,
  onValidate,
  className = '',
  isPreview = false
}) => {
  const formConfig = { ...DEFAULT_FORM_CONFIG, ...config };
  
  // Structure par défaut si non fournie
  const defaultStructure: FormStructure = {
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'Prénom',
        placeholder: 'Votre prénom',
        required: true,
        order: 0
      },
      {
        id: 'lastName',
        type: 'text',
        label: 'Nom',
        placeholder: 'Votre nom',
        required: true,
        order: 1
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'votre@email.com',
        required: true,
        order: 2
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'Téléphone',
        placeholder: '06 12 34 56 78',
        required: false,
        order: 3
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Votre message (optionnel)',
        required: false,
        order: 4,
        rows: 3
      } as any
    ],
    submitButtonText: 'Participer',
    title: 'Participez au jeu',
    description: 'Remplissez le formulaire pour participer'
  };

  const currentStructure = formStructure ?? defaultStructure;
  
  // Initialiser formData basé sur la structure
  const initializeFormData = () => {
    const data: Record<string, any> = {};
    currentStructure.fields.forEach(field => {
      if (field.type === 'checkbox') {
        data[field.id] = [];
      } else {
        data[field.id] = '';
      }
    });
    return data;
  };

  const [formData, setFormData] = useState(initializeFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Re-initialize form data whenever the structure (fields) changes
  useEffect(() => {
    // Using a function update to avoid stale closures
    setFormData(prev => {
      const next = initializeFormData();
      // Preserve values for existing fields when possible
      Object.keys(next).forEach(key => {
        if (prev && Object.prototype.hasOwnProperty.call(prev, key)) {
          (next as any)[key] = (prev as any)[key];
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStructure.fields.length, JSON.stringify(currentStructure.fields.map(f => ({ id: f.id, type: f.type, order: f.order, required: f.required })))]);

  // Validation du contraste
  const buttonContrast = getContrastRatio(formConfig.buttonColor, formConfig.buttonTextColor);
  const textContrast = getContrastRatio(formConfig.backgroundColor, formConfig.textColor);
  const hasContrastIssue = buttonContrast < 4.5 || textContrast < 4.5;

  // Validation des champs
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length < 2 ? 'Minimum 2 caractères requis' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Email invalide' : '';
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return value && !phoneRegex.test(value) ? 'Numéro invalide' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    // Champs obligatoires
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';

    setErrors(newErrors);
    onValidate?.(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      onSubmit?.(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle: React.CSSProperties = {
    backgroundColor: formConfig.backgroundColor,
    borderColor: formConfig.borderColor,
    color: formConfig.textColor,
    fontFamily: formConfig.fontFamily,
    borderRadius: `${formConfig.borderRadius}px`,
    width: `${Math.min(Math.max(formConfig.widthPx, 240), 720)}px`,
    border: `1px solid ${formConfig.borderColor}`,
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  const fieldStyle: React.CSSProperties = {
    borderRadius: `${formConfig.fieldRadius}px`,
    borderColor: formConfig.borderColor,
    color: formConfig.textColor,
    fontFamily: formConfig.fontFamily,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: formConfig.buttonColor,
    color: formConfig.buttonTextColor,
    borderRadius: `${formConfig.fieldRadius}px`,
    fontFamily: formConfig.fontFamily,
  };

  return (
    <div className={`form-canvas-container ${className}`}>
      {/* Avertissement contraste */}
      {hasContrastIssue && !isPreview && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Contraste insuffisant détecté. Ratio recommandé: 4.5:1 minimum (AA)
          </p>
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        style={formStyle}
        className="space-y-4"
        noValidate
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2" style={{ color: formConfig.textColor }}>
            {currentStructure.title}
          </h3>
          <p className="text-sm opacity-75" style={{ color: formConfig.textColor }}>
            {currentStructure.description}
          </p>
        </div>

        {showSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-medium">✅ Inscription réussie !</p>
          </div>
        )}

        {/* Rendu dynamique des champs */}
        <DynamicFormRenderer
          fields={currentStructure.fields}
          formData={formData}
          errors={errors}
          fieldStyle={fieldStyle}
          textColor={formConfig.textColor}
          onFieldChange={handleInputChange}
        />

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={buttonStyle}
          className={`w-full py-3 px-4 font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting 
              ? 'opacity-75 cursor-not-allowed' 
              : 'hover:opacity-90 active:scale-98'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Envoi en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Send className="w-4 h-4 mr-2" />
              {currentStructure.submitButtonText}
            </span>
          )}
        </button>

        <p className="text-xs text-center opacity-60" style={{ color: formConfig.textColor }}>
          * Champs obligatoires
        </p>
      </form>
    </div>
  );
};

export default FormCanvas;
