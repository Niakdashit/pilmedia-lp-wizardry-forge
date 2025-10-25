// @ts-nocheck

import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GameResult, GameConfig } from '../types/game';

export const useGameResult = (campaignId: string, config: GameConfig) => {
  const checkWinningCondition = useCallback(async () => {
    if (!config.maxWinners || !config.winRate) return false;

    // Since this is a mock, we'll simulate having 0 winners
    const currentWinners = 0;

    // Check if we've reached max winners
    if (currentWinners >= config.maxWinners) {
      return false;
    }

    // Apply win rate probability
    return Math.random() <= config.winRate;
  }, [campaignId, config]);

  const saveResult = useCallback(async (result: Omit<GameResult, 'id' | 'createdAt'>) => {
    const insertResult = await supabase
      .from('game_results')
      .insert([{
        campaign_id: result.campaignId,
        user_id: result.userId,
        game_type: result.gameType,
        result: result.result,
        score: result.score,
        duration: result.duration,
        is_winner: result.isWinner
      }])
      .select()
      .single();

    if (insertResult.error) {
      console.error('Error saving game result:', insertResult.error);
      throw insertResult.error;
    }

    return insertResult.data;
  }, []);

  return {
    checkWinningCondition,
    saveResult
  };
};
