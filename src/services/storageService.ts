import AsyncStorage from './asyncStorageAdapter';
import type { PremiumPlan } from '../types/premium';

// Storage keys
const STORAGE_KEYS = {
  IS_PREMIUM: '@eyezen_is_premium',
  DAILY_WATCH_COUNT: '@eyezen_daily_watch_count',
  LAST_WATCH_DATE: '@eyezen_last_watch_date',
  PREMIUM_PLAN: '@eyezen_premium_plan',
} as const;

export interface StorageData {
  isPremium: boolean;
  dailyWatchCount: number;
  lastWatchDate: string | null;
  premiumPlan: PremiumPlan;
}

/**
 * Generic storage service for key-value pairs
 */
export const storageService = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`@eyezen_${key}`);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(`@eyezen_${key}`, stringValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@eyezen_${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

/**
 * Get premium status from storage
 */
export const getIsPremium = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_PREMIUM);
    return value === 'true';
  } catch (error) {
    console.error('Error reading premium status:', error);
    return false;
  }
};

/**
 * Set premium status in storage
 */
export const setIsPremium = async (isPremium: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_PREMIUM, isPremium.toString());
  } catch (error) {
    console.error('Error saving premium status:', error);
  }
};

/**
 * Get premium plan type from storage
 */
export const getPremiumPlan = async (): Promise<PremiumPlan> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_PLAN);
    if (value === 'lifetime' || value === 'yearly') {
      return value;
    }
    return 'free';
  } catch (error) {
    console.error('Error reading premium plan:', error);
    return 'free';
  }
};

/**
 * Persist premium plan type
 */
export const setPremiumPlan = async (plan: PremiumPlan): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_PLAN, plan);
  } catch (error) {
    console.error('Error saving premium plan:', error);
  }
};

/**
 * Get daily watch count from storage
 */
export const getDailyWatchCount = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_WATCH_COUNT);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error reading watch count:', error);
    return 0;
  }
};

/**
 * Set daily watch count in storage
 */
export const setDailyWatchCount = async (count: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WATCH_COUNT, count.toString());
  } catch (error) {
    console.error('Error saving watch count:', error);
  }
};

/**
 * Get last watch date from storage
 */
export const getLastWatchDate = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_WATCH_DATE);
  } catch (error) {
    console.error('Error reading last watch date:', error);
    return null;
  }
};

/**
 * Set last watch date in storage
 */
export const setLastWatchDate = async (date: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_WATCH_DATE, date);
  } catch (error) {
    console.error('Error saving last watch date:', error);
  }
};

/**
 * Get all storage data at once
 */
export const getAllStorageData = async (): Promise<StorageData> => {
  try {
    const [isPremium, dailyWatchCount, lastWatchDate, premiumPlan] = await Promise.all([
      getIsPremium(),
      getDailyWatchCount(),
      getLastWatchDate(),
      getPremiumPlan(),
    ]);

    return {
      isPremium,
      dailyWatchCount,
      lastWatchDate,
      premiumPlan,
    };
  } catch (error) {
    console.error('Error reading storage data:', error);
    return {
      isPremium: false,
      dailyWatchCount: 0,
      lastWatchDate: null,
      premiumPlan: 'free',
    };
  }
};

/**
 * Clear all app data (useful for testing)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Reset daily watch count (called when new day detected)
 */
export const resetDailyWatchCount = async (): Promise<void> => {
  try {
    await setDailyWatchCount(0);
  } catch (error) {
    console.error('Error resetting watch count:', error);
  }
};
