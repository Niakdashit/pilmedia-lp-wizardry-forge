import React, { useState, useEffect, useMemo } from 'react';
import { useButtonStyleCSS } from '@/stores/buttonStore';

export type FieldConfig = {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  autoComplete?: string;
};

interface DynamicContactFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, string>) => void;
  submitLabel?: string;
  defaultValues?: Record<string, string>;
  className?: string;
  textStyles?: {
    label?: React.CSSProperties;
    button?: React.CSSProperties;
    // Optionally accept border color
  };
  inputBorderColor?: string;
  inputFocusColor?: string;
  inputBorderRadius?: number | string;
  launchButtonStyles?: React.CSSProperties;
}

const DynamicContactForm: React.FC<DynamicContactFormProps> = ({
  fields,
  onSubmit,
  submitLabel = "Envoyer",
  defaultValues,
  className = "",
  textStyles,
  inputBorderColor = "#E5E7EB",
  inputFocusColor = "#000000",
  inputBorderRadius = "2px",
  launchButtonStyles
}) => {
  // Utiliser le style global du bouton de lancement
  const globalButtonStyle = useButtonStyleCSS();
  
  // Stabilize defaultValues to avoid identity changes causing effects to loop
  const stableDefaultValues = useMemo(() => defaultValues ?? {}, [defaultValues]);

  const [formData, setFormData] = useState<Record<string, string>>(() => stableDefaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep form in sync when fields or defaultValues change
  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.id] = stableDefaultValues[f.id] ?? '';
    });
    // Only update state if values actually changed
    const sameShape = Object.keys(initial).length === Object.keys(formData).length;
    const sameValues = sameShape && fields.every(f => (formData[f.id] ?? '') === (initial[f.id] ?? ''));
    if (!sameValues) {
      setFormData(initial);
    }
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [fields, stableDefaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked ? 'true' : 'false' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateField = (field: FieldConfig, value: string): string => {
    if (field.required && !value?.trim()) {
      return "Ce champ est requis";
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Format d'email invalide";
    }
    if (field.type === 'tel' && value && !/^[\d\s\+\-\(\)]+$/.test(value)) {
      return "Format de téléphone invalide";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const value = formData[field.id] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const getInputStyle = () => ({
    borderColor: inputBorderColor,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: inputBorderRadius,
    outline: "none"
  });

  const getFocusClass = () => 'focus:ring-2';

  const renderField = (field: FieldConfig) => {
    const baseProps = {
      id: field.id,
      name: field.id,
      required: field.required,
      autoComplete: field.autoComplete || "on",
      style: {
        ...getInputStyle(),
        // Override Tailwind ring color safely via CSS variable
        ['--tw-ring-color' as any]: inputFocusColor || '#841b60',
      },
      className: `w-full px-4 py-2 border rounded-[2px] ${getFocusClass()}`,
      onChange: handleChange
    };

    switch (field.type) {
      case 'select':
        return (
          <select
            {...baseProps}
            value={formData[field.id] || ""}
          >
            <option value="">Sélectionner</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            value={formData[field.id] || ""}
            rows={4}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={formData[field.id] === 'true'}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-[#841b60] border-gray-300 rounded-[2px] ring-2 ring-[#841b60]"
              style={{
                borderColor: inputBorderColor,
                outline: "none",
                ['--tw-ring-color' as any]: inputFocusColor || '#841b60',
              }}
            />
            <label htmlFor={field.id} className="text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        );
      default:
        return (
          <input
            {...baseProps}
            type={field.type || "text"}
            value={formData[field.id] || ""}
          />
        );
    }
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit} autoComplete="on">
      {fields.map(field => (
        <div key={field.id}>
          {field.type !== 'checkbox' && (
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.id} style={textStyles?.label}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {renderField(field)}

          {errors[field.id] && (
            <span className="text-xs text-red-500">{errors[field.id]}</span>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full px-6 py-3 font-medium transition-colors duration-200 hover:opacity-90"
        style={{
          ...globalButtonStyle,
          ...launchButtonStyles,
          ...(launchButtonStyles ? {} : (textStyles?.button || {}))
        }}
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default DynamicContactForm;
