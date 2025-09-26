
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { createStyles } from './styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import DatePicker from 'react-native-date-picker';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useRegister } from '../../../hooks/useAuth';
import { showErrorToast } from '../../../components/toast';
import { registerValidationSchema } from '../../../utils/validation';
import { networkDebugger } from '../../../utils/networkDebugger';
import LogoIconSvg from '../../../assets/svgs/logoIcon.svg';
import EmailIcon from '../../../assets/svgs/emailIcon.svg';
import PasswordIcon from '../../../assets/svgs/passwordIcon.svg';
import CheckIcon from '../../../assets/svgs/checkIcon.svg';
import EyeSlash from '../../../assets/svgs/eyeSlash.svg';
import UserIcon from '../../../assets/svgs/user.svg';
import PhoneIcon from '../../../assets/svgs/receiverIcon.svg';
import CalendarIcon from '../../../assets/svgs/calendar.svg';
import PlusImage from '../../../assets/svgs/plusImage.svg';
import { isValidEmail } from '../../../utils';
import FloatingInput from '../../../components/TextInput/TextInput';

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
  // Multi-phone state
  // Set default country code for phone input
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [phoneCountries, setPhoneCountries] = useState(['US']);
  const [phoneErrors, setPhoneErrors] = useState(['']);

  // Add this after your existing state declarations
const [phoneIds, setPhoneIds] = useState([0]); // Track unique IDs for each phone field
const nextPhoneId = useRef(1); // Counter for generating unique IDs


  // Initialize refs array once
  // const phoneRefs = useRef([] as React.RefObject<PhoneInput>[]);
  // if (phoneRefs.current.length !== phoneNumbers.length) {
  //   // Add missing refs
  //   while (phoneRefs.current.length < phoneNumbers.length) {
  //     phoneRefs.current.push(React.createRef<PhoneInput>());
  //   }
  //   // Remove extra refs
  //   while (phoneRefs.current.length > phoneNumbers.length) {
  //     phoneRefs.current.pop();
  //   }
  // }

  // Initialize refs array once
const phoneRefs = useRef([] as React.RefObject<PhoneInput>[]);

// Replace the existing useEffect with this:
React.useEffect(() => {
  // Completely rebuild refs array to match current phoneNumbers length
  phoneRefs.current = phoneNumbers.map(() => React.createRef<PhoneInput>());
}, [phoneNumbers.length]);

  // Add new phone field
  // const addPhoneField = () => {
  //   setPhoneNumbers(nums => [...nums, '']);
  //   setPhoneCountries(countries => [...countries, 'US']);
  //   setPhoneErrors(errs => [...errs, '']);
  //   // phoneRefs will sync automatically above
  // };

  const addPhoneField = () => {
  const newId = nextPhoneId.current++;
  setPhoneNumbers(nums => [...nums, '']);
  setPhoneCountries(countries => [...countries, 'US']);
  setPhoneErrors(errs => [...errs, '']);
  setPhoneIds(ids => [...ids, newId]);
};

  // const removePhoneField = (idx: number) => {
  //   setPhoneNumbers(nums => nums.filter((_, i) => i !== idx));
  //   setPhoneCountries(countries => countries.filter((_, i) => i !== idx));
  //   setPhoneErrors(errs => errs.filter((_, i) => i !== idx));
  //   // Remove the ref at the same index
  //   if (phoneRefs.current.length > idx) {
  //     phoneRefs.current.splice(idx, 1);
  //   }
  // };

