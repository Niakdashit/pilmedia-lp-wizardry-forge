import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Tablet, Smartphone, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
}

const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = config.fields || [];
  const design = config.design || {};
  const buttonConfig = config.buttonConfig || {};
  const validation = config.validation || {};

  // Device-specific dimensions
  const deviceDimensions = {
    desktop: { width: '1024px', height: '768px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field: any) => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.label} est requis`;
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Adresse email invalide';
        }
      }
      
      // Phone validation
      if (field.type === 'tel' && formData[field.id]) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Numéro de téléphone invalide';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({});
    }, 3000);
  };

  const getSpacingClass = () => {
    switch (design.spacing) {
      case 'compact': return 'space-y-2';
      case 'spacious': return 'space-y-6';
      default: return 'space-y-4';
    }
  };

  const getLayoutClass = () => {
    if (design.layout === 'horizontal' && selectedDevice === 'desktop') {
      return 'grid grid-cols-2 gap-4';
    }
    return 'space-y-4';
  };

  const renderField = (field: any, index: number) => {
    const fieldStyle = {
      borderColor: errors[field.id] ? '#ef4444' : (design.primaryColor || '#3b82f6'),
      borderRadius: `${design.borderRadius || 8}px`
    };

    const labelStyle = {
      color: design.secondaryColor || '#64748b'
    };

    const fieldValue = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <label className="block text-sm font-medium" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className={`w-full px-3 py-2 border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
              style={fieldStyle}
            />
            {errors[field.id] && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.id]}
              </p>
            )}
            {field.helpText && !errors[field.id] && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </motion.div>
        );

      case 'textarea':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <label className="block text-sm font-medium" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              rows={field.rows || 3}
              className={`w-full px-3 py-2 border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
              style={fieldStyle}
            />
            {errors[field.id] && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.id]}
              </p>
            )}
            {field.helpText && !errors[field.id] && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <label className="block text-sm font-medium" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className={`w-full px-3 py-2 border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
              style={fieldStyle}
            >
              <option value="">{field.placeholder || 'Choisir une option'}</option>
              {field.options?.map((option: any, optIndex: number) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[field.id] && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.id]}
              </p>
            )}
            {field.helpText && !errors[field.id] && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </motion.div>
        );

      case 'radio':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    className="w-4 h-4 border-2 focus:ring-2 focus:ring-blue-500/20"
                    style={{ accentColor: design.primaryColor || '#3b82f6' }}
                  />
                  <span className="text-sm" style={labelStyle}>{option.label}</span>
                </label>
              ))}
            </div>
            {errors[field.id] && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.id]}
              </p>
            )}
            {field.helpText && !errors[field.id] && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </motion.div>
        );

      case 'checkbox':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium" style={labelStyle}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(fieldValue) ? fieldValue.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (e.target.checked) {
                        handleInputChange(field.id, [...currentValues, option.value]);
                      } else {
                        handleInputChange(field.id, currentValues.filter((v: any) => v !== option.value));
                      }
                    }}
                    className="w-4 h-4 border-2 rounded focus:ring-2 focus:ring-blue-500/20"
                    style={{ accentColor: design.primaryColor || '#3b82f6' }}
                  />
                  <span className="text-sm" style={labelStyle}>{option.label}</span>
                </label>
              ))}
            </div>
            {errors[field.id] && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.id]}
              </p>
            )}
            {field.helpText && !errors[field.id] && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const backgroundStyle = design.background?.type === 'image' 
    ? { backgroundImage: `url(${design.background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: design.background?.value || '#f8fafc' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Aperçu du formulaire</h2>
                
                {/* Device selector */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedDevice('desktop')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedDevice === 'desktop' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedDevice('tablet')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedDevice === 'tablet' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedDevice('mobile')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedDevice === 'mobile' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="flex items-center justify-center">
                <motion.div
                  key={selectedDevice}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-300 rounded-lg overflow-hidden shadow-lg"
                  style={deviceDimensions[selectedDevice]}
                >
                  <div className="w-full h-full overflow-auto" style={backgroundStyle}>
                    <div className="p-6 h-full">
                      {/* Success Message */}
                      <AnimatePresence>
                        {showSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                            <p className="text-green-800">
                              {validation.successMessage || 'Merci ! Votre formulaire a été envoyé avec succès.'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showSuccess && (
                        <motion.div
                          className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
                          style={{ borderRadius: `${design.borderRadius || 8}px` }}
                        >
                          {/* Form Title */}
                          {config.title && (
                            <div className="mb-6 text-center">
                              <h2 className="text-2xl font-bold" style={{ color: design.primaryColor || '#3b82f6' }}>
                                {config.title}
                              </h2>
                              {config.description && (
                                <p className="text-gray-600 mt-2">{config.description}</p>
                              )}
                            </div>
                          )}

                          {/* Form */}
                          {fields.length > 0 ? (
                            <form onSubmit={handleSubmit} className={getSpacingClass()}>
                              <div className={getLayoutClass()}>
                                {fields.map((field: any, index: number) => renderField(field, index))}
                              </div>

                              {/* Submit Button */}
                              <div className="pt-4">
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="w-full px-6 py-3 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                                  style={{
                                    backgroundColor: buttonConfig.color || '#3b82f6',
                                    color: buttonConfig.textColor || '#ffffff',
                                    borderRadius: `${design.borderRadius || 8}px`
                                  }}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      {buttonConfig.loadingText || 'Envoi en cours...'}
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      {buttonConfig.text || 'Envoyer'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Formulaire vide</h3>
                              <p className="text-gray-500">Ajoutez des champs pour voir l'aperçu de votre formulaire</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormPreviewModal;
