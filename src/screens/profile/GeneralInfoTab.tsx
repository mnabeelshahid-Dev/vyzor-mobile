import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);

  const renderModalItem = ({ item, onSelect, onClose }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
      }}
      onPress={() => {
        onSelect(item.text);
        onClose();
      }}
    >
      <Text style={{
        fontSize: 16,
        color: '#1A1A1A',
      }}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

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
        <TouchableOpacity
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#B0B0B0',
            marginBottom: 10,
            paddingVertical: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => setShowLanguageModal(true)}
        >
          <Text style={{
            fontSize: 16,
            color: language ? '#1A1A1A' : '#999',
          }}>
            {language || 'Select language'}
          </Text>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Time Zone</Text>
        <TouchableOpacity
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#B0B0B0',
            marginBottom: 10,
            paddingVertical: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => setShowTimezoneModal(true)}
        >
          <Text style={{
            fontSize: 16,
            color: timezone ? '#1A1A1A' : '#999',
          }}>
            {timezone || 'Select time zone'}
          </Text>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>▼</Text>
        </TouchableOpacity>
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

      {/* Language Modal */}
      <Modal
        isVisible={showLanguageModal}
        onBackdropPress={() => setShowLanguageModal(false)}
        backdropOpacity={0.5}
        style={{
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          margin: 20,
          maxHeight: '70%',
          width: '80%',
          overflow: 'hidden',
        }}>
          <View style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#E8E8E8',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1A1A1A',
              textAlign: 'center',
            }}>
              Select Language
            </Text>
          </View>
          <FlatList
            data={LANGUAGE_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => renderModalItem({
              item,
              onSelect: onSelectLanguage,
              onClose: () => setShowLanguageModal(false),
            })}
            showsVerticalScrollIndicator={true}
          />
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderTopWidth: 1,
              borderTopColor: '#E8E8E8',
              alignItems: 'center',
            }}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={{
              fontSize: 16,
              color: '#007AFF',
              fontWeight: '600',
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Timezone Modal */}
      <Modal
        isVisible={showTimezoneModal}
        onBackdropPress={() => setShowTimezoneModal(false)}
        backdropOpacity={0.5}
        style={{
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          margin: 20,
          maxHeight: '70%',
          width: '80%',
          overflow: 'hidden',
        }}>
          <View style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#E8E8E8',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1A1A1A',
              textAlign: 'center',
            }}>
              Select Time Zone
            </Text>
          </View>
          <FlatList
            data={TIMEZONE_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => renderModalItem({
              item,
              onSelect: onSelectTimezone,
              onClose: () => setShowTimezoneModal(false),
            })}
            showsVerticalScrollIndicator={true}
          />
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderTopWidth: 1,
              borderTopColor: '#E8E8E8',
              alignItems: 'center',
            }}
            onPress={() => setShowTimezoneModal(false)}
          >
            <Text style={{
              fontSize: 16,
              color: '#007AFF',
              fontWeight: '600',
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default GeneralInfoTab;