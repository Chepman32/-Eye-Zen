import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { usePurchase } from '../contexts/PurchaseContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  image: any;
  isPaywall?: boolean;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    image: require('../assets/onboarding/onboarding_en_1.png'),
  },
  {
    id: '2',
    image: require('../assets/onboarding/onboarding_en_2.png'),
  },
  {
    id: '3',
    image: require('../assets/onboarding/onboarding_en_3.png'),
  },
  {
    id: '4',
    image: require('../assets/onboarding/onboarding_en_4.png'),
  },
  {
    id: '5',
    image: require('../assets/onboarding/onboarding_en_paywall.png'),
    isPaywall: true,
  },
];

const OnboardingScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, 'Onboarding'>
> = ({ navigation }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { products, purchase, isLoading } = usePurchase();

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
    await purchase();
    // After purchase, go to home
    await AsyncStorage.setItem('@eyezen_onboarding_completed', 'true');
    navigation.replace('Home');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const isLastSlide = item.isPaywall;
    const price = products.length > 0 ? products[0].localizedPrice : '$2.99';

    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />

        {isLastSlide && (
          <>
            {/* Close Button - top right */}
            <Pressable onPress={handleSkip} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            <View style={styles.paywallOverlay}>
              {/* Price Badge */}
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{price}</Text>
                <Text style={styles.priceSubtext}>one-time payment</Text>
              </View>

              {/* Purchase Button */}
              <Pressable
                style={styles.purchaseButton}
                onPress={handlePurchase}
                disabled={isLoading}>
                <Text style={styles.purchaseButtonText}>
                  {isLoading ? 'Processing...' : 'Unlock Premium'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <View style={styles.bottomControls}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {slides.slice(0, -1).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable onPress={handleSkip} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Skip</Text>
            </Pressable>

            <Pressable onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  paywallOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  priceBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  purchaseButton: {
    backgroundColor: '#5B4FB4',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#5B4FB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
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
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#5B4FB4',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  textButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  nextButton: {
    backgroundColor: '#5B4FB4',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
