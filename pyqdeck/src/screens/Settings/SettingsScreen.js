import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [downloadWifi, setDownloadWifi] = React.useState(true);

  const renderSettingItem = (icon, title, description, hasSwitch, switchValue, setSwitchValue) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={24} color="#4285F4" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {hasSwitch && (
        <Switch
          value={switchValue}
          onValueChange={setSwitchValue}
          trackColor={{ false: '#d9d9d9', true: '#4285F4' }}
          thumbColor="#fff"
        />
      )}
      {!hasSwitch && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem('notifications-outline', 'Notifications', 'Receive updates and reminders', true, notifications, setNotifications)}
        {renderSettingItem('moon-outline', 'Dark Mode', 'Switch to dark theme', true, darkMode, setDarkMode)}
        {renderSettingItem('wifi-outline', 'Download over Wi-Fi only', 'Save mobile data', true, downloadWifi, setDownloadWifi)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem('person-outline', 'Profile', 'Edit your profile information', false)}
        {renderSettingItem('key-outline', 'Change Password', 'Update your password', false)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderSettingItem('help-circle-outline', 'Help Center', 'Get help with the app', false)}
        {renderSettingItem('mail-outline', 'Contact Us', 'Send us your feedback', false)}
        {renderSettingItem('information-circle-outline', 'About', 'App version and information', false)}
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#333',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
    marginLeft: 10,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 3,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;