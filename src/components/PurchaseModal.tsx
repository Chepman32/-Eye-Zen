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
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Watch more videos daily</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>
                Watch up to <Text style={styles.highlight}>5 videos</Text> per
                day
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>One-time purchase</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Lifetime access</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Support development</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>One-time payment</Text>
            <Text style={styles.price}>{price}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Purchase Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={isLoading}
              style={styles.purchaseButtonWrapper}
              android_ripple={{
                color: 'rgba(255,255,255,0.3)',
                borderless: false,
              }}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={styles.purchaseButton}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.purchaseButtonText}>Purchase Now</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Restore Button */}
            {showRestoreButton && (
              <Pressable
                onPress={handleRestore}
                disabled={isLoading}
                style={styles.restoreButton}>
                <Text style={styles.restoreButtonText}>Restore Purchase</Text>
              </Pressable>
            )}

            {/* Close Button */}
            <Pressable
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Maybe Later</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
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
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  highlight: {
    fontWeight: '700',
    color: '#4CAF50',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
  },
  buttons: {
    gap: 12,
  },
  purchaseButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
