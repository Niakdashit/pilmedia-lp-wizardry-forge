import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  title?: string;
  submitLabel?: string;
  fields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

interface FormData {
  [key: string]: string;
}

const ParticipationModal: React.FC<ParticipationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Formulaire de participation",
  submitLabel,
  fields = [
    { id: 'firstName', label: 'Prénom', type: 'text', required: true, placeholder: 'Votre prénom' },
    { id: 'lastName', label: 'Nom', type: 'text', required: true, placeholder: 'Votre nom' },
    { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'votre@email.com' },
    { id: 'phone', label: 'Téléphone', type: 'tel', required: false, placeholder: '06 12 34 56 78' }
  ]
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ensure fields is always a usable array and filter invalid entries to avoid runtime errors
  const safeFields = useMemo(() => (
    Array.isArray(fields)
      ? fields.filter((f) => f && typeof f === 'object' && typeof (f as any).id === 'string' && typeof (f as any).label === 'string')
      : []
  ), [fields]);

  // Create a stable key for content-based change detection to avoid effect loops on array identity churn
  const fieldsKey = useMemo(() => {
    try {
      return JSON.stringify(safeFields.map((f: any) => ({ id: f.id, type: f.type, required: !!f.required, label: f.label, options: f.options })));
    } catch {
      return String(safeFields.length);
    }
  }, [safeFields]);

  // Reset form state when fields definition changes to avoid stale UI
  useEffect(() => {
    setFormData({});
    setErrors({});
  }, [fieldsKey]);

  if (!isOpen) return null;

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    safeFields.forEach(field => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} est requis`;
      }

      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Email invalide';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation API
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors[field.id] ? 'border-red-500' : 'border-gray-300'
            }`}
            required={field.required}
          >
            <option value="">Sélectionnez...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors[field.id] ? 'border-red-500' : 'border-gray-300'
            }`}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] === 'true'}
              onChange={(e) => handleInputChange(field.id, e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required={field.required}
            />
            <label htmlFor={field.id} className="ml-2 text-sm text-gray-700">
              {field.placeholder || field.label}
            </label>
          </div>
        );
      default:
        const allowed = ['text', 'email', 'tel'] as const;
        const inputType = allowed.includes(field.type) ? field.type : 'text';
        return (
          <input
            type={inputType}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors[field.id] ? 'border-red-500' : 'border-gray-300'
            }`}
            required={field.required}
          />
        );
    }
  };

  // Defensive rendering: precompute form fields with error guard
  let fieldsContent: React.ReactNode;
  try {
    fieldsContent = (
      <>
        {safeFields.map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </>
    );
  } catch (e) {
    // Log enough context to debug without crashing the whole app
    // eslint-disable-next-line no-console
    console.error('[ParticipationModal] Failed to render fields', {
      error: e,
      safeFields,
    });
    fieldsContent = (
      <div className="text-red-600 text-sm">
        Une erreur est survenue lors de l\'affichage du formulaire. Veuillez réessayer.
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {fieldsContent}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-400 disabled:to-pink-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Envoi en cours...' : (submitLabel || 'Valider et participer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipationModal;