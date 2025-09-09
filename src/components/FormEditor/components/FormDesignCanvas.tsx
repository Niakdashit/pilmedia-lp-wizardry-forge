import React from 'react';
import { motion } from 'framer-motion';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

interface FormDesignCanvasProps {
  config: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  zoom?: number;
}

const FormDesignCanvas: React.FC<FormDesignCanvasProps> = ({
  config,
  selectedDevice,
  zoom = 0.7
}) => {
  const fields = config.fields || [];
  const design = config.design || {};
  const buttonConfig = config.buttonConfig || {};

  // Utilise les dimensions standardisées
  const dimensions = getDeviceDimensions(selectedDevice);
  const { width, height } = dimensions;
  
  // Utiliser le zoom passé en props ou valeur par défaut
  const scale = zoom || (() => {
    switch (selectedDevice) {
      case 'desktop': return 0.7;
      case 'tablet': return 0.55;
      case 'mobile': return 0.45;
      default: return 0.7;
    }
  })();

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
      borderColor: design.primaryColor || '#3b82f6',
      borderRadius: `${design.borderRadius || 8}px`
    };

    const labelStyle = {
      color: design.secondaryColor || '#64748b'
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'input':
        return (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ gap: `${4 * scale}px` }}
            className="space-y-1"
          >
            <label className="block font-medium" style={{
              fontSize: `${14 * scale}px`,
              ...labelStyle
            }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" style={{ marginLeft: `${4 * scale}px` }}>*</span>}
            </label>
            <input
              type={field.inputType || 'text'}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              style={{
                padding: `${8 * scale}px ${12 * scale}px`,
                fontSize: `${14 * scale}px`,
                ...fieldStyle
              }}
              readOnly
            />
            {field.helpText && (
              <p className="text-xs text-gray-500" style={{ fontSize: `${12 * scale}px` }}>{field.helpText}</p>
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
            style={{ gap: `${4 * scale}px` }}
            className="space-y-1"
          >
            <label className="block font-medium" style={{
              fontSize: `${14 * scale}px`,
              ...labelStyle
            }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" style={{ marginLeft: `${4 * scale}px` }}>*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              rows={field.rows || 3}
              className="w-full px-3 py-2 border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
              style={{
                padding: `${8 * scale}px ${12 * scale}px`,
                fontSize: `${14 * scale}px`,
                ...fieldStyle
              }}
              readOnly
            />
            {field.helpText && (
              <p className="text-xs text-gray-500" style={{ fontSize: `${12 * scale}px` }}>{field.helpText}</p>
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
            style={{ gap: `${4 * scale}px` }}
            className="space-y-1"
          >
            <label className="block font-medium" style={{
              fontSize: `${14 * scale}px`,
              ...labelStyle
            }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" style={{ marginLeft: `${4 * scale}px` }}>*</span>}
            </label>
            <select
              required={field.required}
              className="w-full px-3 py-2 border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              style={{
                padding: `${8 * scale}px ${12 * scale}px`,
                fontSize: `${14 * scale}px`,
                ...fieldStyle
              }}
            >
              <option value="">{field.placeholder || 'Choisir une option'}</option>
              {field.options?.map((option: any, optIndex: number) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helpText && (
              <p className="text-xs text-gray-500" style={{ fontSize: `${12 * scale}px` }}>{field.helpText}</p>
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
            style={{ gap: `${8 * scale}px` }}
            className="space-y-2"
          >
            <label className="block font-medium" style={{
              fontSize: `${14 * scale}px`,
              ...labelStyle
            }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" style={{ marginLeft: `${4 * scale}px` }}>*</span>}
            </label>
            <div style={{ gap: `${8 * scale}px` }} className="space-y-2">
              {field.options?.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center cursor-pointer" style={{ gap: `${8 * scale}px` }}>
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    required={field.required}
                    className="w-4 h-4 border-2 focus:ring-2 focus:ring-blue-500/20"
                    style={{
                      width: `${16 * scale}px`,
                      height: `${16 * scale}px`,
                      accentColor: design.primaryColor || '#3b82f6'
                    }}
                  />
                  <span style={{
                    fontSize: `${14 * scale}px`,
                    ...labelStyle
                  }}>{option.label}</span>
                </label>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500" style={{ fontSize: `${12 * scale}px` }}>{field.helpText}</p>
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
            style={{ gap: `${8 * scale}px` }}
            className="space-y-2"
          >
            <label className="block font-medium" style={{
              fontSize: `${14 * scale}px`,
              ...labelStyle
            }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1" style={{ marginLeft: `${4 * scale}px` }}>*</span>}
            </label>
            <div style={{ gap: `${8 * scale}px` }} className="space-y-2">
              {field.options?.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center cursor-pointer" style={{ gap: `${8 * scale}px` }}>
                  <input
                    type="checkbox"
                    value={option.value}
                    className="w-4 h-4 border-2 rounded focus:ring-2 focus:ring-blue-500/20"
                    style={{
                      width: `${16 * scale}px`,
                      height: `${16 * scale}px`,
                      accentColor: design.primaryColor || '#3b82f6'
                    }}
                  />
                  <span style={{
                    fontSize: `${14 * scale}px`,
                    ...labelStyle
                  }}>{option.label}</span>
                </label>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500" style={{ fontSize: `${12 * scale}px` }}>{field.helpText}</p>
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
    <div className="design-canvas-container flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 relative">
      <div className="flex items-center justify-center w-full h-full">
        <motion.div
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          style={{
            width: width * scale,
            height: height * scale,
            ...backgroundStyle
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-full overflow-auto" style={{ padding: `${24 * scale}px` }}>
          {/* Form Title */}
          {config.title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ marginBottom: `${24 * scale}px` }}
            >
              <h2 style={{
                fontSize: `${24 * scale}px`,
                fontWeight: 'bold',
                color: design.primaryColor || '#3b82f6'
              }}>
                {config.title}
              </h2>
              {config.description && (
                <p style={{
                  color: '#6b7280',
                  marginTop: `${8 * scale}px`,
                  fontSize: `${14 * scale}px`
                }}>
                  {config.description}
                </p>
              )}
            </motion.div>
          )}

          {/* Form Fields */}
          {fields.length > 0 ? (
            <form className={getSpacingClass()}>
              <div className={getLayoutClass()}>
                {fields.map((field: any, index: number) => renderField(field, index))}
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fields.length * 0.1 + 0.2 }}
                style={{ paddingTop: `${16 * scale}px` }}
              >
                <button
                  type="submit"
                  className="w-full rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  style={{
                    padding: `${12 * scale}px ${24 * scale}px`,
                    fontSize: `${16 * scale}px`,
                    fontWeight: '500',
                    backgroundColor: buttonConfig.color || '#3b82f6',
                    color: buttonConfig.textColor || '#ffffff',
                    borderRadius: `${(design.borderRadius || 8) * scale}px`
                  }}
                >
                  {buttonConfig.text || 'Envoyer'}
                </button>
              </motion.div>
            </form>
          ) : (
            <div className="text-center" style={{ padding: `${48 * scale}px 0` }}>
              <div
                className="mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
                style={{
                  width: `${64 * scale}px`,
                  height: `${64 * scale}px`
                }}
              >
                <svg
                  className="text-gray-400"
                  style={{
                    width: `${32 * scale}px`,
                    height: `${32 * scale}px`
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: `${18 * scale}px`,
                fontWeight: '500',
                color: '#111827',
                marginBottom: `${8 * scale}px`
              }}>
                Formulaire vide
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: `${14 * scale}px`
              }}>
                Ajoutez des champs pour voir l'aperçu de votre formulaire
              </p>
            </div>
          )}
          
          {/* Indicateur d'appareil */}
          <div
            className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg text-white"
            style={{
              padding: `${6 * scale}px ${12 * scale}px`,
              fontSize: `${12 * scale}px`,
              fontWeight: '600'
            }}
          >
            {selectedDevice === 'desktop' ? '🖥️ Bureau' :
             selectedDevice === 'tablet' ? '📱 Tablette' :
             '📱 Mobile'}
          </div>
          </div>
        </motion.div>
      </div>
      
      {/* Informations de debug */}
      <div
        className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg text-white"
        style={{
          padding: `${12 * scale}px`,
          fontSize: `${12 * scale}px`
        }}
      >
        <div>Appareil: {selectedDevice}</div>
        <div>Canvas: {width}×{height}px</div>
        <div>Affichage: {Math.round(width * scale)}×{Math.round(height * scale)}px</div>
        <div>Échelle: {Math.round(scale * 100)}%</div>
        <div>Champs: {fields.length}</div>
      </div>
    </div>
  );
};

export default FormDesignCanvas;
