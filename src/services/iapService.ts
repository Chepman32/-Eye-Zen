import { Platform, NativeModules } from 'react-native';
import { setIsPremium } from './storageService';

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
  PREMIUM_VIDEOS: 'com.eyeszen.antonchepur.app.dailyfive', // iOS product ID
} as const;

// iOS product IDs array
const IOS_PRODUCT_IDS = [PRODUCT_IDS.PREMIUM_VIDEOS];

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
 * Get available products from App Store
 */
export const fetchProducts = async (): Promise<IAPProduct[]> => {
  if (!isIAPAvailable || !getProducts) {
    console.warn('IAP not available - cannot fetch products');
    return [];
  }

  try {
    const products = await getProducts({ skus: IOS_PRODUCT_IDS });

    return products.map((product: any) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      localizedPrice: product.localizedPrice,
    }));
  } catch (error: any) {
    if (!error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.error('Error fetching products:', error);
    }
    return [];
  }
};

/**
 * Request purchase for premium videos
 */
export const purchasePremium = async (): Promise<boolean> => {
  if (!isIAPAvailable || !requestPurchase) {
    console.warn('IAP not available - cannot make purchase');
    return false;
  }

  try {
    await requestPurchase({
      sku: PRODUCT_IDS.PREMIUM_VIDEOS,
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
 * Returns true if purchase is valid
 */
export const verifyPurchase = async (purchase: any): Promise<boolean> => {
  if (!isIAPAvailable || !finishTransaction) {
    console.warn('IAP not available - cannot verify purchase');
    return false;
  }

  try {
    // For production, you should verify receipt with your backend server
    // For now, we'll do basic client-side validation

    if (purchase.productId === PRODUCT_IDS.PREMIUM_VIDEOS) {
      // Mark as premium in storage
      await setIsPremium(true);

      // Finish the transaction
      await finishTransaction({ purchase, isConsumable: false });

      console.log('Purchase verified and completed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return false;
  }
};

/**
 * Restore previous purchases
 * Required by Apple for non-consumable purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
  if (!isIAPAvailable || !getAvailablePurchases) {
    console.warn('IAP not available - cannot restore purchases');
    return false;
  }

  try {
    const purchases = await getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      const premiumPurchase = purchases.find(
        (purchase: any) => purchase.productId === PRODUCT_IDS.PREMIUM_VIDEOS
      );

      if (premiumPurchase) {
        await setIsPremium(true);
        console.log('Premium purchase restored');
        return true;
      }
    }

    console.log('No purchases to restore');
    return false;
  } catch (error: any) {
    if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.warn('IAP not available - cannot restore purchases');
    } else {
      console.error('Error restoring purchases:', error);
    }
    return false;
  }
};

/**
 * Setup purchase listeners
 * Returns cleanup function
 */
export const setupPurchaseListeners = (
  onPurchaseSuccess: () => void,
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
          const isValid = await verifyPurchase(purchase);

          if (isValid) {
            onPurchaseSuccess();
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
export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!isIAPAvailable || !getAvailablePurchases) {
    console.warn('IAP not available - cannot check purchase status');
    return false;
  }

  try {
    const purchases = await getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      const hasPremium = purchases.some(
        (purchase: any) => purchase.productId === PRODUCT_IDS.PREMIUM_VIDEOS
      );

      if (hasPremium) {
        await setIsPremium(true);
        return true;
      }
    }

    return false;
  } catch (error: any) {
    if (error?.message?.includes('E_IAP_NOT_AVAILABLE')) {
      console.warn('IAP not available - cannot check purchase status');
    } else {
      console.error('Error checking premium status:', error);
    }
    return false;
  }
};
