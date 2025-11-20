import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Alert, Platform, AppState } from 'react-native';
import type { PurchaseError } from 'react-native-iap';
import {
  initIAP,
  disconnectIAP,
  setupPurchaseListeners,
  fetchProducts,
  purchaseProduct,
  restorePurchases,
  IAPProduct,
  ProductId,
  PRODUCT_IDS,
} from '../services/iapService';
import {
  getAllStorageData,
  setIsPremium,
  setDailyWatchCount,
  setLastWatchDate,
  getLastWatchDate,
  resetDailyWatchCount,
  setPremiumPlan as persistPremiumPlan,
} from '../services/storageService';
import { useReviewPrompt } from '../hooks/useReviewPrompt';
import {
  PremiumPlan,
  PREMIUM_PLAN_LIMITS,
  isUnlimitedPlan,
} from '../types/premium';

// Video limits
const FREE_DAILY_LIMIT = 1;

interface PurchaseContextType {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;
  premiumPlan: PremiumPlan;
  isUnlimited: boolean;

  // Video limits
  dailyWatchCount: number;
  maxDailyLimit: number;
  canWatchVideo: boolean;
  remainingVideos: number;

  // Products
  products: IAPProduct[];
  isLoadingProducts: boolean;
  productsError: string | null;

  // Actions
  purchase: (productId?: ProductId) => Promise<void>;
  restore: () => Promise<void>;
  incrementWatchCount: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  retryLoadProducts: () => Promise<void>;
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
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [premiumPlan, setPremiumPlanState] = useState<PremiumPlan>('free');
  const { recordPositiveEvent } = useReviewPrompt();

  // Calculate max daily limit based on premium status
  const planLimit = PREMIUM_PLAN_LIMITS[premiumPlan] ?? FREE_DAILY_LIMIT;
  const isUnlimited = isUnlimitedPlan(premiumPlan);
  const maxDailyLimit = premiumPlan === 'free' ? FREE_DAILY_LIMIT : planLimit;

  // Check if user can watch more videos today
  const canWatchVideo = isUnlimited || dailyWatchCount < maxDailyLimit;

  // Calculate remaining videos for today
  const remainingVideos = isUnlimited
    ? Infinity
    : Math.max(0, maxDailyLimit - dailyWatchCount);

  const applyPremiumPlan = (plan: PremiumPlan): void => {
    setPremiumPlanState(plan);
    setIsPremiumState(plan !== 'free');
  };

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
      let plan = storageData.premiumPlan;
      if (plan === 'free' && storageData.isPremium) {
        plan = 'lifetime';
        void persistPremiumPlan('lifetime');
      }
      applyPremiumPlan(plan);
      setDailyWatchCountState(storageData.dailyWatchCount);

      // Check for new day and reset if needed
      await checkAndResetDailyCount();

