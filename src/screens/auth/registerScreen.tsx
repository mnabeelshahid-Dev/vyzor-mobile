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
import CountryPicker from 'react-native-country-picker-modal';
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
import ArrowDown from '../../assets/svgs/arrowDown.svg';

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
  const [phoneCountry, setPhoneCountry] = useState<any>('US');
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [phoneCountries, setPhoneCountries] = useState([phoneCountry]);
  const [phoneErrors, setPhoneErrors] = useState(['']);
  // Initialize refs array once
  const phoneRefs = useRef([] as React.RefObject<PhoneInput>[]);
  if (phoneRefs.current.length !== phoneNumbers.length) {
    // Add missing refs
    while (phoneRefs.current.length < phoneNumbers.length) {
      phoneRefs.current.push(React.createRef<PhoneInput>());
    }
    // Remove extra refs
    while (phoneRefs.current.length > phoneNumbers.length) {
      phoneRefs.current.pop();
    }
  }

  // Add new phone field
  const addPhoneField = () => {
    setPhoneNumbers(nums => [...nums, '']);
    setPhoneCountries(countries => [...countries, 'US']);
    setPhoneErrors(errs => [...errs, '']);
    // phoneRefs will sync automatically above
  };

  const removePhoneField = (idx: number) => {
    setPhoneNumbers(nums => nums.filter((_, i) => i !== idx));
    setPhoneCountries(countries => countries.filter((_, i) => i !== idx));
    setPhoneErrors(errs => errs.filter((_, i) => i !== idx));
    // phoneRefs will sync automatically above
  };

  // Handle phone number change
  const handleMultiPhoneChange = (idx: number, text: string) => {
    setPhoneNumbers(nums => nums.map((n, i) => i === idx ? text : n));
    // Validate
    const ref = phoneRefs.current[idx].current;
    let error = '';
    if (ref && ref.isValidNumber) {
      error = !ref.isValidNumber(text) ? 'Invalid phone number' : '';
    }
    setPhoneErrors(errs => errs.map((e, i) => i === idx ? error : e));
  };

  // Handle country change
  const handleMultiCountryChange = (idx: number, country: any) => {
    setPhoneCountries(countries => countries.map((c, i) => i === idx ? country.cca2 : c));
  };
  // Country list for phone input and picker
  const countries = [
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'PK', name: 'Pakistan', dialCode: '+92' },
    { code: 'IN', name: 'India', dialCode: '+91' },
    // ...add more countries as needed
  ];
  // Single phone input state
  const phoneInputRef = useRef<PhoneInput>(null);
  // Remove duplicate phoneNumber state (use phoneNumbers[])
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
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  // Single phone input handlers
  // Phone number validation using phone input ref
  const handlePhoneChange = (text: string) => {
    // Deprecated: use multi-phone logic
  };
  const handleCountryChange = (country: any) => {
    setPhoneCountry(country.cca2 as 'US' | 'CA' | 'GB' | 'PK' | 'IN');
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
   * Email validation
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  /**
   * Strong email validation (RFC 5322 compliant)
   */
  const isStrongEmail = (email: string): boolean => {
    // RFC 5322 Official Standard regex (covers most valid emails)
    const strongEmailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})$/;
    return strongEmailRegex.test(email);
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
      setFirstnameError('First name is required*');
      valid = false;
    }
    if (!formData.lastname.trim()) {
      setLastnameError('Last name is required*');
      valid = false;
    }
    if (!formData.email.trim()) {
      setEmailError('Email is required*');
      valid = false;
    }
    if (!formData.dateOfBirth) {
      setDateOfBirthError('Date of birth is required*');
      valid = false;
    }
    // Validate multi-phone numbers
    let hasValidPhone = false;
    phoneNumbers.forEach((num, idx) => {
      const ref = phoneRefs.current[idx]?.current;
      if (num.trim() && ref && ref.isValidNumber && ref.isValidNumber(num)) {
        hasValidPhone = true;
      } else {
        setPhoneErrors(errs => errs.map((e, i) => i === idx ? 'Invalid phone number' : e));
      }
    });
    if (!hasValidPhone) {
      setPhoneError('At least one valid phone number is required*');
      valid = false;
    } else {
      setPhoneError('');
    }
    if (!formData.password.trim()) {
      setPasswordError('Password is required*');
      valid = false;
    }
    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError('Confirm password is required*');
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
        phoneNumber
      } = formData;

      // Validate required fields
      if (
        !firstname ||
        !lastname ||
        !email ||
        !dateOfBirth ||
        !password ||
        !confirmPassword ||
        phoneNumbers.length === 0
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
      if (validPhones.length === 0) {
        throw new Error('At least one valid phone number is required');
      }
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
      setLastnameError('Last name is required *');
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
        'Last name can only contain letters and spaces'
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
                        First Name {''}
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        firstnameFocused && styles.floatingInputFocused,
                        firstnameError && styles.floatingInputError,
                      ]}
                      value={formData.firstname}
                      onFocus={handleFirstnameFocus}
                      onBlur={handleFirstnameBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      onChangeText={(text: string) => {
                        // Allow only letters and at most one space between words
                        const cleaned = text.replace(/[^A-Za-z ]/g, '').replace(/\s{2,}/g, ' ');
                        handleInputChange('firstname', cleaned);
                      }}
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
                        Last Name {''}
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.floatingInput,
                        lastnameFocused && styles.floatingInputFocused,
                        lastnameError && styles.floatingInputError,
                      ]}
                      value={formData.lastname}
                      onChangeText={(text: string) => {
                        // Allow only letters and at most one space between words
                        const cleaned = text.replace(/[^A-Za-z ]/g, '').replace(/\s{2,}/g, ' ');
                        handleInputChange('lastname', cleaned);
                      }}
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
                        [
                          styles.floatingLabelContainer,
                          (emailFocused || formData.email) &&
                          styles.floatingLabelContainerActive
                        ]
                      ]}
                    >
                      <EmailIcon
                        style={[styles.floatingIcon, { top: 2 }]}
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
                        Email {''}
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
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
                        (true || dateOfBirthFocused || formData.dateOfBirth) &&
                        [styles.floatingLabelContainerActive],
                      ]}
                    >
                      <CalendarIcon
                        style={styles.floatingIcon}
                        color={
                          true || dateOfBirthFocused || formData.dateOfBirth
                            ? '#0088E7'
                            : '#475467'
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
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
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
                        Password {''}
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
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
                  {/* Password Error Display and Strength Indicator */}
                  {passwordError && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{passwordError}</Text>
                    </View>
                  )}
                </View>


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
                        Confirm Password {''}
                        <Text style={{ color: '#FF1200', fontSize: 14, fontWeight: 'bold', marginLeft: 4 }}>*</Text>
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
                  {/* Confirm Password Error Display */}
                  {confirmPasswordError ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{confirmPasswordError}</Text>
                    </View>
                  ) : null}
                </View>


                {/* Multi Phone Number Input */}
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <PhoneIcon style={{ marginRight: 4 }} height={18} width={18} color={'#475467'} />
                      <Text style={{ fontFamily: 'Poppins', fontSize: 15, color: '#475467' }}>Phone Number</Text>
                    </View>
                    <TouchableOpacity onPress={addPhoneField} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#0088E7', fontSize: 15, fontWeight: '600', marginRight: 4 }}>Add New</Text>
                      <PlusImage width={18} height={18} />
                    </TouchableOpacity>
                  </View>
                  {phoneNumbers.map((num, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: phoneErrors[idx] ? '#FF6B6B' : (currentlyFocusedField === `phone${idx}` ? '#0088E7' : '#D0D5DD'), minHeight: 40, paddingHorizontal: 8, marginTop: idx === 0 ? 0 : 12, marginBottom: phoneErrors[idx] ? 0 : 20 }}>
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
                      {/* Show green check if valid and no error */}
                      {num && phoneRefs.current[idx].current && phoneRefs.current[idx].current.isValidNumber(num) && !phoneErrors[idx] ? (
                        <CheckIcon width={20} height={20} color="#22C55E" style={{ marginLeft: 8 }} />
                      ) : null}
                      {/* Remove button (X icon) if more than one field */}
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
      // marginBottom: 15,
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
      top: -10,
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
      transform: [{ translateY: 2 }],
      fontFamily: 'Poppins',
    },
    floatingIcon: {
      height: 25,
      width: 25,
      marginRight: 2,
      // top: 2,
    },
    floatingIconText: {
      fontSize: 16,
      color: '#475467',
      marginRight: 8,
    },
    floatingIconActive: {
      transform: [{ translateY: 2 }],
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
      paddingVertical: 8,
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
