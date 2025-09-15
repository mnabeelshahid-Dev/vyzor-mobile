import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { Picker } from '@react-native-picker/picker';

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

const DropdownFieldWithData = ({
  styles,
  label,
  value,
  placeholder,
  data,
  loading,
  disabled,
  onSelect,
}: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#B0B0B0',
        marginBottom: 10,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Picker
        selectedValue={value}
        style={{
          height: 55,
          color: '#1A1A1A',
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: 0,
        }}
        dropdownIconColor="#007AFF"
        enabled={!disabled && !loading}
        onValueChange={(itemValue, itemIndex) => {
          if (itemIndex > 0) {
            const selectedItem = data[itemIndex - 1];
            onSelect(selectedItem);
          }
        }}
      >
        <Picker.Item
          label={loading ? 'Loading...' : placeholder}
          value=""
          color="#999"
        />
        {data.map((item: Option) => (
          <Picker.Item key={item.value} label={item.text} value={item.text} />
        ))}
      </Picker>
    </View>
  </View>
);

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

      <DropdownFieldWithData
        styles={styles}
        label="Country"
        value={country}
        placeholder="Select country"
        data={countries}
        loading={countriesLoading}
        disabled={false}
        onSelect={onSelectCountry}
      />

      <DropdownFieldWithData
        styles={styles}
        label="State/Province/Region"
        value={state}
        placeholder="Select state/province/region"
        data={states}
        loading={statesLoading}
        disabled={!selectedCountryValue}
        onSelect={onSelectState}
      />

      <DropdownFieldWithData
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
