
import { getThemeColors } from './WheelThemes';

interface Segment {
  label: string;
  color?: string;
  image?: string | null;
}

interface WheelSegmentDrawerProps {
  ctx: CanvasRenderingContext2D;
  segments: Segment[];
  rotation: number;
  center: number;
  radius: number;
  size: number;
  theme: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  borderOutlineColor: string;
}

export const drawWheelSegments = ({
  ctx,
  segments,
  rotation,
  center,
  radius,
  size,
  theme,
  customColors,
  borderOutlineColor
}: WheelSegmentDrawerProps) => {
  const total = segments.length;
  const anglePerSlice = (2 * Math.PI) / total;
  
  // Priorité absolue aux couleurs personnalisées si définies
  const themeColors = customColors && customColors.primary ? 
    [customColors.primary, customColors.secondary, customColors.accent || customColors.secondary] :
    getThemeColors(theme);

  console.log('WheelSegmentDrawer - Couleurs utilisées:', themeColors);
  console.log('WheelSegmentDrawer - CustomColors reçues:', customColors);

  segments.forEach((seg: Segment, i: number) => {
    const startAngle = i * anglePerSlice + rotation;
    const endAngle = startAngle + anglePerSlice;

    // Draw segment - toujours utiliser la couleur du segment si définie, sinon les couleurs du thème
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius + 15, startAngle, endAngle);
    ctx.closePath();
    
    // Forcer l'utilisation des couleurs personnalisées
    const segmentColor = seg.color || themeColors[i % themeColors.length];
    ctx.fillStyle = segmentColor;
    ctx.fill();

    // Draw golden separator lines
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(
      center + (radius + 15) * Math.cos(startAngle),
      center + (radius + 15) * Math.sin(startAngle)
    );
    ctx.strokeStyle = borderOutlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text - VALIDATION CRITIQUE du label
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + anglePerSlice / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.max(12, size * 0.04)}px Arial`;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    
    // SÉCURITÉ: Vérifier que le label est valide avant de l'afficher
    const safeLabel = seg.label && typeof seg.label === 'string' && seg.label.length < 50 
      ? seg.label 
      : `Segment ${i + 1}`;
    
    try {
      ctx.strokeText(safeLabel, radius - 30, 5);
      ctx.fillText(safeLabel, radius - 30, 5);
    } catch (error) {
      console.error('Error drawing segment text:', error);
      // Fallback text en cas d'erreur
      ctx.strokeText(`Segment ${i + 1}`, radius - 30, 5);
      ctx.fillText(`Segment ${i + 1}`, radius - 30, 5);
    }
    ctx.restore();

    // SÉCURITÉ: Validation stricte de l'image avant chargement
    if (seg.image && typeof seg.image === 'string') {
      // Vérifier que l'image n'est pas une chaîne corrompue
      const isValidImageUrl = (url: string) => {
        try {
          // Vérifier la longueur et le format
          if (url.length > 500) return false;
          if (url.includes('undefined') || url.includes('null')) return false;
          
          // Vérifier le format d'URL
          return url.startsWith('http') || 
                 url.startsWith('/') || 
                 url.startsWith('data:image/') ||
                 url.startsWith('blob:');
        } catch {
          return false;
        }
      };

      if (isValidImageUrl(seg.image)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const angle = startAngle + anglePerSlice / 2;
            const distance = radius - 20;
            const imgSize = Math.max(40, size * 0.15);
            const x = center + distance * Math.cos(angle) - imgSize / 2;
            const y = center + distance * Math.sin(angle) - imgSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x + imgSize / 2, y + imgSize / 2, imgSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, x, y, imgSize, imgSize);
            ctx.restore();
          } catch (error) {
            console.error('Error drawing segment image:', error);
          }
        };
        img.onerror = () => {
          console.warn('Failed to load segment image:', seg.image);
        };
        img.src = seg.image;
      } else {
        console.warn('Invalid image URL detected:', seg.image);
      }
    }
  });
};
