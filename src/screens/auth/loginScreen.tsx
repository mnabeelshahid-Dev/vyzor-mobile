import ErrorModal from '../../components/ErrorModal';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useLogin, useForgotPassword } from '../../hooks/useAuth';
import { emailSchema } from '../../utils/validation';
import LogoIconSvg from '../../assets/svgs/logoIcon.svg';
import EmailIcon from '../../assets/svgs/emailIcon.svg';
import PasswordIcon from '../../assets/svgs/passwordIcon.svg';
import CheckIcon from '../../assets/svgs/checkIcon.svg';
import EyeSlash from '../../assets/svgs/eyeSlash.svg';
import GoogleIcon from '../../assets/svgs/googleIcon.svg';

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
   * Enhanced email validation
   */
  const isValidEmail = (email: string): boolean => {
    // More comprehensive email regex
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

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
    if (emailError) setEmailError('');
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

  const handleForgotPassword = async () => {
    try {
      await emailSchema.validate(email);
      setEmailError(''); // Clear error if validation passes
    } catch (error: any) {
      setEmailError(error.message);
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({ email: email.trim() });
    } catch (error) {
      console.error('Forgot password error:', error);
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
    // Validate email when user moves to next field
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
                <View style={styles.floatingInputContainer}>
                  <View style={[styles.floatingInputWrapper]}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (emailFocused || email) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <EmailIcon
                        height={20}
                        width={20}
                        style={[
                          styles.floatingIcon,
                          (emailFocused || email) && styles.floatingIconActive,
                        ]}
                        color={
                          emailFocused || email
                            ? emailFocused
                              ? '#0088E7'
                              : '#9CA3AF'
                            : '#9CA3AF'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (emailFocused || email) && styles.floatingLabelActive,
                          emailFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        Email
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        emailFocused && styles.floatingInputFocused,
                        emailError && styles.floatingInputError,
                      ]}
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                      editable={!loginMutation.isPending}
                    />
                    <View
                      style={[
                        styles.underline,
                        emailFocused && styles.underlineFocused,
                        emailError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : (
                    (() => {
                      return isValidEmail(email) ? (
                        <View style={styles.validationIcon}>
                          <CheckIcon width={20} height={20} />
                        </View>
                      ) : null;
                    })()
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.floatingInputContainer}>
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (passwordFocused || password) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <PasswordIcon
                        height={20}
                        width={20}
                        style={[
                          styles.floatingIcon,
                          (passwordFocused || password) &&
                          styles.floatingIconActive,
                        ]}
                        color={
                          passwordFocused || password
                            ? passwordFocused
                              ? '#0088E7'
                              : '#9CA3AF'
                            : '#9CA3AF'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (passwordFocused || password) &&
                          styles.floatingLabelActive,
                          passwordFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        Password
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        passwordFocused && styles.floatingInputFocused,
                        passwordError && styles.floatingInputError,
                        { paddingRight: 40 }, // Add space for toggle button
                      ]}
                      value={password}
                      onChangeText={handlePasswordChange}
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                      secureTextEntry={!isPasswordVisible}
                      textContentType="password"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loginMutation.isPending}
                    />

                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={togglePasswordVisibility}
                      disabled={loginMutation.isPending}
                    >
                      {isPasswordVisible ? (
                        <Text style={styles.passwordToggleIcon}>👁️‍🗨️</Text>
                      ) : (
                        <EyeSlash width={20} height={20} />
                      )}
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.underline,
                        passwordFocused && styles.underlineFocused,
                        passwordError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {/* Password error removed, only email error shown */}
                </View>
                {passwordError && (
                  <Text style={[styles.errorText,{marginTop: -10}]}>{passwordError}</Text>
                )}

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
      backgroundColor: '#0088E7',
      paddingHorizontal: 20,
      paddingTop: 0,
      flex: 1
    },
    statusArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusTime: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    statusIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusIcon: {
      color: '#FFFFFF',
      fontSize: 14,
    },
    logoSection: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
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
    loginCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 30,
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
      fontFamily: 'Poppins',
    },
    form: {
      marginTop: 30,
    },
    floatingInputContainer: {
      marginBottom: 15,
      position: 'relative',
    },
    floatingInputWrapper: {
      position: 'relative',
    },
    floatingLabelContainer: {
      position: 'absolute',
      left: -2,
      top: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 2,
    },
    floatingLabelContainerActive: {
      top: -8,
      backgroundColor: '#FFFFFF',
      // paddingHorizontal: 4,
      marginLeft: -3,
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
      color: '#9CA3AF',
      transform: [{ translateY: -1 }],
      fontFamily: 'Poppins',
    },
    floatingIcon: {
      height: 25,
      width: 25,
      marginRight: 2,
      top: 2,
    },
    floatingIconActive: {
      transform: [{ translateY: -1 }],
    },
    floatingLabelFocused: {
      color: '#0088E7',
      fontFamily: 'Poppins',
    },
    floatingInput: {
      fontSize: 14,
      color: '#1F2937',
      paddingVertical: 4,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      width: '100%',
      paddingTop: 20,
      fontFamily: 'Poppins',
    },
    floatingInputFocused: {
      color: '#1F2937',
    },
    underline: {
      height: 1,
      backgroundColor: '#E5E7EB',
      // marginTop: 4,
      width: '100%',
    },
    underlineFocused: {
      backgroundColor: '#0088E7',
      height: 2,
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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    inputIconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    inputIcon: {
      alignSelf: 'center',
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#1F2937',
      paddingVertical: 8,
      paddingRight: 16,
      fontFamily: 'Poppins',
    },
    passwordToggle: {
      position: 'absolute',
      right: 0,
      top: 20,
      paddingHorizontal: 8,
      paddingVertical: 0,
      zIndex: 2,
    },
    passwordToggleIcon: {
      fontSize: 14,
      color: '#9CA3AF',
      fontFamily: 'Poppins',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 32,
      flexDirection: 'row',
      alignItems: 'center',
    },
    forgotPasswordText: {
      color: '#021639',
      fontSize: 14,
      fontWeight: '400',
      fontFamily: 'Poppins',
    },
    forgotPasswordLoader: {
      marginLeft: 8,
    },
    loginButton: {
      backgroundColor: '#0088E7',
      borderRadius: 12,
      paddingVertical: 8,
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: '#0088E7',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 32,
    },
    dividerLine: {
      flex: 1,
      height: 1.2,
      backgroundColor: '#0088E7',
    },
    dividerTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    dividerText: {
      color: '#000000',
      fontSize: 19,
      fontWeight: '500',
      paddingHorizontal: 7,
      fontFamily: 'Poppins',
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 40,
    },
    socialButton: {
      width: 100,
      height: 60,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    facebookButton: {
      backgroundColor: '#F3F5F5',
    },
    socialIconText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Poppins',
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 5,
    },
    forgotPasswordLink: {
      fontSize: 14,
      color: 'red',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 'auto',
    },
    signUpText: {
      fontSize: 14,
      color: '#868696',
      fontFamily: 'Poppins',
    },
    signUpLink: {
      fontSize: 14,
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    // Password strength styles
    passwordStrengthContainer: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      marginBottom: 8,
    },
    passwordStrengthLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
      fontFamily: 'Poppins',
    },
    passwordRequirements: {
      gap: 4,
    },
    passwordRequirement: {
      fontSize: 12,
      fontWeight: '400',
      paddingVertical: 2,
      fontFamily: 'Poppins',
    },
    passwordRequirementMet: {
      color: '#16A34A', // Green for met requirements
    },
    passwordRequirementUnmet: {
      color: '#9CA3AF', // Gray for unmet requirements
    },
    // Error styles
    floatingInputError: {
      borderColor: '#FF6B6B',
      color: '#FF6B6B',
    },
    underlineError: {
      backgroundColor: '#FF6B6B',
    },
    errorText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontFamily: 'Poppins',
      marginTop: 4,
    },
  });

export default LoginScreen;
