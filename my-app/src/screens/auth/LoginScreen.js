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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, operationLoading, error } = useAuth();

  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success && error) {
      Alert.alert('Login Failed', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} animated />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
          <Text style={styles.title}>
            Welcome <Text style={{ color: COLORS.primaryDark }}>Back!</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

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
              placeholderTextColor={COLORS.textSecondary}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
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
                placeholderTextColor={COLORS.textSecondary}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
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

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (operationLoading || !email || !password) && { opacity: 0.5 }
            ]}
            onPress={handleLogin}
            disabled={operationLoading || !email || !password}
            activeOpacity={0.85}
          >
            {operationLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
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
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: width * 0.08, // Match onboarding generous horizontal padding
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
    marginBottom: 28,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotPasswordText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500'
  },
  loginButton: {
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
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  registerText: {
    color: COLORS.textBody,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 14,
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

export default LoginScreen;
