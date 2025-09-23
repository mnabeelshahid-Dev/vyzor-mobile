import ErrorModal from '../../../components/ErrorModal';
import FloatingInput from '../../../components/TextInput/TextInput';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { createStyles } from './styles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useForgotPassword, useLogin, useThemedStyles } from '../../../hooks';
import { isValidEmail } from '../../../utils';

import LogoIconSvg from '../../../assets/svgs/logoIcon.svg';
import EmailIcon from '../../../assets/svgs/emailIcon.svg';
import PasswordIcon from '../../../assets/svgs/passwordIcon.svg';
import CheckIcon from '../../../assets/svgs/checkIcon.svg';
import EyeSlash from '../../../assets/svgs/eyeSlash.svg';
import GoogleIcon from '../../../assets/svgs/googleIcon.svg';
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};


type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  // Password strength indicator removed

  const styles = useThemedStyles(createStyles);
  const loginMutation = useLogin();
  const forgotPasswordMutation = useForgotPassword();

  // Ensure consistent StatusBar on focus
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#0088E7', true);
      StatusBar.setBarStyle('light-content', true);
    }, [])
  );

  // Password requirements function removed

  /**
   * Only email validation for login
   */
  const validateForm = async (): Promise<boolean> => {
    return validateEmailOnBlur();
  };

  /**
   * Handles email input change
   */
  const handleEmailChange = (text: string) => {
    setEmail(text);

    const trimmedEmail = text.trim();

    if (!trimmedEmail) {
      setEmailError('Email is required');
      return;
    }

    if (trimmedEmail.length > 254) {
      setEmailError('Email address is too long');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (trimmedEmail.includes('..')) {
      setEmailError('Email cannot contain consecutive dots');
      return;
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      setEmailError('Email cannot start or end with a dot');
      return;
    }

    setEmailError('');
  };


  /**
   * Handles password input change (no validation)
   */
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleLogin = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });
      // If login is successful, modal stays hidden
      setErrorModalVisible(false);
    } catch (error) {
      // Show modal only if login fails
      setErrorModalVisible(true);
      console.log('Login error:', error);
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleNavigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    validateEmailOnBlur();
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    // No password validation
  };

  /**
   * Enhanced email validation on blur
   */
  const validateEmailOnBlur = () => {
    console.log('Validating email on blur', email);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email is required');
      return false;
    }

    if (trimmedEmail.length > 254) {
      setEmailError('Email address is too long');
      return false;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Check for common email issues
    if (trimmedEmail.includes('..')) {
      setEmailError('Email cannot contain consecutive dots');
      return false;
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      setEmailError('Email cannot start or end with a dot');
      return false;
    }

    setEmailError('');
    return true;
  };

  return (
    <>
      <ErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={'Your email/password is incorrect'}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <StatusBar backgroundColor="#0088E7" barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          scrollEnabled={true}
        >
          {/* Blue Gradient Background */}
          <View style={styles.gradientBackground}>
            {/* Logo Section - Updated to match UI */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIconContainer}>
                  <LogoIconSvg width={50} height={50} />
                </View>
                <Text style={styles.logoText}>vyzor</Text>
              </View>
            </View>
            {/* Login Card */}
            <View style={styles.loginCard}>
              <Text style={styles.cardTitle}>Sign In</Text>
              <Text style={styles.cardSubtitle}>Sign in to your account</Text>
              <View style={styles.form}>
                {/* Email Input */}
                <FloatingInput
                  label="Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={() => {
                    handleEmailBlur();
                    validateEmailOnBlur();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  editable={!loginMutation.isPending}
                  LeftIcon={EmailIcon}
                  RightIcon={isValidEmail(email.trim()) ? CheckIcon : undefined}
                  errorMessage={emailError}
                />

                {/* Password Input */}
                <FloatingInput
                  label="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!isPasswordVisible}
                  textContentType="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loginMutation.isPending}
                  LeftIcon={PasswordIcon}
                  RightIconAlt={EyeSlash}
                  onRightIconPress={togglePasswordVisibility}
                  errorMessage={passwordError}
                />


                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={handleNavigateToForgotPassword}
                  disabled={loginMutation.isPending}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  {forgotPasswordMutation.isPending && (
                    <ActivityIndicator
                      size="small"
                      color="#0088E7"
                      style={styles.forgotPasswordLoader}
                    />
                  )}
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loginMutation.isPending && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loginMutation.isPending}
                  activeOpacity={loginMutation.isPending ? 1 : 0.7}
                >
                  {loginMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Log In</Text>
                  )}
                </TouchableOpacity>
                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerTextContainer}>
                    <Text style={styles.dividerText}> Or Login with</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <GoogleIcon width={28} height={28} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                  >
                    <View
                      style={{
                        backgroundColor: '#4267B2',
                        height: 30,
                        width: 30,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={styles.socialIconText}>f</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={handleNavigateToRegister}
                    disabled={loginMutation.isPending}
                  >
                    <Text style={styles.signUpLink}>Create an account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

export default LoginScreen;
