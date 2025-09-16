import React from 'react';
import { FormField } from '../../types/FormField';
import { User, Mail, Phone, MessageSquare, Hash, Calendar, List, CheckSquare, Circle } from 'lucide-react';

interface DynamicFormRendererProps {
  fields: FormField[];
  formData: Record<string, any>;
  errors: Record<string, string>;
  fieldStyle: React.CSSProperties;
  textColor: string;
  onFieldChange: (fieldId: string, value: any) => void;
}

const FIELD_ICONS: Record<string, React.ComponentType<any>> = {
  text: User,
  email: Mail,
  tel: Phone,
  textarea: MessageSquare,
  number: Hash,
  date: Calendar,
  select: List,
  checkbox: CheckSquare,
  radio: Circle
};

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  fields,
  formData,
  errors,
  fieldStyle,
  textColor,
  onFieldChange
}) => {
  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const fieldValue = formData[field.id] || '';

    const commonProps = {
      id: field.id,
      style: fieldStyle,
      className: `w-full px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        hasError ? 'border-red-500' : ''
      }`,
      'aria-describedby': hasError ? `${field.id}-error` : undefined
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            {...commonProps}
            type={field.type}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        const numberField = field as any;
        return (
          <input
            {...commonProps}
            type="number"
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={numberField.min}
            max={numberField.max}
            step={numberField.step}
          />
        );

      case 'date':
        const dateField = field as any;
        return (
          <input
            {...commonProps}
            type="date"
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
            min={dateField.min}
            max={dateField.max}
          />
        );

      case 'textarea':
        const textareaField = field as any;
        return (
          <textarea
            {...commonProps}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={textareaField.rows || 3}
            className={`${commonProps.className} resize-none`}
          />
        );

      case 'select':
        const selectField = field as any;
        return (
          <select
            {...commonProps}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
            multiple={selectField.multiple}
          >
            <option value="">Sélectionnez une option</option>
            {selectField.options?.map((option: any) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        const radioField = field as any;
        return (
          <div className="space-y-2">
            {radioField.options?.map((option: any) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={(e) => onFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-blue-600"
                />
                <span style={{ color: textColor }}>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const checkboxField = field as any;
        const checkboxValues = Array.isArray(fieldValue) ? fieldValue : [];
        return (
          <div className="space-y-2">
            {checkboxField.options?.map((option: any) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={checkboxValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkboxValues, option.value]
                      : checkboxValues.filter((v: string) => v !== option.value);
                    onFieldChange(field.id, newValues);
                  }}
                  className="text-blue-600"
                />
                <span style={{ color: textColor }}>{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={fieldValue}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        );
    }
  };

  return (
    <>
      {fields
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <div key={field.id} className="space-y-1">
            <label 
              htmlFor={field.id} 
              className="block text-sm font-medium"
              style={{ color: textColor }}
            >
              {React.createElement(FIELD_ICONS[field.type] || User, { 
                className: "inline w-4 h-4 mr-1" 
              })}
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p id={`${field.id}-error`} className="text-sm text-red-600" role="alert">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
    </>
  );
};

export default DynamicFormRenderer;
