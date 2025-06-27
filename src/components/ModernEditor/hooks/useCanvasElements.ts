
import { useState, useCallback } from 'react';

export const useCanvasElements = (
  campaign: any, 
  setCampaign: (updater: (prev: any) => any) => void,
  previewDevice: 'desktop' | 'tablet' | 'mobile'
) => {
  const [selectedElement, setSelectedElement] = useState<{type: 'text' | 'image', id: number} | null>(null);

  // Get device key - desktop and tablet share the same config
  const deviceKey = previewDevice === 'mobile' ? 'mobile' : 'desktop';

  const customTexts = campaign.design?.customTexts || [];
  const customImages = campaign.design?.customImages || [];

  const addTextElement = useCallback(() => {
    const newId = Date.now() + Math.random(); // Ensure unique ID
    const newText = {
      id: newId,
      text: 'Nouveau texte',
      enabled: true,
      x: 100,
      y: 100,
      color: '#000000',
      size: 'base',
      bold: false,
      italic: false,
      underline: false,
      fontFamily: 'Inter',
      showFrame: false,
      frameColor: '#ffffff',
      frameBorderColor: '#e5e7eb',
      deviceConfig: {
        [deviceKey]: {
          x: 100,
          y: 100,
          width: undefined,
          height: undefined
        }
      }
    };

    console.log('Adding new text element:', newText);

    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        customTexts: [...customTexts, newText]
      }
    }));

    setSelectedElement({ type: 'text', id: newText.id });
  }, [setCampaign, customTexts, deviceKey]);

  const addImageElement = useCallback(() => {
    const newId = Date.now() + Math.random(); // Ensure unique ID
    const newImage = {
      id: newId,
      src: '',
      enabled: true,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      deviceConfig: {
        [deviceKey]: {
          x: 100,
          y: 100,
          width: 100,
          height: 100
        }
      }
    };

    console.log('Adding new image element:', newImage);

    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        customImages: [...customImages, newImage]
      }
    }));

    setSelectedElement({ type: 'image', id: newImage.id });
  }, [setCampaign, customImages, deviceKey]);

  const updateTextElement = useCallback((id: number, updates: any) => {
    console.log('Updating text element:', id, updates);
    
    setCampaign((prevCampaign: any) => {
      const updatedTexts = customTexts.map((text: any) => {
        if (text.id === id) {
          const updatedText = { ...text };
          
          // Update device-specific properties
          if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
            updatedText.deviceConfig = {
              ...updatedText.deviceConfig,
              [deviceKey]: {
                ...updatedText.deviceConfig?.[deviceKey],
                x: updates.x !== undefined ? updates.x : updatedText.deviceConfig?.[deviceKey]?.x || updatedText.x || 0,
                y: updates.y !== undefined ? updates.y : updatedText.deviceConfig?.[deviceKey]?.y || updatedText.y || 0,
                width: updates.width !== undefined ? updates.width : updatedText.deviceConfig?.[deviceKey]?.width || updatedText.width,
                height: updates.height !== undefined ? updates.height : updatedText.deviceConfig?.[deviceKey]?.height || updatedText.height
              }
            };
          }
          
          // Update other properties (color, text, etc.)
          Object.keys(updates).forEach(key => {
            if (!['x', 'y', 'width', 'height'].includes(key)) {
              updatedText[key] = updates[key];
            }
          });
          
          console.log('Text element updated:', updatedText);
          return updatedText;
        }
        return text;
      });

      return {
        ...prevCampaign,
        design: {
          ...prevCampaign.design,
          customTexts: updatedTexts
        }
      };
    });
  }, [setCampaign, customTexts, deviceKey]);

  const updateImageElement = useCallback((id: number, updates: any) => {
    console.log('Updating image element:', id, updates);
    
    setCampaign((prevCampaign: any) => {
      const updatedImages = customImages.map((img: any) => {
        if (img.id === id) {
          const updatedImage = { ...img };
          
          // Update device-specific properties
          if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
            updatedImage.deviceConfig = {
              ...updatedImage.deviceConfig,
              [deviceKey]: {
                ...updatedImage.deviceConfig?.[deviceKey],
                x: updates.x !== undefined ? updates.x : updatedImage.deviceConfig?.[deviceKey]?.x || updatedImage.x || 0,
                y: updates.y !== undefined ? updates.y : updatedImage.deviceConfig?.[deviceKey]?.y || updatedImage.y || 0,
                width: updates.width !== undefined ? updates.width : updatedImage.deviceConfig?.[deviceKey]?.width || updatedImage.width || 100,
                height: updates.height !== undefined ? updates.height : updatedImage.deviceConfig?.[deviceKey]?.height || updatedImage.height || 100
              }
            };
          }
          
          // Update other properties (src, rotation, etc.)
          Object.keys(updates).forEach(key => {
            if (!['x', 'y', 'width', 'height'].includes(key)) {
              updatedImage[key] = updates[key];
            }
          });
          
          console.log('Image element updated:', updatedImage);
          return updatedImage;
        }
        return img;
      });

      return {
        ...prevCampaign,
        design: {
          ...prevCampaign.design,
          customImages: updatedImages
        }
      };
    });
  }, [setCampaign, customImages, deviceKey]);

  const deleteTextElement = useCallback((id: number) => {
    console.log('Deleting text element:', id);
    setCampaign((prevCampaign: any) => ({
      ...prevCampaign,
      design: {
        ...prevCampaign.design,
        customTexts: customTexts.filter((text: any) => text.id !== id)
      }
    }));
    setSelectedElement(null);
  }, [setCampaign, customTexts]);

  const deleteImageElement = useCallback((id: number) => {
    console.log('Deleting image element:', id);
    setCampaign((prevCampaign: any) => ({
      ...prevCampaign,
      design: {
        ...prevCampaign.design,
        customImages: customImages.filter((img: any) => img.id !== id)
      }
    }));
    setSelectedElement(null);
  }, [setCampaign, customImages]);

  // Helper function to get current device config for an element
  const getElementDeviceConfig = useCallback((element: any) => {
    const deviceConfig = element.deviceConfig?.[deviceKey];
    const config = {
      x: deviceConfig?.x ?? element.x ?? 0,
      y: deviceConfig?.y ?? element.y ?? 0,
      width: deviceConfig?.width ?? element.width ?? (element.src ? 100 : undefined),
      height: deviceConfig?.height ?? element.height ?? (element.src ? 100 : undefined)
    };
    
    console.log('Getting device config for element:', element.id, config);
    return config;
  }, [deviceKey]);

  return {
    selectedElement,
    setSelectedElement,
    customTexts,
    customImages,
    updateTextElement,
    updateImageElement,
    deleteTextElement,
    deleteImageElement,
    getElementDeviceConfig,
    addTextElement,
    addImageElement,
    deviceKey
  };
};
