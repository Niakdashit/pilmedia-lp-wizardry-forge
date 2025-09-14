// === NOUVEAU SYSTÈME DE RENDU MODULAIRE BURGER KING ===

import { WheelBorderConfig } from './borderStyles';

// Fonction principale de rendu des bordures
export const renderWheelBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  animationTime: number = 0,
  wheelSize: number = 200,
  customBorderWidth?: number
) => {
  // Utiliser la largeur personnalisée si fournie, sinon celle de la config
  const borderWidth = customBorderWidth || config.dimensions.width;
  const scaleFactor = wheelSize / 200;
  // Largeur de bordure indépendante de la taille de la roue
  const scaledBorderWidth = borderWidth;

  // Appeler le renderer personnalisé si spécifié
  if (config.customRenderer) {
    // Les renderers personnalisés sont gérés dans borderStyles.ts
    return;
  }

  // Renderer générique basé sur le matériau et le style
  switch (config.material) {
    case 'metal':
      renderMetalBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
      break;
    case 'neon':
      renderNeonBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor, animationTime);
      break;
    case 'wood':
      renderWoodBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
      break;
    case 'plastic':
      renderPlasticBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
      break;
    case 'glass':
      renderGlassBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth);
      break;
    case 'ceramic':
      renderCeramicBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
      break;
    case 'carbon':
      renderCarbonBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
      break;
    default:
      renderPlasticBorder(ctx, centerX, centerY, radius, config, scaledBorderWidth, scaleFactor);
  }
};

