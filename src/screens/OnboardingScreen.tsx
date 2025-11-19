import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  FlatList,
  ViewToken,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import type { RootStackParamList } from '../../App';
import { usePurchase } from '../contexts/PurchaseContext';
import AsyncStorage from '../services/asyncStorageAdapter';
import { type ProductId } from '../services/iapService';
import {
  PremiumPaywall,
  createPaywallPlanOptions,
} from '../components/PremiumPaywall';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  image: any;
  isPaywall?: boolean;
}

// Map of all available onboarding images by language
const onboardingImages: Record<string, {
  slide1: any;
  slide2: any;
  slide3: any;
  slide4: any;
  paywall: any;
}> = {
  en: {
    slide1: require('../assets/onboarding/onboarding_en_1.png'),
    slide2: require('../assets/onboarding/onboarding_en_2.png'),
    slide3: require('../assets/onboarding/onboarding_en_3.png'),
    slide4: require('../assets/onboarding/onboarding_en_4.png'),
    paywall: require('../assets/onboarding/onboarding_en_paywall.png'),
  },
  fr: {
    slide1: require('../assets/onboarding/fr/onboarding_fr_1.png'),
    slide2: require('../assets/onboarding/fr/onboarding_fr_2.png'),
    slide3: require('../assets/onboarding/fr/onboarding_fr_3.png'),
    slide4: require('../assets/onboarding/fr/onboarding_fr_4.png'),
    paywall: require('../assets/onboarding/fr/onboarding_fr_paywall.png'),
  },
  de: {
    slide1: require('../assets/onboarding/ge/onboarding_ge_1.png'),
    slide2: require('../assets/onboarding/ge/onboarding_ge_2.png'),
    slide3: require('../assets/onboarding/ge/onboarding_ge_3.png'),
    slide4: require('../assets/onboarding/ge/onboarding_ge_4.png'),
    paywall: require('../assets/onboarding/ge/onboarding_ge_paywall.png'),
  },
  it: {
    slide1: require('../assets/onboarding/it/onboarding_it_1.png'),
    slide2: require('../assets/onboarding/it/onboarding_it_2.png'),
    slide3: require('../assets/onboarding/it/onboarding_it_3.png'),
    slide4: require('../assets/onboarding/it/onboarding_it_4.png'),
    paywall: require('../assets/onboarding/it/onboarding_it_paywall.png'),
  },
  ja: {
    slide1: require('../assets/onboarding/ja/onboarding_ja_1.png'),
    slide2: require('../assets/onboarding/ja/onboarding_ja_2.png'),
    slide3: require('../assets/onboarding/ja/onboarding_ja_3.png'),
    slide4: require('../assets/onboarding/ja/onboarding_ja_4.png'),
    paywall: require('../assets/onboarding/ja/onboarding_ja_paywall.png'),
  },
  ko: {
    slide1: require('../assets/onboarding/ko/onboarding_ko_1.png'),
    slide2: require('../assets/onboarding/ko/onboarding_ko_2.png'),
    slide3: require('../assets/onboarding/ko/onboarding_ko_3.png'),
    slide4: require('../assets/onboarding/ko/onboarding_ko_4.png'),
    paywall: require('../assets/onboarding/ko/onboarding_ko_paywall.png'),
  },
  pl: {
    slide1: require('../assets/onboarding/pl/onboarding_pl_1.png'),
    slide2: require('../assets/onboarding/pl/onboarding_pl_2.png'),
    slide3: require('../assets/onboarding/pl/onboarding_pl_3.png'),
    slide4: require('../assets/onboarding/pl/onboarding_pl_4.png'),
    paywall: require('../assets/onboarding/pl/onboarding_pl_paywall.png'),
  },
  pt: {
    slide1: require('../assets/onboarding/pt/onboarding_pt_1.png'),
    slide2: require('../assets/onboarding/pt/onboarding_pt_2.png'),
    slide3: require('../assets/onboarding/pt/onboarding_pt_3.png'),
    slide4: require('../assets/onboarding/pt/onboarding_pt_4.png'),
    paywall: require('../assets/onboarding/pt/onboarding_pt_paywall.png'),
  },
};