      // NOTE: We don't automatically check IAP status on launch to avoid Apple ID prompts.
      // Premium status is restored from AsyncStorage.
      // Users can explicitly restore purchases via the "Restore Purchases" button if needed.

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
        setProductsError('In-app purchases are only available on iOS devices');
        return;
      }

      setIsLoadingProducts(true);
      setProductsError(null);

      const connected = await initIAP();
      if (connected) {
        // Fetch available products
        const availableProducts = await fetchProducts();

        if (availableProducts.length === 0) {
          setProductsError(
            'Pricing unavailable. Confirm the in-app purchase is “Ready to Submit/Approved” in App Store Connect, product IDs match, and you are signed into the device with a Sandbox tester.'
          );
          console.warn('No products fetched - possible network issue or App Store Connect configuration');
        } else {
          setProducts(availableProducts);
          setProductsError(null);
          console.log('Products fetched successfully:', availableProducts);
        }
      } else {
        setProductsError('Unable to connect to the App Store. Please try again.');
      }
    } catch (error: any) {
      // Gracefully handle when IAP is not available (e.g., simulator, unsupported platform)
      if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
        console.warn('IAP not available on this device/platform - this is expected in simulator or development');
        setProductsError('In-app purchases are not available in the simulator. Please test on a real device.');
      } else {
        console.error('Error initializing IAP:', error);
        setProductsError(
          'Unable to load pricing. Please ensure you are online, signed in with a Sandbox tester, and the product is approved in App Store Connect.'
        );
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  /**
   * Retry loading products
   */
  const retryLoadProducts = useCallback(async () => {
    await initializeIAP();
  }, [initializeIAP]);

  /**
   * Handle successful purchase
   */
  const handlePurchaseSuccess = useCallback(async (plan: PremiumPlan) => {
    applyPremiumPlan(plan);
    await setIsPremium(true);
    await persistPremiumPlan(plan);

    const limit = PREMIUM_PLAN_LIMITS[plan];
    const message = isUnlimitedPlan(plan)
      ? 'You now have unlimited sessions every day!'
      : `You can now watch up to ${limit} videos per day!`;

    Alert.alert('Purchase Successful!', message, [{ text: 'Great!' }]);
    void recordPositiveEvent('purchase');
  }, [recordPositiveEvent]);

  /**
   * Handle purchase error
   */
  const handlePurchaseError = useCallback((error: PurchaseError) => {
    if (error.code === 'E_USER_CANCELLED') {
      console.log('User cancelled purchase');
      return;
    }

    console.error('Purchase error:', error);

    // Provide more specific error messages
    let title = 'Purchase Failed';
    let message = 'There was an error processing your purchase. Please try again.';

    if (error.code === 'E_IAP_NOT_AVAILABLE') {
      title = 'Purchases Not Available';
      message = 'In-app purchases are not available on this device or simulator.';
    } else if (error.code === 'E_UNKNOWN') {
      title = 'Setup Required';
      message = 'The purchase product is not configured. Please set up the in-app purchase in App Store Connect and sign in with a sandbox test account. See IAP_SETUP_GUIDE.md for details.';
    } else if (error.code === 'E_NETWORK_ERROR') {
      title = 'Network Error';
      message = 'Please check your internet connection and try again.';
    } else if (error.message) {
      message = `Error: ${error.message}\n\nCode: ${error.code}`;
    }

    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  /**
   * Make a purchase
   */
  const purchase = useCallback(async (productId?: ProductId) => {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'Not Supported',
        'Purchases are only available on iOS devices at this time.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      let targetProduct = productId;
      if (!targetProduct) {
        const defaultProduct = products[0]?.productId as ProductId | undefined;
        targetProduct = defaultProduct ?? PRODUCT_IDS.PREMIUM_VIDEOS;
      }
      await purchaseProduct(targetProduct);
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
  }, [products]);

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      const restoredPlan = await restorePurchases();

      if (restoredPlan) {
        applyPremiumPlan(restoredPlan);
        await setIsPremium(true);
        await persistPremiumPlan(restoredPlan);
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
    // Wrap everything in try-catch to handle any IAP-related errors
    const initialize = async () => {
      try {
        await loadInitialData();
        await initializeIAP();
      } catch (error: any) {
        if (!error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
          console.error('Error during initialization:', error);
        }
      }
    };

    initialize();

    // Setup purchase listeners
    let cleanupListeners: (() => void) | undefined;

    if (Platform.OS === 'ios') {
      try {
        cleanupListeners = setupPurchaseListeners(
          handlePurchaseSuccess,
          handlePurchaseError
        );
      } catch (error: any) {
        if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
          console.warn('IAP listeners not available - running without IAP support');
        } else {
          console.error('Error setting up purchase listeners:', error);
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (cleanupListeners) {
        try {
          cleanupListeners();
        } catch (error) {
          // Silently handle cleanup errors
        }
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
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkAndResetDailyCount();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAndResetDailyCount]);

  const value: PurchaseContextType = {
    isPremium,
    isLoading,
    premiumPlan,
    isUnlimited,
    dailyWatchCount,
    maxDailyLimit,
    canWatchVideo,
    remainingVideos,
    products,
    isLoadingProducts,
    productsError,
    purchase,
    restore,
    incrementWatchCount,
    refreshStatus,
    retryLoadProducts,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};
