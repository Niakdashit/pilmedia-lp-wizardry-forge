export interface SwiperCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  productName?: string;
  backgroundColor?: string;
}

export interface SwiperConfig {
  mainTitle: string;
  mainSubtitle?: string;
  cards: SwiperCard[];
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  accentColor: string;
  showLikeButton: boolean;
  showDislikeButton: boolean;
  showNextButton: boolean;
  enableSwipeGestures: boolean;
  cardBorderRadius: number;
  stackEffect: boolean;
}

export interface SwiperResult {
  likedCards: string[];
  dislikedCards: string[];
  skippedCards: string[];
  completedAt: Date;
}

export const defaultSwiperConfig: SwiperConfig = {
  mainTitle: 'Looking for Healthy Skin Tips?',
  mainSubtitle: '',
  cards: [
    {
      id: '1',
      title: 'Fantastic Charm',
      description: 'Your brief description of your product comes right here.',
      imageUrl: '',
      backgroundColor: '#FF6B9D'
    }
  ],
  backgroundColor: '#FF6B9D',
  cardBackgroundColor: '#FFFFFF',
  textColor: '#1E3A5F',
  accentColor: '#FF6B9D',
  showLikeButton: true,
  showDislikeButton: true,
  showNextButton: true,
  enableSwipeGestures: true,
  cardBorderRadius: 24,
  stackEffect: true
};
