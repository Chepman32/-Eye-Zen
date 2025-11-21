import { Platform, NativeModules } from 'react-native';
import { setIsPremium, setPremiumPlan } from './storageService';
import type { PremiumPlan } from '../types/premium';

// Conditional imports to avoid crashes when IAP is not available
let initConnection: any;
let endConnection: any;
let getProducts: any;
let requestPurchase: any;
let finishTransaction: any;
let purchaseUpdatedListener: any;
let purchaseErrorListener: any;
let getAvailablePurchases: any;

// Check if IAP native modules are available
const isIAPAvailable = Platform.OS === 'ios' &&
  (NativeModules.RNIapIos || NativeModules.RNIapIosSk2);

// Only import IAP if native modules are available
if (isIAPAvailable) {
  try {
    const IAP = require('react-native-iap');
    initConnection = IAP.initConnection;
    endConnection = IAP.endConnection;
    getProducts = IAP.getProducts;
    requestPurchase = IAP.requestPurchase;
    finishTransaction = IAP.finishTransaction;
    purchaseUpdatedListener = IAP.purchaseUpdatedListener;
    purchaseErrorListener = IAP.purchaseErrorListener;
    getAvailablePurchases = IAP.getAvailablePurchases;
  } catch (error) {
    console.warn('IAP module not available:', error);
  }
}

// Type imports
export type { PurchaseError, Product, Purchase } from 'react-native-iap';

// Product IDs - MUST match exactly what you create in App Store Connect
export const PRODUCT_IDS = {
  PREMIUM_VIDEOS: 'com.eyeszen.antonchepur.app.dailyfive', // iOS non-consumable lifetime product
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

// Map product IDs to internal plan types
const PRODUCT_PLAN_MAP: Record<ProductId, PremiumPlan> = {
  [PRODUCT_IDS.PREMIUM_VIDEOS]: 'lifetime',
};

// iOS product IDs array
const IOS_PRODUCT_IDS: ProductId[] = Object.values(PRODUCT_IDS);

const PLAN_PRIORITY: Record<PremiumPlan, number> = {
  free: 0,
  lifetime: 1,
};

const getPlanForProduct = (productId: string): PremiumPlan | null => {
  return PRODUCT_PLAN_MAP[productId as ProductId] ?? null;
};

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
}

/**
 * Initialize IAP connection
 * Call this when app starts
 */
export const initIAP = async (): Promise<boolean> => {
  if (!isIAPAvailable || !initConnection) {
    console.warn('IAP not available - running on unsupported platform or simulator');
    return false;
  }

  try {
    const result = await initConnection();
    console.log('IAP Connection initialized:', result);
    return true;
  } catch (error: any) {
    if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.warn('IAP not available - running on unsupported platform or simulator');
    } else {
      console.error('Error initializing IAP connection:', error);
    }
    return false;
  }
};

/**
 * End IAP connection
 * Call this when app unmounts
 */
export const disconnectIAP = async (): Promise<void> => {
  if (!isIAPAvailable || !endConnection) {
    return;
  }

  try {
    await endConnection();
    console.log('IAP Connection ended');
  } catch (error: any) {
    if (!error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.error('Error ending IAP connection:', error);
    }
  }
};

/**
 * Wraps a promise with a timeout
 * If the promise doesn't resolve within the timeout, it rejects
 */
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
};

/**
 * Get available products from App Store
 */
