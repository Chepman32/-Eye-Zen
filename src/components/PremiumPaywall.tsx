import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useTheme } from '../contexts/ThemeContext';
import type { ProductId, IAPProduct } from '../services/iapService';
import { PRODUCT_IDS } from '../services/iapService';

export interface PaywallPlanOption {
  id: ProductId;
  title: string;
  subtitle: string;
  badge?: string;
  priceCaption: string;
  highlight?: boolean;
  priceDisplay?: string;
  available: boolean;
}

export const createPaywallPlanOptions = (
  products: IAPProduct[],
  t: TFunction
): PaywallPlanOption[] => {
  const configs: Array<{
    id: ProductId;
    title: string;
    subtitle: string;
    badge?: string;
    priceCaption: string;
    highlight?: boolean;
    alwaysShow: boolean;
  }> = [
    {
      id: PRODUCT_IDS.YEARLY_UNLIMITED,
      title: t('purchaseModal.yearlyPlanTitle'),
      subtitle: t('purchaseModal.yearlyPlanSubtitle'),
      badge: t('purchaseModal.bestValueBadge'),
      priceCaption: t('purchaseModal.perYear'),
      highlight: true,
      alwaysShow: true,
    },
    {
      id: PRODUCT_IDS.WEEKLY_TRIAL,
      title: '7 days free trial',
      subtitle: 'then $3.99 per week',
      priceCaption: 'per week',
      alwaysShow: true,
    },
    {
      id: PRODUCT_IDS.PREMIUM_VIDEOS,
      title: t('purchaseModal.lifetimePlanTitle'),
      subtitle: t('purchaseModal.lifetimePlanSubtitle'),
      priceCaption: t('purchaseModal.oneTimePayment'),
      alwaysShow: false,
    },
  ];

  return configs.reduce<PaywallPlanOption[]>((acc, config) => {
    const product = products.find((p) => p.productId === config.id);
    if (!product && !config.alwaysShow) {
      return acc;
    }

    acc.push({
      id: config.id,
      title: config.title,
      subtitle: config.subtitle,
      badge: config.badge,
      priceCaption: config.priceCaption,
      highlight: config.highlight,
      priceDisplay: product?.localizedPrice,
      available: Boolean(product),
    });

    return acc;
  }, []);
};

