export type CardItem = {
  id: string;
  title: string;
  image: string;
};

export type SwiperConfig = {
  cards: CardItem[];
  likeThreshold?: number;
  passThreshold?: number;
};

export type SwiperResult = {
  liked: CardItem[];
  passed: CardItem[];
  completed: boolean;
};
