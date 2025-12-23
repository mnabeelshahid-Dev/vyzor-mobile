import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import WarningIcon from '../assets/svgs/warningFilled.svg';

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  tryAgain?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, onClose, message, tryAgain = false }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 28,
            width: '85%',
            maxWidth: 380,
            overflow: 'hidden', // VERY IMPORTANT (fixes rounded button bottom)
            alignItems: 'center',
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              backgroundColor: '#0088E71A',
              borderRadius: 999,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <Text style={{ color: '#1292E6', fontSize: 24, lineHeight: 28 }}>
              x
            </Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={{ padding: 32, paddingBottom: 20, alignItems: 'center' }}>
            <WarningIcon width={80} height={80} />

            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#F44336',
                marginVertical: 8,
              }}
            >
              Error!
            </Text>

            <Text
              style={{
                fontSize: 18,
                color: '#222B45',
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          </View>

          {/* Full-width bottom button */}
          {tryAgain && (
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#F44336',
                width: '100%',
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                Try again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
