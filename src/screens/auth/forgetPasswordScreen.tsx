import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { isValidEmail } from '../../utils';
import { useAuthStore } from '../../store/authStore';
import LogoIconSvg from '../../assets/svgs/logoIcon.svg';
import EmailIcon from '../../assets/svgs/emailIcon.svg';
import CheckIcon from '../../assets/svgs/checkIcon.svg';
import FloatingInput from '../../components/TextInput/TextInput';

/**
 * Root navigation stack parameter list
 */
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

/**
 * Props interface for ForgotPasswordScreen component
 */
interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

/**
 * ForgotPasswordScreen component for password reset
 */
const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { forgotPassword, isLoading } = useAuthStore();
  const styles = useThemedStyles(createStyles);

  // Ensure consistent StatusBar on focus
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#0088E7', true);
      StatusBar.setBarStyle('light-content', true);
    }, [])
  );

  /**
   * Validates email field
   */
  // Email validation logic (copied from loginScreen)
  const validateEmailOnBlur = () => {
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
   * Handles password reset request
   */
  const handleResetPassword = async (): Promise<void> => {
    // Validate form
    const isEmailValid = validateEmailOnBlur();
    if (!isEmailValid) {
      return;
    }
    try {
      const success = await forgotPassword(email);
      if (success) {
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      console.log('Password reset error:', error);
    }
  };

  /**
   * Navigate back to login screen
   */
  const navigateToLogin = (): void => {
    navigation.navigate('Login');
  };


  return (
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
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconContainer}>
                <LogoIconSvg width={50} height={50} />
              </View>
              <Text style={styles.logoText}>vyzor</Text>
            </View>
          </View>

          {/* Forgot Password Card */}
          <View style={styles.resetCard}>
            <Text style={styles.cardTitle}>Forgot Password?</Text>
            <Text style={styles.cardSubtitle}>
              Enter your email to reset your password.
            </Text>

            <View style={styles.form}>

              {/* Email Input using FloatingInput */}
              <FloatingInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={validateEmailOnBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                LeftIcon={EmailIcon}
                leftIconProps={{ color: "#475467" }}
                RightIcon={isValidEmail(email.trim()) ? CheckIcon : undefined}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  isLoading && styles.resetButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>Send</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity
                  onPress={navigateToLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Creates themed styles for the ForgotPasswordScreen component
 * @param theme - Theme object containing colors and spacing
 * @returns StyleSheet object with all component styles
 */
const createStyles = (theme: {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    gradientBackground: {
      minHeight: '100%',
      backgroundColor: '#0088E7',
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 20,
    },
    logoSection: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 20,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logoIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
   logoText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '600',
      letterSpacing: 1,
      fontFamily: 'Poppins',
    },
    resetCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      paddingHorizontal: 25,
      paddingVertical: 30,
      marginTop: 0,
      marginBottom: 20,
      minHeight: 400,
    },
    cardTitle: {
      fontSize: 21,
      fontWeight: '600',
      color: '#101828',
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
    cardSubtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: '#475467',
      textAlign: 'center',
      marginBottom: 30,
      fontFamily: 'Poppins',
    },
    form: {
      paddingBottom: 20,
    },
    floatingInputContainer: {
      marginBottom: 30,
      paddingHorizontal: 0,
      position: 'relative',
    },
    floatingInputWrapper: {
      position: 'relative',
    },
    floatingLabelContainer: {
      position: 'absolute',
      left: 0,
      top: 20,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 2,
    },
    floatingLabelContainerActive: {
      top: -2,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 4,
      marginLeft: -2,
    },
    floatingLabel: {
      fontWeight: '400',
      color: '#475467',
      fontSize: 16,
      marginLeft: 5,
      backgroundColor: 'transparent',
      fontFamily: 'Poppins',
    },
    floatingLabelActive: {
      fontSize: 14,
      color: '#475467',
      transform: [{ translateY: -1 }],
      fontFamily: 'Poppins',
    },
    floatingIcon: {
      height: 25,
      width: 25,
      marginRight: 2,
      top: 2,
    },
    floatingLabelFocused: {
      color: '#0088E7',
      fontFamily: 'Poppins',
    },
    floatingInput: {
      fontSize: 16,
      color: '#1F2937',
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      width: '100%',
      paddingTop: 15,
      fontFamily: 'Poppins',
    },
    floatingInputFocused: {
      color: '#1F2937',
    },
    floatingInputError: {
      color: '#DC2626',
    },
    underline: {
      height: 1,
      backgroundColor: '#E5E7EB',
      width: '100%',
    },
    underlineFocused: {
      backgroundColor: '#0088E7',
      height: 2,
    },
    underlineError: {
      backgroundColor: '#DC2626',
      height: 2,
    },
    errorText: {
      fontSize: 12,
      color: '#DC2626',
      marginTop: 5,
      marginLeft: 2,
      fontFamily: 'Poppins',
    },
    validationIcon: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: -2,
      top: 2,
      zIndex: 1,
    },
    resetButton: {
      backgroundColor: '#0088E7',
      borderRadius: 12,
      alignItems: 'center',
      paddingVertical: 10,
      marginBottom: 30,
      marginTop: 20,
      shadowColor: '#0088E7',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    resetButtonDisabled: {
      opacity: 0.6,
    },
    resetButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 20,
      marginTop: 'auto',
    },
    loginText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Poppins',
    },
    loginLink: {
      fontSize: 14,
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
  });

export default ForgotPasswordScreen;
