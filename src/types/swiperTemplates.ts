export interface SwiperTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    containerWidth: number;
    backgroundColor: string;
    borderRadius: number | string;
    padding: number | string;
    boxShadow: string;
    fontFamily: string;
  };
}

export const swiperTemplates: SwiperTemplate[] = [
  {
    id: 'swiper-default',
    name: 'Swiper par défaut',
    description: 'Template de base pour mécaniques de swipe',
    preview: '/templates/swiper-default.png',
    style: {
      containerWidth: 450,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }
];
