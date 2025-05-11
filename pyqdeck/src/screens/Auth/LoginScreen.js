// src/screens/Auth/LoginScreen.js
import React from 'react';
import AuthFormScreen from './AuthFormScreen'; // Reusable form component
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();

  return (
    <AuthFormScreen
      title="Welcome Back!"
      buttonText="Sign In"
      onSubmit={signIn} 
      navigation={navigation}
      isSignUp={false}
    />
  );
};

export default LoginScreen;