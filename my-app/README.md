# PYQDeck Mobile Application

PYQDeck is a React Native mobile app built using Expo for efficient cross-platform development. The app provides personalized onboarding, user authentication, and a home experience tailored to user preferences for a question deck application.

## Project Status

> **This README documents the project structure and features as implemented so far.**

---

## Features

- **User Authentication:** Login, Register, Forgot Password, Reset Password.
- **Onboarding:** Multi-step onboarding including:
  - Branch Selection
  - Semester Selection
  - Personalization Preferences
  - Notification Settings
- **Personalization Flow:** Users complete additional onboarding for a personalized experience.
- **Context API:** Application-wide and authentication state managed through React Context.
- **Navigation:** Configured with React Navigation (stack navigators and conditional flows).
- **Expo Integration:** Leveraging Expo modules for native features, splash screen, icons, etc.

---

## Quick Start

### Prerequisites

- Node.js
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode for device emulation (optional)

### Install Dependencies

```sh
npm install
```

### Start the Project

```sh
npm start
# or, to run directly on Android:
npm run android
# or, to run on iOS:
npm run ios
# or, to run as a web app:
npm run web
```

---

## App Structure

```
my-app/
├── App.js         # App entry point, wraps navigators and contexts
├── app.json       # Expo/React Native config
├── package.json   # Project dependencies & scripts
├── assets/        # App icons, favicon, splash, etc.
└── src/
    ├── components/
    │   └── onboarding/
    │       ├── NextButton.js
    │       └── OnboardingWrapper.js
    ├── constants/
    │   └── Colors.js
    ├── context/
    │   ├── AppContext.js       # Global app state
    │   ├── AuthContext.js      # Handles authentication state & actions
    │   └── index.js
    ├── navigation/
    │   ├── AppNavigator.js                     # Main navigator (auth/onboarding/home flow)
    │   ├── AuthNavigator.js                    # Handles login/register/forgot etc.
    │   ├── OnboardingStack.js                  # Initial onboarding screens
    │   └── PersonalizationOnboardingNavigator.js # Further personalization onboarding
    └── screens/
        ├── AuthLandingScreen.js
        ├── HomeScreen.js
        ├── OnboardingScreen.js
        ├── auth/
        │   ├── ForgotPasswordScreen.js
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   └── ResetPasswordScreen.js
        └── onboarding/
            ├── BranchScreen.js
            ├── NotificationSettingsScreen.js
            ├── PreferencesScreen.js
            └── SemesterScreen.js
```

---

## Core Flow

1. **Onboarding:** New users are guided through an initial onboarding sequence (branch, semester, preferences, notification settings).
2. **Authentication:** Upon completing or skipping onboarding, users authenticate via email/password (login/register/forgot/reset flows).
3. **Personalization:** Authenticated users proceed through any extra onboarding needed (personalization).
4. **Home:** Once authenticated and onboarding is complete, the user lands on the Home Screen.

### Context Providers

- `AppContext` manages global state such as onboarding and personalization flags.
- `AuthContext` handles authentication state, current user, logout, and related logic.

### Navigation

All navigation is centralized through stack navigators, which conditionally route users based on their onboarding and authentication status.

---

## Dependencies

Key dependencies include:

- `expo` & Expo managed libraries
- `react`, `react-native`
- `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- `axios` (API requests)
- `@expo/vector-icons` (icons)
- `@react-native-async-storage/async-storage`
- ...plus various Expo modules for native capabilities

---

## Assets

Icons, splash screens, and a favicon are located in the `assets/` directory.

---

## Development Status

This README captures the current project structure and functionality. Additional features (such as quiz/quiz deck management, API integration, notifications, etc.) can be built on top of this solid foundation.
