import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  PurchaseError,
  getAvailablePurchases,
  Product,
  Purchase,
} from 'react-native-iap';
import { Platform } from 'react-native';
import { setIsPremium } from './storageService';

// Product IDs - MUST match exactly what you create in App Store Connect
export const PRODUCT_IDS = {
  PREMIUM_VIDEOS: 'com.eyezen.dailyfive', // iOS product ID
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
  try {
    const result = await initConnection();
    console.log('IAP Connection initialized:', result);
    return true;
  } catch (error) {
    console.error('Error initializing IAP connection:', error);
    return false;
  }
};

/**
 * End IAP connection
 * Call this when app unmounts
 */
export const disconnectIAP = async (): Promise<void> => {
  try {
    await endConnection();
    console.log('IAP Connection ended');
  } catch (error) {
    console.error('Error ending IAP connection:', error);
  }
};

/**
 * Get available products from App Store
 */
export const fetchProducts = async (): Promise<IAPProduct[]> => {
  try {
    const products = await getProducts({ skus: IOS_PRODUCT_IDS });

    return products.map((product: Product) => ({
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      localizedPrice: product.localizedPrice,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Request purchase for premium videos
 */
export const purchasePremium = async (): Promise<boolean> => {
  try {
    await requestPurchase({
      sku: PRODUCT_IDS.PREMIUM_VIDEOS,
    });
    // Purchase processing happens in the listener
    return true;
  } catch (error) {
    const purchaseError = error as PurchaseError;
    if (purchaseError.code === 'E_USER_CANCELLED') {
      console.log('User cancelled the purchase');
    } else {
      console.error('Error requesting purchase:', purchaseError);
    }
    return false;
  }
};

/**
 * Verify and process a purchase
 * Returns true if purchase is valid
 */
export const verifyPurchase = async (purchase: Purchase): Promise<boolean> => {
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
  try {
    const purchases = await getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      const premiumPurchase = purchases.find(
        (purchase) => purchase.productId === PRODUCT_IDS.PREMIUM_VIDEOS
      );

      if (premiumPurchase) {
        await setIsPremium(true);
        console.log('Premium purchase restored');
        return true;
      }
    }

    console.log('No purchases to restore');
    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
};

/**
 * Setup purchase listeners
 * Returns cleanup function
 */
export const setupPurchaseListeners = (
  onPurchaseSuccess: () => void,
  onPurchaseError: (error: PurchaseError) => void
): (() => void) => {
  // Listen for purchase updates
  const purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: Purchase) => {
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
    (error: PurchaseError) => {
      console.warn('Purchase error:', error);
      onPurchaseError(error);
    }
  );

  // Return cleanup function
  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
  };
};

/**
 * Check if user has active premium purchase
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const purchases = await getAvailablePurchases();

    if (purchases && purchases.length > 0) {
      const hasPremium = purchases.some(
        (purchase) => purchase.productId === PRODUCT_IDS.PREMIUM_VIDEOS
      );

      if (hasPremium) {
        await setIsPremium(true);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};
