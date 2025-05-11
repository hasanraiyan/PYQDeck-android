import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#7C6BEE', // Purple
  primaryDark: '#5F4BE2',
  white: '#FFFFFF',
  background: '#FFFFFF',
  textTitle: '#22223B',
  textSubtitle: '#72727E',
  textBody: '#6B7280',
  border: '#DADADA',
  google: '#4285F4',
};

export default function AuthLandingScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo and Title Block */}
        <View style={styles.topSection}>
          <View style={styles.logoBgLanding}>
            <Image
              source={require('../../assets/app-logo.png')}
              style={styles.logoInCircleLanding}
              resizeMode="contain"
              accessibilityLabel="PYQDeck logo"
            />
          </View>
          <Text style={styles.appTitle}>PYQDeck</Text>
          <Text style={styles.subtitle}>Your smart BEU PYQ companion</Text>
        </View>

        {/* Illustration */}
        <Image
          source={require('../assets/onboarding1.png')} // Ensure this path is correct
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="Education Illustration"
        />

        {/* Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Login Button - Modified for "Coming Soon" disabled look */}
          <View style={{ width: '100%', marginBottom: 0, alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.googleLoginButton}
              onPress={() => {}} // No action
              activeOpacity={1} // No visual feedback on press when disabled
              disabled={true}     // Disables interaction
            >
              <View style={styles.googleContent}>
                <Image
                  source={{
                    uri:'https://img.icons8.com/?size=100&id=17949&format=png&color=000000',
                  }}
                  style={styles.googleBtnIcon}
                  resizeMode="contain"
                  accessibilityLabel="Google logo"
                />
                <Text style={styles.googleLoginButtonText}>Login with Google</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.comingSoonBelow}>Coming Soon</Text>
          </View>
        </View>

        {/* Terms & Policy */}
        <Text style={styles.policyText}>
          By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> & <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed to flex-start to allow content to push policyText down
    paddingHorizontal: 26,
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    backgroundColor: COLORS.background,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBgLanding: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
    elevation: 2,
  },
  logoInCircleLanding: {
    width: 68,
    height: 68,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textTitle,
    marginBottom: 6,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSubtitle,
    textAlign: 'center',
    marginBottom: 6,
  },
  illustration: {
    width: width * 0.68,
    height: width * 0.5,
    marginBottom: 32,
    marginTop: 0,
  },
  buttonsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8, // Adjusted for overall spacing
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  signupButton: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 22,
  },
  signupButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1.2,
    backgroundColor: COLORS.border,
  },
  orText: {
    color: COLORS.textBody,
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  // --- Modified Google Button Styles for Disabled "Coming Soon" Look ---
  googleLoginButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white, // Keep background white for consistency with signup
    borderWidth: 2,
    borderColor: COLORS.border, // Muted border color for disabled look
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    marginBottom: 7,
    // Removed shadow for a flatter, disabled appearance
    // shadowColor: COLORS.primary,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.10,
    // shadowRadius: 3,
    // elevation: 3, // Remove elevation for Android
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5, // Reduce opacity of content to signify disabled state
  },
  googleBtnIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 12,
    marginRight: 12,
  },
  googleLoginButtonText: {
    color: COLORS.textTitle, // Original color, will be faded by googleContent opacity
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  // --- End of Modified Google Button Styles ---
  comingSoonBelow: {
    textAlign: 'center',
    color: '#AAA8B3', // Muted color, good for helper text
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3, // Small space after the button
    marginBottom: 12, // Space before the policy text
    letterSpacing: 0.15,
  },
  policyText: {
    fontSize: 13,
    color: COLORS.textBody,
    flexWrap: 'wrap',
    textAlign: 'center',
    marginTop: 'auto', // Pushes to the bottom if container has flex:1 and justifyContent: 'space-between' or if other content doesn't fill screen
    paddingBottom: Platform.OS === 'ios' ? 10 : 20, // Ensure some padding at the very bottom
    opacity: 0.85,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
