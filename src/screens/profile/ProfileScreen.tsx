import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
// removed Picker here; tab components handle their own Picker imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import PhoneInput from 'react-native-phone-number-input';
import {
  COUNTRIES,
  detectCountryFromPhoneNumber,
  cleanPhoneNumber, // Add this import
} from '../../constants/countries';

import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';

import { useLogout } from '../../hooks/useAuth';

//This is testing

// Define the expected properties on profileData
interface ProfileData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  location: string;
  timezone: string;
  timeZone?: string;
  phone: string;
  language: string;
  updatedById: string;
  clientId: string;
  birthday: string;
  endDate: string;
  startDate: string;
  webId: string;
  fileId?: string;
  addressModel: {
    city: string;
    street: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  userPhoneModels: { phoneModel: { phoneNumber: string; webId: string } }[];
  // Add other fields as needed
}

import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import LocationIcon from '../../assets/svgs/location.svg';
import PasswordIcon from '../../assets/svgs/password.svg';
import TimeZoneIcon from '../../assets/svgs/timezone.svg';
import LanguageIcon from '../../assets/svgs/language.svg';
import PhoneIcon from '../../assets/svgs/phone.svg';
import EditIcon from '../../assets/svgs/edit.svg';
import UserProfile from '../../assets/svgs/user-profile.svg';
// EyeSlash icon is used inside tab components now
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import axios from 'axios';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'react-native';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import GeneralInfoTab from './GeneralInfoTab';
import ChangePasswordTab from './ChangePasswordTab';
import ContactDetailsTab from './ContactDetailsTab';
import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  getLanguageText,
  getLanguageValue,
  getTimezoneText,
  getTimezoneValue,
} from './constants';

