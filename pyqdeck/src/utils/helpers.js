// src/utils/helpers.js

// Example helper (can be expanded as needed)
export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };
  
  // You can add more general utility functions here as your app grows.
  // For example, date formatting, debouncing (if not a custom hook), etc.