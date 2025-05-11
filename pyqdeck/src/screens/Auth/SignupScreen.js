// src/screens/Auth/SignupScreen.js
import React from 'react';
import AuthFormScreen from './AuthFormScreen'; // Reusable form component
import { useAuth } from '../../contexts/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { signUp } = useAuth();

  return (
    <AuthFormScreen
      title="Create Your Account"
      buttonText="Sign Up"
      onSubmit={signUp} 
      navigation={navigation}
      isSignUp={true}
    />
  );
};

export default SignupScreen;