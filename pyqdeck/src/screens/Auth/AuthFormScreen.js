// src/screens/Auth/AuthFormScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Platform, StatusBar as RNStatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '../../constants/theme';
import PrimaryButton from '../../components/common/PrimaryButton';
import ThemedStatusBar from '../../components/common/ThemedStatusBar';
import ScreenHeader from '../../components/common/ScreenHeader'; // For the back button

const AuthFormScreen = ({
  title,
  buttonText,
  onSubmit, // Expects a function that takes { email, password, name? }
  navigation,
  isSignUp = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used if isSignUp is true
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Email and Password are required.");
      return;
    }
    if (isSignUp && !name.trim()) {
      Alert.alert("Validation Error", "Name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const data = isSignUp ? { name, email, password, role: 'user' } : { email, password };
      await onSubmit(data); // onSubmit is signIn or signUp from AuthContext
      // Navigation to main app will be handled by RootNavigator based on userToken change
    } catch (error) {
      Alert.alert("Authentication Error", error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.auth_safeArea}>
      <ThemedStatusBar barStyle="dark-content" backgroundColor={AppTheme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.auth_form_scrollContainer}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <ScreenHeader
          title="" // No title, just back button
          onBackPress={() => navigation.goBack()}
          transparent
          headerStyleOverride={{
            paddingTop: Platform.OS === 'ios'
              ? AppTheme.spacing.lg
              : (RNStatusBar.currentHeight || 0) + AppTheme.spacing.sm,
            // Remove primary color background for transparent header
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
            elevation: 0,
          }}
        />
        <Text style={styles.auth_form_title}>{title}</Text>

        {isSignUp && (
          <View style={styles.auth_form_inputContainer}>
            <Ionicons name="person-circle-outline" size={24} color={AppTheme.colors.placeholder} style={styles.auth_form_inputIcon} />
            <TextInput
              placeholder="Full Name"
              style={styles.auth_form_input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={AppTheme.colors.placeholder}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.auth_form_inputContainer}>
          <Ionicons name="mail-outline" size={24} color={AppTheme.colors.placeholder} style={styles.auth_form_inputIcon} />
          <TextInput
            placeholder="Email Address"
            style={styles.auth_form_input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={AppTheme.colors.placeholder}
            autoCompleteType="email" // For iOS
            textContentType="emailAddress" // For iOS
          />
        </View>

        <View style={styles.auth_form_inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color={AppTheme.colors.placeholder} style={styles.auth_form_inputIcon} />
          <TextInput
            placeholder="Password"
            style={styles.auth_form_input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={AppTheme.colors.placeholder}
            autoCompleteType="password" // For iOS
            textContentType="password" // For iOS
          />
        </View>

        <PrimaryButton
          title={buttonText}
          onPress={handleSubmit}
          style={styles.auth_button_form}
          isLoading={isLoading}
          disabled={isLoading}
          iconName={isSignUp ? "person-add-outline" : "log-in-outline"}
          size="large"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate(isSignUp ? 'LoginScreen' : 'SignupScreen')}
          style={styles.auth_form_switchLink}
        >
          <Text style={styles.auth_form_switchText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={{ fontFamily: AppTheme.typography.fontBold, color: AppTheme.colors.primary }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  auth_safeArea: { flex: 1, backgroundColor: AppTheme.colors.background },
  auth_form_scrollContainer: { flexGrow: 1, justifyContent: 'flex-start', paddingHorizontal: AppTheme.spacing.lg, paddingBottom: AppTheme.spacing.lg },
  auth_form_title: { fontSize: AppTheme.typography.h1Size + 2, fontFamily: AppTheme.typography.fontBold, color: AppTheme.colors.primary, marginBottom: AppTheme.spacing.xl + AppTheme.spacing.sm, textAlign: 'center', marginTop: Platform.OS === 'ios' ? AppTheme.spacing.md : AppTheme.spacing.xs },
  auth_form_inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppTheme.colors.card, borderRadius: AppTheme.borderRadius.md, paddingHorizontal: AppTheme.spacing.md, marginBottom: AppTheme.spacing.lg - 2, height: 58, borderWidth:1.5, borderColor: AppTheme.colors.border, shadowColor:AppTheme.colors.softShadow, shadowOffset:{width:0, height:2}, shadowOpacity:0.8, shadowRadius:4, elevation: 3},
  auth_form_inputIcon: { marginRight: AppTheme.spacing.md -2 },
  auth_form_input: { flex: 1, fontSize: AppTheme.typography.bodySize, fontFamily: AppTheme.typography.fontRegular, color: AppTheme.colors.text},
  auth_button_form: {width:'100%', marginTop: AppTheme.spacing.xl},
  auth_form_switchLink: { marginTop: AppTheme.spacing.xl, paddingBottom: AppTheme.spacing.lg, alignItems: 'center' },
  auth_form_switchText: { fontSize: AppTheme.typography.bodySize, color: AppTheme.colors.textSecondary, fontFamily: AppTheme.typography.fontRegular},
});

export default AuthFormScreen;