interface PremiumPaywallProps {
  backgroundImage?: ImageSourcePropType;
  planOptions: PaywallPlanOption[];
  selectedProductId: ProductId | null;
  onSelectPlan: (id: ProductId) => void;
  onPurchase: () => void;
  onClose: () => void;
  onRestore: () => void;
  isLoading: boolean;
  isPurchaseSupported: boolean;
  ctaDisabled: boolean;
  isLoadingProducts: boolean;
  productsError: string | null;
  onRetryLoadProducts: () => void;
}

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({
  backgroundImage,
  planOptions,
  selectedProductId,
  onSelectPlan,
  onPurchase,
  onClose,
  onRestore,
  isLoading,
  isPurchaseSupported,
  ctaDisabled,
  isLoadingProducts,
  productsError,
  onRetryLoadProducts,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);

  // Detect iPad layout (width >= 768)
  const isTabletLayout = width >= 768;

  // Responsive scaling for fonts and spacing
  const scale = useMemo(() => {
    if (isTabletLayout) {
      // Scale up for iPad, but cap at 1.4x for very large iPads
      return Math.min(1.4, width / 550);
    }
    return 1;
  }, [width, isTabletLayout]);

  // Responsive values
  const responsiveValues = useMemo(() => ({
    horizontalPadding: isTabletLayout ? 60 : 20,
    titleFontSize: Math.round(32 * scale),
    featureFontSize: Math.round(17 * scale),
    planTitleFontSize: Math.round(19 * scale),
    planPriceFontSize: Math.round(22 * scale),
    planCaptionFontSize: Math.round(14 * scale),
    badgeFontSize: Math.round(13 * scale),
    toggleLabelFontSize: Math.round(18 * scale),
    ctaFontSize: Math.round(20 * scale),
    planCardPadding: isTabletLayout ? 28 : 18,
    togglePadding: isTabletLayout ? 28 : 20,
    iconSize: Math.round(24 * scale),
    radioSize: Math.round(28 * scale),
  }), [scale, isTabletLayout]);

  const features = [
    {
      icon: 'eye-outline',
      text: 'Unlimited eye exercise sessions',
    },
    { icon: 'people-outline', text: 'Family Sharing' },
    { icon: 'newspaper-outline', text: 'New exercies updates' },
    { icon: 'medkit-outline', text: 'Guaranteed relief' },
  ];

  const content = (
    <LinearGradient
      colors={[`${theme.colors.background}FA`, `${theme.colors.background}F2`]}
      style={styles.gradient}>
      <SafeAreaView style={[styles.safeArea, { paddingHorizontal: responsiveValues.horizontalPadding }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={[styles.headerButton, { backgroundColor: `${theme.colors.text}0D` }]}>
            <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>✕</Text>
          </Pressable>
          <Pressable onPress={onRestore}>
            <Text style={[styles.restore, { color: theme.colors.text }]}>
              {t('purchaseModal.restorePurchase')}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: responsiveValues.titleFontSize }]} numberOfLines={2}>
            Take care of your{'\n'}eyes and wellness
          </Text>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature.text} style={styles.featureRow}>
                <Ionicons name={feature.icon as any} size={responsiveValues.iconSize} color={theme.colors.text} />
                <Text style={[styles.featureText, { color: theme.colors.text, fontSize: responsiveValues.featureFontSize }]} numberOfLines={2}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.planList}>
            {/* Yearly Plan */}
            <Pressable
              onPress={() => planOptions[0] && onSelectPlan(planOptions[0].id)}
              style={[
                styles.planCard,
                {
                  borderColor: selectedProductId === planOptions[0]?.id ? theme.colors.success : theme.colors.border,
                  backgroundColor: selectedProductId === planOptions[0]?.id ? theme.colors.surface : theme.colors.backgroundSecondary,
                  shadowColor: selectedProductId === planOptions[0]?.id ? theme.colors.success : undefined,
                  padding: responsiveValues.planCardPadding,
                },
                selectedProductId === planOptions[0]?.id && styles.planCardSelected,
              ]}>
              <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textInverse, fontSize: responsiveValues.badgeFontSize }]}>Save 95%</Text>
              </View>
              <View style={styles.planHeader}>
                <View style={[
                  styles.radioOuter,
                  {
                    borderColor: selectedProductId === planOptions[0]?.id ? theme.colors.success : theme.colors.border,
                    width: responsiveValues.radioSize,
                    height: responsiveValues.radioSize,
                    borderRadius: responsiveValues.radioSize / 2,
                  }
                ]}>
                  {selectedProductId === planOptions[0]?.id && <View style={[styles.radioInner, { backgroundColor: theme.colors.success }]} />}
                </View>
                <View style={styles.planText}>
                  <Text style={[styles.planTitle, { color: theme.colors.text, fontSize: responsiveValues.planTitleFontSize }]} numberOfLines={1}>
                    Yearly Plan
                  </Text>
                </View>
                <View style={styles.planPriceGroup}>
                  <Text style={[styles.planPrice, { color: theme.colors.text, fontSize: responsiveValues.planPriceFontSize }]} numberOfLines={1}>
                    {planOptions[0]?.priceDisplay ?? t('purchaseModal.priceUnavailable')}
                  </Text>
                  <Text style={[styles.planPriceCaption, { color: theme.colors.text, fontSize: responsiveValues.planCaptionFontSize }]} numberOfLines={1}>
                    Per year
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Weekly Plan with 7 days free trial */}
            <Pressable
              onPress={() => planOptions[1] && onSelectPlan(planOptions[1].id)}
              style={[
                styles.planCard,
                {
                  borderColor: selectedProductId === planOptions[1]?.id ? theme.colors.success : theme.colors.border,
                  backgroundColor: selectedProductId === planOptions[1]?.id ? theme.colors.surface : theme.colors.backgroundSecondary,
                  shadowColor: selectedProductId === planOptions[1]?.id ? theme.colors.success : undefined,
                  padding: responsiveValues.planCardPadding,
                },
                selectedProductId === planOptions[1]?.id && styles.planCardSelected,
              ]}>
              <View style={styles.planHeader}>
                <View style={[
                  styles.radioOuter,
                  {
                    borderColor: selectedProductId === planOptions[1]?.id ? theme.colors.success : theme.colors.border,
                    width: responsiveValues.radioSize,
                    height: responsiveValues.radioSize,
                    borderRadius: responsiveValues.radioSize / 2,
                  }
                ]}>
                  {selectedProductId === planOptions[1]?.id && <View style={[styles.radioInner, { backgroundColor: theme.colors.success }]} />}
                </View>
                <View style={styles.planText}>
                  <Text style={[styles.planTitle, { color: theme.colors.text, fontSize: responsiveValues.planTitleFontSize }]} numberOfLines={1}>
                    7 days free trial
                  </Text>
                </View>
                <View style={styles.planPriceGroup}>
                  <Text style={[styles.planPriceCaption, { color: theme.colors.text, fontSize: responsiveValues.planCaptionFontSize }]} numberOfLines={2}>
                    then <Text style={[styles.planPrice, { color: theme.colors.text, fontSize: responsiveValues.planPriceFontSize }]}>
                      {planOptions[1]?.priceDisplay ?? t('purchaseModal.priceUnavailable')}
                    </Text>
                  </Text>
                  <Text style={[styles.planPriceCaption, { color: theme.colors.text, fontSize: responsiveValues.planCaptionFontSize }]} numberOfLines={1}>
                    per week
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Free Trial Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: theme.colors.backgroundSecondary, padding: responsiveValues.togglePadding }]}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text, fontSize: responsiveValues.toggleLabelFontSize }]} numberOfLines={1}>
              Enable the free trial
            </Text>
            <Switch
              value={freeTrialEnabled}
              onValueChange={setFreeTrialEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={theme.colors.surface}
            />
          </View>

          {/* Loading state for products */}
          {isLoadingProducts && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.text} size="small" />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading pricing...</Text>
            </View>
          )}

          {/* Error state with retry button */}
          {!isLoadingProducts && productsError && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <Ionicons name="alert-circle-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.text }]}>{productsError}</Text>
              <Pressable
                onPress={onRetryLoadProducts}
                style={[styles.retryButton, { backgroundColor: theme.colors.buttonPrimary }]}>
                <Text style={[styles.retryButtonText, { color: theme.colors.buttonText }]}>Retry</Text>
              </Pressable>
            </View>
          )}

          {!isPurchaseSupported && !productsError && !isLoadingProducts && (
            <Text style={[styles.unavailableText, { color: theme.colors.textSecondary }]}>{t('purchaseModal.unavailableMessage')}</Text>
          )}

          <Pressable
            style={[
              styles.ctaButton,
              {
                backgroundColor: theme.colors.buttonPrimary,
                shadowColor: theme.colors.buttonPrimary,
              },
              (ctaDisabled || !isPurchaseSupported) && styles.ctaDisabled,
            ]}
            onPress={onPurchase}
            disabled={ctaDisabled || !isPurchaseSupported}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <View style={styles.ctaContent}>
                <Text style={[styles.ctaText, { color: theme.colors.buttonText, fontSize: responsiveValues.ctaFontSize }]}>
                  Continue
                </Text>
                <Ionicons name="arrow-forward" size={responsiveValues.iconSize} color={theme.colors.buttonText} style={styles.ctaArrow} />
              </View>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  if (backgroundImage) {
    return (
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover" blurRadius={8}>
        {content}
      </ImageBackground>
    );
  }

  return <View style={styles.background}>{content}</View>;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  restore: {
    textDecorationLine: 'underline',
    fontWeight: '600',
    marginRight: 20,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  metricCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  stars: {
    fontSize: 18,
    letterSpacing: 4,
  },
  features: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },
  planList: {
    gap: 12,
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
  },
  planCardSelected: {
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  planCardHighlight: {
  },
  badge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -40 }],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 10,
  },
  badgeText: {
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    fontWeight: '600',
  },
  planSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  planPriceGroup: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontWeight: '700',
  },
  planPriceCaption: {
    marginTop: 2,
  },
  unavailableText: {
    textAlign: 'center',
    marginTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  ctaButton: {
    marginTop: 24,
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontWeight: '700',
  },
  ctaArrow: {
    marginLeft: 8,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
