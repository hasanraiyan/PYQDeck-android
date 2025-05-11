// src/screens/Auth/WelcomeAuthScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/common/PrimaryButton';
import ThemedStatusBar from '../../components/common/ThemedStatusBar';

const { width } = Dimensions.get('window');

const WelcomeAuthScreen = ({ navigation }) => {
    const { continueAsGuest } = useAuth();

    return (
        <LinearGradient colors={[AppTheme.colors.primaryLight, AppTheme.colors.primaryDark]} style={{ flex: 1 }}>
            <SafeAreaView style={styles.auth_safeArea_transparentBg}>
                <ThemedStatusBar barStyle="light-content" backgroundColor="transparent" />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.auth_container}>
                        <View style={styles.auth_logoOuterRing}>
                            <LinearGradient
                                colors={[AppTheme.colors.lightText, AppTheme.colors.lightText + 'CC']}
                                style={styles.auth_logoBg}
                            >
                                <Ionicons name="school-sharp" size={width * 0.18} color={AppTheme.colors.primaryDark} />
                            </LinearGradient>
                        </View>
                        <Text style={styles.auth_mainTitle}>PYQDeck</Text>
                        <Text style={styles.auth_subtitle}>Your Ultimate Engineering Exam Companion.</Text>
                        <PrimaryButton
                            title="Sign In"
                            onPress={() => navigation.navigate('LoginScreen')}
                            style={styles.auth_button}
                            iconName="log-in-outline"
                            size="large"
                        />
                        <PrimaryButton
                            title="Create Account"
                            onPress={() => navigation.navigate('SignupScreen')}
                            style={[styles.auth_button, { marginTop: AppTheme.spacing.md + 2 }]}
                            iconName="person-add-outline"
                            size="large"
                            variant="success"
                        />
                        <TouchableOpacity style={styles.auth_guestButton} onPress={continueAsGuest}>
                            <Text style={styles.auth_guestButtonText}>
                                Explore as Guest <Ionicons name="arrow-forward-outline" size={16} />
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    auth_safeArea_transparentBg: { flex: 1, backgroundColor: 'transparent' },
    auth_container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: AppTheme.spacing.xl, paddingVertical: AppTheme.spacing.lg },
    auth_logoOuterRing: { padding: AppTheme.spacing.sm, backgroundColor: AppTheme.colors.lightText + '55', borderRadius: AppTheme.borderRadius.circle, marginBottom: AppTheme.spacing.lg },
    auth_logoBg: { width: width * 0.28, height: width * 0.28, borderRadius: (width * 0.28) / 2, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: AppTheme.colors.strongShadow, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 10 },
    auth_mainTitle: { fontSize: AppTheme.typography.h1Size + 8, fontFamily: AppTheme.typography.fontBold, color: AppTheme.colors.lightText, marginBottom: AppTheme.spacing.sm, letterSpacing: 0.5, textShadowColor: 'rgba(0, 0, 0, 0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    auth_subtitle: { fontSize: AppTheme.typography.bodySize, color: AppTheme.colors.lightText + 'DD', textAlign: 'center', marginBottom: AppTheme.spacing.xl * 1.5, paddingHorizontal: AppTheme.spacing.md, lineHeight: AppTheme.typography.bodySize * 1.5, fontFamily: AppTheme.typography.fontRegular },
    auth_button: { width: '100%', marginVertical: AppTheme.spacing.sm },
    auth_guestButton: { marginTop: AppTheme.spacing.xl, paddingVertical: AppTheme.spacing.md - 2, paddingHorizontal: AppTheme.spacing.lg, borderRadius: AppTheme.borderRadius.xl, borderWidth: 2, borderColor: AppTheme.colors.lightText + 'AA' },
    auth_guestButtonText: { color: AppTheme.colors.lightText, fontSize: AppTheme.typography.bodySize, fontFamily: AppTheme.typography.fontBold },
});

export default WelcomeAuthScreen;