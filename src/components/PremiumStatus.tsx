import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Haptic from 'react-native-haptic-feedback';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useVideoLimit } from '../hooks/useVideoLimit';
import { PurchaseModal } from './PurchaseModal';

type PremiumStatusProps = {
  topOffset?: number;
};

export const PremiumStatus: React.FC<PremiumStatusProps> = ({ topOffset = 60 }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      <View style={[styles.container, { top: topOffset }]}>
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isPremium ? t('premium.premiumActive') : t('premium.freePlan')}
            </Text>
          </View>

          {/* Video Count */}
          <View style={styles.countContainer}>
            <Text style={[styles.countLabel, { color: theme.colors.textSecondary }]}>
              {t('premium.videosRemaining')}
            </Text>
            <View style={styles.countRow}>
              <Text
                style={[
                  styles.countNumber,
                  { color: theme.colors.success },
                  !canWatchVideo && { color: theme.colors.error },
                ]}>
                {remainingVideos}
              </Text>
              <Text style={[styles.countTotal, { color: theme.colors.textTertiary }]}>
                {' / '}{maxDailyLimit}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
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
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.upgradeButton}>
                <Text style={[styles.upgradeButtonText, { color: theme.colors.buttonText }]}>
                  {t('premium.upgradeToPremium')}
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Premium Benefits (only for free users) */}
          {!isPremium && (
            <Text style={[styles.benefitText, { color: theme.colors.textTertiary }]}>
              {t('premium.watchUpTo5')}
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
    left: 20,
    right: 20,
  },
  card: {
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
  },
  countContainer: {
    marginBottom: 12,
  },
  countLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  countTotal: {
    fontSize: 24,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
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
    fontSize: 16,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
