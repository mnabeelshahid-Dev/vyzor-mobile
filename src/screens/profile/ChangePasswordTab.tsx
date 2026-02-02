import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import EyeSlash from '../../assets/svgs/eyeSlash.svg';

type Props = {
  styles: any;
  currentPasswordField: string;
  newPasswordField: string;
  confirmNewPasswordField: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  currentPasswordError: string;
  newPasswordError: string;
  confirmPasswordError: string;
  onChangeCurrentPassword: (text: string) => void;
  onChangeNewPassword: (text: string) => void;
  onChangeConfirmPassword: (text: string) => void;
  onToggleShowCurrent: () => void;
  onToggleShowNew: () => void;
  onToggleShowConfirm: () => void;
};

const ChangePasswordTab: React.FC<Props> = ({
  styles,
  currentPasswordField,
  newPasswordField,
  confirmNewPasswordField,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  currentPasswordError,
  newPasswordError,
  confirmPasswordError,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeConfirmPassword,
  onToggleShowCurrent,
  onToggleShowNew,
  onToggleShowConfirm,
}) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Current Password</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={currentPasswordField}
            placeholder="Enter current password"
            secureTextEntry={!showCurrentPassword}
            placeholderTextColor="#999"
            onChangeText={onChangeCurrentPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={onToggleShowCurrent}>
            <Text style={[styles.eyeIconText,{top: Platform.OS === 'ios' ? -8 : 0}]}>
              {showCurrentPassword ? '👁️‍🗨️' : (
                <EyeSlash style={[styles.editIcon]} height={20} width={20} />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        {currentPasswordError ? (
          <Text style={styles.errorText}>{currentPasswordError}</Text>
        ) : null}
      </View>

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>New Password</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={newPasswordField}
            placeholder="Enter new password"
            secureTextEntry={!showNewPassword}
            placeholderTextColor="#999"
            onChangeText={onChangeNewPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={onToggleShowNew}>
            <Text style={[styles.eyeIconText,{top: Platform.OS === 'ios' ? -8 : 0}]}>
              {showNewPassword ? '👁️‍🗨️' : (
                <EyeSlash style={styles.editIcon} height={20} width={20} />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        {newPasswordError ? (
          <Text style={styles.errorText}>{newPasswordError}</Text>
        ) : null}
      </View>

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={confirmNewPasswordField}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#999"
            onChangeText={onChangeConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={onToggleShowConfirm}>
            <Text style={[styles.eyeIconText,{top: Platform.OS === 'ios' ? -8 : 0}]}>
              {showConfirmPassword ? '👁️‍🗨️' : (
                <EyeSlash style={styles.editIcon} height={20} width={20} />
              )}
            </Text>
          </TouchableOpacity>
        </View>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default ChangePasswordTab;


