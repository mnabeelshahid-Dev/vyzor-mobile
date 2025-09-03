import React, { useState, useRef, useEffect } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import DatePicker from 'react-native-date-picker';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useRegister } from '../../hooks/useAuth';
import { showErrorToast } from '../../components/toast';
import { registerValidationSchema } from '../../utils/validation';
import { networkDebugger } from '../../utils/networkDebugger';
import LogoIconSvg from '../../assets/svgs/logoIcon.svg';
import EmailIcon from '../../assets/svgs/emailIcon.svg';
import PasswordIcon from '../../assets/svgs/passwordIcon.svg';
import CheckIcon from '../../assets/svgs/checkIcon.svg';
import EyeSlash from '../../assets/svgs/eyeSlash.svg';
import UserIcon from '../../assets/svgs/user.svg';
import PhoneIcon from '../../assets/svgs/receiverIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import PlusImage from '../../assets/svgs/plusImage.svg';

/**
 * Root navigation stack parameter list
 */
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

/**
 * Props interface for RegisterScreen component
 */
interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}

/**
 * Form data interface for registration
 */
interface IFormData {
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly dateOfBirth: string;
  readonly phoneNumber: string;
  readonly password: string;
  readonly confirmPassword: string;
}

/**
 * RegisterScreen component for user registration
 */
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<IFormData>({
    firstname: '',
    lastname: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  // Multi-phone input state
  const [phoneNumbers, setPhoneNumbers] = useState([
    { value: '', country: 'US', ref: React.createRef<PhoneInput>() },
  ]);
  const scrollViewRef = useRef<any>(null);

  // For legacy code compatibility
  const countries = [
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'UK', name: 'United Kingdom', dialCode: '+44' },
    { code: 'PAK', name: 'Pakistan', dialCode: '+92' },
    { code: 'IND', name: 'India', dialCode: '+91' },
    // ... (rest unchanged)
  ];

  // Focus states for floating labels
  const [firstnameFocused, setFirstnameFocused] = useState(false);
  const [lastnameFocused, setLastnameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Date picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Error states for validation
  const [firstnameError, setFirstnameError] = useState('');
  const [lastnameError, setLastnameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

  const styles = useThemedStyles(createStyles);
  const registerMutation = useRegister();

  // Ensure consistent StatusBar on focus
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#0088E7', true);
      StatusBar.setBarStyle('light-content', true);
    }, [])
  );

  // Track which field is currently focused for better scroll management
  const [currentlyFocusedField, setCurrentlyFocusedField] = useState<
    string | null
  >(null);

  // Reset scroll position when no field is focused
  useEffect(() => {
    if (!currentlyFocusedField) {
      const timer = setTimeout(() => {
        if (scrollViewRef.current && !currentlyFocusedField) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 500); // Wait 500ms to ensure no new field gets focus

      return () => clearTimeout(timer);
    }
  }, [currentlyFocusedField]);

  /**
   * Handles input field changes and clears related errors
   */
  const handleInputChange = (field: keyof IFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear related error when user starts typing
    switch (field) {
      case 'firstname':
        setFirstnameError('');
        break;
      case 'lastname':
        setLastnameError('');
        break;
      case 'email':
        setEmailError('');
        break;
      case 'dateOfBirth':
        setDateOfBirthError('');
        break;
      case 'password':
        setPasswordError('');
        // Clear confirm password error if user is changing password
        if (formData.confirmPassword) {
          setConfirmPasswordError('');
        }
        break;
      case 'confirmPassword':
        setConfirmPasswordError('');
        break;
      default:
        break;
    }
  };

  /**
   * Auto-detect country based on phone number
   */
  const detectCountryFromPhoneNumber = (phoneNumber: string): string | null => {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // If number starts with +, remove it for processing
    const numberToCheck = phoneNumber.startsWith('+')
      ? cleanNumber
      : cleanNumber;

    // Check for exact matches first (longer codes first to avoid conflicts)
    const sortedCountries = [...countries].sort(
      (a, b) =>
        b.dialCode.replace('+', '').length - a.dialCode.replace('+', '').length
    );

    for (const country of sortedCountries) {
      const dialCodeDigits = country.dialCode.replace('+', '');

      // Check if the number starts with this country's dial code
      if (numberToCheck.startsWith(dialCodeDigits)) {
        // Additional validation for +1 (US/CA) - need to check length or area codes
        if (dialCodeDigits === '1') {
          // For +1, check if it's a valid length (10-11 digits total)
          if (numberToCheck.length >= 10 && numberToCheck.length <= 11) {
            // Prefer US for +1 numbers, but could be enhanced with area code logic
            return numberToCheck.length === 11 ? 'US' : 'US';
          }
        } else {
          // For other countries, basic length validation
          const expectedMinLength = dialCodeDigits.length + 7; // Country code + minimum 7 digits
          const expectedMaxLength = dialCodeDigits.length + 15; // Country code + maximum 15 digits

          if (
            numberToCheck.length >= expectedMinLength &&
            numberToCheck.length <= expectedMaxLength
          ) {
            return country.code;
          }
        }
      }
    }

    return null; // No country detected
  };

  // Multi-phone input handlers
  const handlePhoneChange = (idx: number, text: string) => {
    setPhoneNumbers(prev => {
      const updated = [...prev];
      updated[idx].value = text;
      // Auto-detect country
      const detected = detectCountryFromPhoneNumber(text);
      if (detected) updated[idx].country = detected;
      return updated;
    });
    setPhoneError('');
    // Update formData with the first phone number for legacy validation
    if (idx === 0) setFormData(prev => ({ ...prev, phoneNumber: text }));
  };

  const handleCountryChange = (idx: number, country: string) => {
    setPhoneNumbers(prev => {
      const updated = [...prev];
      updated[idx].country = country;
      return updated;
    });
  };

  const addPhoneField = () => {
    setPhoneNumbers(prev => ([...prev, { value: '', country: 'US', ref: React.createRef<PhoneInput>() }]));
  };

  const removePhoneField = (idx: number) => {
    setPhoneNumbers(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };



  /**
   * Validate username format on blur
   */
  const validateFirstnameFormat = (): boolean => {
    const firstname = formData.firstname;

    if (!firstname) {
      setFirstnameError('First name is required');
      return false;
    }

    if (firstname.length < 3) {
      setFirstnameError('First name must be at least 3 characters long');
      return false;
    }

    if (firstname.length > 15) {
      setFirstnameError('First name must be less than 15 characters');
      return false;
    }

    const firstnameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!firstnameRegex.test(firstname)) {
      setFirstnameError(
        'First name can only contain letters, numbers, and underscores'
      );
      return false;
    }

    setFirstnameError('');
    return true;
  };

  /**
   * Email validation
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate email format on blur
   */
  const validateEmailFormat = (): boolean => {
    if (!formData.email) {
      setEmailError('Email is required');
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  /**
   * Simple function to check password requirements
   */
  const checkPasswordRequirements = (password: string) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    };
  };

  /**
   * Password strength validation with detailed requirements
   */
  const validatePasswordStrength = (): boolean => {
    const password = formData.password;

    if (!password) {
      setPasswordError('Password is required');
      return false;
    }

    const requirements = checkPasswordRequirements(password);

    if (!requirements.hasMinLength) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    if (password.length > 128) {
      setPasswordError('Password must be less than 128 characters');
      return false;
    }

    if (!requirements.hasUpperCase) {
      setPasswordError(
        'Password must contain at least one uppercase letter (A-Z)'
      );
      return false;
    }

    if (!requirements.hasLowerCase) {
      setPasswordError(
        'Password must contain at least one lowercase letter (a-z)'
      );
      return false;
    }

    if (!requirements.hasNumber) {
      setPasswordError('Password must contain at least one number (0-9)');
      return false;
    }

    if (!requirements.hasSpecialChar) {
      setPasswordError(
        'Password must contain at least one special character (@$!%*?&)'
      );
      return false;
    }

    // Check for common weak passwords
    const commonWeakPasswords = [
      'password',
      'Password',
      'PASSWORD',
      'password123',
      'Password123',
      '12345678',
      'qwerty123',
      'Qwerty123',
      'admin123',
      'Admin123',
    ];

    if (commonWeakPasswords.includes(password)) {
      setPasswordError('Please choose a stronger password');
      return false;
    }

    setPasswordError('');
    return true;
  };

  /**
   * Password matching validation
   */
  const validatePasswordMatch = (): boolean => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  /**
   * Format date for display (convert YYYY-MM-DD to MM/DD/YYYY for user display)
   */
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  /**
   * Validates the registration form using Yup schema
   */
  const validateForm = async (): Promise<boolean> => {
    try {
  // Use the first phone number field for validation
  const formattedPhoneNumber = phoneNumbers[0]?.value || '';

      // Validate all fields
      await registerValidationSchema.validate(
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          phoneNumber: formattedPhoneNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          agreeToTerms,
        },
        { abortEarly: false }
      );

      // Clear all errors if validation passes
      setFirstnameError('');
      setLastnameError('');
      setEmailError('');
      setDateOfBirthError('');
      setPhoneError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setTermsError('');

      return true;
    } catch (error: any) {
      const errors = error.inner;

      // Clear all errors first
      setFirstnameError('');
      setLastnameError('');
      setEmailError('');
      setDateOfBirthError('');
      setPhoneError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setTermsError('');

      // Set specific error messages
      errors.forEach((err: any) => {
        switch (err.path) {
          case 'firstname':
            setFirstnameError(err.message);
            break;
          case 'lastname':
            setLastnameError(err.message);
            break;
          case 'email':
            setEmailError(err.message);
            break;
          case 'dateOfBirth':
            setDateOfBirthError(err.message);
            break;
          case 'phoneNumber':
            setPhoneError(err.message);
            break;
          case 'password':
            setPasswordError(err.message);
            break;
          case 'confirmPassword':
            setConfirmPasswordError(err.message);
            break;
          case 'agreeToTerms':
            setTermsError(err.message);
            break;
          default:
            break;
        }
      });

      return false;
    }
  };

  /**
   * Handles user registration
   */
  const handleRegister = async (): Promise<void> => {
    console.log('🚀 Register button clicked!');
    console.log('📝 Form data:', {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      phoneNumber: formData.phoneNumber,
      password: formData.password ? '***' : '',
      confirmPassword: formData.confirmPassword ? '***' : '',
      agreeToTerms,
    });

    const isFormValid = await validateForm();
    console.log('✅ Form validation result:', isFormValid);

    if (!isFormValid) {
      console.log('❌ Form validation failed, stopping registration');
      showErrorToast(
        'Validation Error',
        'Please fix the errors in the form before submitting'
      );
      return;
    }

    try {
      console.log('🔄 Starting registration API call...');
      const {
        firstname,
        lastname,
        email,
        dateOfBirth,
        password,
        confirmPassword,
      } = formData;

      // Validate required fields
      if (
        !firstname ||
        !lastname ||
        !email ||
        !dateOfBirth ||
        !password ||
        !confirmPassword
      ) {
        throw new Error('All fields are required');
      }

      if (!agreeToTerms) {
        throw new Error('You must agree to the terms and conditions');
      }

      // Format phone number with country code for API
      let formattedPhoneNumber = phoneNumbers[0]?.value || formData.phoneNumber;
      if (!formattedPhoneNumber) {
        throw new Error('Phone number is required');
      }
      // Ensure phone number includes country code
      const country = countries.find(c => c.code === phoneNumbers[0]?.country);
      if (country) {
        const digitsOnly = formattedPhoneNumber.replace(/\D/g, '');
        const dialCodeDigits = country.dialCode.replace('+', '');
        if (!digitsOnly.startsWith(dialCodeDigits)) {
          formattedPhoneNumber = country.dialCode + digitsOnly;
        } else {
          formattedPhoneNumber = '+' + digitsOnly;
        }
        const phoneDigits = formattedPhoneNumber.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          throw new Error('Phone number must be at least 10 digits');
        }
      }
      console.log('📞 Phone number processing:', {
        original: phoneNumbers[0]?.value || formData.phoneNumber,
        country: phoneNumbers[0]?.country,
        dialCode: country?.dialCode,
        formatted: formattedPhoneNumber,
      });

      const registrationData = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim().toLowerCase(),
        dateOfBirth: dateOfBirth,
        phoneNumber: formattedPhoneNumber,
        password,
        confirmPassword,
      };

      console.log('📤 Sending registration data:', {
        ...registrationData,
        password: '***',
        confirmPassword: '***',
      });

      await registerMutation.mutateAsync(registrationData);
      console.log('✅ Registration successful!');

      // Only navigate to login on successful registration
      console.log('🔄 Navigating to login screen...');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      // Show specific error message and stay on register screen
      const errorMessage =
        error.message || 'Registration failed. Please try again.';
      showErrorToast('Registration Failed', errorMessage);

      // DO NOT navigate away - let user fix the form and try again
      console.log('❌ Registration failed, staying on register screen');
    }
  };

  /**
   * Navigate to login screen
   */
  const navigateToLogin = (): void => {
    navigation.navigate('Login');
  };

  // Focus handlers
  const handleFirstnameFocus = () => {
    setFirstnameFocused(true);
    setCurrentlyFocusedField('firstname');
  };
  const handleFirstnameBlur = () => {
    setFirstnameFocused(false);
    setCurrentlyFocusedField(null);
    // Validate firstname format when user leaves the field
    validateFirstnameFormat();
  };

  const handleLastnameFocus = () => {
    setLastnameFocused(true);
    setCurrentlyFocusedField('lastname');
  };
  const handleLastnameBlur = () => {
    setLastnameFocused(false);
    setCurrentlyFocusedField(null);
    // Validate lastname format when user leaves the field
    validateLastnameFormat();
  };

  /**
   * Validate lastname format on blur
   */
  const validateLastnameFormat = (): boolean => {
    const lastname = formData.lastname;

    if (!lastname) {
      setLastnameError('Last name is required');
      return false;
    }

    if (lastname.length < 3) {
      setLastnameError('Last name must be at least 3 characters long');
      return false;
    }

    if (lastname.length > 15) {
      setLastnameError('Last name must be less than 10 characters');
      return false;
    }

    const lastnameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!lastnameRegex.test(lastname)) {
      setLastnameError(
        'Last name can only contain letters, numbers, and underscores'
      );
      return false;
    }

    setLastnameError('');
    return true;
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
    setCurrentlyFocusedField('email');
  };
  const handleEmailBlur = () => {
    setEmailFocused(false);
    setCurrentlyFocusedField(null);
    // Validate email format when user leaves the field
    validateEmailFormat();
  };
  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    setCurrentlyFocusedField('password');
  };
  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    setCurrentlyFocusedField(null);
    // Validate password strength when user leaves the field
    const isValidPassword = validatePasswordStrength();
    // If password is valid and confirm password is already filled, validate matching
    if (isValidPassword && formData.confirmPassword) {
      validatePasswordMatch();
    }
  };
  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordFocused(true);
    setCurrentlyFocusedField('confirmPassword');
  };
  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordFocused(false);
    setCurrentlyFocusedField(null);
    // Validate password matching when user finishes typing confirm password
    validatePasswordMatch();
  };

  /**
   * Handles date picker interactions
   */
  const handleDatePickerPress = () => {
    setIsDatePickerOpen(true);
    setDateOfBirthFocused(true);
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    // Use ISO date format (YYYY-MM-DD) for better parsing reliability
    const formattedDate = date.toISOString().split('T')[0];
    handleInputChange('dateOfBirth', formattedDate);
    setIsDatePickerOpen(false);
    setDateOfBirthFocused(false);
  };

  const handleDateCancel = () => {
    setIsDatePickerOpen(false);
    setDateOfBirthFocused(false);
  };

  /**
   * Handles terms checkbox change
   */
  const handleTermsChange = () => {
    setAgreeToTerms(!agreeToTerms);
    setTermsError(''); // Clear terms error when user interacts
  };

  const isLoading = registerMutation.isPending;

  console.log('🌐 === NETWORK DEBUG INFO ===');
  console.log('📋 All Requests:', networkDebugger.getAllRequests());
  console.log('📋 All Responses:', networkDebugger.getAllResponses());
  console.log('🌐 === END DEBUG INFO ===');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        enabled={true}
      >
        <StatusBar backgroundColor="#0088E7" barStyle="light-content" />
        {/* Logo Section */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          scrollEnabled={true}
          enableOnAndroid={true}
          automaticallyAdjustKeyboardInsets={false}
          nestedScrollEnabled={false}
          keyboardDismissMode="interactive"
        >
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconContainer}>
                <LogoIconSvg width={50} height={50} />
              </View>
              <Text style={styles.logoText}>vyzor</Text>
            </View>
          </View>

          {/* Blue Gradient Background */}
          <View style={styles.gradientBackground}>
            {/* Register Card */}
            <View style={styles.registerCard}>
              <Text style={styles.cardTitle}>Create an account</Text>
              <Text style={styles.cardSubtitle}>
                Enter all required details
              </Text>

              <View style={styles.form}>
                {/* Username Input */}
                <View style={[styles.floatingInputContainer]}>
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (firstnameFocused || formData.firstname) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <UserIcon
                        height={20}
                        width={20}
                        style={styles.floatingIcon}
                        color={
                          firstnameFocused || formData.firstname
                            ? firstnameFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (firstnameFocused || formData.firstname) &&
                          styles.floatingLabelActive,
                          firstnameFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        First Name
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        firstnameFocused && styles.floatingInputFocused,
                        firstnameError && styles.floatingInputError,
                      ]}
                      value={formData.firstname}
                      onChangeText={text =>
                        handleInputChange('firstname', text)
                      }
                      onFocus={handleFirstnameFocus}
                      onBlur={handleFirstnameBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <View
                      style={[
                        styles.underline,
                        firstnameFocused && styles.underlineFocused,
                        firstnameError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {/* First Name Error Display */}
                  {firstnameError ? (
                    <View style={[styles.errorContainer]}>
                      <Text style={styles.errorText}>{firstnameError}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.floatingInputContainer}>
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (lastnameFocused || formData.lastname) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <UserIcon
                        height={20}
                        width={20}
                        style={styles.floatingIcon}
                        color={
                          lastnameFocused || formData.lastname
                            ? lastnameFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (lastnameFocused || formData.lastname) &&
                          styles.floatingLabelActive,
                          lastnameFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        Last Name
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        lastnameFocused && styles.floatingInputFocused,
                        lastnameError && styles.floatingInputError,
                      ]}
                      value={formData.lastname}
                      onChangeText={text => handleInputChange('lastname', text)}
                      onFocus={handleLastnameFocus}
                      onBlur={handleLastnameBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <View
                      style={[
                        styles.underline,
                        lastnameFocused && styles.underlineFocused,
                        lastnameError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {/* Last Name Error Display */}
                  {lastnameError ? (
                    <View style={[styles.errorContainer]}>
                      <Text style={styles.errorText}>{lastnameError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Email Input */}
                <View
                  style={[styles.floatingInputContainer]}
                >
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (emailFocused || formData.email) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <EmailIcon
                        style={styles.floatingIcon}
                        height={22}
                        width={22}
                        color={
                          emailFocused || formData.email
                            ? emailFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (emailFocused || formData.email) &&
                          styles.floatingLabelActive,
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
                      value={formData.email}
                      onChangeText={text => handleInputChange('email', text)}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <View
                      style={[
                        styles.underline,
                        emailFocused && styles.underlineFocused,
                        emailError && styles.underlineError,
                      ]}
                    />
                  </View>

                  {/* Email Error Display */}
                  {emailError ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{emailError}</Text>
                    </View>
                  ) : (
                    (() => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      return emailRegex.test(formData.email) ? (
                        <View style={styles.validationIcon}>
                          <CheckIcon width={20} height={20} />
                        </View>
                      ) : null;
                    })()
                  )}
                </View>

                {/* Date of Birth Input */}
                <View style={[styles.floatingInputContainer]}>
                  <View style={[styles.floatingInputWrapper]}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        { left: -5 },
                        (dateOfBirthFocused || formData.dateOfBirth) &&
                        [styles.floatingLabelContainerActive],
                      ]}
                    >
                      <CalendarIcon
                        style={styles.floatingIcon}
                        color={
                          dateOfBirthFocused || formData.dateOfBirth
                            ? dateOfBirthFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (dateOfBirthFocused || formData.dateOfBirth) &&
                          styles.floatingLabelActive,
                          dateOfBirthFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        Date of Birth
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.floatingInput,
                        dateOfBirthFocused && styles.floatingInputFocused,
                        dateOfBirthError && styles.floatingInputError,
                      ]}
                      onPress={handleDatePickerPress}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.dateInputText,
                          formData.dateOfBirth
                            ? styles.dateInputTextFilled
                            : styles.dateInputTextPlaceholder,
                          dateOfBirthError && { color: '#FF6B6B' },
                        ]}
                      >
                        {formData.dateOfBirth &&
                          formatDateForDisplay(formData.dateOfBirth)}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.underline,
                        dateOfBirthFocused && styles.underlineFocused,
                        dateOfBirthError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {dateOfBirthError && (
                    <Text style={styles.errorText}>{dateOfBirthError}</Text>
                  )}
                </View>

                {/* Phone Error Display */}
                {phoneError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{phoneError}</Text>
                  </View>
                ) : null}

                {/* Password Input */}
                <View style={styles.floatingInputContainer}>
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (passwordFocused || formData.password) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <PasswordIcon
                        style={styles.floatingIcon}
                        height={22}
                        width={22}
                        color={
                          passwordFocused || formData.password
                            ? passwordFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (passwordFocused || formData.password) &&
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
                        { paddingRight: 40 },
                      ]}
                      value={formData.password}
                      onChangeText={text => handleInputChange('password', text)}
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      disabled={isLoading}
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
                </View>

                {/* Password Error Display and Strength Indicator */}
                {passwordError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}

                {/* Confirm Password Input */}
                <View style={styles.floatingInputContainer}>
                  <View style={styles.floatingInputWrapper}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        (confirmPasswordFocused || formData.confirmPassword) &&
                        styles.floatingLabelContainerActive,
                      ]}
                    >
                      <PasswordIcon
                        style={styles.floatingIcon}
                        height={22}
                        width={22}
                        color={
                          confirmPasswordFocused || formData.confirmPassword
                            ? confirmPasswordFocused
                              ? '#0088E7'
                              : '#475467'
                            : '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (confirmPasswordFocused ||
                            formData.confirmPassword) &&
                          styles.floatingLabelActive,
                          confirmPasswordFocused && styles.floatingLabelFocused,
                        ]}
                      >
                        Confirm Password
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        confirmPasswordFocused && styles.floatingInputFocused,
                        confirmPasswordError && styles.floatingInputError,
                        { paddingRight: 40 },
                      ]}
                      value={formData.confirmPassword}
                      onChangeText={text =>
                        handleInputChange('confirmPassword', text)
                      }
                      onFocus={handleConfirmPasswordFocus}
                      onBlur={handleConfirmPasswordBlur}
                      secureTextEntry={!isConfirmPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                      disabled={isLoading}
                    >
                      {isConfirmPasswordVisible ? (
                        <Text style={styles.passwordToggleIcon}>👁️‍🗨️</Text>
                      ) : (
                        <EyeSlash width={20} height={20} />
                      )}
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.underline,
                        confirmPasswordFocused && styles.underlineFocused,
                        confirmPasswordError && styles.underlineError,
                      ]}
                    />
                  </View>
                </View>

                {/* Confirm Password Error Display */}
                {confirmPasswordError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  </View>
                ) : null}

                {/* Multi Phone Number Inputs */}
                {phoneNumbers.map((item, idx) => (
                  <View key={idx} style={{ marginBottom: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <PhoneIcon style={{ marginRight: 4 }} height={18} width={18} color={'#475467'} />
                      <Text style={{ fontFamily: 'Poppins', fontSize: 15, color: '#475467' }}>
                        Phone Number{phoneNumbers.length > 1 ? ` ${idx + 1}` : ''}
                      </Text>
                      <Text style={{ color: '#FF6B6B', marginLeft: 4, fontSize: 16, fontWeight: 'bold' }}>*</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                      <PhoneInput
                        ref={item.ref}
                        defaultValue={item.value}
                        defaultCode={item.country as any}
                        layout="first"
                        onChangeText={text => handlePhoneChange(idx, text)}
                        onChangeFormattedText={text => handlePhoneChange(idx, text)}
                        textInputStyle={{ fontFamily: 'Poppins', fontSize: 16, color: '#1F2937', paddingVertical: 0, paddingHorizontal: 0 }}
                        codeTextStyle={{ fontFamily: 'Poppins', fontSize: 16, color: '#1F2937', }}
                        onChangeCountry={country => handleCountryChange(idx, country.cca2)}
                        withShadow={false}
                        withDarkTheme={false}
                        autoFocus={false}
                        disabled={isLoading}
                      />
                      {phoneNumbers.length > 1 && (
                        <TouchableOpacity onPress={() => removePhoneField(idx)} style={{ position: 'absolute', right: -10, top: -20 }}>
                          <Text style={{ color: '#FF6B6B', fontSize: 22 }}>x</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={addPhoneField} style={{ alignSelf: 'flex-end', marginBottom: 10, justifyContent: 'center', flexDirection: 'row' }}>
                  <Text style={{ color: '#0088E7', fontWeight: '500', fontSize: 15, marginRight: 4 }}>Add New</Text>
                  <PlusImage width={20} height={20} />
                </TouchableOpacity>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[
                    styles.signUpButton,
                    isLoading && styles.signUpButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
                {/* Sign In Link */}
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={navigateToLogin}
                    disabled={isLoading}
                  >
                    <Text style={styles.signInLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePicker
          modal
          open={isDatePickerOpen}
          date={selectedDate}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          title="Select Date of Birth"
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Creates themed styles for the RegisterScreen component
 * @param theme - Theme object containing colors and spacing
 * @returns StyleSheet object with all component styles
 */
const createStyles = (theme: {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#0088E7',
    },
    container: {
      flex: 1,
      backgroundColor: '#0088E7',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    gradientBackground: {
      backgroundColor: '#0088E7',
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 20,
      minHeight: '100%',
    },
    logoSection: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 15,
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
    registerCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    cardTitle: {
   fontSize: 21,
      fontWeight: '600',
      color: '#101828',
      textAlign: 'center',
      marginBottom: 5,
      fontFamily: 'Poppins',
    },
    cardSubtitle: {
       fontSize: 13,
      fontWeight: '400',
      color: '#475467',
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Poppins',
    },
    form: {
      paddingBottom: 30,
    },
    floatingInputContainer: {
      marginBottom: 15,
      paddingHorizontal: 0,
      paddingVertical: 10,
      position: 'relative',
    },
    floatingInputWrapper: {
      position: 'relative',
    },
    floatingLabelContainer: {
      position: 'absolute',
      left: 0,
      top: 15,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 2,
    },
    floatingLabelContainerActive: {
      top: -16,
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
    floatingIconText: {
      fontSize: 16,
      color: '#475467',
      marginRight: 8,
    },
    floatingIconActive: {
      transform: [{ translateY: -1 }],
    },
    floatingLabelFocused: {
      color: '#0088E7',
      fontFamily: 'Poppins',
    },
    floatingInput: {
      fontSize: 16,
      color: '#1F2937',
      paddingVertical: 8,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      width: '100%',
      paddingTop: 18,
      fontFamily: 'Poppins',
    },
    floatingInputFocused: {
      color: '#1F2937',
    },
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      marginRight: 12,
      paddingTop: 20,
      paddingBottom: 18,
    },
    countryCode: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      marginRight: 4,
    },
    dropdownArrow: {
      fontSize: 12,
      color: '#475467',
    },
    phoneInput: {
      flex: 1,
      marginLeft: 0,
    },
    // Phone Number Input Package Styles
    phoneNumberContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      width: '100%',
      paddingTop: 20,
      paddingHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    phoneNumberContainerFocused: {
      backgroundColor: 'transparent',
    },
    phoneNumberTextContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      marginLeft: 0,
    },
    phoneNumberInput: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      backgroundColor: 'transparent',
      paddingVertical: 0,
      paddingHorizontal: 0,
      height: 'auto',
      borderWidth: 0,
    },
    phoneNumberInputFocused: {
      color: '#1F2937',
    },
    phoneNumberCodeText: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      paddingHorizontal: 8,
    },
    phoneNumberCountryPicker: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginRight: 8,
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
      borderRadius: 0,
    },
    phoneNumberFlagButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginRight: 0,
    },
    customCountryCode: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 8,
    },
    countryCodeText: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      fontWeight: '500',
    },
    // New phone input styles for custom layout
    phoneInputRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingTop: 18,
    },
    countryCodeSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 5,
      borderRightColor: '#E5E7EB',
      marginRight: 5,
      paddingVertical: 1,
    },
    phoneNumberTextInput: {
      flex: 1,
      marginLeft: 0,
    },
    hiddenPhoneInput: {
      position: 'absolute',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden',
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
    passwordToggle: {
      position: 'absolute',
      right: 0,
      top: 18,
      paddingHorizontal: 8,
      paddingVertical: 0,
      zIndex: 2,
    },
    passwordToggleIcon: {
      fontSize: 16,
      color: '#475467',
      fontFamily: 'Poppins',
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#D1D5DB',
      borderRadius: 4,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
      backgroundColor: '#0088E7',
      borderColor: '#0088E7',
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    termsText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Poppins',
      flex: 1,
    },
    termsLink: {
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signUpButton: {
      backgroundColor: '#0088E7',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#0088E7',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    signUpButtonDisabled: {
      opacity: 0.6,
    },
    signUpButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10,
    },
    signInText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Poppins',
    },
    signInLink: {
      fontSize: 14,
      color: '#0088E7',
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    // Debug button styles (development only)
    debugButton: {
      backgroundColor: '#6B7280',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    debugButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    // Legacy styles for backwards compatibility
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    themeToggle: {
      minWidth: 50,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 50,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      padding: 4,
    },
    eyeText: {
      fontSize: 18,
    },
    placeholder: {
      color: theme.colors.textSecondary,
    },
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
    },
    passwordRequirements: {
      gap: 4,
    },
    passwordRequirement: {
      fontSize: 12,
      fontWeight: '400',
      paddingVertical: 2,
    },
    passwordRequirementMet: {
      color: '#16A34A', // Green for met requirements
    },
    passwordRequirementUnmet: {
      color: '#9CA3AF', // Gray for unmet requirements
    },
    passwordStrengthBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginRight: 12,
    },
    passwordStrengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    passwordStrengthText: {
      fontSize: 12,
      fontWeight: '500',
      minWidth: 60,
    },
    passwordMatchText: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    registerButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    disabledButton: {
      opacity: 0.6,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loginButton: {
      alignItems: 'center',
      marginTop: 10,
    },
    loginButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    loginLink: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    passwordMatchSuccess: {
      color: '#4caf50',
    },
    passwordMatchError: {
      color: '#ff4757',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Poppins',
    },
    modalCloseButton: {
      padding: 5,
    },
    modalCloseText: {
      fontSize: 18,
      color: '#475467',
      fontWeight: 'bold',
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    countryItemSelected: {
      backgroundColor: '#EBF8FF',
    },
    countryItemCode: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Poppins',
      minWidth: 50,
    },
    countryItemName: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'Poppins',
      flex: 1,
      marginLeft: 10,
    },
    countryItemDial: {
      fontSize: 16,
      color: '#6B7280',
      fontFamily: 'Poppins',
    },
    // Error styles
    floatingInputError: {
      borderColor: '#FF6B6B',
      color: '#FF6B6B',
    },
    underlineError: {
      backgroundColor: '#FF6B6B',
    },
    errorContainer: {
      marginLeft: 2,
      marginRight: 1,
    },
    errorText: {
      fontSize: 12,
      color: '#FF6B6B',
      fontFamily: 'Poppins',
      width: '100%',
      paddingTop: 4,
    },
    // Date input styles
    dateInputText: {
      fontSize: 16,
      fontFamily: 'Poppins',
      paddingVertical: 4,
      paddingHorizontal: 0,
      width: '100%',
    },
    dateInputTextFilled: {
      color: '#1F2937',
    },
    dateInputTextPlaceholder: {
      color: '#9CA3AF',
    },
  });
export default RegisterScreen;
