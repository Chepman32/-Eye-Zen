import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Haptic from 'react-native-haptic-feedback';
import { useVideoLimit } from '../hooks/useVideoLimit';
import { PurchaseModal } from './PurchaseModal';

export const PremiumStatus: React.FC = () => {
  const {
    isPremium,
    remainingVideos,
    maxDailyLimit,
    canWatchVideo,
  } = useVideoLimit();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handleUpgradePress = () => {
    Haptic.trigger('impactLight', { enableVibrateFallback: true });
    setShowPurchaseModal(true);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isPremium ? '⭐ Premium Active' : 'Free Plan'}
            </Text>
          </View>

          {/* Video Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>Videos remaining today</Text>
            <View style={styles.countRow}>
              <Text
                style={[
                  styles.countNumber,
                  !canWatchVideo && styles.countNumberZero,
                ]}>
                {remainingVideos}
              </Text>
              <Text style={styles.countTotal}> / {maxDailyLimit}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(remainingVideos / maxDailyLimit) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Upgrade Button (only for free users) */}
          {!isPremium && (
            <Pressable
              onPress={handleUpgradePress}
              style={styles.upgradeButtonWrapper}
              android_ripple={{
                color: 'rgba(255,255,255,0.3)',
                borderless: false,
              }}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>
                  ⭐ Upgrade to Premium
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Premium Benefits (only for free users) */}
          {!isPremium && (
            <Text style={styles.benefitText}>
              Watch up to 5 videos per day with premium!
            </Text>
          )}
        </View>
      </View>

      {/* Purchase Modal */}
      <PurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  countContainer: {
    marginBottom: 12,
  },
  countLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
  },
  countNumberZero: {
    color: '#FF5252',
  },
  countTotal: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  upgradeButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
