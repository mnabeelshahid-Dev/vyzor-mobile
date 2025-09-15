import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from './constants';

type Props = {
  styles: any;
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  timezone: string;
  useDefaultTimeZone: boolean;
  onChangeFirstName: (text: string) => void;
  onChangeLastName: (text: string) => void;
  onSelectLanguage: (text: string) => void;
  onSelectTimezone: (text: string) => void;
  onToggleDefaultTimezone: () => void;
};

const GeneralInfoTab: React.FC<Props> = ({
  styles,
  firstName,
  lastName,
  email,
  language,
  timezone,
  useDefaultTimeZone,
  onChangeFirstName,
  onChangeLastName,
  onSelectLanguage,
  onSelectTimezone,
  onToggleDefaultTimezone,
}) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>First Name</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={firstName}
            placeholder="Enter first name"
            placeholderTextColor="#999"
            onChangeText={onChangeFirstName}
          />
        </View>
      </View>

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={lastName}
            placeholder="Enter last name"
            placeholderTextColor="#999"
            onChangeText={onChangeLastName}
          />
        </View>
      </View>

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={[styles.phoneInput, { backgroundColor: '#f5f5f5', color: '#999' }]}
            value={email}
            placeholder="Enter email"
            placeholderTextColor="#999"
            editable={false}
          />
        </View>
      </View>

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
            onValueChange={itemValue => {
              if (itemValue) {
                onSelectLanguage(itemValue as string);
              }
            }}
          >
            <Picker.Item label="Select language" value="" color="#999" />
            {LANGUAGE_OPTIONS.map(option => (
              <Picker.Item key={option.value} label={option.text} value={option.text} />
            ))}
          </Picker>
        </View>
      </View>

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
            onValueChange={itemValue => {
              if (itemValue) {
                onSelectTimezone(itemValue as string);
              }
            }}
          >
            <Picker.Item label="Select time zone" value="" color="#999" />
            {TIMEZONE_OPTIONS.map(option => (
              <Picker.Item key={option.value} label={option.text} value={option.text} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={onToggleDefaultTimezone}
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
};

export default GeneralInfoTab;


