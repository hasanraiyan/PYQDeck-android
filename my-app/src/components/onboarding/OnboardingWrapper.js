import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../constants/Colors'; // Adjust path if your Colors.js is elsewhere

const { width, height } = Dimensions.get('window');

const OnboardingWrapper = ({ children, title, subtitle, disableScroll }) => {
  const Wrapper = disableScroll ? React.Fragment : ScrollView;
  const wrapperProps = disableScroll ? {} : { contentContainerStyle: styles.scrollContainer, keyboardShouldPersistTaps: 'handled' };
  return (
    <SafeAreaView style={styles.safeArea}>
      <Wrapper {...wrapperProps}>
        <View style={styles.container}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
      </Wrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    paddingHorizontal: width * 0.07,
    alignItems: 'center',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 26 : 24,
    fontWeight: 'bold',
    color: COLORS.textTitle,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: COLORS.textBody,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
});

export default OnboardingWrapper;