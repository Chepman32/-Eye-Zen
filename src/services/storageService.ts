import AsyncStorage from './asyncStorageAdapter';

// Storage keys
const STORAGE_KEYS = {
  IS_PREMIUM: '@eyezen_is_premium',
  DAILY_WATCH_COUNT: '@eyezen_daily_watch_count',
  LAST_WATCH_DATE: '@eyezen_last_watch_date',
} as const;

export interface StorageData {
  isPremium: boolean;
  dailyWatchCount: number;
  lastWatchDate: string | null;
}

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
    const [isPremium, dailyWatchCount, lastWatchDate] = await Promise.all([
      getIsPremium(),
      getDailyWatchCount(),
      getLastWatchDate(),
    ]);

    return {
      isPremium,
      dailyWatchCount,
      lastWatchDate,
    };
  } catch (error) {
    console.error('Error reading storage data:', error);
    return {
      isPremium: false,
      dailyWatchCount: 0,
      lastWatchDate: null,
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
