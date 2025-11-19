import React, { useEffect, useState } from 'react';
import { Modal, Platform, Alert } from 'react-native';
import Haptic from 'react-native-haptic-feedback';
import { useTranslation } from 'react-i18next';
import { usePurchase } from '../contexts/PurchaseContext';
import type { ProductId } from '../services/iapService';
import {
  PremiumPaywall,
  createPaywallPlanOptions,
} from './PremiumPaywall';
import { useTheme } from '../contexts/ThemeContext';

const paywallBackground = require('../assets/onboarding/onboarding_en_paywall.png');

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  showRestoreButton?: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  onClose,
  showRestoreButton = true,
}) => {
  const { t } = useTranslation();
  const { purchase, restore, isLoading, products, isLoadingProducts, productsError, retryLoadProducts } = usePurchase();
  const [pendingAction, setPendingAction] = useState<'purchase' | 'restore' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<ProductId | null>(null);
  const planOptions = createPaywallPlanOptions(products, t);
  const hasAvailablePlan = planOptions.some((plan) => plan.available);

  useEffect(() => {
    if (planOptions.length === 0) {
      setSelectedProductId(null);
      return;
    }

    if (!selectedProductId || !planOptions.some((plan) => plan.id === selectedProductId)) {
      setSelectedProductId(planOptions[0]?.id ?? null);
    }
  }, [planOptions, selectedProductId]);

  const handlePurchase = async () => {
    if (!selectedProductId) {
      Alert.alert(t('purchaseModal.unavailableTitle'), t('purchaseModal.unavailableMessage'));
      return;
    }

    if (!isPurchaseSupported) {
      Alert.alert(t('purchaseModal.unavailableTitle'), t('purchaseModal.unavailableMessage'));
      return;
    }

    Haptic.trigger('impactMedium', { enableVibrateFallback: true });
    try {
      setPendingAction('purchase');
      await purchase(selectedProductId);
    } finally {
      setPendingAction(null);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('purchaseModal.unavailableTitle'), t('purchaseModal.unavailableMessage'));
      return;
    }

    Haptic.trigger('impactLight', { enableVibrateFallback: true });
    try {
      setPendingAction('restore');
      await restore();
    } finally {
      setPendingAction(null);
    }
  };

  const handleClose = () => {
    Haptic.trigger('impactLight', { enableVibrateFallback: true });
    onClose();
  };

  const isPurchaseSupported = Platform.OS === 'ios' && hasAvailablePlan;
  const purchaseDisabled = isLoading || !isPurchaseSupported || !selectedProductId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <PremiumPaywall
        backgroundImage={paywallBackground}
        planOptions={planOptions}
        selectedProductId={selectedProductId}
        onSelectPlan={(id) => setSelectedProductId(id)}
        onPurchase={handlePurchase}
        onClose={handleClose}
        onRestore={showRestoreButton ? handleRestore : handleClose}
        isLoading={isLoading && pendingAction === 'purchase'}
        isPurchaseSupported={isPurchaseSupported}
        ctaDisabled={purchaseDisabled}
        isLoadingProducts={isLoadingProducts}
        productsError={productsError}
        onRetryLoadProducts={retryLoadProducts}
      />
    </Modal>
  );
};
