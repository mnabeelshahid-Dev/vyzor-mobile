import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PhoneIcon from '../../../assets/svgs/receiverIcon.svg';
import PlusImage from '../../../assets/svgs/plusImage.svg';
import PhoneInput from 'react-native-phone-number-input';
import CheckIcon from '../../../assets/svgs/checkIcon.svg';

// import your PhoneInput, icons, styles as you already have

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

export default function MultiPhoneSection({ isLoading }) {
  // initial single field
  const initialId = createId();
  const [phoneFields, setPhoneFields] = useState([
    { id: initialId, number: '', country: 'US', error: '' },
  ]);

  // refs map: id -> React.createRef()
  const phoneRefs = useRef({});
  // ensure initial ref exists
  if (!phoneRefs.current[initialId]) phoneRefs.current[initialId] = React.createRef();

  // change handlers
  const handleMultiPhoneChange = (id, formatted) => {
    setPhoneFields(prev =>
      prev.map(f => (f.id === id ? { ...f, number: formatted, error: '' } : f))
    );
  };

  const handleMultiCountryChange = (id, country) => {
    const code = country?.cca2 || country?.countryCode || country?.code || country;
    setPhoneFields(prev => prev.map(f => (f.id === id ? { ...f, country: code } : f)));
  };

  // add new field only if last is valid
  const addPhoneField = () => {
    const last = phoneFields[phoneFields.length - 1];
    const lastRef = phoneRefs.current[last.id];
    const lastNumber = last.number || '';

    const lastValid =
      lastRef &&
      lastRef.current &&
      typeof lastRef.current.isValidNumber === 'function' &&
      lastRef.current.isValidNumber(lastNumber);

    if (!lastValid) {
      // set a friendly error on last field (optional)
      setPhoneFields(prev => prev.map(f => (f.id === last.id ? { ...f, error: 'Please enter a valid phone' } : f)));
      return;
    }

    const newId = createId();
    phoneRefs.current[newId] = React.createRef(); // create ref before adding
    setPhoneFields(prev => [...prev, { id: newId, number: '', country: 'US', error: '' }]);
  };

  const removePhoneField = (id) => {
    // always keep at least 1 field
    setPhoneFields(prev => (prev.length === 1 ? prev : prev.filter(f => f.id !== id)));
    // free ref
    delete phoneRefs.current[id];
  };

  // compute if "Add New" should show/enabled:
  const canAddNew = (() => {
    const last = phoneFields[phoneFields.length - 1];
    const ref = phoneRefs.current[last.id];
    return (
      last.number &&
      ref &&
      ref.current &&
      typeof ref.current.isValidNumber === 'function' &&
      ref.current.isValidNumber(last.number) &&
      !last.error
    );
  })();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PhoneIcon style={{ marginRight: 4 }} height={18} width={18} color={'#475467'} />
          <Text style={{ fontFamily: 'Poppins', fontSize: 15, color: '#475467' }}>Phone Number</Text>
        </View>
      </View>

      {phoneFields.map((field, idx) => (
        <View
          key={field.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderColor: field.error ? '#FF6B6B' : '#D0D5DD',
            minHeight: 40,
            paddingHorizontal: 8,
            marginTop: idx === 0 ? 0 : 12,
            marginBottom: field.error ? 0 : 20,
          }}
        >
          <PhoneInput
            ref={phoneRefs.current[field.id]}
            // controlled input
            value={field.number}
            defaultCode={field.country}
            layout="second"
            onChangeFormattedText={text => handleMultiPhoneChange(field.id, text)}
            onChangeCountry={country => handleMultiCountryChange(field.id, country)}
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

          {/* valid check */}
          {field.number &&
          phoneRefs.current[field.id] &&
          phoneRefs.current[field.id].current &&
          phoneRefs.current[field.id].current.isValidNumber(field.number) &&
          !field.error ? (
            <CheckIcon width={20} height={20} color="#22C55E" style={{ marginLeft: 8 }} />
          ) : null}

          {/* remove */}
          {phoneFields.length > 1 && (
            <TouchableOpacity onPress={() => removePhoneField(field.id)} style={{ marginLeft: 8, padding: 4 }}>
              <Text style={{ fontSize: 18, color: '#FF6B6B', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* errors below each field */}
      {phoneFields.map(f => (f.error ? <Text key={`err-${f.id}`} style={[ {      fontSize: 12,
      color: '#FF6B6B',
      fontFamily: 'Poppins',
      width: '100%',
      paddingTop: 4 }]}>{f.error}</Text> : null))}

      {/* Add button: only visible/enabled when last phone is valid */}
      {canAddNew && (
        <TouchableOpacity onPress={addPhoneField} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
          <Text style={{ color: '#0088E7', fontSize: 15, fontWeight: '600', marginRight: 4 }}>Add New</Text>
          <PlusImage width={18} height={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}