// Renderer pour bordures métalliques (style Burger King)
const renderMetalBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number,
  // animationTime unused parameter
) => {
  ctx.save();

  // Gradient métallique principal
  const mainGradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.7,
    centerX, centerY, radius * 1.1
  );

  // Appliquer les couleurs selon le finish
  if (config.finish === 'polished') {
    mainGradient.addColorStop(0, config.colors.primary);
    mainGradient.addColorStop(0.3, config.colors.secondary || config.colors.primary);
    mainGradient.addColorStop(0.6, config.colors.accent || config.colors.primary);
    mainGradient.addColorStop(1, config.colors.primary);
  } else {
    // Finish brossé ou mat
    mainGradient.addColorStop(0, config.colors.primary);
    mainGradient.addColorStop(1, config.colors.secondary || config.colors.primary);
  }

  // Effets d'ombre et de lueur
  if (config.effects.shadow?.enabled) {
    ctx.shadowColor = config.effects.shadow.color || 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = (config.effects.shadow.blur || 10) * scaleFactor;
    ctx.shadowOffsetX = (config.effects.shadow.offsetX || 2) * scaleFactor;
    ctx.shadowOffsetY = (config.effects.shadow.offsetY || 2) * scaleFactor;
  }

  if (config.effects.glow?.enabled) {
    ctx.shadowColor = config.effects.glow.color || config.colors.accent || config.colors.primary;
    ctx.shadowBlur = (config.effects.glow.blur || 20) * scaleFactor;
  }

  // Dessiner la bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = mainGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();

  // Effets métalliques
  if (config.effects.metallic?.enabled && config.finish === 'polished') {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Reflet métallique
    const highlightGradient = ctx.createLinearGradient(
      centerX, centerY - radius - borderWidth/2,
      centerX, centerY - radius + borderWidth/2
    );
    const intensity = config.effects.metallic.reflectionIntensity || 0.6;
    
    highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.6})`);
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = highlightGradient;
    ctx.lineWidth = borderWidth * 0.8;
    ctx.stroke();
  }

  // Bordure interne si spécifiée
  if (config.dimensions.innerWidth) {
    const innerGradient = ctx.createRadialGradient(
      centerX, centerY, radius - borderWidth * 0.7,
      centerX, centerY, radius - borderWidth * 0.3
    );
    innerGradient.addColorStop(0, config.colors.accent || config.colors.secondary || config.colors.primary);
    innerGradient.addColorStop(1, config.colors.primary);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - borderWidth * 0.5, 0, 2 * Math.PI);
    ctx.strokeStyle = innerGradient;
    ctx.lineWidth = config.dimensions.innerWidth * scaleFactor;
    ctx.stroke();
  }

  ctx.restore();
};

// Renderer pour bordures néon
const renderNeonBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number,
  animationTime: number = 0
) => {
  ctx.save();

  const glowIntensity = config.effects.glow?.intensity || 1;
  const glowColor = config.effects.glow?.color || config.colors.primary;
  
  // Animation de pulsation si activée
  let pulseMultiplier = 1;
  if (config.effects.animation?.enabled && config.effects.animation.type === 'pulse') {
    const speed = config.effects.animation.speed || 1;
    pulseMultiplier = 0.8 + 0.4 * Math.sin(animationTime * 0.005 * speed);
  }

  // Effet de lueur multiple
  for (let i = 0; i < 3; i++) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = (20 + i * 10) * scaleFactor * glowIntensity * pulseMultiplier;
    ctx.globalAlpha = (0.8 - i * 0.2) * pulseMultiplier;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + i * 2, 0, 2 * Math.PI);
    ctx.strokeStyle = config.colors.primary;
    ctx.lineWidth = borderWidth - i * 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.restore();
};

// Renderer pour bordures en plastique
const renderPlasticBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number
) => {
  ctx.save();

  // Ombre simple
  if (config.effects.shadow?.enabled) {
    ctx.shadowColor = config.effects.shadow.color || 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = (config.effects.shadow.blur || 5) * scaleFactor;
    ctx.shadowOffsetX = (config.effects.shadow.offsetX || 1) * scaleFactor;
    ctx.shadowOffsetY = (config.effects.shadow.offsetY || 1) * scaleFactor;
  }

  // Bordure simple
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = config.colors.primary;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Reflet plastique si finish glossy
  if (config.finish === 'glossy') {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const glossGradient = ctx.createLinearGradient(
      centerX, centerY - radius,
      centerX, centerY - radius * 0.7
    );
    glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 1.2, Math.PI * 1.8);
    ctx.strokeStyle = glossGradient;
    ctx.lineWidth = borderWidth * 0.5;
    ctx.stroke();
  }

  ctx.restore();
};

// Renderer pour bordures en bois
const renderWoodBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number
) => {
  ctx.save();

  // Gradient bois avec veines
  const woodGradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  
  woodGradient.addColorStop(0, config.colors.primary);
  woodGradient.addColorStop(0.3, config.colors.secondary || config.colors.primary);
  woodGradient.addColorStop(0.7, config.colors.accent || config.colors.primary);
  woodGradient.addColorStop(1, config.colors.primary);

  // Ombre si activée
  if (config.effects.shadow?.enabled) {
    ctx.shadowColor = config.effects.shadow.color || 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = (config.effects.shadow.blur || 8) * scaleFactor;
    ctx.shadowOffsetX = (config.effects.shadow.offsetX || 2) * scaleFactor;
    ctx.shadowOffsetY = (config.effects.shadow.offsetY || 2) * scaleFactor;
  }

  // Bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = woodGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();

  // Effet bevel si spécifié
  if (config.dimensions.bevelDepth) {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const bevelGradient = ctx.createLinearGradient(
      centerX, centerY - radius,
      centerX, centerY - radius + config.dimensions.bevelDepth * scaleFactor
    );
    bevelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    bevelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.strokeStyle = bevelGradient;
    ctx.lineWidth = config.dimensions.bevelDepth * scaleFactor;
    ctx.stroke();
  }

  ctx.restore();
};

// Renderer pour bordures en verre
const renderGlassBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  // scaleFactor unused in this function
) => {
  ctx.save();

  // Effet de transparence
  ctx.globalAlpha = 0.8;

  // Gradient verre avec reflets
  const glassGradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.8,
    centerX, centerY, radius * 1.1
  );
  
  glassGradient.addColorStop(0, config.colors.primary);
  glassGradient.addColorStop(0.5, config.colors.secondary || config.colors.primary);
  glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');

  // Bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = glassGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Reflets de verre
  ctx.globalAlpha = 0.6;
  const reflectionGradient = ctx.createLinearGradient(
    centerX - radius * 0.3, centerY - radius,
    centerX + radius * 0.3, centerY - radius * 0.5
  );
  reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI * 1.1, Math.PI * 1.9);
  ctx.strokeStyle = reflectionGradient;
  ctx.lineWidth = borderWidth * 0.6;
  ctx.stroke();

  ctx.restore();
};

// Renderer pour bordures en céramique
const renderCeramicBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number
) => {
  ctx.save();

  // Gradient céramique lisse
  const ceramicGradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.9,
    centerX, centerY, radius * 1.1
  );
  
  ceramicGradient.addColorStop(0, config.colors.primary);
  ceramicGradient.addColorStop(0.5, config.colors.secondary || config.colors.primary);
  ceramicGradient.addColorStop(1, config.colors.primary);

  // Ombre douce
  if (config.effects.shadow?.enabled) {
    ctx.shadowColor = config.effects.shadow.color || 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = (config.effects.shadow.blur || 6) * scaleFactor;
    ctx.shadowOffsetX = (config.effects.shadow.offsetX || 1) * scaleFactor;
    ctx.shadowOffsetY = (config.effects.shadow.offsetY || 1) * scaleFactor;
  }

  // Bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = ceramicGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Reflet céramique subtil
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const ceramicHighlight = ctx.createLinearGradient(
    centerX, centerY - radius,
    centerX, centerY - radius * 0.8
  );
  ceramicHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  ceramicHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI * 1.3, Math.PI * 1.7);
  ctx.strokeStyle = ceramicHighlight;
  ctx.lineWidth = borderWidth * 0.4;
  ctx.stroke();

  ctx.restore();
};

// Renderer pour bordures en carbone
const renderCarbonBorder = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  config: WheelBorderConfig,
  borderWidth: number,
  scaleFactor: number
) => {
  ctx.save();

  // Pattern carbone avec texture
  const carbonGradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  
  // Alternance pour effet tissé
  carbonGradient.addColorStop(0, config.colors.primary);
  carbonGradient.addColorStop(0.25, config.colors.secondary || '#333333');
  carbonGradient.addColorStop(0.5, config.colors.primary);
  carbonGradient.addColorStop(0.75, config.colors.secondary || '#333333');
  carbonGradient.addColorStop(1, config.colors.primary);

  // Ombre nette
  if (config.effects.shadow?.enabled) {
    ctx.shadowColor = config.effects.shadow.color || 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = (config.effects.shadow.blur || 4) * scaleFactor;
    ctx.shadowOffsetX = (config.effects.shadow.offsetX || 2) * scaleFactor;
    ctx.shadowOffsetY = (config.effects.shadow.offsetY || 2) * scaleFactor;
  }

  // Bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = carbonGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();

  // Reflet carbone subtil
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const carbonHighlight = ctx.createLinearGradient(
    centerX, centerY - radius,
    centerX, centerY - radius * 0.9
  );
  carbonHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  carbonHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI * 1.4, Math.PI * 1.6);
  ctx.strokeStyle = carbonHighlight;
  ctx.lineWidth = borderWidth * 0.3;
  ctx.stroke();

  ctx.restore();
};
