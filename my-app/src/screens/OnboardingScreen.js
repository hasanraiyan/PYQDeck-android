import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

// --- Updated Color Palette Based on Analysis ---
const COLORS = {
  primary: '#7C6BEE', // Adjusted primary purple (matches example better)
  primaryDark: '#5F4BE2', // Slightly darker for press states or emphasis

  white: '#FFFFFF',
  background: '#FFFFFF', // Clean white background

  textTitle: '#1D2737', // Dark, strong title color (from example)
  textBody: '#4A5568', // Softer gray for descriptions
  textSecondary: '#6B7280', // For skip text, less important info

  inactiveDot: '#D1D5DB', // Light gray for inactive dots (from example)
  lightBorder: '#E5E7EB', // For subtle borders if needed
  shadowColor: '#A0AEC0', // For soft shadows (though examples are quite flat)
};

const getPollinationsImageUrl = (prompt) => {
  // Add style keywords from the example images to the prompt
  const stylePrompt = "white background, modern flat illustration, character design, educational tech, clean lines, vibrant purple and blue color palette, minimal background, centered composition";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", " + stylePrompt)}`;
};

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef(null);

  const mainButtonScale = useRef(new Animated.Value(1)).current;
  const skipButtonScale = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      key: '1',
      title: 'Browse PYQ Questions', // Or "Discover BEU PYQs Easily"
      description: 'Access thousands of previous year questions from various universities and exams.',
      image: require('../assets/onboarding1.png'),
    },
    {
      key: '2',
      title: 'Track Your Progress',
      description: 'Mark questions as completed and track your learning progress over time.',
      image: require('../assets/onboarding2.png'),
    },
    {
      key: '3',
      title: 'Personalized Learning', // Or "Smart Recommendations For You"
      description: 'Get tailored question recommendations based on your learning patterns.',
      image: require('../assets/onboarding3.png'),
    },
  ];

  const handleDone = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    navigation.navigate('Home');
  };

  const handleNext = () => {
    if (swiperRef.current && activeSlide < slides.length - 1) {
      swiperRef.current.scrollBy(1);
    }
  };

  const onPressIn = (buttonType = 'main') => {
    const scaleAnim = buttonType === 'skip' ? skipButtonScale : mainButtonScale;
    const toValue = 0.96; // Consistent press depth
    Animated.spring(scaleAnim, { toValue, friction: 7, tension: 100, useNativeDriver: true }).start();
  };
  const onPressOut = (buttonType = 'main') => {
    const scaleAnim = buttonType === 'skip' ? skipButtonScale : mainButtonScale;
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  };

  const isLastSlide = activeSlide === slides.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Progress Label Only */}
        <View style={{ marginTop: 32, marginBottom: 18, alignItems: 'center', height: 22 }}>
          <Text
            style={{
              color: COLORS.primaryDark,
              fontSize: 18,
              fontWeight: '700',
              opacity: 0.92,
            }}
            accessibilityLiveRegion="polite"
          >
            {`Step ${activeSlide + 1} of ${slides.length}`}
          </Text>
        </View>
        <Swiper
          ref={swiperRef}
          loop={false}
          onIndexChanged={(index) => setActiveSlide(index)}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          paginationStyle={styles.pagination}
          showsPagination={true}
          showsButtons={false} // We use custom footer buttons
        >
          {slides.map((slide) => (
            <View key={slide.key} style={styles.slideContent}>
              {/* Image takes up a significant portion, then text below */}
              <View style={styles.imageContainer}>
                <Image source={slide.image} style={styles.image} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </Swiper>

        {/* Footer with divider and horizontal button row */}
        <View style={styles.footer}>
          {/* Divider on top of buttons */}
          <View style={styles.footerDivider} />

          {/* Horizontal row of buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            {/* Skip Button - Only if not on the last slide */}
            {!isLastSlide && (
              <TouchableOpacity
                style={styles.skipButtonTouchable}
                onPressIn={() => onPressIn('skip')}
                onPressOut={() => onPressOut('skip')}
                onPress={handleDone}
              >
                <Animated.View style={{ transform: [{ scale: skipButtonScale }] }}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* Spacer to push Next/Get Started button to the right if Skip is present */}
            {!isLastSlide && <View style={{ flex: 1 }} />}

            {/* Next / Get Started Button */}
            <TouchableOpacity
              onPress={isLastSlide ? handleDone : handleNext}
              style={[
                styles.mainButtonTouchable,
                isLastSlide && styles.getStartedButtonFullWidth
              ]}
              onPressIn={() => onPressIn('main')}
              onPressOut={() => onPressOut('main')}
            >
              <Animated.View style={[
                styles.mainButton,
                isLastSlide ? styles.getStartedButtonStyles : styles.nextButtonStyles,
                { transform: [{ scale: mainButtonScale }] }
              ]}>
                <Text style={styles.mainButtonText}>
                  {isLastSlide ? 'Get Started' : 'Next'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.lightBorder,
    width: '100%',
    marginBottom: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingBottom: 20, // Space for footer elements
  },
  slideContent: { // Content within each Swiper slide
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    paddingHorizontal: width * 0.08, // Generous horizontal padding
  },
  imageContainer: {
    width: width * 0.8, // Image width
    height: width * 0.8 * 0.85, // Aspect ratio for image (adjust as needed)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.05, // Space between image and text
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // Padding for text block
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 28 : 26, // Large, prominent title
    fontWeight: 'bold', // Bold as per example
    color: COLORS.textTitle,
    textAlign: 'center',
    marginBottom: 15,
    // fontFamily: 'YourApp-Bold', // TODO: Add your custom font
  },
  description: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: COLORS.textBody,
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 24 : 22, // Good readability
    // fontFamily: 'YourApp-Regular', // TODO: Add your custom font
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column', // vertical stacking: divider (top), buttons (bottom)
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.02, // Vertical padding for footer
    minHeight: height * 0.1, // Ensure footer has enough height
    paddingBottom: Platform.OS === 'ios' ? height * 0.03 : height * 0.02, // Extra for iOS bottom bar
    width: '100%',
  },
  pagination: { // Swiper's pagination style
    // Positioned by Swiper, but ensure it's above the buttons
    // The default positioning of swiper pagination is usually at the bottom of the swiper view.
    // We can adjust its 'bottom' relative to the swiper view itself if needed,
    // but here the footer elements are outside the swiper.
    // So we'll manually place our custom dots OR rely on swiper's default
    // For now, using swiper's default and styling its dots.
    // This will be relative to the swiper container which is most of the screen.
    // We might need to move the Swiper view up a bit if pagination clashes with footer.
    // For precise control, we'd create our own pagination outside the swiper.
    // Let's assume swiper's pagination is fine for now.
    bottom: height * 0.15, // Push it up from the absolute bottom of the Swiper
  },
  dot: {
    backgroundColor: COLORS.inactiveDot,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: { // Elongated active dot like in the example
    backgroundColor: COLORS.primary,
    width: 20, // Wider
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  skipButtonTouchable: {
     padding: 10, // Hit area for skip
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    // fontFamily: 'YourApp-Medium',
  },
  mainButtonTouchable: { // Touchable wrapper for the main button
    // Flex behavior managed by footer's justifyContent
  },
  mainButton: { // Common styles for Next/Get Started button (Animated.View)
    borderRadius: 28, // Well-rounded corners
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: width * 0.35, // Good minimum width
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Subtle shadow
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonStyles: { // Specific to "Next"
    backgroundColor: COLORS.primary,
    paddingHorizontal: 35,
  },
  getStartedButtonStyles: { // Specific to "Get Started"
    backgroundColor: COLORS.primary, // Same color as "Next" in this design
    paddingHorizontal: 40,
  },
  getStartedButtonFullWidth: { // Style for the TouchableOpacity when it's the only button
    flex: 1, // Take full width available in the footer
    marginHorizontal: width * 0.1, // Add some margin if taking full width
  },
  mainButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    // fontFamily: 'YourApp-SemiBold',
  },
});


// --- Step Tab Bar Styles ---
const stepTabSize = 28;

styles.stepTabBar = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
};
styles.stepTab = {
    width: stepTabSize,
    height: stepTabSize,
    borderRadius: stepTabSize / 2,
    backgroundColor: COLORS.inactiveDot,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
};
styles.stepTabActive = {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
};
styles.stepTabText = {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 14,
};
styles.stepTabTextActive = {
    color: COLORS.white,
    fontWeight: '700',
};
