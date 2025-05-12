import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { forgotPassword, operationLoading, error } = useAuth();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const success = await forgotPassword(email);
    if (success) {
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} animated />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* App Logo in circular background */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <View style={styles.logoBgAuth}>
              <Image
                source={require('../../../assets/app-logo.png')}
                style={styles.logoInCircleAuth}
                resizeMode="contain"
                accessibilityLabel="PYQDeck logo"
              />
            </View>
          </View>
          <Text style={styles.title}>Forgot <Text style={{ color: COLORS.primaryDark }}>Password</Text></Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              operationLoading && { opacity: 0.55 }
            ]}
            onPress={handleForgotPassword}
            disabled={operationLoading}
            activeOpacity={0.85}
          >
            {operationLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.05,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 28 : 26,
    fontWeight: 'bold',
    color: COLORS.textTitle,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: COLORS.textBody,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
    color: COLORS.textTitle,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1.5,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    minWidth: width * 0.27,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 6,
  },
  backButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoBgAuth: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 7,
    elevation: 2,
  },
  logoInCircleAuth: {
    width: 48,
    height: 48,
  },
});

export default ForgotPasswordScreen;