export const fetchProducts = async (): Promise<IAPProduct[]> => {
  if (!isIAPAvailable || !getProducts) {
    console.warn('IAP not available - cannot fetch products');
    return [];
  }

  try {
    console.log('🛒 Fetching products with IDs:', IOS_PRODUCT_IDS);
    console.log('📱 Platform:', Platform.OS);
    console.log('🔧 IAP Module Available:', isIAPAvailable);
    console.log('📊 Product IDs array length:', IOS_PRODUCT_IDS.length);
    console.log('📊 Product IDs array:', JSON.stringify(IOS_PRODUCT_IDS));
    console.log('📊 getProducts function available:', typeof getProducts);
    console.log('🕐 Starting product fetch at:', new Date().toISOString());

    // Validate product IDs array
    if (!IOS_PRODUCT_IDS || IOS_PRODUCT_IDS.length === 0) {
      throw new Error('Product IDs array is empty or undefined');
    }

    const startTime = Date.now();

    // In react-native-iap v13.x, getProducts requires { skus: string[] }
    // Wrap with 10-second timeout to prevent infinite hanging
    const products: any[] = await withTimeout(
      getProducts({ skus: IOS_PRODUCT_IDS }),
      10000,
      'Product fetch timed out after 10 seconds. Please check your internet connection and try again.'
    );

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Successfully fetched ${products.length} products from App Store in ${elapsedTime}ms`);

    if (products.length === 0) {
      console.warn('\n⚠️  NO PRODUCTS RETURNED FROM APP STORE');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('Possible causes:');
      console.warn('  1. ❌ Product status is "Waiting for Review" or "Pending" in App Store Connect');
      console.warn('     → Products must be "Ready to Submit" or "Approved" for sandbox testing');
      console.warn('     → Check: https://appstoreconnect.apple.com → In-App Purchases');
      console.warn('  2. ❌ Product IDs do not match exactly');
      console.warn('     → Expected:', IOS_PRODUCT_IDS);
      console.warn('  3. ❌ Not signed in with Sandbox tester account');
      console.warn('     → Check: Settings → App Store → Sandbox Account on device');
      console.warn('  4. ❌ Products not configured in App Store Connect');
      console.warn('  5. ⏳ Product recently created (allow 2-4 hours for propagation)');
      console.warn('\n💡 Testing alternatives:');
      console.warn('  • Use iOS Simulator with StoreKit Configuration file');
      console.warn('  • Ensure Xcode scheme has StoreKit Configuration enabled');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    return products.map((product: any) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      localizedPrice: product.localizedPrice,
    }));
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error?.message?.includes('timed out')) {
      console.error('\n⏱️  PRODUCT FETCH TIMEOUT');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('The request to fetch products from the App Store took too long (>10s).');
      console.error('Possible causes:');
      console.error('  1. ❌ Slow or unstable internet connection');
      console.error('  2. ❌ App Store servers are slow to respond');
      console.error('  3. ❌ Product IDs may be invalid, causing StoreKit to hang');
      console.error('  4. ❌ StoreKit connection issue on device');
      console.error('  5. ❌ Sandbox account may not be properly configured');
      console.error('\n💡 Recommended actions:');
      console.error('  • Check your internet connection');
      console.error('  • Verify sandbox account in Settings → App Store');
      console.error('  • Try again in a few moments');
      console.error('  • Test on iOS Simulator with StoreKit Configuration');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return [];
    }

    if (!error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.error('\n❌ ERROR FETCHING PRODUCTS FROM APP STORE');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error Details:');
      console.error('  Code:', error?.code || 'N/A');
      console.error('  Message:', error?.message || 'Unknown error');
      console.error('  Product IDs attempted:', IOS_PRODUCT_IDS);
      console.error('\nFull error object:', JSON.stringify(error, null, 2));
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    return [];
  }
};

/**
 * Request purchase for premium videos
 */
export const purchaseProduct = async (productId: ProductId): Promise<boolean> => {
  if (!isIAPAvailable || !requestPurchase) {
    console.warn('IAP not available - cannot make purchase');
    return false;
  }

  try {
    await requestPurchase({
      sku: productId,
    });
    // Purchase processing happens in the listener
    return true;
  } catch (error: any) {
    if (error.code === 'E_USER_CANCELLED') {
      console.log('User cancelled the purchase');
    } else {
      console.error('Error requesting purchase:', error);
    }
    return false;
  }
};

/**
 * Verify and process a purchase
 * Returns the plan that was activated if successful
 */
export const verifyPurchase = async (purchase: any): Promise<PremiumPlan | null> => {
  if (!isIAPAvailable || !finishTransaction) {
    console.warn('IAP not available - cannot verify purchase');
    return null;
  }

  try {
    // For production, you should verify receipt with your backend server
    // For now, we'll do basic client-side validation

    const plan = getPlanForProduct(purchase.productId);
    if (plan) {
      // Mark as premium in storage
      await setIsPremium(true);
      await setPremiumPlan(plan);

      // Finish the transaction
      await finishTransaction({ purchase, isConsumable: false });

      console.log('Purchase verified and completed');
      return plan;
    }

    return null;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return null;
  }
};

/**
 * Restore previous purchases
 * Required by Apple for non-consumable purchases
 */
export const restorePurchases = async (): Promise<PremiumPlan | null> => {
  if (!isIAPAvailable || !getAvailablePurchases) {
    console.warn('IAP not available - cannot restore purchases');
    return null;
  }

  try {
    const purchases = await getAvailablePurchases();
    let restoredPlan: PremiumPlan | null = null;

    if (purchases && purchases.length > 0) {
      purchases.forEach((purchase: any) => {
        const plan = getPlanForProduct(purchase.productId);
        if (plan) {
          if (
            !restoredPlan ||
            PLAN_PRIORITY[plan] > PLAN_PRIORITY[restoredPlan]
          ) {
            restoredPlan = plan;
          }
        }
      });

      if (restoredPlan) {
        await setIsPremium(true);
        await setPremiumPlan(restoredPlan);
        console.log(`Premium purchase restored (${restoredPlan})`);
        return restoredPlan;
      }
    }

    console.log('No purchases to restore');
    return null;
  } catch (error: any) {
    if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.warn('IAP not available - cannot restore purchases');
    } else {
      console.error('Error restoring purchases:', error);
    }
    return null;
  }
};

/**
 * Setup purchase listeners
 * Returns cleanup function
 */
export const setupPurchaseListeners = (
  onPurchaseSuccess: (plan: PremiumPlan) => void,
  onPurchaseError: (error: any) => void
): (() => void) => {
  if (!isIAPAvailable || !purchaseUpdatedListener || !purchaseErrorListener) {
    console.warn('IAP not available - cannot setup purchase listeners');
    return () => {}; // Return empty cleanup function
  }

  // Listen for purchase updates
  const purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: any) => {
      console.log('Purchase updated:', purchase);

      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          // Verify and process the purchase
          const plan = await verifyPurchase(purchase);

          if (plan) {
            onPurchaseSuccess(plan);
          }
        } catch (error) {
          console.error('Error processing purchase:', error);
        }
      }
    }
  );

  // Listen for purchase errors
  const purchaseErrorSubscription = purchaseErrorListener(
    (error: any) => {
      console.warn('Purchase error:', error);
      onPurchaseError(error);
    }
  );

  // Return cleanup function
  return () => {
    purchaseUpdateSubscription?.remove();
    purchaseErrorSubscription?.remove();
  };
};

/**
 * Check if user has active premium purchase
 */
export const checkPremiumStatus = async (): Promise<PremiumPlan | null> => {
  if (!isIAPAvailable || !getAvailablePurchases) {
    console.warn('IAP not available - cannot check purchase status');
    return null;
  }

  try {
    const purchases = await getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      let detectedPlan: PremiumPlan | null = null;
      purchases.forEach((purchase: any) => {
        const plan = getPlanForProduct(purchase.productId);
        if (
          plan &&
          (!detectedPlan ||
            PLAN_PRIORITY[plan] > PLAN_PRIORITY[detectedPlan])
        ) {
          detectedPlan = plan;
        }
      });

      if (detectedPlan) {
        await setIsPremium(true);
        await setPremiumPlan(detectedPlan);
        return detectedPlan;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.warn('IAP not available - cannot check purchase status');
    } else {
      console.error('Error checking premium status:', error);
    }
    return null;
  }
};