const removePhoneField = (idx: number) => {
  setPhoneNumbers(nums => nums.filter((_, i) => i !== idx));
  setPhoneCountries(countries => countries.filter((_, i) => i !== idx));
  setPhoneErrors(errs => errs.filter((_, i) => i !== idx));
  setPhoneIds(ids => ids.filter((_, i) => i !== idx));
};

  // Handle phone number change
  const handleMultiPhoneChange = (idx: number, text: string) => {
    setPhoneNumbers(nums => nums.map((n, i) => i === idx ? text : n));
    // Only validate if user entered 2+ digits
    const ref = phoneRefs.current[idx].current;
    let error = '';
    if (text && text.replace(/\D/g, '').length >= 5) {
      if (ref && ref.isValidNumber) {
        error = !ref.isValidNumber(text) ? 'Invalid phone number' : '';
      }
    } else {
      error = '';
    }
    setPhoneErrors(errs => errs.map((e, i) => i === idx ? error : e));
  };

  // Handle country change
  const handleMultiCountryChange = (idx: number, country: any) => {
    setPhoneCountries(countries => countries.map((c, i) => i === idx ? country.cca2 : c));
  };
  const scrollViewRef = useRef<any>(null);
  // ...existing code...
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(true);
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Single phone input state
  // (already declared above, remove duplicates)


  // Focus states for floating labels
  const [firstnameFocused, setFirstnameFocused] = useState(false);
  const [lastnameFocused, setLastnameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  function toggleConfirmPasswordVisibility(): void {
  setIsConfirmPasswordVisible((prev) => !prev);
}

  // Date picker state
  // Set default date to 16 years ago
  const getDefaultDOB = () => {
    const now = new Date();
    // Set to exactly 16 years ago, same month/day
    return new Date(now.getFullYear() - 16, now.getMonth(), now.getDate());
  };
  const defaultDOBString = getDefaultDOB().toISOString().split('T')[0];
  const [formData, setFormData] = useState<IFormData>({
    firstname: '',
    lastname: '',
    email: '',
    dateOfBirth: defaultDOBString,
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedDate, setSelectedDate] = useState(getDefaultDOB());
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

    // Live validation for email
    if (field === 'email') {
      if (!value) {
        setEmailError('Email is required');
      } else if (!isValidEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
      return;
    }

    // Clear related error when user starts typing (other fields)
    switch (field) {
      case 'firstname':
        setFirstnameError('');
        break;
      case 'lastname':
        setLastnameError('');
        break;
      case 'dateOfBirth':
        setDateOfBirthError('');
        break;
      case 'password':
        setPasswordError('');
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

    // Only letters and spaces allowed
    const firstnameRegex = /^[A-Za-z ]{3,15}$/;
    if (!firstnameRegex.test(firstname)) {
      setFirstnameError('First name can only contain letters and spaces');
      return false;
    }

    setFirstnameError('');
    return true;
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
      setConfirmPasswordError('Password fields do not match');
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
    // Clear all errors first
    setFirstnameError('');
    setLastnameError('');
    setEmailError('');
    setDateOfBirthError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');

    let valid = true;
    // Required field checks
    if (!formData.firstname.trim()) {
      setFirstnameError('First name is required');
      valid = false;
    }
    if (!formData.lastname.trim()) {
      setLastnameError('Last name is required');
      valid = false;
    }
    if (!formData.email.trim()) {
      setEmailError('Email is required');
      valid = false;
    }
    if (!formData.dateOfBirth) {
      setDateOfBirthError('Date of birth is required');
      valid = false;
    }
    // Phone number is optional; error handled in handleMultiPhoneChange only if user enters 2+ digits and it's invalid
    setPhoneError('');
    if (!formData.password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError('Confirm password is required');
      valid = false;
    }
    if (!agreeToTerms) {
      setTermsError('You must agree to the terms');
      valid = false;
    }
    if (!valid) return false;

    // First name: only letters and spaces
    if (!/^[A-Za-z ]+$/.test(formData.firstname.trim())) {
      setFirstnameError('First name can only contain letters and spaces');
      valid = false;
    }
    // Last name: only letters and spaces
    if (!/^[A-Za-z ]+$/.test(formData.lastname.trim())) {
      setLastnameError('Last name can only contain letters and spaces');
      valid = false;
    }
    // Email format
    if (!isValidEmail(formData.email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }
    // Remove redundant phone regex validation (handled by phone input)
    // Date of birth: must be 16 years or older
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    const d = today.getDate() - dob.getDate();
    let is16 = age > 16 || (age === 16 && (m > 0 || (m === 0 && d >= 0)));
    if (!is16) {
      setDateOfBirthError('You must be at least 16 years old');
      valid = false;
    }
    // Password match
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }
    // Password strength (reuse existing logic)
    if (!checkPasswordRequirements(formData.password).hasMinLength) {
      setPasswordError('Password must be at least 8 characters long');
      valid = false;
    }
    if (!checkPasswordRequirements(formData.password).hasUpperCase) {
      setPasswordError('Password must contain at least one uppercase letter');
      valid = false;
    }
    if (!checkPasswordRequirements(formData.password).hasLowerCase) {
      setPasswordError('Password must contain at least one lowercase letter');
      valid = false;
    }
    if (!checkPasswordRequirements(formData.password).hasNumber) {
      setPasswordError('Password must contain at least one number');
      valid = false;
    }
    if (!checkPasswordRequirements(formData.password).hasSpecialChar) {
      setPasswordError('Password must contain at least one special character');
      valid = false;
    }
    return valid;
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
      phoneNumbers,
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

      // Collect all valid phone numbers for API
      const validPhones: string[] = [];
      phoneNumbers.forEach((num, idx) => {
        const ref = phoneRefs.current[idx]?.current;
        if (num.trim() && ref && ref.isValidNumber && ref.isValidNumber(num)) {
          validPhones.push(ref.getNumberAfterPossiblyEliminatingZero().formattedNumber);
        }
      });
      // validPhones can be empty; phone number is optional
      console.log('📞 Phone numbers processing:', validPhones);

      // Build userPhoneModels array
      const userPhoneModels = validPhones.map((phone, idx) => ({
        phoneModel: {
          phoneNumber: phone,
          type: 'CALL',
          defaultPhone: idx === 0,
        },
      }));

      // Await and log full response
      // Format birthday to ISO string with time
      let formattedBirthday = '';
      if (formData.dateOfBirth) {
        const dateObj = new Date(formData.dateOfBirth);
        formattedBirthday = dateObj.toISOString();
      }
      const payload = {
        firstName: formData.firstname.trim(),
        lastName: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        birthday: formattedBirthday,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userRoleModels: [],
        language: '',
        status: 'INACTIVE',
        userPhoneModels: userPhoneModels,
      };
      console.log('📤 Sending registration data (FULL):', { ...payload, password: '***' });
      const response = await registerMutation.mutateAsync(payload);
      console.log('✅ Registration successful! Full response:', response);

      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.log('❌ Registration error:', error);
      if (error.response) {
        console.log('❌ API Error Response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          config: error.response.config,
        });
      } else {
        console.log('❌ Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }

      // Show specific error message and stay on register screen
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
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
      setLastnameError('Last name must be less than 15 characters');
      return false;
    }

    const lastnameRegex = /^[A-Za-z ]+$/;
    if (!lastnameRegex.test(lastname)) {
      setLastnameError('Last name can only contain letters and spaces');
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

  function togglePasswordVisibility(): void {
    setIsPasswordVisible(prev => !prev);
  }

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
                <FloatingInput
                  label="First Name"
                  LeftIcon={UserIcon}
                  value={formData.firstname}
                  onFocus={handleFirstnameFocus}
                  onBlur={handleFirstnameBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  leftIconProps={{ color: "#475467" }}
                  onChangeText={(text: string) => {
                    const cleaned = text.replace(/[^A-Za-z ]/g, '').replace(/\s{2,}/g, ' ');
                    handleInputChange('firstname', cleaned);
                  }}
                  errorMessage={firstnameError}
                  isStaric
                />

                <FloatingInput
                  label="Last Name"
                  LeftIcon={UserIcon}
                  value={formData.lastname}
                  onFocus={handleLastnameFocus}
                  onBlur={handleLastnameBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  leftIconProps={{ color: "#475467" }}
                  onChangeText={(text: string) => {
                    const cleaned = text.replace(/[^A-Za-z ]/g, '').replace(/\s{2,}/g, ' ');
                    handleInputChange('lastname', cleaned);
                  }}
                  errorMessage={lastnameError}
                  isStaric
                />

                {/* Email Input */}
                <FloatingInput
                  label="Email"
                  LeftIcon={EmailIcon}
                  value={formData.email}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  leftIconProps={{ color: "#475467" }}
                  onChangeText={text => handleInputChange('email', text)}
                  errorMessage={emailError}
                  isStaric
                  RightIcon={
                    !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                      ? () => <CheckIcon width={20} height={20} />
                      : undefined
                  }
                />

                {/* Date of Birth Input */}
                <View style={[styles.floatingInputContainer]}>
                  <View style={[styles.floatingInputWrapper]}>
                    <View
                      style={[
                        styles.floatingLabelContainer,
                        { left: -5 },
                        (true || dateOfBirthFocused || formData.dateOfBirth) &&
                        [styles.floatingLabelContainerActive],
                      ]}
                    >
                      <CalendarIcon
                        style={styles.floatingIcon}
                        color={
                          '#475467'
                        }
                      />
                      <Text
                        style={[
                          styles.floatingLabel,
                          (true || dateOfBirthFocused || formData.dateOfBirth) &&
                          styles.floatingLabelActive,
                          (true || dateOfBirthFocused) && styles.floatingLabelFocused,
                        ]}
                      >
                        Date of Birth {''}
                        <Text style={{ color: '#FF6B6B', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.floatingInput,
                        (true || dateOfBirthFocused) && styles.floatingInputFocused,
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
                        {formatDateForDisplay(formData.dateOfBirth)}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.underline,
                        (true || dateOfBirthFocused) && styles.underlineFocused,
                        dateOfBirthError && styles.underlineError,
                      ]}
                    />
                  </View>
                  {dateOfBirthError && (
                    <Text style={styles.errorText}>{dateOfBirthError}</Text>
                  )}
                </View>
                {/* Password Input */}
                <FloatingInput
                  label="Password"
                  LeftIcon={PasswordIcon}
                  value={formData.password}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={text => handleInputChange('password', text)}
                  errorMessage={passwordError}
                  leftIconProps={{ color: "#475467" }}
                  isStaric
                  secureTextEntry={!isPasswordVisible}
                  RightIconAlt={EyeSlash}
                  onRightIconPress={togglePasswordVisibility}
                />


                {/* Confirm Password Input */}
                <FloatingInput
                  label="Confirm Password"
                  LeftIcon={PasswordIcon}
                  value={formData.confirmPassword}
                  onFocus={handleConfirmPasswordFocus}
                  onBlur={handleConfirmPasswordBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={text => handleInputChange('confirmPassword', text)}
                  errorMessage={confirmPasswordError}
                  isStaric
                  leftIconProps={{ color: "#475467" }}
                  secureTextEntry={!isConfirmPasswordVisible}
                  RightIconAlt={EyeSlash}
                  onRightIconPress={toggleConfirmPasswordVisibility}
                />


                {/* Multi Phone Number Input */}
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <PhoneIcon style={{ marginRight: 4 }} height={18} width={18} color={'#475467'} />
                      <Text style={{ fontFamily: 'Poppins', fontSize: 15, color: '#475467' }}>Phone Number</Text>
                    </View>
                  </View>
                    {phoneNumbers.map((num, idx) => (
                      <View key={phoneIds[idx]} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: phoneErrors[idx] ? '#FF6B6B' : (currentlyFocusedField === `phone${idx}` ? '#0088E7' : '#D0D5DD'), minHeight: 40, paddingHorizontal: 8, marginTop: idx === 0 ? 0 : 12, marginBottom: phoneErrors[idx] ? 0 : 20 }}>
                      <PhoneInput
                        ref={phoneRefs.current[idx]}
                        defaultValue={num}
                        defaultCode={phoneCountries[idx] as any}
                        layout="second"
                        onChangeFormattedText={text => handleMultiPhoneChange(idx, text)}
                        onChangeCountry={country => handleMultiCountryChange(idx, country)}
                        containerStyle={{ backgroundColor: 'transparent', minHeight: 40, flex: 1, alignItems: 'center' }}
                        textContainerStyle={{ backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0, alignItems: 'center' }}
                        textInputStyle={{ fontFamily: 'Poppins', fontSize: 16, color: '#1F2937', paddingVertical: 0 }}
                        codeTextStyle={{ fontFamily: 'Poppins', fontSize: 17, color: '#1F2937', marginRight: 4, right: 20 }}
                        flagButtonStyle={{ marginRight: 4 }}
                        disabled={isLoading}
                        withDarkTheme={false}
                        withShadow={false}
                        autoFocus={false}
                        placeholder="Phone Number"
                      />
                      {num && phoneRefs.current[idx].current && phoneRefs.current[idx].current.isValidNumber(num) && !phoneErrors[idx] ? (
                        <CheckIcon width={20} height={20} color="#22C55E" style={{ marginLeft: 8 }} />
                      ) : null}
                      {phoneNumbers.length > 1 && (
                        <TouchableOpacity onPress={() => removePhoneField(idx)} style={{ marginLeft: 8, padding: 4 }}>
                          <Text style={{ fontSize: 18, color: '#FF6B6B', fontWeight: 'bold' }}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Show error for each field */}
                  {phoneErrors.map((err, idx) => err ? (
                    <Text key={`err${idx}`} style={[styles.errorText, { color: '#FF6B6B' }]}>{err}</Text>
                  ) : null)}
                </View>
                {/* {phoneNumbers[phoneNumbers.length - 1] !== '' && (
                  <TouchableOpacity onPress={addPhoneField} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
                    <Text style={{ color: '#0088E7', fontSize: 15, fontWeight: '600', marginRight: 4 }}>Add New</Text>
                    <PlusImage width={18} height={18} />
                  </TouchableOpacity>
                )} */}


                {(() => {
                  const lastIndex = phoneNumbers.length - 1;
                  const lastNumber = phoneNumbers[lastIndex];
                  const lastError = phoneErrors[lastIndex];
                  const lastRef = phoneRefs.current[lastIndex]?.current;
                  
                  // Show "Add New+" only if:
                  // 1. Last phone number is not empty
                  // 2. Last phone number is valid (no error)
                  // 3. Phone validation passes
                  const shouldShowAddButton = lastNumber && 
                    !lastError && 
                    lastRef && 
                    lastRef.isValidNumber && 
                    lastRef.isValidNumber(lastNumber);
                    
                  return shouldShowAddButton ? (
                    <TouchableOpacity onPress={addPhoneField} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
                      <Text style={{ color: '#0088E7', fontSize: 15, fontWeight: '600', marginRight: 4 }}>Add New</Text>
                      <PlusImage width={18} height={18} />
                    </TouchableOpacity>
                  ) : null;
                })()}

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
          maximumDate={getDefaultDOB()}
          minimumDate={new Date(1900, 0, 1)}
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          title="Select Date of Birth"
          confirmText="Confirm"
          cancelText="Cancel"
        />

        {/* Success Modal */}
        {showSuccessModal && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              width: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 16, right: 16 }}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Login');
                }}
              >
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F2F4F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 22, color: '#0088E7' }}>X</Text>
                </View>
              </TouchableOpacity>
              <View style={{ marginTop: 32, marginBottom: 16 }}>
                <Text style={{ fontSize: 48, color: '#22C55E' }}>✓</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22C55E', marginBottom: 12 }}>Success!</Text>
              <Text style={{ fontSize: 16, color: '#475467', textAlign: 'center' }}>
                Your account has been created successfully. Please contact the support team to activate your account.
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
