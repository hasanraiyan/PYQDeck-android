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

const ResetPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, operationLoading, error } = useAuth();
  const { resetToken } = route.params;

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
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

    const success = await resetPassword(resetToken, password);
    if (success) {
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={require('../../../assets/onboarding1.png')}
              style={{
                width: width * 0.48,
                height: width * 0.36,
                resizeMode: 'contain',
                marginTop: 10,
                marginBottom: 0,
              }}
            />
          </View>
          <Text style={styles.title}>Reset <Text style={{ color: COLORS.primaryDark }}>Password</Text></Text>
          <Text style={styles.subtitle}>
            Enter your new password below
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              operationLoading && { opacity: 0.55 }
            ]}
            onPress={handleResetPassword}
            disabled={operationLoading}
            activeOpacity={0.85}
          >
            {operationLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
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
});

export default ResetPasswordScreen;
