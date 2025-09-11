import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LocationIcon from '../../assets/svgs/locationIcon.svg';
import { styles } from '../../screens/branches/tasks/style';

interface SectionType {
  webId?: string | number;
  name?: string;
  location?: string;
}

interface SectionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  sections: SectionType[];
}

const SectionsModal: React.FC<SectionsModalProps> = ({
  isVisible,
  onClose,
  isLoading,
  isError,
  sections,
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
      <View style={styles.modalBox}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sections</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ marginTop: 12 }} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
          ) : isError ? (
            <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading sections</Text>
          ) : sections.length > 0 ? (
            sections.map((section, idx) => (
              <View key={section.webId || idx} style={{ backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#F1F1F6', padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, marginHorizontal: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', fontSize: 15, color: '#222E44', marginBottom: 2 }}>{section.name || 'Cleaning'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <LocationIcon width={16} height={16} style={{ opacity: 0.7 }} />
                    <Text style={{ color: '#676869', fontSize: 12, marginLeft: 8, fontWeight: '400' }}>
                      {section.location ? section.location : 'No Location Available'}
                    </Text>
                  </View>
                </View>
                <View style={{ marginLeft: 12 }}>
                  {section.location ? (
                    <View style={{ backgroundColor: '#E6FAEF', borderRadius: 50, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#11A330', fontSize: 14 }}>✓</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: '#FDEBEB', borderRadius: 50, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#E4190A', fontSize: 14 }}>✕</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No sections found</Text>
          )}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default SectionsModal;
