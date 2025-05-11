// src/screens/Onboarding/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Animated, TouchableOpacity,
  Dimensions, Platform, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tinycolor from 'tinycolor2';

import { AppTheme } from '../../constants/theme';
import { playHaptic } from '../../utils/haptics';
import PrimaryButton from '../../components/common/PrimaryButton'; // Assuming PrimaryButton is common
import ThemedStatusBar from '../../components/common/ThemedStatusBar';


const { width, height } = Dimensions.get('window');

const onboardingSlidesData = [
  { id: '1', iconName: 'library-sharp', title: 'Vast PYQ Library', description: 'Access thousands of Previous Year Questions across all engineering disciplines and semesters.', bgColor: [AppTheme.colors.primaryLight, AppTheme.colors.primaryDark] },
  { id: '2', iconName: 'search-circle-sharp', title: 'Smart & Quick Search', description: 'Instantly find specific questions or topics with our powerful, intuitive search and filtering tools.', bgColor: [AppTheme.colors.accent, tinycolor(AppTheme.colors.accent).darken(20).toString()] },
  { id: '3', iconName: 'bookmark-sharp', title: 'Personalized Study Hub', description: 'Bookmark important PYQs, track your progress, and get recommendations tailored to your learning path.', bgColor: [AppTheme.colors.info, tinycolor(AppTheme.colors.info).darken(20).toString()] },
  { id: '4', iconName: 'rocket-sharp', title: "Ace Your Exams!", description: 'PYQDeck is your ultimate companion for engineering exam success. Let\'s get started!', bgColor: [AppTheme.colors.success, tinycolor(AppTheme.colors.success).darken(20).toString()] },
];

const OnboardingItem = ({ item, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const iconScale = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp' });
  const iconRotate = scrollX.interpolate({ inputRange, outputRange: ['-30deg', '0deg', '30deg'], extrapolate: 'clamp' });
  const textTranslateY = scrollX.interpolate({ inputRange, outputRange: [50, 0, 50], extrapolate: 'clamp' });

  return (
    <View style={styles.onboarding_slideItemContainer}>
      <View style={styles.onboarding_graphicContainer}>
        <LinearGradient
          colors={item.bgColor || [AppTheme.colors.primaryLight, AppTheme.colors.primaryDark]}
          style={styles.onboarding_iconBg_new}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: iconRotate }] }}>
            <Ionicons name={item.iconName} size={width * 0.38} color={AppTheme.colors.lightText} style={styles.onboarding_mainIcon} />
          </Animated.View>
        </LinearGradient>
      </View>
      <Animated.Text style={[styles.onboarding_slideTitle, { transform: [{ translateY: textTranslateY }] }]}>
        {item.title}
      </Animated.Text>
      <Animated.Text style={[styles.onboarding_slideDescription, { transform: [{ translateY: textTranslateY }] }]}>
        {item.description}
      </Animated.Text>
    </View>
  );
};

const Paginator = ({ data, scrollXVal }) => (
  <View style={styles.onboarding_paginatorContainer}>
    {data.map((_, i) => {
      const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
      const dotSize = scrollXVal.interpolate({ inputRange, outputRange: [10, 16, 10], extrapolate: 'clamp' });
      const dotOpacity = scrollXVal.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
      const dotColor = scrollXVal.interpolate({
        inputRange,
        outputRange: [AppTheme.colors.placeholder, AppTheme.colors.primary, AppTheme.colors.placeholder],
        extrapolate: 'clamp',
      });
      return (
        <Animated.View
          style={[styles.onboarding_dot_new, { width: dotSize, height: dotSize, opacity: dotOpacity, backgroundColor: dotColor }]}
          key={i.toString()}
        />
      );
    })}
  </View>
);

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < onboardingSlidesData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.onboarding_container}>
      <ThemedStatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.background} />
      <View style={styles.onboarding_skipButtonContainer}>
        {currentIndex < onboardingSlidesData.length - 1 && (
          <TouchableOpacity onPress={() => { playHaptic(); onComplete(); }} style={styles.onboarding_skipButton}>
            <Text style={styles.onboarding_skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        ref={slidesRef}
        data={onboardingSlidesData}
        renderItem={({ item, index }) => <OnboardingItem item={item} index={index} scrollX={scrollX} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={16}
      />
      <Paginator data={onboardingSlidesData} scrollXVal={scrollX} />
      <View style={styles.onboarding_buttonArea}>
        <PrimaryButton
          title={currentIndex === onboardingSlidesData.length - 1 ? "Let's Go!" : 'Next'}
          onPress={() => { playHaptic('medium'); scrollToNext(); }}
          iconName={currentIndex < onboardingSlidesData.length - 1 ? "arrow-forward-circle" : "rocket-sharp"}
          style={{ minWidth: width * 0.9 }}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

// Add relevant styles from your prototype's StyleSheet for Onboarding here
const styles = StyleSheet.create({
    onboarding_container: { flex: 1, backgroundColor: AppTheme.colors.background },
    onboarding_skipButtonContainer: { position: 'absolute', top: (Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0) + (Platform.OS === 'ios' ? AppTheme.spacing.xl : AppTheme.spacing.lg + AppTheme.spacing.sm), right: AppTheme.spacing.lg, zIndex: 10 },
    onboarding_skipButton: { paddingVertical: AppTheme.spacing.sm, paddingHorizontal:AppTheme.spacing.md, backgroundColor:AppTheme.colors.primary+'2A', borderRadius:AppTheme.borderRadius.circle },
    onboarding_skipButtonText: { fontSize: AppTheme.typography.bodySmall, color: AppTheme.colors.primary, fontFamily: AppTheme.typography.fontBold},
    onboarding_slideItemContainer: { width: width, flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: AppTheme.spacing.lg, paddingTop: height * 0.1 },
    onboarding_graphicContainer: { width: '100%', height: height * 0.4, justifyContent: 'center', alignItems: 'center', marginBottom: AppTheme.spacing.lg },
    onboarding_iconBg_new: { width: width * 0.75, height: width * 0.75, borderRadius: AppTheme.borderRadius.xl + 20, justifyContent:'center', alignItems:'center', transform: [{ rotate: '-15deg' }], elevation: 12, shadowColor: AppTheme.colors.strongShadow, shadowOffset: {width: 0, height: 10}, shadowOpacity: 1, shadowRadius: 15 },
    onboarding_mainIcon: { transform: [{ rotate: '15deg' }] },
    onboarding_slideTitle: { fontFamily: AppTheme.typography.fontBold, fontSize: AppTheme.typography.h1Size, marginBottom: AppTheme.spacing.md, color: AppTheme.colors.text, textAlign: 'center', letterSpacing:0.2},
    onboarding_slideDescription: { color: AppTheme.colors.textSecondary, textAlign: 'center', paddingHorizontal: AppTheme.spacing.md, fontSize: AppTheme.typography.bodySize, lineHeight: AppTheme.typography.bodySize * 1.6, fontFamily: AppTheme.typography.fontRegular},
    onboarding_paginatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: AppTheme.spacing.lg, height: AppTheme.spacing.lg },
    onboarding_dot_new: { borderRadius: AppTheme.borderRadius.circle, marginHorizontal: AppTheme.spacing.sm },
    onboarding_buttonArea: { paddingBottom: Platform.OS === 'ios' ? AppTheme.spacing.xl : AppTheme.spacing.lg, width: '100%', alignItems: 'center', paddingHorizontal:AppTheme.spacing.lg },
});

export default OnboardingScreen;