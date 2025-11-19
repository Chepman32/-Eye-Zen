import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, type DimensionValue } from 'react-native';
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
  const { width } = useWindowDimensions();
  const {
    isPremium,
    remainingVideos,
    maxDailyLimit,
    canWatchVideo,
    isUnlimited,
  } = useVideoLimit();

  // Detect iPad layout (width >= 768)
  const isTabletLayout = width >= 768;

  // Responsive scaling for fonts
  const scale = useMemo(() => {
    if (isTabletLayout) {
      // Scale up for iPad, but cap at 1.4x for very large iPads
      return Math.min(1.4, width / 550);
    }
    return 1;
  }, [width, isTabletLayout]);

  // Responsive values
  const responsiveValues = useMemo(() => ({
    horizontalPadding: isTabletLayout ? 40 : 20,
    cardPadding: isTabletLayout ? 32 : 24,
    titleFontSize: Math.round(24 * scale),
    countLabelFontSize: Math.round(14 * scale),
    countNumberFontSize: Math.round(42 * scale),
    countTotalFontSize: Math.round(28 * scale),
  }), [scale, isTabletLayout]);

  const containerStyles = [
    styles.container,
    variant === 'floating' ? [styles.floating, { top: topOffset, left: responsiveValues.horizontalPadding, right: responsiveValues.horizontalPadding }] : styles.inline,
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
        <View style={[styles.card, { backgroundColor: theme.colors.card, padding: responsiveValues.cardPadding }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: responsiveValues.titleFontSize }]} numberOfLines={1}>
              {isPremium ? t('premium.premiumActive') : t('premium.freePlan')}
            </Text>
          </View>

          {/* Video Count */}
          <View style={styles.countContainer}>
            <Text style={[styles.countLabel, { color: theme.colors.textSecondary, fontSize: responsiveValues.countLabelFontSize }]} numberOfLines={1}>
              {t('premium.videosRemaining')}
            </Text>
            <View style={styles.countRow}>
              <Text
                style={[
                  styles.countNumber,
                  { color: theme.colors.success, fontSize: responsiveValues.countNumberFontSize },
                  !canWatchVideo && { color: theme.colors.error },
                ]}
                numberOfLines={1}>
                {remainingLabel}
              </Text>
              <Text style={[styles.countTotal, { color: theme.colors.textTertiary, fontSize: responsiveValues.countTotalFontSize }]} numberOfLines={1}>
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
    fontWeight: '700',
  },
  countContainer: {
    marginBottom: 16,
  },
  countLabel: {
    marginBottom: 8,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countNumber: {
    fontWeight: '700',
  },
  countTotal: {
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
