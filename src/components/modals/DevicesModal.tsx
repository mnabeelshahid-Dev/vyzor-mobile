import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import SettingsIcon from '../../assets/svgs/settingsIcon.svg';
import { styles } from '../../screens/branches/tasks/style';

interface DeviceType {
  uuid?: string | number;
  name?: string;
  macAddress?: string;
  uuId?: string;
}

interface DevicesModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  devices: DeviceType[];
}

const DevicesModal: React.FC<DevicesModalProps> = ({
  isVisible,
  onClose,
  isLoading,
  isError,
  devices,
}) => (
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
    style={{ margin: 0 }}
    useNativeDriver={true}
    hideModalContentWhileAnimating={false}
    propagateSwipe={false}
    deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
    deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
    onBackdropPress={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalBox, { padding: 0, minHeight: 320 }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <Text style={{ fontWeight: '700', fontSize: 20, color: '#222E44' }}>Devices</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, color: '#0088E7' }}>✕</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
          {isLoading ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
          ) : isError ? (
            <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading devices</Text>
          ) : devices.length > 0 ? (
            <FlatList
              data={devices}
              keyExtractor={(item, idx) => (item.uuid ? String(item.uuid) : idx.toString())}
              renderItem={({ item }) => (
                <View key={item.uuid} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 17, color: '#222E44', marginBottom: 2 }}>{item.name || ''}</Text>
                    <Text style={{ color: '#0088E7', fontSize: 12, fontWeight: '400', marginBottom: 2 }}>{item.macAddress || ''}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#AAB3BB', fontSize: 12, fontWeight: '400' }}>uuid # {item.uuId ?? ''}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No devices found</Text>}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              style={{ flex: 1 }}
            />
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No devices found</Text>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

export default DevicesModal;
