import React, { useState } from 'react';
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
  const weeklyProduct = products.find(
    (p) => p.productId === PRODUCT_IDS.WEEKLY_TRIAL
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

  if (weeklyProduct) {
    options.push({
      id: PRODUCT_IDS.WEEKLY_TRIAL,
      product: weeklyProduct,
      title: '7 days free trial',
      subtitle: 'then $3.99 per week',
      priceCaption: 'per week',
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
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);

  const features = [
    {
      icon: 'create-outline',
      text: '300+ sketches for practice',
    },
    { icon: 'logo-android', text: 'Unlimited AI generated drawings' },
    { icon: 'phone-portrait-outline', text: 'Access to Image Projector' },
    { icon: 'ribbon-outline', text: 'Ad free experience' },
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
          <Text style={styles.title}>Take care of your{'\n'}eyes and wellness</Text>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature.text} style={styles.featureRow}>
                <Ionicons name={feature.icon as any} size={24} color="#000" />
                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.planList}>
            {/* Yearly Plan */}
            <Pressable
              onPress={() => planOptions[0] && onSelectPlan(planOptions[0].id)}
              style={[
                styles.planCard,
                selectedProductId === planOptions[0]?.id && styles.planCardSelected,
              ]}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Save 95%</Text>
              </View>
              <View style={styles.planHeader}>
                <View style={[styles.radioOuter, selectedProductId === planOptions[0]?.id && styles.radioOuterSelected]}>
                  {selectedProductId === planOptions[0]?.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.planText}>
                  <Text style={styles.planTitle}>Yearly Plan</Text>
                </View>
                <View style={styles.planPriceGroup}>
                  <Text style={styles.planPrice}>
                    {planOptions[0]?.product.localizedPrice || '$9.99'}
                  </Text>
                  <Text style={styles.planPriceCaption}>Per year</Text>
                </View>
              </View>
            </Pressable>

            {/* Weekly Plan with 7 days free trial */}
            <Pressable
              onPress={() => planOptions[1] && onSelectPlan(planOptions[1].id)}
              style={[
                styles.planCard,
                selectedProductId === planOptions[1]?.id && styles.planCardSelected,
              ]}>
              <View style={styles.planHeader}>
                <View style={[styles.radioOuter, selectedProductId === planOptions[1]?.id && styles.radioOuterSelected]}>
                  {selectedProductId === planOptions[1]?.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.planText}>
                  <Text style={styles.planTitle}>7 days free trial</Text>
                </View>
                <View style={styles.planPriceGroup}>
                  <Text style={styles.planPriceCaption}>
                    then <Text style={styles.planPrice}>{planOptions[1]?.product.localizedPrice || '$3.99'}</Text>
                  </Text>
                  <Text style={styles.planPriceCaption}>per week</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Free Trial Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enable the free trial</Text>
            <Switch
              value={freeTrialEnabled}
              onValueChange={setFreeTrialEnabled}
              trackColor={{ false: '#D1D1D6', true: '#5EC16A' }}
              thumbColor="#fff"
            />
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
              <View style={styles.ctaContent}>
                <Text style={[styles.ctaText, { color: theme.colors.buttonText }]}>
                  Continue
                </Text>
                <Ionicons name="arrow-forward" size={24} color="#fff" style={styles.ctaArrow} />
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
    paddingBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 38,
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  metricLabel: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
    marginBottom: 8,
  },
  stars: {
    fontSize: 18,
    color: '#FFD700',
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
    fontSize: 17,
    fontWeight: '500',
  },
  planList: {
    gap: 12,
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    padding: 18,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#5EC16A',
    backgroundColor: '#fff',
    shadowColor: '#5EC16A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  planCardHighlight: {
    borderColor: '#5EC16A',
  },
  badge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#5EC16A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#5EC16A',
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5EC16A',
  },
  planText: {
    flex: 1,
  },
  planTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  planPriceCaption: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },
  unavailableText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  ctaButton: {
    marginTop: 24,
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2D55',
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
    fontSize: 20,
    fontWeight: '700',
  },
  ctaArrow: {
    marginLeft: 8,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
});
