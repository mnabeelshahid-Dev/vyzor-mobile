import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import { useLogout } from '../../hooks/useAuth';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import LocationIcon from '../../assets/svgs/location.svg';
import PasswordIcon from '../../assets/svgs/password.svg';
import TimeZoneIcon from '../../assets/svgs/timezone.svg';
import LanguageIcon from '../../assets/svgs/language.svg';
import PhoneIcon from '../../assets/svgs/phone.svg';
import EditIcon from '../../assets/svgs/edit.svg';
import EyeSlash from '../../assets/svgs/eyeSlash.svg';

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

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  const handleEditPress = () => {
    setIsEditMode(true);
  };

  const handleUpdatePress = () => {
    setIsEditMode(false);
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
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholderTextColor="#999"
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
        value="Dan"
        placeholder="Enter first name"
      />
      <InputField
        label="Last Name"
        value="Smith"
        placeholder="Enter last name"
      />
      <InputField
        label="Email"
        value="dansmith.vyzor@gmail.com"
        placeholder="Enter email"
      />
      <InputField
        label="Language"
        value="French"
        placeholder="Select language"
      />
      <InputField
        label="Time Zone"
        value="UTC-12:00"
        placeholder="Select timezone"
      />

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
        value="••••••••••••••"
        placeholder="Enter current password"
        secureTextEntry={true}
        showPassword={showCurrentPassword}
        onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
      />
      <InputField
        label="New Password"
        value="••••••••••••••"
        placeholder="Enter new password"
        secureTextEntry={true}
        showPassword={showNewPassword}
        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
      />
      <InputField
        label="Confirm New Password"
        value="••••••••••••••"
        placeholder="Confirm new password"
        secureTextEntry={true}
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
    </View>
  );

  const renderContactDetails = () => (
    <View style={styles.tabContent}>
      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value="(223)-334-4444"
            placeholder="Enter phone number"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.phoneEditIcon}>
            <Text style={styles.phoneEditIconText}>✎</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.addNumberButton}>
        <Text style={styles.addNumberText}>Add New Number</Text>
      </TouchableOpacity>

      <View style={styles.countryCodeContainer}>
        <Text style={styles.inputLabel}>Country Code</Text>
        <TouchableOpacity style={styles.dropdownInput}>
          <Text style={styles.dropdownInputText}>+44 | 334-4444</Text>
          <Text style={styles.dropdownArrowText}>▾</Text>
        </TouchableOpacity>
      </View>

      <InputField
        label="State/Province/Region"
        value="Punjab"
        placeholder="Enter state/province/region"
      />
      <InputField
        label="Street"
        value="Valencia Town"
        placeholder="Enter street address"
      />
      <InputField
        label="Zip/Postal Code"
        value="0423"
        placeholder="Enter zip/postal code"
      />
    </View>
  );

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
              <Text style={styles.userName}>Dan Smith</Text>
              <Text style={styles.userRole}>Technical Lead</Text>
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
                <Text style={styles.updateButtonText}>Update</Text>
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
                navigation.navigate('Profile');
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handleEditPress}
              >
                {/* <Text style={styles.editIcon}>✎</Text> */}
                <EditIcon style={styles.editIcon} height={20} width={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>Dan Smith</Text>
            <Text style={styles.userRole}>Technical Lead</Text>
          </View>

          {/* Profile Details */}
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
              subtitle="dansmith.vyzor@gmail.com"
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
              subtitle="French"
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
              subtitle="UTC+2:00"
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
              subtitle="+92 | 334 444 4221"
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
              navigation.navigate('Profile');
            }}
          >
            <Text style={styles.dropdownText}>Profile</Text>
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
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
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
    fontSize: 22,
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
    width: 120,
    height: 120,
    borderRadius: 12,
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
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
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
    borderRadius: 16,
    padding: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileItemSubtitle: {
    fontSize: 14,
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
    marginTop: Platform.OS === 'ios' ? 90 : 82,
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
    fontWeight: '600',
    color: '#1A1A1A',
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
  phoneInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingRight: 50,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
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
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
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
});
export default ProfileScreen;
