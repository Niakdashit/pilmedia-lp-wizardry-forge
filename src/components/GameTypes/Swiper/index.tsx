// @ts-nocheck
import { useState, useCallback } from "react";
import HealthySkinSwiper from "./HealthySkinSwiper";
import { CardItem } from "../../../types/game";
import { SwiperConfig, SwiperResult } from "./types";

interface SwiperProps {
  config?: SwiperConfig;
  campaign?: any;
  isPreview?: boolean;
  onComplete?: (result: SwiperResult) => void;
}

export default function Swiper({ config, campaign, isPreview = false, onComplete }: SwiperProps) {
  const [liked] = useState<CardItem[]>([]);
  const [passed] = useState<CardItem[]>([]);

  // Get cards from campaign config or config prop or use sample cards
  const cards = (campaign?.gameConfig as any)?.swiper?.cards || config?.cards || [
    { id: "1", title: "Fantastic Charm", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop" },
    { id: "2", title: "Radiant Routine", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" },
    { id: "3", title: "Calm & Clear", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop" },
    { id: "4", title: "Daily Glow", image: "https://images.unsplash.com/photo-1598515213691-84b2c46a1a1c?q=80&w=1600&auto=format&fit=crop" },
  ];

  return <HealthySkinSwiper cards={cards} />;
}
