import { useCallback } from 'react';
import { usePurchase } from '../contexts/PurchaseContext';
import type { PremiumPlan } from '../types/premium';

interface UseVideoLimitReturn {
  // Status
  canWatchVideo: boolean;
  remainingVideos: number;
  dailyWatchCount: number;
  maxDailyLimit: number;
  isPremium: boolean;
  isLoading: boolean;
  isUnlimited: boolean;
  premiumPlan: PremiumPlan;

  // Actions
  checkAndIncrementWatch: () => Promise<boolean>;
  getStatusMessage: () => string;
}

/**
 * Custom hook for video limit functionality
 * Provides easy access to video limit state and actions
 */
export const useVideoLimit = (): UseVideoLimitReturn => {
  const {
    canWatchVideo,
    remainingVideos,
    dailyWatchCount,
    maxDailyLimit,
    isPremium,
    isLoading,
    isUnlimited,
    premiumPlan,
    incrementWatchCount,
  } = usePurchase();

  /**
   * Check if user can watch and increment count if yes
   * Returns true if video can be watched
   */
  const checkAndIncrementWatch = useCallback(async (): Promise<boolean> => {
    if (!canWatchVideo) {
      return false;
    }

    await incrementWatchCount();
    return true;
  }, [canWatchVideo, incrementWatchCount]);

  /**
   * Get a human-readable status message
   */
  const getStatusMessage = useCallback((): string => {
    if (isUnlimited) {
      return 'Premium: Unlimited sessions every day';
    }
    if (isPremium) {
      return `Premium: ${remainingVideos} of ${maxDailyLimit} videos left today`;
    }
    return `Free: ${remainingVideos} of ${maxDailyLimit} video left today`;
  }, [isPremium, isUnlimited, remainingVideos, maxDailyLimit]);

  return {
    canWatchVideo,
    remainingVideos,
    dailyWatchCount,
    maxDailyLimit,
    isPremium,
    isLoading,
    isUnlimited,
    premiumPlan,
    checkAndIncrementWatch,
    getStatusMessage,
  };
};
