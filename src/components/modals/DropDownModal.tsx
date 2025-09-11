import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/branches/tasks/style';

interface DropDownModalProps {
  isVisible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

const DropDownModal: React.FC<DropDownModalProps> = ({ isVisible, onClose, onProfile, onLogout }) => (
  <Modal
    isVisible={isVisible}
    hasBackdrop={true}
    backdropColor="#000"
    backdropOpacity={0.18}
    animationIn="fadeIn"
    animationOut="fadeOut"
    animationInTiming={300}
    animationOutTiming={300}
    avoidKeyboard={true}
    coverScreen={true}
    style={{
      margin: 0,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
    }}
    useNativeDriver={true}
    hideModalContentWhileAnimating={false}
    propagateSwipe={false}
    deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
    deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
    onBackdropPress={onClose}
  >
    <View style={styles.dropdownMenu}>
      <TouchableOpacity style={styles.dropdownItem} onPress={onProfile}>
        <Text style={styles.dropdownText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dropdownItem} onPress={onLogout}>
        <Text style={styles.dropdownText}>Logout</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

export default DropDownModal;
