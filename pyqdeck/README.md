# PYQDeck - Previous Year Questions App

PYQDeck is a mobile application built with React Native and Expo that helps students access and practice with previous year questions (PYQs) for various courses.

## Features

- User authentication (login/register)
- Browse courses and PYQs
- Search functionality
- Bookmark favorite questions
- User settings and preferences

## Project Structure

```
pyqdeck/
├── assets/              # App assets (images, fonts)
├── src/
│   ├── api/             # API utilities and services
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Common components (Button, Card, etc.)
│   │   └── specific/    # Feature-specific components
│   ├── constants/       # App constants and theme
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   │   ├── Auth/        # Authentication screens
│   │   ├── Bookmarks/   # Bookmarked PYQs
│   │   ├── Home/        # Home screen
│   │   ├── Onboarding/  # Onboarding screens
│   │   ├── PYQ/         # PYQ details
│   │   ├── Search/      # Search functionality
│   │   └── Settings/    # User settings
│   └── utils/           # Utility functions
├── App.js               # Main app component
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/pyqdeck.git
cd pyqdeck
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm start
# or
yarn start
```

4. Run on a device or emulator

```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Development

### Adding New Screens

1. Create a new screen component in the appropriate directory under `src/screens/`
2. Add the screen to the navigation in `src/navigation/index.js`

### Styling

The app uses a centralized theme system. Update the theme constants in `src/constants/theme.js` to maintain consistent styling across the app.

## Dependencies

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Vector Icons

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped with the development of this app.
- Special thanks to the React Native and Expo communities for their excellent documentation and support.