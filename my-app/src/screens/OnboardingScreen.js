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
import Carousel from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');

// --- Updated Color Palette Based on Analysis ---
const COLORS = {
    primary: '#7C6BEE',
    primaryDark: '#5F4BE2',
    white: '#FFFFFF',
    background: '#FFFFFF',
    textTitle: '#1D2737',
    textBody: '#4A5568',
    textSecondary: '#6B7280',
    inactiveDot: '#D1D5DB',
    lightBorder: '#E5E7EB',
    shadowColor: '#A0AEC0',
};

// Helper to generate Pollinations onboarding image URLs with style keywords
const getPollinationsImageUrl = (prompt) => {
    // Add style keywords from the example images to the prompt
    const stylePrompt =
        "white background, modern flat illustration, character design, educational tech, clean lines, vibrant purple and blue color palette, minimal background, centered composition";
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt + ", " + stylePrompt
    )}`;
};

export default function OnboardingScreen() {
    // Slides array NEEDS to be before any usage in effects!
    // Use Vector Icons for slide icons
    const slides = [
        {
            key: '1',
            title: 'Browse PYQ Questions',
            description:
                'Easily search and access thousands of previous year questions from top universities and exams.',
            image: { uri: getPollinationsImageUrl("Engineering student searching for previous year questions on a laptop with books and question marks") },
            icon: (props) => <Ionicons name="search" {...props} />,
            actionHint: 'Swipe categories to explore question banks',
        },
        {
            key: '2',
            title: 'Track Your Progress',
            description:
              'Keep track of your completed questions and measure your overall learning progress through visual stats and performance charts.',
            image: { uri: getPollinationsImageUrl("Engineering student tracking completed questions and progress with charts") },
            icon: (props) => <Ionicons name="stats-chart" {...props} />,
            actionHint: 'Mark questions as completed to see your progress over time',
          },
          {
            key: '3',
            title: 'Personalized Learning',
            description:
              'Receive custom-tailored recommendations that adapt to your study habits, helping you focus on areas that need improvement for optimal results.',
            image: { uri: getPollinationsImageUrl("Engineering student receiving smart recommendations based on learning patterns and performance") },
            icon: (props) => <MaterialCommunityIcons name="target" {...props} />,
            actionHint: 'Check your learning patterns for personalized tips and recommendations',
          }
          
    ];

    const navigation = useNavigation();
    const { setOnboardingCompleted } = useApp();
    const [activeSlide, setActiveSlide] = useState(0);
    const carouselRef = useRef(null);

    // Animated values for button morph transitions
    const mainButtonScale = useRef(new Animated.Value(1)).current;
    const skipButtonScale = useRef(new Animated.Value(1)).current;
    const nextToGetStarted = useRef(new Animated.Value(0)).current; // 0=show Next, 1=show Get Started

    React.useEffect(() => {
        // Animate button morph on slide transitions
        Animated.timing(nextToGetStarted, {
            toValue: activeSlide === slides.length - 1 ? 1 : 0,
            duration: 250,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false, // Must be false for width animation (JS-driven)
        }).start();
    }, [activeSlide, slides.length]);

    const handleDone = async () => {
        await setOnboardingCompleted(true);
        // No navigation here — AppNavigator will rerender according to onboarding status.
    };

    const handleNext = () => {
        if (activeSlide < slides.length - 1 && carouselRef.current) {
            carouselRef.current.scrollTo({ index: activeSlide + 1, animated: true });
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

    // Animate label morph (Next → OK/Get Started)
    const mainLabelOpacity = nextToGetStarted.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });
    const getStartedLabelOpacity = nextToGetStarted.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0, 0.5, 1],
    });
    // Remove width animation. Use static width -- wide on last slide, compact otherwise.
    const getButtonWidth = (isLastSlide) => (isLastSlide ? 260 : 160);

    // Animate skip fade out
    const skipOpacity = nextToGetStarted.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [1, 0.4, 0],
    });
    const skipTranslateY = nextToGetStarted.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 24],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Step Progress Label */}
                <View style={styles.stepIndicatorWrapper}>
                    <Text
                        style={styles.stepIndicator}
                        accessibilityLiveRegion="polite"
                    >
                        {`Step ${Math.floor(activeSlide + 1)} of ${slides.length}`}
                    </Text>
                </View>
                <Carousel
                    ref={carouselRef}
                    width={width}
                    height={height * 0.67}
                    data={slides}
                    scrollAnimationDuration={500}
                    pagingEnabled
                    loop={false}
                    snapEnabled
                    style={{ flexGrow: 0, marginBottom: 0, overflow: 'visible' }}
                    mode="horizontal-stack"
                    modeConfig={{
                        snapDirection: 'left',
                        stackInterval: 9,
                        showLength: 1,
                        opacityInterval: 1,
                        scaleInterval: 0,
                    }}
                    panGestureHandlerProps={{
                        activeOffsetX:
                            activeSlide === 0
                                ? [0, 10]
                                : activeSlide === slides.length - 1
                                    ? [-10, 0]
                                    : [-10, 10],
                    }}
                    renderItem={({ item: slide }) => (
                        <View key={slide.key} style={styles.slideContent}>
                            {/* Large Vector Icon above Image */}
                            <View style={styles.iconContainer}>
                                <View style={styles.iconBg}>
                                    <Image
                                        source={require('../../assets/app-logo.png')}
                                        style={styles.logoIconInCircle}
                                        accessibilityLabel="App Logo"
                                    />
                                </View>
                            </View>
                            {/* Image/Illustration */}
                            <View style={styles.imageContainerLarge}>
                                <Image source={slide.image} style={styles.imageLarge} />
                            </View>
                            {/* Headline, Description, and Action Hint */}
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{slide.title}</Text>
                                <Text style={styles.description}>{slide.description}</Text>
                                <Text style={styles.actionHint}>{slide.actionHint}</Text>
                            </View>
                        </View>
                    )}
                    customAnimation={null}
                    windowSize={1}
                    removeClippedSubviews={true}
                    defaultIndex={0}
                    customConfig={() => ({ type: 'positive', viewCount: 1 })}
                    onSnapToItem={(index) => setActiveSlide(index)}
                    enabled /* allow touch scroll */
                    activeSlideOffset={0}
                    panGestureHandlerSimultaneousHandlers={undefined}
                    scrollEnabled
                    enableSnap
                    autoPlay={false}
                    currentIndex={activeSlide}
                />

                {/* Pagination anchored to bottom, above footer divider */}
                {/* Footer with divider and horizontal button row */}
                <View style={styles.footer}>
                    {/* Pagination dots above the divider */}
                    <View style={styles.paginationRow}>
                        {slides.map((_, idx) => (
                            <View
                                key={idx}
                                style={activeSlide === idx ? styles.activeDot : styles.dot}
                            />
                        ))}
                    </View>
                    {/* Divider on top of buttons */}
                    <View style={styles.footerDivider} />

                    {/* Horizontal row of buttons */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: isLastSlide ? 'center' : 'flex-start',
                        }}
                    >
                        {/* Skip button always rendered, fades out on last slide */}
                        {!isLastSlide && (
                            <Animated.View
                                style={{
                                    opacity: skipOpacity,
                                    transform: [{ translateY: skipTranslateY }, { scale: skipButtonScale }],
                                    zIndex: 2,
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.skipButtonTouchable}
                                    onPressIn={() => onPressIn('skip')}
                                    onPressOut={() => onPressOut('skip')}
                                    onPress={handleDone}
                                >
                                    <Text style={styles.skipButtonText}>Skip</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Spacer to push Next button right when not last slide */}
                        {!isLastSlide && <View style={{ flex: 1 }} />}

                        {/* Animated morphing Next/Get Started/OK button, centered if last slide */}
                        <TouchableOpacity
                            onPress={isLastSlide ? handleDone : handleNext}
                            style={[
                                styles.mainButtonTouchable,
                                isLastSlide && styles.getStartedButtonFullWidth,
                                { alignItems: 'center', justifyContent: 'center' },
                            ]}
                            onPressIn={() => onPressIn('main')}
                            onPressOut={() => onPressOut('main')}
                            activeOpacity={0.9}
                        >
                            <Animated.View
                                style={[
                                    styles.mainButton,
                                    isLastSlide ? styles.getStartedButtonStyles : styles.nextButtonStyles,
                                    { transform: [{ scale: mainButtonScale }], width: getButtonWidth(isLastSlide) },
                                ]}
                            >
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
        justifyContent: 'flex-start',
        paddingHorizontal: width * 0.08,
        paddingTop: 0,
    },
    iconContainer: {
        marginTop: 5,
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ede9fe', // Soft light version of purple, tweak if needed
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 0,
    },
    logoIconInCircle: {
        width: 54,
        height: 54,
        resizeMode: 'contain',
    },
    imageContainerLarge: {
        width: width * 0.92,
        height: width * 0.92 * 1.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageLarge: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        marginTop: 8,
        marginBottom: 0,
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
    actionHint: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
    },
    mainButtonTouchable: { // Touchable wrapper for the main button
        // Flex behavior managed by footer's justifyContent
    },
    mainButton: { // Common styles for Next/Get Started button (Animated.View)
        borderRadius: 36, // Even more rounded
        paddingVertical: 22,
        paddingHorizontal: 28,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 120, // Compact min for Next; width is animated
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Subtle shadow
        shadowRadius: 14,
        elevation: 7,
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
        fontSize: 20,
        fontWeight: '700',
        // fontFamily: 'YourApp-SemiBold',
    },
    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        minHeight: 20,
    },
    stepIndicatorWrapper: {
        marginTop: 28,
        marginBottom: 14,
        alignItems: 'center',
        minHeight: 18,
        justifyContent: 'center'
    },
    stepIndicator: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.78,
        letterSpacing: 0.5,
        textAlign: 'center',
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
