import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Modal from 'react-native-modal';

type Option = { value: string; text: string };

type PhoneItem = {
  id: number;
  phoneNumber: string;
  country: string;
  isDefault: boolean;
  ref: React.RefObject<PhoneInput>;
};

type Props = {
  styles: any;
  phoneNumbers: PhoneItem[];
  phoneErrors: string[];
  onAddNewPhone: () => void;
  onRemovePhone: (id: number) => void;
  onChangePhone: (id: number, text: string) => void;
  onChangePhoneCountry: (id: number, cca2: string) => void;
  street: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  onChangeStreet: (text: string) => void;
  onChangePostalCode: (text: string) => void;
  onSelectCountry: (item: Option) => void;
  onSelectState: (item: Option) => void;
  onSelectCity: (item: Option) => void;
  countries: Option[];
  states: Option[];
  cities: Option[];
  countriesLoading: boolean;
  statesLoading: boolean;
  citiesLoading: boolean;
  selectedCountryValue: string;
  selectedStateValue: string;
  isMutationLoading: boolean;
};

const DropdownFieldWithModal = ({
  styles,
  label,
  value,
  placeholder,
  data,
  loading,
  disabled,
  onSelect,
}: any) => {
  const [showModal, setShowModal] = useState(false);

  const renderModalItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E8E8',
      }}
      onPress={() => {
        onSelect(item);
        setShowModal(false);
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
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#B0B0B0',
          marginBottom: 10,
          paddingVertical: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
        onPress={() => !disabled && !loading && setShowModal(true)}
        disabled={disabled || loading}
      >
        <Text style={{
          fontSize: 16,
          color: value ? '#1A1A1A' : '#999',
        }}>
          {loading ? 'Loading...' : (value || placeholder)}
        </Text>
        <Text style={{ fontSize: 16, color: '#007AFF' }}>▼</Text>
      </TouchableOpacity>

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
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
              {label}
            </Text>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.value}
            renderItem={renderModalItem}
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
            onPress={() => setShowModal(false)}
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

const ContactDetailsTab: React.FC<Props> = ({
  styles,
  phoneNumbers,
  phoneErrors,
  onAddNewPhone,
  onRemovePhone,
  onChangePhone,
  onChangePhoneCountry,
  street,
  country,
  state,
  city,
  postalCode,
  onChangeStreet,
  onChangePostalCode,
  onSelectCountry,
  onSelectState,
  onSelectCity,
  countries,
  states,
  cities,
  countriesLoading,
  statesLoading,
  citiesLoading,
  selectedCountryValue,
  selectedStateValue,
  isMutationLoading,
}) => {
  useEffect(() => {
    console.log('country in component', country);
    console.log('city in component', city);
    console.log('state in component', state);
  }, []);

  return (
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
                onPress={() => onRemovePhone(phone.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          <PhoneInput
            ref={phone.ref}
            defaultValue={phone.phoneNumber}
            defaultCode={phone.country as any}
            layout="first"
            onChangeText={text => onChangePhone(phone.id, text)}
            onChangeFormattedText={text => onChangePhone(phone.id, text)}
            textInputStyle={{
              fontFamily: 'Poppins',
              fontSize: 16,
              color: '#1F2937',
              paddingVertical: 0,
              paddingHorizontal: 0,
            }}
            codeTextStyle={{
              fontFamily: 'Poppins',
              fontSize: 16,
              color: '#1F2937',
            }}
            onChangeCountry={country => {
              onChangePhoneCountry(phone.id, (country as any).cca2);
            }}
            withShadow={false}
            withDarkTheme={false}
            autoFocus={false}
            disabled={isMutationLoading}
          />

          {phoneErrors[index] ? (
            <Text style={styles.errorText}>{phoneErrors[index]}</Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity style={styles.addNumberButton} onPress={onAddNewPhone}>
        <Text style={styles.addNumberText}>+ Add New Number</Text>
      </TouchableOpacity>

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Street</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={street}
            placeholder="Enter street address"
            placeholderTextColor="#999"
            onChangeText={onChangeStreet}
          />
        </View>
      </View>

      <DropdownFieldWithModal
        styles={styles}
        label="Country"
        value={country}
        placeholder="Select country"
        data={countries}
        loading={countriesLoading}
        disabled={false}
        onSelect={onSelectCountry}
      />

      <DropdownFieldWithModal
        styles={styles}
        label="State/Province/Region"
        value={state}
        placeholder="Select state/province/region"
        data={states}
        loading={statesLoading}
        disabled={!selectedCountryValue}
        onSelect={onSelectState}
      />

      <DropdownFieldWithModal
        styles={styles}
        label="City"
        value={city}
        placeholder="Select city"
        data={cities}
        loading={citiesLoading}
        disabled={!selectedStateValue}
        onSelect={onSelectCity}
      />

      <View style={styles.phoneNumberContainer}>
        <Text style={styles.inputLabel}>Zip/Postal Code</Text>
        <View style={styles.phoneInputWrapper}>
          <TextInput
            style={styles.phoneInput}
            value={postalCode}
            placeholder="Enter zip/postal code"
            placeholderTextColor="#999"
            onChangeText={onChangePostalCode}
          />
        </View>
      </View>
    </View>
  );
};

export default ContactDetailsTab;