import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import WarningIcon from '../assets/svgs/warningFilled.svg';

const ErrorModal = ({ visible, onClose, message }) => {
  console.log('ErrorModal mounted', visible, message);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', width: '85%', maxWidth: 380 }}>
           <WarningIcon width={80} height={80} />
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#F44336', marginBottom: 8 }}>Error!</Text>
          <Text style={{ fontSize: 18, color: '#222B45', textAlign: 'center', marginBottom: 18 }}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 18, right: 18, backgroundColor: '#0088E71A', borderRadius: 999, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#1292E6', fontSize: 24, lineHeight: 28, textAlign: 'center' }}>x</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
