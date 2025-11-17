import React from 'react';
import { View, Text, StyleSheet, type DimensionValue } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useVideoLimit } from '../hooks/useVideoLimit';

type PremiumStatusProps = {
  topOffset?: number;
  variant?: 'floating' | 'inline';
};

export const PremiumStatus: React.FC<PremiumStatusProps> = ({
  topOffset = 60,
  variant = 'floating',
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    isPremium,
    remainingVideos,
    maxDailyLimit,
    canWatchVideo,
    isUnlimited,
  } = useVideoLimit();

  const containerStyles = [
    styles.container,
    variant === 'floating' ? [styles.floating, { top: topOffset }] : styles.inline,
  ];

  const remainingLabel = isUnlimited ? '∞' : remainingVideos;
  const totalLabel = isUnlimited ? t('premium.unlimitedLabel') : `${maxDailyLimit}`;
  const progressWidth: DimensionValue =
    isUnlimited || maxDailyLimit === 0
      ? '100%'
      : `${Math.min(100, (remainingVideos / maxDailyLimit) * 100)}%`;

  return (
    <>
      <View style={containerStyles}>
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
                {remainingLabel}
              </Text>
              <Text style={[styles.countTotal, { color: theme.colors.textTertiary }]}>
                {' / '}{totalLabel}
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
                    width: progressWidth,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  floating: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  inline: {
    position: 'relative',
    left: undefined,
    right: undefined,
    width: '100%',
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    minHeight: 170,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  countContainer: {
    marginBottom: 16,
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
    fontSize: 42,
    fontWeight: '700',
  },
  countTotal: {
    fontSize: 28,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
