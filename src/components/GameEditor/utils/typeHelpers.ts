import { CustomText, CustomImage } from '../GameEditorLayout';

export const createCustomText = (overrides: Partial<CustomText> & { id: string; content: string }): CustomText => {
  return {
    id: overrides.id,
    content: overrides.content,
    x: overrides.x ?? 50,
    y: overrides.y ?? 50,
    size: overrides.size ?? 'base',
    color: overrides.color ?? '#000000',
    fontFamily: overrides.fontFamily ?? 'Inter, sans-serif',
    bold: overrides.bold ?? false,
    italic: overrides.italic ?? false,
    underline: overrides.underline ?? false,
    enabled: overrides.enabled ?? true,
    showFrame: overrides.showFrame ?? false,
    frameColor: overrides.frameColor ?? '#ffffff',
    frameBorderColor: overrides.frameBorderColor ?? '#e5e7eb',
    animationConfig: overrides.animationConfig,
    fontSize: overrides.fontSize,
    fontWeight: overrides.fontWeight,
    fontStyle: overrides.fontStyle,
    textDecoration: overrides.textDecoration,
    width: overrides.width,
    height: overrides.height,
    backgroundColor: overrides.backgroundColor,
    textAlign: overrides.textAlign,
    listType: overrides.listType,
    hasEffect: overrides.hasEffect,
    isAnimated: overrides.isAnimated,
    deviceConfig: overrides.deviceConfig,
  };
};

export const createCustomImage = (overrides: Partial<CustomImage> & { id: string; src: string }): CustomImage => {
  return {
    id: overrides.id,
    src: overrides.src,
    x: overrides.x ?? 50,
    y: overrides.y ?? 50,
    width: overrides.width ?? 100,
    height: overrides.height ?? 100,
    rotation: overrides.rotation ?? 0,
    enabled: overrides.enabled ?? true,
  };
};