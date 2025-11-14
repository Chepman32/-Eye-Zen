import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import { PurchaseError } from 'react-native-iap';
import {
  initIAP,
  disconnectIAP,
  setupPurchaseListeners,
  fetchProducts,
  purchasePremium,
  restorePurchases,
  checkPremiumStatus,
  IAPProduct,
} from '../services/iapService';
import {
  getAllStorageData,
  setIsPremium,
  setDailyWatchCount,
  setLastWatchDate,
  getDailyWatchCount,
  getLastWatchDate,
  getIsPremium,
  resetDailyWatchCount,
} from '../services/storageService';

// Video limits
const FREE_DAILY_LIMIT = 1;
const PREMIUM_DAILY_LIMIT = 5;

interface PurchaseContextType {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;

  // Video limits
  dailyWatchCount: number;
  maxDailyLimit: number;
  canWatchVideo: boolean;
  remainingVideos: number;

  // Products
  products: IAPProduct[];

  // Actions
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  incrementWatchCount: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined
);

export const usePurchase = (): PurchaseContextType => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within PurchaseProvider');
  }
  return context;
};

interface PurchaseProviderProps {
  children: ReactNode;
}

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({
  children,
}) => {
  const [isPremium, setIsPremiumState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyWatchCount, setDailyWatchCountState] = useState(0);
  const [products, setProducts] = useState<IAPProduct[]>([]);

  // Calculate max daily limit based on premium status
  const maxDailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;

  // Check if user can watch more videos today
  const canWatchVideo = dailyWatchCount < maxDailyLimit;

  // Calculate remaining videos for today
  const remainingVideos = Math.max(0, maxDailyLimit - dailyWatchCount);

  /**
   * Check if it's a new day and reset count if needed
   */
  const checkAndResetDailyCount = useCallback(async () => {
    try {
      const lastWatchDate = await getLastWatchDate();
      const today = new Date().toDateString();

      if (lastWatchDate !== today) {
        // New day detected, reset count
        await resetDailyWatchCount();
        setDailyWatchCountState(0);
        console.log('Daily watch count reset for new day');
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  }, []);

  /**
   * Load initial data from storage
   */
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load data from storage
      const storageData = await getAllStorageData();
      setIsPremiumState(storageData.isPremium);
      setDailyWatchCountState(storageData.dailyWatchCount);

      // Check for new day and reset if needed
      await checkAndResetDailyCount();

      // Check premium status from IAP
      if (Platform.OS === 'ios') {
        const hasPremium = await checkPremiumStatus();
        if (hasPremium && !storageData.isPremium) {
          setIsPremiumState(true);
          await setIsPremium(true);
        }
      }

      console.log('Initial data loaded:', {
        isPremium: storageData.isPremium,
        dailyWatchCount: storageData.dailyWatchCount,
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkAndResetDailyCount]);

  /**
   * Initialize IAP and load products
   */
  const initializeIAP = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') {
        console.log('IAP only supported on iOS currently');
        return;
      }

      const connected = await initIAP();
      if (connected) {
        // Fetch available products
        const availableProducts = await fetchProducts();
        setProducts(availableProducts);
        console.log('Products fetched:', availableProducts);
      }
    } catch (error) {
      console.error('Error initializing IAP:', error);
    }
  }, []);

  /**
   * Handle successful purchase
   */
  const handlePurchaseSuccess = useCallback(async () => {
    setIsPremiumState(true);
    await setIsPremium(true);

    Alert.alert(
      'Purchase Successful!',
      `You can now watch up to ${PREMIUM_DAILY_LIMIT} videos per day!`,
      [{ text: 'Great!' }]
    );
  }, []);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: PurchaseError) => {
    if (error.code !== 'E_USER_CANCELLED') {
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  /**
   * Make a purchase
   */
  const purchase = useCallback(async () => {
    try {
      setIsLoading(true);
      await purchasePremium();
    } catch (error) {
      console.error('Error making purchase:', error);
      Alert.alert(
        'Purchase Error',
        'Unable to complete purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const restored = await restorePurchases();

      if (restored) {
        setIsPremiumState(true);
        Alert.alert(
          'Restore Successful',
          'Your premium purchase has been restored!',
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Increment watch count when user watches a video
   */
  const incrementWatchCount = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const newCount = dailyWatchCount + 1;

      // Update state
      setDailyWatchCountState(newCount);

      // Save to storage
      await setDailyWatchCount(newCount);
      await setLastWatchDate(today);

      console.log(`Watch count incremented to ${newCount}`);
    } catch (error) {
      console.error('Error incrementing watch count:', error);
    }
  }, [dailyWatchCount]);

  /**
   * Refresh status from storage and IAP
   */
  const refreshStatus = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  // Initialize on mount
  useEffect(() => {
    loadInitialData();
    initializeIAP();

    // Setup purchase listeners
    let cleanupListeners: (() => void) | undefined;

    if (Platform.OS === 'ios') {
      cleanupListeners = setupPurchaseListeners(
        handlePurchaseSuccess,
        handlePurchaseError
      );
    }

    // Cleanup on unmount
    return () => {
      if (cleanupListeners) {
        cleanupListeners();
      }
      disconnectIAP();
    };
  }, [
    loadInitialData,
    initializeIAP,
    handlePurchaseSuccess,
    handlePurchaseError,
  ]);

  // Check for new day periodically (every time app comes to foreground)
  useEffect(() => {
    const interval = setInterval(checkAndResetDailyCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkAndResetDailyCount]);

  const value: PurchaseContextType = {
    isPremium,
    isLoading,
    dailyWatchCount,
    maxDailyLimit,
    canWatchVideo,
    remainingVideos,
    products,
    purchase,
    restore,
    incrementWatchCount,
    refreshStatus,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};
