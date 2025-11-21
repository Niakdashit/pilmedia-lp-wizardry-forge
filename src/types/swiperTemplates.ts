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
  // Tinder Style
  {
    id: 'swiper-tinder',
    name: 'Tinder Style',
    description: 'Style de swipe inspiré de Tinder',
    preview: '/templates/swiper-tinder.png',
    style: {
      containerWidth: 400,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '0',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      fontFamily: 'Proxima Nova, sans-serif'
    }
  },

  // Instagram Stories
  {
    id: 'swiper-instagram',
    name: 'Instagram Stories',
    description: 'Style Instagram Stories',
    preview: '/templates/swiper-instagram.png',
    style: {
      containerWidth: 420,
      backgroundColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)',
      borderRadius: 20,
      padding: '16px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      fontFamily: 'system-ui, sans-serif'
    }
  },

  // TikTok Feed
  {
    id: 'swiper-tiktok',
    name: 'TikTok Feed',
    description: 'Style de feed TikTok vertical',
    preview: '/templates/swiper-tiktok.png',
    style: {
      containerWidth: 380,
      backgroundColor: '#000000',
      borderRadius: 0,
      padding: '20px',
      boxShadow: '0 0 40px rgba(254, 44, 85, 0.3)',
      fontFamily: 'Proxima Nova, sans-serif'
    }
  },

  // Bumble Cards
  {
    id: 'swiper-bumble',
    name: 'Bumble Cards',
    description: 'Cartes de swipe style Bumble',
    preview: '/templates/swiper-bumble.png',
    style: {
      containerWidth: 410,
      backgroundColor: '#ffc629',
      borderRadius: 24,
      padding: '24px',
      boxShadow: '0 6px 20px rgba(255, 198, 41, 0.3)',
      fontFamily: 'system-ui, sans-serif'
    }
  },

  // Netflix Carousel
  {
    id: 'swiper-netflix',
    name: 'Netflix Carousel',
    description: 'Style carrousel Netflix',
    preview: '/templates/swiper-netflix.png',
    style: {
      containerWidth: 500,
      backgroundColor: '#141414',
      borderRadius: 4,
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      fontFamily: 'Netflix Sans, sans-serif'
    }
  },

  // Spotify Discover
  {
    id: 'swiper-spotify',
    name: 'Spotify Discover',
    description: 'Style découverte Spotify',
    preview: '/templates/swiper-spotify.png',
    style: {
      containerWidth: 440,
      backgroundColor: '#121212',
      borderRadius: 8,
      padding: '24px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      fontFamily: 'Circular, sans-serif'
    }
  },

  // Pinterest Masonry
  {
    id: 'swiper-pinterest',
    name: 'Pinterest Masonry',
    description: 'Style mosaïque Pinterest',
    preview: '/templates/swiper-pinterest.png',
    style: {
      containerWidth: 460,
      backgroundColor: '#efefef',
      borderRadius: 16,
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, sans-serif'
    }
  },

  // Apple Card Style
  {
    id: 'swiper-apple',
    name: 'Apple Card',
    description: 'Design minimaliste Apple',
    preview: '/templates/swiper-apple.png',
    style: {
      containerWidth: 420,
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, sans-serif'
    }
  },

  // Airbnb Experiences
  {
    id: 'swiper-airbnb',
    name: 'Airbnb Experiences',
    description: 'Style expériences Airbnb',
    preview: '/templates/swiper-airbnb.png',
    style: {
      containerWidth: 450,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
      fontFamily: 'Circular, sans-serif'
    }
  },

  // Snapchat Discover
  {
    id: 'swiper-snapchat',
    name: 'Snapchat Discover',
    description: 'Style Snapchat Discover',
    preview: '/templates/swiper-snapchat.png',
    style: {
      containerWidth: 400,
      backgroundColor: '#fffc00',
      borderRadius: 0,
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontFamily: 'Avenir Next, sans-serif'
    }
  },

  // LinkedIn Feed
  {
    id: 'swiper-linkedin',
    name: 'LinkedIn Feed',
    description: 'Style feed professionnel LinkedIn',
    preview: '/templates/swiper-linkedin.png',
    style: {
      containerWidth: 480,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, sans-serif'
    }
  },

  // YouTube Shorts
  {
    id: 'swiper-youtube',
    name: 'YouTube Shorts',
    description: 'Style YouTube Shorts vertical',
    preview: '/templates/swiper-youtube.png',
    style: {
      containerWidth: 380,
      backgroundColor: '#0f0f0f',
      borderRadius: 12,
      padding: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      fontFamily: 'Roboto, sans-serif'
    }
  },

  // Template par défaut (conservé)
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
