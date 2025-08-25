
import { FieldConfig } from '../components/forms/DynamicContactForm';

export const DEFAULT_FIELDS: FieldConfig[] = [
  { id: "civilite", label: "Civilité", type: "select", options: ["M.", "Mme"], required: false },
  { id: "prenom", label: "Prénom", required: true },
  { id: "nom", label: "Nom", required: true },
  { id: "email", label: "Email", type: "email", required: true }
];

export const DEFAULT_WHEEL_SEGMENTS = [
  { label: 'Prix 1', color: '#ff6b6b' },
  { label: 'Prix 2', color: '#4ecdc4' },
  { label: 'Prix 3', color: '#45b7d1' },
  { label: 'Prix 4', color: '#96ceb4' },
  { label: 'Dommage', color: '#feca57' },
  { label: 'Rejouer', color: '#ff9ff3' }
] as const;

const calculateSegmentProbabilities = (segments: any[], prizes: any[]) => {
  if (!segments || segments.length === 0) return [];
  
  // Filtrer les lots avec méthode probability/immediate et disponibles
  const availablePrizes = prizes?.filter(p => {
    if (!p.method) return false;
    const method = String(p.method).toLowerCase();
    if (!['probability', 'immediate', 'probabilite', 'probabilité'].includes(method)) return false;
    
    // Vérifier si le lot est encore disponible
    if (typeof p.totalUnits === 'number' && typeof p.awardedUnits === 'number') {
      return (p.totalUnits - p.awardedUnits) > 0;
    }
    return true; // Si pas de limite définie, considérer comme disponible
  }) || [];
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎯 calculateSegmentProbabilities - Available prizes:', availablePrizes);
    console.log('🎯 calculateSegmentProbabilities - Segments:', segments);
  }
  
  // Calculer les probabilités assignées via les lots
  let totalAssignedProbability = 0;
  const segmentProbabilities = segments.map((segment: any) => {
    if (segment.prizeId) {
      const prize = availablePrizes.find(p => p.id === segment.prizeId);
      if (prize) {
        // Chercher le pourcentage de probabilité dans différents champs possibles
        const prob = prize.probabilityPercent || prize.probability || prize.percentage || prize.percent || 0;
        const normalizedProb = Math.max(0, Math.min(100, Number(prob)));
        totalAssignedProbability += normalizedProb;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🎯 Segment "${segment.label}" avec lot "${prize.name}": ${normalizedProb}%`);
        }
        
        return normalizedProb;
      }
    }
    return null; // Pas de lot assigné ou lot non disponible
  });
  
  // LOGIQUE SPÉCIALE: Si un lot a 100% de probabilité, les autres segments doivent avoir 0%
  const has100PercentPrize = segmentProbabilities.some(prob => prob === 100);
  
  if (has100PercentPrize) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎯 Lot à 100% détecté - application de la logique garantie');
    }
    // Seuls les segments avec 100% gardent leur probabilité, les autres à 0
    const finalProbabilities = segmentProbabilities.map(prob => {
      return prob === 100 ? 100 : 0;
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎯 Probabilités finales (100% forcé):', finalProbabilities);
    }
    
    return finalProbabilities;
  }
  
  // Logique normale: distribuer le résiduel aux segments sans lots
  const residual = Math.max(0, 100 - totalAssignedProbability);
  const segmentsWithoutPrizes = segmentProbabilities.filter(p => p === null).length;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎯 Total assigné: ${totalAssignedProbability}%, Résiduel: ${residual}%, Segments sans lots: ${segmentsWithoutPrizes}`);
  }
  
  // Si pas de résiduel, les segments sans lots restent à 0
  const residualPerSegment = (residual > 0 && segmentsWithoutPrizes > 0) ? residual / segmentsWithoutPrizes : 0;
  
  const finalProbabilities = segmentProbabilities.map(prob => {
    if (prob === null) {
      return residualPerSegment;
    }
    return prob;
  });
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎯 Probabilités finales:', finalProbabilities);
  }
  
  return finalProbabilities;
};

export const getWheelSegments = (campaign: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Campaign reçu:', campaign);
  }

  const hasImageBackground = campaign?.design?.background?.type === 'image';
  const extractedPrimary = campaign?.design?.extractedColors?.[0];
  const defaultPrimary = campaign?.config?.roulette?.segmentColor1 || campaign?.design?.wheelConfig?.borderColor || '#ff6b6b';
  const segmentColor1 = hasImageBackground && extractedPrimary ? extractedPrimary : defaultPrimary;
  const segmentColor2 = '#ffffff';

  // Vérifier plusieurs sources pour les segments
  let originalSegments = 
    campaign?.gameConfig?.wheel?.segments || 
    campaign?.config?.roulette?.segments || 
    [];

  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Segments trouvés:', originalSegments);
  }

  // Si aucun segment n'est trouvé, ne pas utiliser les segments par défaut
  // pour permettre l'affichage du message "Ajoutez des segments"
  if (!originalSegments || originalSegments.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('getWheelSegments - Aucun segment, retour tableau vide');
    }
    return [];
  }

  // Calculer les probabilités basées sur les lots
  const prizes = campaign?.prizes || [];
  const probabilities = calculateSegmentProbabilities(originalSegments, prizes);

  const segments = originalSegments.map((segment: any, index: number) => ({
    ...segment,
    color: segment.color || (index % 2 === 0 ? segmentColor1 : segmentColor2),
    textColor: segment.textColor || (index % 2 === 0 ? segmentColor2 : segmentColor1),
    id: segment.id || `segment-${index}`,
    // Normaliser l'image pour les moteurs canvas: utiliser 'image' si présent, sinon mapper 'imageUrl' -> 'image'
    image: segment.image ?? segment.imageUrl ?? undefined,
    // CRUCIAL: Ajouter la probabilité calculée
    probability: probabilities[index] || 1
  }));

  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Segments finaux avec probabilités:', segments);
  }
  return segments;
};

export const getWheelDimensions = (
  gameDimensions: any,
  gamePosition: string,
  shouldCropWheel: boolean
) => {
  const baseCanvasSize = Math.min(gameDimensions.width, gameDimensions.height) - 60;
  const canvasSize = baseCanvasSize;
  const containerWidth =
    shouldCropWheel && (gamePosition === 'left' || gamePosition === 'right')
      ? baseCanvasSize * 0.5
      : baseCanvasSize;

  const containerHeight =
    shouldCropWheel && gamePosition === 'bottom' ? baseCanvasSize * 0.5 : baseCanvasSize;

  const pointerSize = Math.max(30, canvasSize * 0.08);

  return { canvasSize, containerWidth, containerHeight, pointerSize };
};
