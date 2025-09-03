import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  // Picker,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../../services/api';

import { useAuthStore } from '../../store/authStore';

import {
  useLogout,
  // useCurrentUser,
  // useNewCurrentUser,
} from '../../hooks/useAuth';
// import { profileApi } from '../../api/profile';
// import { useCurrentUserProfile } from '../../hooks/useAuth';

// Define the expected properties on profileData
interface ProfileData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  location: string;
  timezone: string;
  phone: string;
  language: string;
  updatedById: string;
  clientId: string;
  birthday: string;
  endDate: string;
  startDate: string;
  webId: string;
  addressModel: {
    city: string;
    street: string;
    state: string;
    postalCode: string;
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
import EyeSlash from '../../assets/svgs/eyeSlash.svg';
import axios from 'axios';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('General Info');
  const [useDefaultTimeZone, setUseDefaultTimeZone] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    location: '',
    timezone: '',
    phone: '',
    language: '',
    updatedById: '',
    webId: '',
    clientId: '',
    birthday: '',
    endDate: '',
    startDate: '',
    addressModel: {
      city: '',
      street: '',
      postalCode: '',
      state: '',
    },
    userPhoneModels: [{ phoneModel: { phoneNumber: '', webId: '' } }],
  });
  const [currentPasswordField, setCurrentPasswordField] = useState('');
  const [newPasswordField, setNewPasswordField] = useState('');
  const [confirmNewPasswordField, setConfirmNewPasswordField] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('');
  const [timezone, setTimezone] = useState('');

  const [street, setStreet] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [phoneNumbers, setPhoneNumbers] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await apiService.get<ProfileData>(
          '/api/security/userAccounts/currentUser/',
        );

        if (response.success && response.data) {
          const profileData = response.data;
          setProfileData(profileData);

          // Initialize form fields with fetched data
          setFirstName(profileData.firstName || '');
          setLastName(profileData.lastName || '');
          setEmail(profileData.email || '');
          setLanguage(profileData.language || '');
          setTimezone(profileData.timezone || '');

          // Initialize contact details states
          setStreet(profileData.addressModel?.street || '');
          setState(profileData.addressModel?.state || '');
          setPostalCode(profileData.addressModel?.postalCode || '');

          // Initialize phone numbers - first one as default, others as non-default
          const userPhones = profileData.userPhoneModels || [];
          if (userPhones.length > 0) {
            const initialPhones = userPhones.map((phoneObj, index) => ({
              id: Date.now() + index, // unique id for each phone
              phoneNumber: phoneObj.phoneModel?.phoneNumber || '',
              isDefault: index === 0, // first one is default
            }));
            setPhoneNumbers(initialPhones);
          } else {
            // If no phones exist, create one default phone
            setPhoneNumbers([
              {
                id: Date.now(),
                phoneNumber: '',
                isDefault: true,
              },
            ]);
          }

          console.log('Phone numbers', phoneNumbers);
          console.log('Current user response:', profileData);
        } else {
          console.error('Error fetching current user:', response.message);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
      isDefault: false,
    };
    setPhoneNumbers([...phoneNumbers, newPhone]);
  };

  const removePhoneNumber = id => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone.id !== id));
  };

  const updatePhoneNumber = (id, newPhoneNumber) => {
    setPhoneNumbers(
      phoneNumbers.map(phone =>
        phone.id === id ? { ...phone, phoneNumber: newPhoneNumber } : phone,
      ),
    );
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  const handleEditPress = () => {
    setIsEditMode(true);
  };

  const handleGeneralInfoUpdate = async () => {
    try {
      // Create payload from form state
      const updatePayload = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        language: language,
        timezone: timezone,
        birthday: profileData?.birthday,
        startDate: profileData?.startDate,
        clientId: profileData?.clientId,
        endDate: profileData?.endDate,
      };

      const response = await apiService.put<ProfileData>(
        `/api/security/userAccounts/${profileData.updatedById}`,
        updatePayload,
      );

      if (response.success && response.data) {
        console.log('Updated Payload', updatePayload);
        console.log('Update profile response:', response.data);
        // Optionally update the profileData state with the returned data
        setProfileData(response.data);
      } else {
        console.error('Error updating profile:', response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    console.log('General Info updated');
    setIsEditMode(false);
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

    try {
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

      const response = await apiService.put<ProfileData>(
        `/api/security/userAccounts/${profileData.updatedById}`,
        updatePayload,
      );

      if (response.success && response.data) {
        console.log('Password update payload:', updatePayload);
        console.log('Password update response:', response.data);

        // Clear password fields after successful update
        setCurrentPasswordField('');
        setNewPasswordField('');
        setConfirmNewPasswordField('');
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');
      } else {
        console.error('Error updating password:', response.message);
      }
    } catch (error) {
      console.error('Error updating password:', error);
    }
    setIsEditMode(false);
  };
  // const handleContactDetailsUpdate = () => {
  //   // Add your contact details update logic here
  //   console.log('Contact Details updated');
  //   setIsEditMode(false);
  // };

  const handleContactDetailsUpdate = async () => {
    try {
      // Create payload from form state
      const updatePayload = {
        addressModel: {
          street: street,
          postalCode: postalCode,
          state: state,
        },
      };

      const response = await apiService.post(
        `/api/security/contactDetails`,
        updatePayload,
      );

      if (response.success && response.data) {
        console.log('Updated Payload', updatePayload);
        console.log('Update contact details response:', response.data);
      } else {
        console.error('Error updating contact details:', response.message);
      }
    } catch (error) {
      console.error('Error updating contact details:', error);
    }
    console.log('Contact Details updated');
    setIsEditMode(false);
  };

  const handlePhoneDetailsUpdate = async () => {
    try {
      // Create dynamic payload from phoneNumbers state
      const updatePayload = phoneNumbers
        .filter(phone => phone.phoneNumber.trim() !== '') // Only include phones with numbers
        .map(phone => ({
          phoneNumber: phone.phoneNumber,
          type: 'CALL',
          webId: phone.webId,
          defaultPhone: phone.isDefault,
        }));

      const updateStaticPayload = [
        {
          phoneNumber: '+923089907111',
          type: 'CALL',
          webId: profileData?.webId,
          defaultPhone: false,
        },
        {
          phoneNumber: '+376643111',
          type: 'CALL',
          webId: profileData?.webId,
          defaultPhone: true,
        },
        {
          phoneNumber: '+923089905111',
          type: 'CALL',
          webId: profileData?.webId,
          defaultPhone: false,
        },
      ];
      console.log(updateStaticPayload);

      const response = await apiService.put(
        `/api/security/userAccounts/userAccount/${profileData.updatedById}/updatePhone`,
        updatePayload,
      );

      console.log('phone payload', updatePayload);
      console.log('phone response', response);
    } catch (error) {
      console.error('Error updating Phone details:', error);
    }
    console.log('Phone Details updated');
    setIsEditMode(false);
  };

  const handleUpdatePress = () => {
    if (activeTab === 'General Info') {
      handleGeneralInfoUpdate();
    } else if (activeTab === 'Change Password') {
      handleChangePasswordUpdate();
    } else if (activeTab === 'Contact Details') {
      handleContactDetailsUpdate();
      handlePhoneDetailsUpdate();
    }
  };

  const handleResetPress = () => {
    // Reset form logic would go here
    console.log('Reset pressed');
  };

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    showDropdown = false,
    onPress,
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {showDropdown && (
        <View style={styles.dropdownArrow}>
          <Text style={styles.dropdownArrowText}>▾</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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

  const InputField = ({
    label,
    value,
    placeholder,
    secureTextEntry = false,
    showPassword,
    onTogglePassword,
    onChangeText,
    errorMessage,
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          key={label} // Add this key prop
          style={styles.textInput}
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor="#999"
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          returnKeyType="next"
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeIcon} onPress={onTogglePassword}>
            <Text style={styles.eyeIconText}>
              {showPassword ? (
                '👁️‍🗨️'
              ) : (
                <EyeSlash style={styles.editIcon} height={20} width={20} />
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );

  const DropdownField = ({ label, value, placeholder }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownInput}>
        <Text
          style={[styles.dropdownInputText, !value && styles.placeholderText]}
        >
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrowText}>▾</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneralInfo = () => (
    <View style={styles.tabContent}>
      <InputField
        label="First Name"
        value={firstName}
        placeholder="Enter first name"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setFirstName}
      />
      <InputField
        label="Last Name"
        value={lastName}
        placeholder="Enter last name"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setLastName}
      />
      <InputField
        label="Email"
        value={email}
        placeholder="Enter email"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setEmail}
      />
      {/* Language as select */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Language</Text>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#B0B0B0',
            marginBottom: 10,
          }}
        >
          <Picker
            selectedValue={language}
            style={{
              height: 55,
              color: '#1A1A1A',
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0,
              padding: 0,
            }}
            dropdownIconColor="#007AFF"
            onValueChange={itemValue => setLanguage(itemValue)}
          >
            <Picker.Item label="Select language" value="" color="#999" />
            <Picker.Item label="English" value="English" />
            <Picker.Item label="French" value="French" />
            <Picker.Item label="Spanish" value="Spanish" />
          </Picker>
        </View>
      </View>
      {/* Time Zone as select */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Time Zone</Text>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#B0B0B0',
            marginBottom: 10,
          }}
        >
          <Picker
            selectedValue={timezone}
            style={{
              height: 55,
              color: '#1A1A1A',
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0,
              padding: 0,
            }}
            dropdownIconColor="#007AFF"
            onValueChange={itemValue => setTimezone(itemValue)}
          >
            <Picker.Item label="Select time zone" value="" color="#999" />
            <Picker.Item label="UTC" value="UTC" />
            <Picker.Item label="GMT+1 (Central European Time)" value="GMT+1" />
            <Picker.Item label="GMT+2 (Eastern European Time)" value="GMT+2" />
            <Picker.Item label="GMT+3 (Moscow Time)" value="GMT+3" />
            <Picker.Item label="GMT+5 (Pakistan Standard Time)" value="GMT+5" />
            <Picker.Item
              label="GMT+5:30 (India Standard Time)"
              value="GMT+5:30"
            />
            <Picker.Item label="GMT+8 (China Standard Time)" value="GMT+8" />
            <Picker.Item label="GMT+9 (Japan Standard Time)" value="GMT+9" />
            <Picker.Item
              label="GMT+10 (Australian Eastern Time)"
              value="GMT+10"
            />
            <Picker.Item
              label="GMT-5 (Eastern Time US & Canada)"
              value="GMT-5"
            />
            <Picker.Item
              label="GMT-6 (Central Time US & Canada)"
              value="GMT-6"
            />
            <Picker.Item
              label="GMT-7 (Mountain Time US & Canada)"
              value="GMT-7"
            />
            <Picker.Item
              label="GMT-8 (Pacific Time US & Canada)"
              value="GMT-8"
            />
          </Picker>
        </View>
      </View>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setUseDefaultTimeZone(!useDefaultTimeZone)}
      >
        <View
          style={[
            styles.checkbox,
            useDefaultTimeZone && styles.checkedCheckbox,
          ]}
        >
          {useDefaultTimeZone && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Use Default Time Zone</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChangePassword = () => (
    <View style={styles.tabContent}>
      <InputField
        label="Current Password"
        value={currentPasswordField}
        placeholder="Enter current password"
        secureTextEntry={true}
        showPassword={showCurrentPassword}
        onChangeText={text => {
          setCurrentPasswordField(text);
          if (currentPasswordError) {
            validateCurrentPassword(text);
          }
        }}
        onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
        errorMessage={currentPasswordError}
      />
      <InputField
        label="New Password"
        value={newPasswordField}
        placeholder="Enter new password"
        secureTextEntry={true}
        showPassword={showNewPassword}
        onChangeText={text => {
          setNewPasswordField(text);
          if (newPasswordError) {
            validateNewPassword(text);
          }
          if (confirmNewPasswordField) {
            validateConfirmPassword(confirmNewPasswordField, text);
          }
        }}
        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
        errorMessage={newPasswordError}
      />
      <InputField
        label="Confirm New Password"
        value={confirmNewPasswordField}
        placeholder="Confirm new password"
        secureTextEntry={true}
        showPassword={showConfirmPassword}
        onChangeText={text => {
          setConfirmNewPasswordField(text);
          if (confirmPasswordError) {
            validateConfirmPassword(text, newPasswordField);
          }
        }}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        errorMessage={confirmPasswordError}
      />
    </View>
  );

  const renderContactDetails = () => (
    <View style={styles.tabContent}>
      {phoneNumbers.map((phone, index) => (
        <View style={styles.phoneNumberContainer} key={phone.id}>
          <View style={styles.phoneHeaderRow}>
            <Text
              style={[
                styles.inputLabel,
                index === 0
                  ? styles.defaultPhoneLabel
                  : styles.inputLabelAddNewNumber,
              ]}
            >
              {index === 0
                ? 'Phone Number (Default)'
                : 'Additional Phone Number'}
            </Text>
            {index > 0 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removePhoneNumber(phone.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.phoneInputWrapper}>
            <TextInput
              style={styles.phoneInput}
              value={phone.phoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              onChangeText={text => updatePhoneNumber(phone.id, text)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addNumberButton}
        onPress={addNewPhoneNumber}
      >
        <Text style={styles.addNumberText}>+ Add New Number</Text>
      </TouchableOpacity>

      <InputField
        label="State/Province/Region"
        value={state}
        placeholder="Enter state/province/region"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setState}
      />
      <InputField
        label="Street"
        value={street}
        placeholder="Enter street address"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setStreet}
      />
      <InputField
        label="Zip/Postal Code"
        value={postalCode}
        placeholder="Enter zip/postal code"
        secureTextEntry={false}
        showPassword={false}
        onTogglePassword={() => {}}
        onChangeText={setPostalCode}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: '#007AFF', marginTop: 16, fontSize: 16 }}>
          Loading, please wait...
        </Text>
      </SafeAreaView>
    );
  }

  if (isEditMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
        <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setIsEditMode(false)}>
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Profile Header - Edit Mode */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                  }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.userName}>{profileData?.firstName}</Text>
              <Text style={styles.userRole}>
                {profileData?.role ? profileData.role : 'Role not assigned'}
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
            {activeTab === 'General Info' && renderGeneralInfo()}
            {activeTab === 'Change Password' && renderChangePassword()}
            {activeTab === 'Contact Details' && renderContactDetails()}
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPress}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdatePress}
              >
                <Text style={styles.updateButtonText}>
                  {activeTab === 'General Info'
                    ? 'Update'
                    : activeTab === 'Change Password'
                    ? 'Update Password'
                    : activeTab === 'Contact Details'
                    ? 'Update'
                    : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
              onPress={() => {
                setShowDropdown(false);
                setIsEditMode(false);
              }}
            >
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Normal View Mode
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
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
      <View style={styles.profileContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editIconContainer}>
                <EditIcon style={styles.editIcon} height={20} width={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{profileData?.firstName}</Text>
            <Text style={styles.userRole}>
              {profileData?.role ? profileData.role : 'Role not assigned'}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <ProfileItem
              icon={
                <View
                  style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}
                >
                  <View style={styles.iconWrapper}>
                    <LocationIcon height={20} width={20} color={'#0088E7'} />
                  </View>
                </View>
              }
              title="Email"
              subtitle={profileData.email}
            />
            <ProfileItem
              icon={
                <View
                  style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}
                >
                  <View style={styles.iconWrapper}>
                    <LanguageIcon height={20} width={20} color={'#0088E7'} />
                  </View>
                </View>
              }
              title="Language"
              subtitle={profileData?.language || 'Not Assigned'}
              showDropdown={true}
            />
            <ProfileItem
              icon={
                <View
                  style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}
                >
                  <View style={styles.iconWrapper}>
                    <TimeZoneIcon height={20} width={20} color={'#0088E7'} />
                  </View>
                </View>
              }
              title="Time Zone"
              subtitle={profileData?.timezone || 'Not Assigned'}
              showDropdown={true}
            />
            <ProfileItem
              icon={
                <View
                  style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}
                >
                  <View style={styles.iconWrapper}>
                    <PhoneIcon height={20} width={20} color={'#0088E7'} />
                  </View>
                </View>
              }
              title="Phone Number"
              // subtitle={phoneNumbers[0].phoneNumber || 'Not Assigned'}
              subtitle="Not Assigned"
            />
            <ProfileItem
              icon={
                <View
                  style={[styles.iconCircle, { backgroundColor: '#E8F4FD' }]}
                >
                  <View style={styles.iconWrapper}>
                    <PasswordIcon height={20} width={20} color={'#0088E7'} />
                  </View>
                </View>
              }
              title="Password"
              subtitle="••••••••••••••"
            />
          </View>
        </ScrollView>
      </View>
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
            onPress={() => {
              setShowDropdown(false);
              handleEditPress();
            }}
          >
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={styles.dropdownText}>Logout</Text>
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
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
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
    fontWeight: 'bold',
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
    marginBottom: 30,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
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
  // textInput: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   topBorderwidth: 0,
  //   padding: 16,
  //   fontSize: 14,
  //   color: '#1A1A1A',
  //   borderWidth: 1,
  //   borderColor: '#E8E8E8',
  //   shadowColor: '#000',
  //   shadowOpacity: 0.02,
  //   shadowRadius: 4,
  //   elevation: 1,
  // },
  textInput: {
    backgroundColor: 'transparent', // no background
    paddingVertical: 8,
    paddingHorizontal: 0, // remove side padding to align with underline
    fontSize: 14,
    color: '#1A1A1A',

    // Only bottom border (underline)
    borderBottomWidth: 1,
    borderBottomColor: '#B0B0B0', // light gray, adjust as needed

    // Remove unnecessary styles
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 4,
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
  // phoneInput: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   fontSize: 14,
  //   color: '#1A1A1A',
  //   borderWidth: 1,
  //   borderColor: '#E8E8E8',
  //   paddingRight: 50,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.02,
  //   shadowRadius: 4,
  //   elevation: 1,
  // },
  phoneInput: {
    backgroundColor: 'transparent', // no background
    paddingVertical: 8,
    paddingHorizontal: 0, // remove side padding to align with underline
    fontSize: 14,
    color: '#1A1A1A',

    // Only bottom border (underline)
    borderBottomWidth: 1,
    borderBottomColor: '#B0B0B0', // light gray, adjust as needed

    // Remove unnecessary styles
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
    marginBottom: 8,
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
});
export default ProfileScreen;
