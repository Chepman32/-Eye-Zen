import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
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
  product: IAPProduct;
  title: string;
  subtitle: string;
  badge?: string;
  priceCaption: string;
  highlight?: boolean;
}

export const createPaywallPlanOptions = (
  products: IAPProduct[],
  t: TFunction
): PaywallPlanOption[] => {
  const lifetimeProduct = products.find(
    (p) => p.productId === PRODUCT_IDS.PREMIUM_VIDEOS
  );
  const yearlyProduct = products.find(
    (p) => p.productId === PRODUCT_IDS.YEARLY_UNLIMITED
  );

  const options: PaywallPlanOption[] = [];

  if (yearlyProduct) {
    options.push({
      id: PRODUCT_IDS.YEARLY_UNLIMITED,
      product: yearlyProduct,
      title: t('purchaseModal.yearlyPlanTitle'),
      subtitle: t('purchaseModal.yearlyPlanSubtitle'),
      badge: t('purchaseModal.bestValueBadge'),
      priceCaption: t('purchaseModal.perYear'),
      highlight: true,
    });
  }

  if (lifetimeProduct) {
    options.push({
      id: PRODUCT_IDS.PREMIUM_VIDEOS,
      product: lifetimeProduct,
      title: t('purchaseModal.lifetimePlanTitle'),
      subtitle: t('purchaseModal.lifetimePlanSubtitle'),
      priceCaption: t('purchaseModal.oneTimePayment'),
    });
  }

  return options;
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
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const features = [
    {
      icon: 'sparkles-outline',
      text: `${t('purchaseModal.feature1')} ${t(
        'purchaseModal.feature1Value'
      )} ${t('purchaseModal.feature1Suffix')}`,
    },
    { icon: 'infinite-outline', text: t('purchaseModal.feature3') },
    { icon: 'play-outline', text: t('premium.watchUpTo5') },
    { icon: 'happy-outline', text: t('purchaseModal.feature4') },
  ];

  const content = (
    <LinearGradient
      colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
      style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>✕</Text>
          </Pressable>
          <Pressable onPress={onRestore}>
            <Text style={[styles.restore, { color: theme.colors.text }]}>
              {t('purchaseModal.restorePurchase')}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('purchaseModal.title')}</Text>
          <Text style={styles.subtitle}>{t('purchaseModal.subtitle')}</Text>

          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>1,000,000+</Text>
            <Text style={styles.metricLabel}>{t('premium.watchUpTo5')}</Text>
          </View>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature.text} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.planList}>
            {planOptions.map((plan) => {
              const selected = plan.id === selectedProductId;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => onSelectPlan(plan.id)}
                  style={[
                    styles.planCard,
                    selected && styles.planCardSelected,
                    plan.highlight && styles.planCardHighlight,
                  ]}>
                  {plan.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <View style={styles.radioOuter}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planText}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                    </View>
                    <View style={styles.planPriceGroup}>
                      <Text style={styles.planPrice}>
                        {plan.product.localizedPrice || t('purchaseModal.priceUnavailable')}
                      </Text>
                      <Text style={styles.planPriceCaption}>{plan.priceCaption}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!isPurchaseSupported && (
            <Text style={styles.unavailableText}>{t('purchaseModal.unavailableMessage')}</Text>
          )}

          <Pressable
            style={[
              styles.ctaButton,
              { backgroundColor: theme.colors.buttonPrimary },
              (ctaDisabled || !isPurchaseSupported) && styles.ctaDisabled,
            ]}
            onPress={onPurchase}
            disabled={ctaDisabled || !isPurchaseSupported}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <Text style={[styles.ctaText, { color: theme.colors.buttonText }]}>
                {t('purchaseModal.purchaseNow')}
              </Text>
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
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  restore: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  planList: {
    gap: 12,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    backgroundColor: '#fff',
  },
  planCardSelected: {
    borderColor: '#5EC16A',
    shadowColor: '#5EC16A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  planCardHighlight: {
    borderColor: '#5EC16A',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 16,
    backgroundColor: '#5EC16A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5EC16A',
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  planPriceGroup: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  planPriceCaption: {
    fontSize: 12,
    color: '#555',
  },
  unavailableText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 12,
  },
  ctaButton: {
    marginTop: 24,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2D55',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
  },
  ctaDisabled: {
    opacity: 0.5,
  },
});
