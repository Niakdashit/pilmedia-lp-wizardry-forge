
interface Segment {
  label: string;
  color?: string;
  image?: string | null;
  id?: string | number;
  textColor?: string;
  probability?: number;
}

export const validateSegment = (segment: any, index: number): Segment => {
  // Validate and sanitize label
  let label = 'Segment sans nom';
  if (segment?.label && typeof segment.label === 'string') {
    // Remove any non-printable characters and limit length
    label = segment.label
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters
      .substring(0, 50) // Limit length
      .trim();
    
    // If after cleaning the label is empty or looks like encoded data, use fallback
    if (!label || label.length < 1 || /^[A-Za-z0-9+/=]{20,}$/.test(label)) {
      label = `Segment ${index + 1}`;
    }
  } else {
    label = `Segment ${index + 1}`;
  }

  // Validate color (must be a valid hex color)
  let color = segment?.color;
  if (!color || typeof color !== 'string' || !/^#[0-9A-F]{6}$/i.test(color)) {
    const defaultColors = ['#841b60', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    color = defaultColors[index % defaultColors.length];
  }

  // Validate text color
  let textColor = segment?.textColor;
  if (!textColor || typeof textColor !== 'string' || !/^#[0-9A-F]{6}$/i.test(textColor)) {
    textColor = '#ffffff';
  }

  // Validate image URL
  let image = null;
  if (segment?.image && typeof segment.image === 'string') {
    // Check if it's a valid URL or data URI, not corrupted text
    if (segment.image.startsWith('http') || segment.image.startsWith('/') || segment.image.startsWith('data:image/')) {
      // Additional check: if it looks like corrupted base64 or very long string, ignore it
      if (segment.image.length < 500 && !segment.image.includes('undefined')) {
        image = segment.image;
      } else {
        console.warn(`Invalid image data detected for segment ${index}:`, segment.image.substring(0, 100));
      }
    }
  }

  // Validate probability
  let probability = 1;
  if (typeof segment?.probability === 'number' && segment.probability > 0) {
    probability = Math.max(1, Math.min(100, segment.probability));
  }

  return {
    label,
    color,
    textColor,
    image,
    probability,
    id: segment?.id || index
  };
};

export const validateSegments = (segments: any[]): Segment[] => {
  if (!Array.isArray(segments)) {
    console.warn('Invalid segments data, using empty array');
    return [];
  }

  const validatedSegments = segments.map((segment, index) => {
    try {
      return validateSegment(segment, index);
    } catch (error) {
      console.error(`Error validating segment ${index}:`, error);
      return validateSegment({}, index); // Fallback to default segment
    }
  });

  // Filter out any segments that might still be problematic
  return validatedSegments.filter(segment => 
    segment.label && 
    segment.label.length > 0 && 
    segment.label.length < 100
  );
};
