import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Haptic from 'react-native-haptic-feedback';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { usePurchase } from '../contexts/PurchaseContext';

const { width } = Dimensions.get('window');

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
  const { theme } = useTheme();
  const { purchase, restore, isLoading, products } = usePurchase();

  const handlePurchase = async () => {
    Haptic.trigger('impactMedium', { enableVibrateFallback: true });
    await purchase();
  };

  const handleRestore = async () => {
    Haptic.trigger('impactLight', { enableVibrateFallback: true });
    await restore();
  };

  const handleClose = () => {
    Haptic.trigger('impactLight', { enableVibrateFallback: true });
    onClose();
  };

  const product = products[0];
  const price = product?.localizedPrice || '$2.99'; // Fallback price

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlayDark }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('purchaseModal.title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('purchaseModal.subtitle')}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>✓</Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {t('purchaseModal.feature1')}{' '}
                <Text style={[styles.highlight, { color: theme.colors.primary }]}>
                  {t('purchaseModal.feature1Value')}
                </Text>{' '}
                {t('purchaseModal.feature1Suffix')}
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>✓</Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {t('purchaseModal.feature2')}
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>✓</Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {t('purchaseModal.feature3')}
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureIcon, { color: theme.colors.primary }]}>✓</Text>
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {t('purchaseModal.feature4')}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={[styles.priceContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              {t('purchaseModal.oneTimePayment')}
            </Text>
            <Text style={[styles.price, { color: theme.colors.primary }]}>{price}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Purchase Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={isLoading}
              style={styles.purchaseButtonWrapper}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.purchaseButton}>
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.buttonText} />
                ) : (
                  <Text style={[styles.purchaseButtonText, { color: theme.colors.buttonText }]}>
                    {t('purchaseModal.purchaseNow')}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Restore Button */}
            {showRestoreButton && (
              <Pressable
                onPress={handleRestore}
                disabled={isLoading}
                style={styles.restoreButton}>
                <Text style={[styles.restoreButtonText, { color: theme.colors.primary }]}>
                  {t('purchaseModal.restorePurchase')}
                </Text>
              </Pressable>
            )}

            {/* Close Button */}
            <Pressable
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.textTertiary }]}>
                {t('purchaseModal.maybeLater')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  features: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  highlight: {
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  buttons: {
    gap: 12,
  },
  purchaseButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseButton: {
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
});
