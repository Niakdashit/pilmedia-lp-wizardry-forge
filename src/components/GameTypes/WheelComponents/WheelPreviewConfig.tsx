export const getWheelPreviewConfig = (campaign: any) => {
  const position = campaign?.config?.roulette?.position || 'centre';
  const centerImage = campaign?.config?.roulette?.centerImage;
  const centerLogo = campaign?.design?.centerLogo || campaign?.config?.roulette?.centerImage;
  const theme = campaign?.config?.roulette?.theme || 'default';

  const borderColor = campaign?.config?.roulette?.borderColor || '#44444d';
  const borderOutlineColor = campaign?.config?.roulette?.borderOutlineColor || '#FFD700';

  const customColors = campaign?.design?.customColors;

  const buttonConfig = campaign?.buttonConfig || {
    color: customColors?.primary || '#44444d',
    textColor: customColors?.primary || '#ffffff',
    borderColor: customColors?.primary || '#44444d',
    borderWidth: 1,
    borderRadius: 8,
    size: 'medium',
    link: '',
    visible: true,
    text: 'Remplir le formulaire'
  };

  return {
    position,
    centerImage,
    centerLogo,
    theme,
    borderColor,
    borderOutlineColor,
    customColors,
    buttonConfig
  };
};