import React, { useState, useRef, useEffect } from 'react';
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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Consistent palette with onboarding/login
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

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const { register, operationLoading, error } = useAuth();
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const spinnerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      // Shrink button and pulse spinner
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(spinnerAnim, {
              toValue: 1.15,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(spinnerAnim, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
      spinnerAnim.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const success = await register(name, email, password);
    if (!success && error) {
      Alert.alert('Registration Failed', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Big Onboarding Illustration */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={require('../../assets/onboarding1.png')}
              style={{
                width: width * 0.52,
                height: width * 0.4,
                resizeMode: 'contain',
                marginTop: 10,
                marginBottom: 2,
              }}
            />
          </View>
          <Text style={styles.title}>
            Create <Text style={{ color: COLORS.primaryDark }}>Account</Text>
          </Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                nameFocused && { borderColor: COLORS.primaryDark, borderWidth: 2 }
              ]}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailFocused && { borderColor: COLORS.primaryDark, borderWidth: 2 }
              ]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && { borderColor: COLORS.primaryDark, borderWidth: 2 }
                ]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 0,
                  height: '100%',
                  justifyContent: 'center',
                  paddingLeft: 16,
                  paddingRight: 4,
                }}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput
                style={[
                  styles.input,
                  confirmFocused && { borderColor: COLORS.primaryDark, borderWidth: 2 }
                ]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 0,
                  height: '100%',
                  justifyContent: 'center',
                  paddingLeft: 16,
                  paddingRight: 4,
                }}
                onPress={() => setShowConfirmPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            style={[
              styles.registerButton,
              {
                opacity: (operationLoading || !name || !email || !password || !confirmPassword) ? 0.5 : 1,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
              onPress={handleRegister}
              disabled={operationLoading || !name || !email || !password || !confirmPassword}
              activeOpacity={0.85}
            >
              {operationLoading ? (
                <Animated.View style={{ transform: [{ scale: spinnerAnim }] }}>
                  <ActivityIndicator color="#fff" />
                </Animated.View>
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 16,
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
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    minWidth: width * 0.27,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginText: {
    color: COLORS.textBody,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
