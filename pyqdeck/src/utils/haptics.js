// src/utils/haptics.js
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const playHaptic = (type = 'light') => {
  if (Platform.OS === 'ios') {
    switch(type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'selection': // Good for picker changes, switches
        Haptics.selectionAsync();
        break;
      case 'light':
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } else {
    // Android haptic feedback is less nuanced with expo-haptics.
    switch(type) {
        case 'success':
        case 'warning':
        case 'error':
        case 'medium':
        case 'heavy':
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Or map to a generic impact
            break;
        case 'selection':
        case 'light':
        default:
            Haptics.selectionAsync();
            break;
    }
  }
};