const ProfileScreen = ({ navigation }) => {
  const queryClient = useQueryClient();

  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  // Language/Timezone constants imported from './constants'

  // Fetch current user data using React Query
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<ProfileData> => {
      const response = await apiService.get<ProfileData>(
        '/api/security/userAccounts/currentUser/',
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error fetching current user');
      }
    },
  });

  // Query to fetch file details when fileId exists
  const { data: fileData, isLoading: isFileLoading } = useQuery<{
    fileUrl: string;
  } | null>({
    queryKey: ['fileDetails', profileData?.fileId],
    queryFn: async () => {
      if (!profileData?.fileId) return null;

      const response = await apiService.get(
        `/api/dms/file/${profileData.fileId}`,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error fetching file details');
      }
    },
    enabled: !!profileData?.fileId, // Only run when fileId exists
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('General Info');
  const [useDefaultTimeZone, setUseDefaultTimeZone] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states initialized with profileData
  const [firstName, setFirstName] = useState(profileData?.firstName || '');
  const [lastName, setLastName] = useState(profileData?.lastName || '');
  const [email, setEmail] = useState(profileData?.email || '');
  const [language, setLanguage] = useState(profileData?.language || '');
  const [timezone, setTimezone] = useState(profileData?.timezone || '');

  const [street, setStreet] = useState(profileData?.addressModel?.street || '');
  const [state, setState] = useState(profileData?.addressModel?.state || '');
  const [postalCode, setPostalCode] = useState(
    profileData?.addressModel?.postalCode || '',
  );

  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);

  // Update the profileImage state initialization
  const [profileImage, setProfileImage] = useState(null);

  // Add useEffect to update profile image when profileData changes
  React.useEffect(() => {
    if (fileData?.fileUrl) {
      setProfileImage(fileData.fileUrl);
    } else {
      setProfileImage(null);
    }
  }, [fileData, profileData?.fileId]);

  const [showImageOptions, setShowImageOptions] = useState(false);

  const [phoneNumbers, setPhoneNumbers] = useState(() => {
    if (
      profileData?.userPhoneModels &&
      profileData.userPhoneModels.length > 0
    ) {
      return profileData.userPhoneModels.map((phoneObj, index) => ({
        id: Date.now() + index,
        phoneNumber: phoneObj.phoneModel?.phoneNumber || '',
        country: 'US', // Default country
        isDefault: index === 0,
        ref: React.createRef<PhoneInput>(),
      }));
    }
    return [
      {
        id: Date.now(),
        phoneNumber: '',
        country: 'US',
        isDefault: true,
        ref: React.createRef<PhoneInput>(),
      },
    ];
  });

  const [currentPasswordField, setCurrentPasswordField] = useState('');
  const [newPasswordField, setNewPasswordField] = useState('');
  const [confirmNewPasswordField, setConfirmNewPasswordField] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [country, setCountry] = useState(
    profileData?.addressModel?.country || '',
  );
  const [city, setCity] = useState(profileData?.addressModel?.city || '');

  // Dropdown data states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Loading states
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Selected values for API calls
  const [selectedCountryValue, setSelectedCountryValue] = useState('');
  const [selectedStateValue, setSelectedStateValue] = useState('');

  const [languageValue, setLanguageValue] = useState('');
  const [timezoneValue, setTimezoneValue] = useState('');

  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: '',
    timezone: '',
    street: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    phoneNumbers: [],
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const validateAlphabetsOnly = (text: string) => {
    // Allow only alphabets and spaces
    return text.replace(/[^a-zA-Z\s]/g, '');
  };

  const fetchCountries = async () => {
    try {
      setCountriesLoading(true);
      const response = await apiService.get('/api/site/filter/COUNTRIES');
      if (response.success && response.data) {
        setCountries(response.data as any[]);
      }
    } catch (error) {
      console.log('Error fetching countries:', error);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchStates = async countryValue => {
    try {
      setStatesLoading(true);
      const response = await apiService.get(
        `/api/site/filter/STATES?userId=${countryValue}`,
      );
      if (response.success && response.data) {
        setStates(response.data as any[]);
        setCities([]); // Reset cities when country changes
        // Don't clear city here - let it be handled by the useEffect
        setSelectedStateValue('');
      }
    } catch (error) {
      console.log('Error fetching states:', error);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchCities = async stateValue => {
    try {
      setCitiesLoading(true);
      const response = await apiService.get(
        `/api/site/filter/CITIES?userId=${stateValue}`,
      );
      if (response.success && response.data) {
        setCities(response.data as any[]);
        // Don't clear city here - preserve the existing value
      }
    } catch (error) {
      console.log('Error fetching cities:', error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  // 4. Add useEffect to fetch countries on component mount (after existing useEffects, around line 220)

  React.useEffect(() => {
    fetchCountries();
  }, []);

  React.useEffect(() => {
    if (profileData && countries.length > 0) {
      // Find country value by text match
      const countryData = countries.find(
        c => c.text === profileData.addressModel?.country,
      );
      if (countryData) {
        setSelectedCountryValue(countryData.value);
        fetchStates(countryData.value);
      }
    }
  }, [profileData, countries]);

  React.useEffect(() => {
    if (profileData && states.length > 0 && selectedCountryValue) {
      // Find state value by text match
      const stateData = states.find(
        s => s.text === profileData.addressModel?.state,
      );
      if (stateData) {
        setSelectedStateValue(stateData.value);
        fetchCities(stateData.value);
      }
    }
  }, [profileData, states, selectedCountryValue]);

  React.useEffect(() => {
    if (profileData && cities.length > 0 && selectedStateValue && !city) {
      // Only set city if it's currently empty and we have profile data
      const profileCity = profileData.addressModel?.city;
      if (profileCity) {
        setCity(profileCity);
      }
    }
  }, [profileData, cities, selectedStateValue, city]);

React.useEffect(() => {
  if (profileData) {
    const data = {
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      language: profileData.language || '',
      timezone: profileData.timeZone || '',
      street: profileData.addressModel?.street || '',
      country: profileData.addressModel?.country || '',
      state: profileData.addressModel?.state || '',
      city: profileData.addressModel?.city || '',
      postalCode: profileData.addressModel?.postalCode || '',
      phoneNumbers:
        profileData.userPhoneModels?.length > 0
          ? profileData.userPhoneModels.map((phoneObj, index) => {
              const phoneNumber = phoneObj.phoneModel?.phoneNumber || '';
              
              // Use the new cleanPhoneNumber function to remove country code
              const cleanedPhone = cleanPhoneNumber(phoneNumber);

              // Detect country from the original phone number (with country code)
              const detectedCountry = detectCountryFromPhoneNumber(phoneNumber);

              return {
                id: Date.now() + index,
                phoneNumber: cleanedPhone,
                country: detectedCountry || 'US', // Only fallback to US if no country detected
                isDefault: index === 0,
                ref: React.createRef<PhoneInput>(),
              };
            })
          : [
              {
                id: Date.now(),
                phoneNumber: '',
                country: 'US',
                isDefault: true,
                ref: React.createRef<PhoneInput>(),
              },
            ],
    };

    // ... rest of the useEffect remains the same
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);

    // Map received values to display text and store both
    setLanguage(getLanguageText(data.language));
    setLanguageValue(data.language);
    setTimezone(getTimezoneText(data.timezone));
    setTimezoneValue(data.timezone);

    setStreet(data.street);
    setCountry(data.country);
    setState(data.state);
    setCity(data.city);
    console.log('City info', data.city);
    setPostalCode(data.postalCode);
    setPhoneNumbers(data.phoneNumbers);
    setInitialData(data);

    if (data.city && !city) {
      setCity(data.city);
    }
  }
}, [profileData]);

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]) {
        const selectedImageUri = response.assets[0].uri;
        if (selectedImageUri) {
          // Update local state immediately for UI feedback
          setProfileImage(selectedImageUri);
          // Upload to server
          uploadProfilePictureMutation.mutate(selectedImageUri);
        }
      }
      setShowImageOptions(false);
    });
  };

  const removeProfileImage = async () => {
    try {
      // Update user profile to remove file ID
      const response = await apiService.delete(
        `/api/dms/file/${profileData.fileId}`,
      );

      // Set to null instead of the default avatar URL
      setProfileImage(null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage('Profile picture removed successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Error removing profile picture:', error);
      setErrorMessage('Failed to remove profile picture. Please try again.');
      setShowErrorModal(true);
    }
    setShowImageOptions(false);
  };

  // Enhanced phone validation function similar to RegisterScreen
  const validatePhoneNumber = (phoneNumber: string, index: number): boolean => {
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    const phoneRef = phoneNumbers[index]?.ref?.current;

    if (!phoneNumber.trim()) {
      const newErrors = [...phoneErrors];
      newErrors[index] = '';
      setPhoneErrors(newErrors);
      return true; // Phone is optional, so empty is valid
    }

    // Only validate if user entered 5+ digits (similar to registration)
    if (phoneDigits.length >= 5) {
      if (
        phoneRef &&
        phoneRef.isValidNumber &&
        !phoneRef.isValidNumber(phoneNumber)
      ) {
        const newErrors = [...phoneErrors];
        newErrors[index] = 'Invalid phone number';
        setPhoneErrors(newErrors);
        return false;
      }
    }

    // Clear error if valid
    const newErrors = [...phoneErrors];
    newErrors[index] = '';
    setPhoneErrors(newErrors);
    return true;
  };

// Replace the areAllPhoneNumbersValid function with this version
const areAllPhoneNumbersValid = (): boolean => {
  // If there are no phone numbers, consider it valid
  if (phoneNumbers.length === 0) return true;
  
  // Check each phone number (including the default one)
  for (let i = 0; i < phoneNumbers.length; i++) {
    const phone = phoneNumbers[i];
    const phoneDigits = phone.phoneNumber.replace(/\D/g, '');
    
    // If phone is empty, it's invalid (all phones must be filled now)
    if (!phone.phoneNumber.trim()) {
      return false;
    }
    
    // If phone has less than 5 digits, consider invalid (user started typing)
    if (phoneDigits.length > 0 && phoneDigits.length < 5) {
      return false;
    }
    
    // If phone has 5+ digits, validate it
    if (phoneDigits.length >= 5) {
      const phoneRef = phone.ref?.current;
      if (phoneRef && phoneRef.isValidNumber && !phoneRef.isValidNumber(phone.phoneNumber)) {
        return false;
      }
    }
  }
  
  return true;
};

  // Mutation for uploading profile picture
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      // Generate unique ID for the file
      const fileId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const fileName = `profile_${Date.now()}.jpeg`;

      // Prepare the JSON parameter
      const jsonParam = {
        id: fileId,
        ownerWebId: profileData?.webId,
        name: fileName,
      };

      // Create FormData
      const formData = new FormData();
      formData.append('content', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // First API call - upload file
      const uploadResponse = await apiService.postFormData(
        `/api/dms/file?json=${encodeURIComponent(JSON.stringify(jsonParam))}`,
        formData,
      );

      if (uploadResponse.success && uploadResponse.data) {
        const uploadedFileId = uploadResponse.data.id;

        // Second API call - update user profile with file ID
        const updateResponse = await apiService.patch(
          `/api/security/userAccounts/${profileData?.webId}`,
          { fileId: uploadedFileId },
        );

        if (updateResponse.success) {
          return {
            uploadData: uploadResponse.data,
            updateData: updateResponse.data,
          };
        } else {
          throw new Error(
            updateResponse.message || 'Error updating profile with file ID',
          );
        }
      } else {
        throw new Error(uploadResponse.message || 'Error uploading file');
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage('Profile picture updated successfully!');
      setShowSuccessModal(true);
      console.log('Profile picture upload response:', data);
    },
    onError: error => {
      console.log('Error uploading profile picture:', error);
      setErrorMessage(
        error.message || 'Failed to update profile picture. Please try again.',
      );
      setShowErrorModal(true);
    },
  });

  // Mutation for updating general info
  const updateGeneralInfoMutation = useMutation({
    mutationFn: async (updatePayload: any) => {
      const response = await apiService.put<ProfileData>(
        `/api/security/userAccounts/${profileData?.webId}`,
        updatePayload,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating profile');
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage('General Info updated successfully!');
      setShowSuccessModal(true);
      console.log('Update profile response:', data);
    },
    onError: error => {
      console.log('Error updating profile:', error);
      setErrorMessage(
        error.message || 'Failed to update profile. Please try again.',
      );
      setShowErrorModal(true);
    },
  });

  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: async (updatePayload: any) => {
      const response = await apiService.put<ProfileData>(
        `/api/security/userAccounts/${profileData?.webId}`,
        updatePayload,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating password');
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('Password update response:', data);
      // Clear password fields after successful update
      setCurrentPasswordField('');
      setNewPasswordField('');
      setConfirmNewPasswordField('');
      setCurrentPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');
      setSuccessMessage('Password updated successfully!');
      setShowSuccessModal(true);
    },
    onError: error => {
      console.log('Error updating password:', error);
      // Handle specific password error
      if (
        error.message.toLowerCase().includes('current password') ||
        error.message.toLowerCase().includes('incorrect password') ||
        error.message.toLowerCase().includes('wrong password')
      ) {
        setErrorMessage('Current password is incorrect. Please try again.');
      } else {
        setErrorMessage(
          error.message || 'Failed to update password. Please try again.',
        );
      }
      setShowErrorModal(true);
    },
  });

  // Mutation for updating contact details
  const updateContactDetailsMutation = useMutation({
    mutationFn: async (updatePayload: any) => {
      const response = await apiService.post(
        `/api/security/contactDetails`,
        updatePayload,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating contact details');
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage('Contact details updated successfully!');
      setShowSuccessModal(true);
      console.log('Update contact details response:', data);
    },
    onError: error => {
      console.log('Error updating contact details:', error);
      setErrorMessage(
        error.message || 'Failed to update contact details. Please try again.',
      );
      setShowErrorModal(true);
    },
  });

  // Mutation for updating phone details
  const updatePhoneDetailsMutation = useMutation({
    mutationFn: async (updatePayload: any) => {
      const response = await apiService.put(
        `/api/security/userAccounts/userAccount/${profileData?.webId}/updatePhone`,
        updatePayload,
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error updating phone details');
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('Phone update response:', data);
    },
    onError: error => {
      console.log('Error updating Phone details:', error);
    },
  });

  // Password validation functions
  const validateCurrentPassword = (password: string) => {
    if (!password.trim()) {
      setCurrentPasswordError('Current password is required');
      return false;
    }
    setCurrentPasswordError('');
    return true;
  };

  const validateNewPassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setNewPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (!hasUpperCase) {
      setNewPasswordError('Password must contain at least 1 uppercase letter');
      return false;
    }
    if (!hasLowerCase) {
      setNewPasswordError('Password must contain at least 1 lowercase letter');
      return false;
    }
    if (!hasNumbers) {
      setNewPasswordError('Password must contain at least 1 number');
      return false;
    }
    if (!hasSpecialChar) {
      setNewPasswordError('Password must contain at least 1 special character');
      return false;
    }
    setNewPasswordError('');
    return true;
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    newPassword: string,
  ) => {
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const addNewPhoneNumber = () => {
    const newPhone = {
      id: Date.now(),
      phoneNumber: '',
      country: 'US',
      isDefault: false,
      ref: React.createRef<PhoneInput>(),
    };
    setPhoneNumbers([...phoneNumbers, newPhone]);
    setPhoneErrors([...phoneErrors, '']); // Add empty error for new phone
  };

  const removePhoneNumber = id => {
    const index = phoneNumbers.findIndex(phone => phone.id === id);
    setPhoneNumbers(phoneNumbers.filter(phone => phone.id !== id));

    // Remove corresponding error
    if (index !== -1) {
      const newErrors = phoneErrors.filter((_, i) => i !== index);
      setPhoneErrors(newErrors);
    }
  };

const updatePhoneNumber = (id, newPhoneNumber) => {
  const index = phoneNumbers.findIndex(phone => phone.id === id);

  setPhoneNumbers(
    phoneNumbers.map(phone =>
      phone.id === id
        ? {
            ...phone,
            phoneNumber: newPhoneNumber,
            // Don't auto-detect country here since PhoneInput handles it
          }
        : phone,
    ),
  );

  // Enhanced validation (only validate if 5+ digits entered)
  if (index !== -1) {
    validatePhoneNumber(newPhoneNumber, index);
  }
};

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  const handleGeneralInfoUpdate = async () => {
    const updatePayload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      language: languageValue, // Send the value instead of text
      timeZone: timezoneValue, // Send the value instead of text
      birthday: profileData?.birthday,
      startDate: profileData?.startDate,
      clientId: profileData?.clientId,
      endDate: profileData?.endDate,
    };

    await updateGeneralInfoMutation.mutateAsync(updatePayload);
    console.log('Updated Payload', updatePayload);
  };

  const handleChangePasswordUpdate = async () => {
    // Validate all fields
    const isCurrentPasswordValid =
      validateCurrentPassword(currentPasswordField);
    const isNewPasswordValid = validateNewPassword(newPasswordField);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmNewPasswordField,
      newPasswordField,
    );

    if (
      !isCurrentPasswordValid ||
      !isNewPasswordValid ||
      !isConfirmPasswordValid
    ) {
      return; // Don't proceed if validation fails
    }

    const updatePayload = {
      firstName: profileData?.firstName,
      lastName: profileData?.lastName,
      email: profileData?.email,
      language: profileData?.language,
      endDate: profileData?.endDate,
      timeZone: profileData?.timezone,
      birthday: profileData?.birthday,
      startDate: profileData?.startDate,
      clientId: profileData?.clientId,
      password: newPasswordField,
      currentPassword: currentPasswordField,
    };

    await updatePasswordMutation.mutateAsync(updatePayload);
    console.log('Password update payload:', updatePayload);
  };

  const handleContactDetailsUpdate = async () => {
    // Validate all phone numbers before updating
    let allPhoneNumbersValid = true;
    phoneNumbers.forEach((phone, index) => {
      if (!validatePhoneNumber(phone.phoneNumber, index)) {
        allPhoneNumbersValid = false;
      }
    });

    if (!allPhoneNumbersValid) {
      setErrorMessage('Please fix phone number errors before updating.');
      setShowErrorModal(true);
      return;
    }

    const updatePayload = {
      addressModel: {
        street: street,
        country: country,
        state: state,
        city: city,
        postalCode: postalCode,
      },
    };

    await updateContactDetailsMutation.mutateAsync(updatePayload);
    console.log('Updated Payload', updatePayload);
  };

  // const handlePhoneDetailsUpdate = async () => {
  //   // Create dynamic payload from phoneNumbers state
  //   const updatePayload = phoneNumbers
  //     .filter(phone => phone.phoneNumber.trim() !== '') // Only include phones with numbers
  //     .map(phone => ({
  //       phoneNumber: phone.phoneNumber,
  //       type: 'CALL',
  //       webId: phone.webId,
  //       defaultPhone: phone.isDefault,
  //     }));

  //   const updateStaticPayload = [
  //     {
  //       phoneNumber: '+923089907111',
  //       type: 'CALL',
  //       webId: profileData?.webId,
  //       defaultPhone: false,
  //     },
  //     {
  //       phoneNumber: '+376643111',
  //       type: 'CALL',
  //       webId: profileData?.webId,
  //       defaultPhone: true,
  //     },
  //     {
  //       phoneNumber: '+923089905111',
  //       type: 'CALL',
  //       webId: profileData?.webId,
  //       defaultPhone: false,
  //     },
  //   ];
  //   console.log(updateStaticPayload);

  //   await updatePhoneDetailsMutation.mutateAsync(updatePayload);
  //   console.log('phone payload', updatePayload);
  // };


  const handlePhoneDetailsUpdate = async () => {
  // Create dynamic payload from phoneNumbers state
  const updatePayload = phoneNumbers
    .filter(phone => phone.phoneNumber.trim() !== '') // Only include phones with numbers
    .map(phone => {
      // Get the formatted number from PhoneInput ref
      const phoneRef = phone.ref?.current;
      let completePhoneNumber = phone.phoneNumber;
      
      // If we have a ref and can get the formatted number, use that
      if (phoneRef && phoneRef.getNumberAfterPossiblyEliminatingZero) {
        const formattedNumber = phoneRef.getNumberAfterPossiblyEliminatingZero();
        completePhoneNumber = formattedNumber.formattedNumber || phone.phoneNumber;
      } else {
        // Fallback: if phoneNumber doesn't start with +, add the country code
        if (!phone.phoneNumber.startsWith('+')) {
          const country = COUNTRIES.find(c => c.code === phone.country);
          const dialCode = country?.dialCode || '+1';
          completePhoneNumber = `${dialCode}${phone.phoneNumber}`;
        }
      }
      
      return {
        phoneNumber: completePhoneNumber,
        type: 'CALL',
        webId: phone.webId,
        defaultPhone: phone.isDefault,
      };
    });

  await updatePhoneDetailsMutation.mutateAsync(updatePayload);
  console.log('phone payload', updatePayload);
};

  const handleUpdatePress = async () => {
    if (activeTab === 'General Info') {
      await handleGeneralInfoUpdate();
    } else if (activeTab === 'Change Password') {
      await handleChangePasswordUpdate();
    } else if (activeTab === 'Contact Details') {
      await handleContactDetailsUpdate();
      await handlePhoneDetailsUpdate();
    }
  };

  const handleResetPress = () => {
    if (activeTab === 'General Info') {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setLanguage(getLanguageText(initialData.language));
      setLanguageValue(initialData.language);
      setTimezone(getTimezoneText(initialData.timezone));
      setTimezoneValue(initialData.timezone);
    } else if (activeTab === 'Change Password') {
      setCurrentPasswordField('');
      setNewPasswordField('');
      setConfirmNewPasswordField('');
      setCurrentPasswordError('');
      setNewPasswordError('');
      setConfirmPasswordError('');
    } else if (activeTab === 'Contact Details') {
      setStreet(initialData.street);
      setCountry(initialData.country);
      setState(initialData.state);
      setCity(initialData.city);
      setPostalCode(initialData.postalCode);
      setPhoneNumbers([...initialData.phoneNumbers]);

      // Reset dropdown selections
      if (initialData.country) {
        const countryData = countries.find(c => c.text === initialData.country);
        if (countryData) {
          setSelectedCountryValue(countryData.value);
          fetchStates(countryData.value);
        }
      }
    }
  };

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // inlined tab renderers and input helpers moved to separate components

  // Check if any mutation is loading
  const isMutationLoading =
    updateGeneralInfoMutation.isPending ||
    updatePasswordMutation.isPending ||
    updateContactDetailsMutation.isPending ||
    updatePhoneDetailsMutation.isPending ||
    uploadProfilePictureMutation.isPending;

  if (isLoading || (profileData?.fileId && isFileLoading)) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: '#007AFF', marginTop: 16, fontSize: 16 }}>
          Loading, please wait...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <Text style={{ color: '#FF0000', marginTop: 16, fontSize: 16 }}>
          Error loading profile. Please try again.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            padding: 10,
            backgroundColor: '#007AFF',
            borderRadius: 8,
          }}
          onPress={() => refetch()}
        >
          <Text style={{ color: '#FFF' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Always show edit mode (removed profile items view)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <TouchableOpacity onPress={() => setShowDropdown(true)}>
            <ThreeDotIcon width={26} height={26} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Profile Content */}
      <View style={styles.profileContainer}>
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <View>
              {/* Profile Header - Edit Mode */}
              <View style={styles.profileHeader}>
                <TouchableOpacity
                  style={[
                    styles.avatarContainer,
                    uploadProfilePictureMutation.isPending && { opacity: 0.6 },
                  ]}
                  onPress={() => setShowImageOptions(true)}
                  disabled={uploadProfilePictureMutation.isPending}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatar}
                    />
                  ) : (
                    <UserProfile width={84} height={84} style={styles.avatar} />
                  )}
                  {/* Edit Icon */}
                  <View style={styles.editIconContainer}>
                    <EditIcon width={16} height={16} style={styles.editIcon} />
                  </View>
                  {uploadProfilePictureMutation.isPending && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: 50,
                      }}
                    >
                      <ActivityIndicator size="small" color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.userName}>{profileData?.firstName}</Text>
                <Text style={styles.userRole}>
                  {profileData?.role ? profileData.role : ''}
                </Text>
              </View>
              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                <TabButton
                  title="General Info"
                  isActive={activeTab === 'General Info'}
                  onPress={() => setActiveTab('General Info')}
                />
                <TabButton
                  title="Change Password"
                  isActive={activeTab === 'Change Password'}
                  onPress={() => setActiveTab('Change Password')}
                />
                <TabButton
                  title="Contact Details"
                  isActive={activeTab === 'Contact Details'}
                  onPress={() => setActiveTab('Contact Details')}
                />
              </View>
              {/* Tab Content */}
              {activeTab === 'General Info' && (
                <GeneralInfoTab
                  styles={styles}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  language={language}
                  timezone={timezone}
                  useDefaultTimeZone={useDefaultTimeZone}
                  onChangeFirstName={text =>
                    setFirstName(validateAlphabetsOnly(text))
                  }
                  onChangeLastName={text =>
                    setLastName(validateAlphabetsOnly(text))
                  }
                  onSelectLanguage={itemText => {
                    if (itemText) {
                      setLanguage(itemText);
                      setLanguageValue(getLanguageValue(itemText));
                    }
                  }}
                  onSelectTimezone={itemText => {
                    if (itemText) {
                      setTimezone(itemText);
                      setTimezoneValue(getTimezoneValue(itemText));
                    }
                  }}
                  onToggleDefaultTimezone={() =>
                    setUseDefaultTimeZone(!useDefaultTimeZone)
                  }
                />
              )}
              {activeTab === 'Change Password' && (
                <ChangePasswordTab
                  styles={styles}
                  currentPasswordField={currentPasswordField}
                  newPasswordField={newPasswordField}
                  confirmNewPasswordField={confirmNewPasswordField}
                  showCurrentPassword={showCurrentPassword}
                  showNewPassword={showNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  currentPasswordError={currentPasswordError}
                  newPasswordError={newPasswordError}
                  confirmPasswordError={confirmPasswordError}
                  onChangeCurrentPassword={text => {
                    setCurrentPasswordField(text);
                    if (currentPasswordError) {
                      validateCurrentPassword(text);
                    }
                  }}
                  onChangeNewPassword={text => {
                    setNewPasswordField(text);
                    if (newPasswordError) {
                      validateNewPassword(text);
                    }
                    if (confirmNewPasswordField) {
                      validateConfirmPassword(confirmNewPasswordField, text);
                    }
                  }}
                  onChangeConfirmPassword={text => {
                    setConfirmNewPasswordField(text);
                    if (confirmPasswordError) {
                      validateConfirmPassword(text, newPasswordField);
                    }
                  }}
                  onToggleShowCurrent={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                  onToggleShowNew={() => setShowNewPassword(!showNewPassword)}
                  onToggleShowConfirm={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />
              )}
              {activeTab === 'Contact Details' && (
                <ContactDetailsTab
                  styles={styles}
                  phoneNumbers={phoneNumbers}
                  phoneErrors={phoneErrors}
                  onAddNewPhone={addNewPhoneNumber}
                  onRemovePhone={removePhoneNumber}
                  onChangePhone={updatePhoneNumber}
                  onChangePhoneCountry={(id, cca2) => {
                    setPhoneNumbers(prev =>
                      prev.map(p =>
                        p.id === id ? { ...p, country: cca2 } : p,
                      ),
                    );
                  }}
                  street={street}
                  country={country}
                  state={state}
                  city={city}
                  postalCode={postalCode}
                  onChangeStreet={setStreet}
                  onChangePostalCode={setPostalCode}
                  onSelectCountry={selectedCountry => {
                    setCountry(selectedCountry.text);
                    setSelectedCountryValue(selectedCountry.value);
                    setState('');
                    setCity('');
                    fetchStates(selectedCountry.value);
                  }}
                  onSelectState={selectedState => {
                    setState(selectedState.text);
                    setSelectedStateValue(selectedState.value);
                    setCity('');
                    fetchCities(selectedState.value);
                  }}
                  onSelectCity={selectedCity => {
                    setCity(selectedCity.text);
                  }}
                  countries={countries}
                  states={states}
                  cities={cities}
                  countriesLoading={countriesLoading}
                  statesLoading={statesLoading}
                  citiesLoading={citiesLoading}
                  selectedCountryValue={selectedCountryValue}
                  selectedStateValue={selectedStateValue}
                  isMutationLoading={isMutationLoading}
                  canAddNewPhone={areAllPhoneNumbersValid()}
                />
              )}
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPress}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    isMutationLoading && { opacity: 0.6 },
                  ]}
                  onPress={handleUpdatePress}
                  disabled={isMutationLoading}
                >
                  {isMutationLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.updateButtonText}>
                      {activeTab === 'General Info'
                        ? 'Update'
                        : activeTab === 'Change Password'
                        ? 'Update Password'
                        : activeTab === 'Contact Details'
                        ? 'Update'
                        : 'Update'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyExtractor={item => item.key}
        />
      </View>
      {/* Dropdown Modal */}
      <Modal
        isVisible={showDropdown}
        onBackdropPress={() => setShowDropdown(false)}
        backdropOpacity={0.18}
        style={{
          margin: 0,
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
        }}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => setShowDropdown(false)}
          >
            <SettingsIcon width={18} height={18} style={{ marginRight: 8 }} />
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
            <Text style={styles.dropdownText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Image Options Modal */}
      <Modal
        isVisible={showImageOptions}
        onBackdropPress={() => setShowImageOptions(false)}
        backdropOpacity={0.18}
        style={{
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.imageOptionsMenu}>
          <TouchableOpacity
            style={styles.imageOptionItem}
            onPress={openImagePicker}
          >
            <Text style={styles.imageOptionText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageOptionItem}
            onPress={removeProfileImage}
          >
            <Text style={styles.imageOptionText}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.imageOptionItem,
              { borderTopWidth: 1, borderTopColor: '#E0E0E0' },
            ]}
            onPress={() => setShowImageOptions(false)}
          >
            <Text style={[styles.imageOptionText, { color: '#007AFF' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        isVisible={showSuccessModal}
        onBackdropPress={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
        backdropOpacity={0.5}
        style={{
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            margin: 20,
            alignItems: 'center',
            minWidth: 280,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#28a745',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            Success!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#333',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {successMessage}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => {
              setShowSuccessModal(false);
              setSuccessMessage('');
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        isVisible={showErrorModal}
        onBackdropPress={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        backdropOpacity={0.5}
        style={{
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            margin: 20,
            alignItems: 'center',
            minWidth: 280,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#dc3545',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            Error
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#333',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {errorMessage}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#dc3545',
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={() => {
              setShowErrorModal(false);
              setErrorMessage('');
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 12 : 50,
    paddingBottom: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    paddingTop: 30,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },
  editIconContainer: {
    position: 'absolute',
    top: -6,
    right: -10,
    width: 32,
    height: 32,
    // borderRadius: 16,
    // backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 3,
    // borderColor: '#fff',
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  editIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  profileDetails: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    // shadowColor: '#000',
    // shadowOpacity: 0.06,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 3,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileItemSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  dropdownArrow: {
    marginLeft: 12,
  },
  dropdownArrowText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? 90 : 52,
    marginRight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  // Edit Mode Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#d3e8f8ff',
    // borderRadius: 25,
    // marginHorizontal: 24,
    marginBottom: 24,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    marginVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#eef2f5ff',
    color: '#021639',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#021639',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputLabelAddNewNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0088E7',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },

  textInput: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#B0B0B0',
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 16,
  },
  dropdownInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownInputText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  placeholderText: {
    color: '#999',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  phoneNumberContainer: {
    marginBottom: 20,
  },
  phoneInputWrapper: {
    position: 'relative',
  },
  phoneInput: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#B0B0B0',
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  phoneEditIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneEditIconText: {
    color: '#fff',
    fontSize: 12,
  },
  addNumberButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  addNumberText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  countryCodeContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 8,
  },
  defaultPhoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imageOptionsMenu: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  imageOptionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  imageOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  phoneInputWithDeleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputFlexContainer: {
    flex: 1,
  },
  phoneDeleteIconButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    // backgroundColor: '#FF3B30',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneDeleteIconText: {
    fontSize: 14,
    color: '#fff',
  },
  addNewNumberIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addNewNumberIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#007AFF',
    color: '#fff',
    borderRadius: 12,
    textAlign: 'center',
    // lineHeight: 24,
    fontSize: 16,
    // fontWeight: 'bold',
    marginLeft: 8,
  },
  addNewNumberLabel: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
export default ProfileScreen;
