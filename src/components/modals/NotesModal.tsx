import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import NotesIcon from '../../assets/svgs/notesIcon.svg';
import { styles } from '../../screens/branches/tasks/style';

interface NoteType {
  id?: string | number;
  text?: string;
  note?: string;
}

interface NotesModalProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  isError: boolean;
  notes: NoteType[];
}

const NotesModal: React.FC<NotesModalProps> = ({
  isVisible,
  onClose,
  isLoading,
  isError,
  notes,
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
          <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44' }}>Notes</Text>
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
            <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading notes</Text>
          ) : notes.length > 0 ? (
            <FlatList
              data={notes}
              keyExtractor={(item, idx) => (item.id ? String(item.id) : idx.toString())}
              renderItem={({ item }) => (
                <View key={item.id} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ color: '#222E44', fontSize: 16, fontWeight: '600' }}>{item.text || item.note || ''}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No notes found</Text>}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              style={{ flex: 1 }}
            />
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 32 }}>
              <Text style={{ color: '#888', fontSize: 18, fontWeight: '500', textAlign: 'center' }}>
                No notes found for this task.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

export default NotesModal;