// Helper function to get slides for a specific language with fallback to English
const getSlidesForLanguage = (language: string): OnboardingSlide[] => {
  // Extract base language code (e.g., 'en' from 'en-US')
  const langCode = language.split('-')[0].toLowerCase();

  // Check if we have slides for this language, otherwise use English
  const images = onboardingImages[langCode] || onboardingImages.en;

  return [
    {
      id: '1',
      image: images.slide1,
    },
    {
      id: '2',
      image: images.slide2,
    },
    {
      id: '3',
      image: images.slide3,
    },
    {
      id: '4',
      image: images.slide4,
    },
    {
      id: '5',
      image: images.paywall,
      isPaywall: true,
    },
  ];
};

const OnboardingScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, 'Onboarding'>
> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { products, purchase, restore, isLoading, isPremium } = usePurchase();
  const [selectedProductId, setSelectedProductId] = useState<ProductId | null>(null);
  const bottomControlsWidth = useMemo(
    () => Math.max(0, Math.min(windowWidth - 48, 700)),
    [windowWidth]
  );

  // Get slides based on current language with fallback to English
  const slides = useMemo(() => getSlidesForLanguage(i18n.language), [i18n.language]);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken[];
      changed: ViewToken[];
    }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const planOptions = useMemo(
    () => createPaywallPlanOptions(products, t),
    [products, t]
  );
  const hasAvailablePlan = useMemo(
    () => planOptions.some((plan) => plan.available),
    [planOptions]
  );

  useEffect(() => {
    if (planOptions.length === 0) {
      setSelectedProductId(null);
      return;
    }

    if (!selectedProductId || !planOptions.some((plan) => plan.id === selectedProductId)) {
      setSelectedProductId(planOptions[0]?.id ?? null);
    }
  }, [planOptions, selectedProductId]);

  const isPurchaseSupported = Platform.OS === 'ios' && hasAvailablePlan;
  const purchaseDisabled = isLoading || !isPurchaseSupported || !selectedProductId;
  const onboardingCompletedRef = useRef(false);

  useEffect(() => {
    if (isPremium && !onboardingCompletedRef.current) {
      onboardingCompletedRef.current = true;
      const completeOnboarding = async () => {
        await AsyncStorage.setItem('@eyezen_onboarding_completed', 'true');
        navigation.replace('Home');
      };
      completeOnboarding();
    }
  }, [isPremium, navigation]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem('@eyezen_onboarding_completed', 'true');
    navigation.replace('Home');
  };

  const handlePurchase = async () => {
    if (!selectedProductId || !isPurchaseSupported) {
      Alert.alert(
        t('purchaseModal.unavailableTitle'),
        t('purchaseModal.unavailableMessage')
      );
      return;
    }
    await purchase(selectedProductId);
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        t('purchaseModal.unavailableTitle'),
        t('purchaseModal.unavailableMessage')
      );
      return;
    }
    await restore();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const isLastSlide = item.isPaywall;
    if (isLastSlide) {
      return (
        <View style={styles.slide}>
          <PremiumPaywall
            backgroundImage={item.image}
            planOptions={planOptions}
            selectedProductId={selectedProductId}
            onSelectPlan={(id) => setSelectedProductId(id)}
            onPurchase={handlePurchase}
            onClose={handleSkip}
            onRestore={handleRestore}
            isLoading={isLoading}
            isPurchaseSupported={isPurchaseSupported}
            ctaDisabled={purchaseDisabled}
          />
        </View>
      );
    }

    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;
  const isIpad = Platform.OS === 'ios' && Platform.isPad;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Controls */}
      {!isLastSlide && (
        <View style={[styles.bottomControls, isIpad && styles.bottomControlsIpad]}>
          <View style={[styles.bottomControlsContent, { width: bottomControlsWidth }]}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {slides.slice(0, -1).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.border },
                    index === currentIndex && [styles.dotActive, { backgroundColor: "#1C0D0D" }],
                  ]}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Pressable onPress={handleSkip} style={styles.nextButton}>
                <Text style={[styles.textButtonLabel]}>
                  {t('onboarding.skip')}
                </Text>
              </Pressable>

              <Pressable onPress={handleNext} style={[styles.nextButton, { backgroundColor: "#9977B8" }]}>
                <Text style={[styles.nextButtonText, { color: theme.colors.buttonText }]}>
                  {t('onboarding.next')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bottomControlsIpad: {
  },
  bottomControlsContent: {
    width: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  textButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: "#F2EDED"
  },
  nextButton: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#9977B8",
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
