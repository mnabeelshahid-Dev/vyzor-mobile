import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import ArrowDown from '../../assets/svgs/arrowDown.svg';
import { styles } from '../../screens/branches/tasks/style';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  showStatusDropdown: boolean;
  setShowStatusDropdown: (show: boolean) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  calendarDate: string;
  setCalendarDate: (date: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  filterStatus,
  setFilterStatus,
  showStatusDropdown,
  setShowStatusDropdown,
  filterDate,
  setFilterDate,
  showDatePicker,
  setShowDatePicker,
  calendarDate,
  setCalendarDate,
  onApply,
  onReset,
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
          <Text style={styles.modalTitle}>Filter Options</Text>
          <TouchableOpacity style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 0 }]}
          >
            <Text style={{ flex: 1, fontSize: 15, color: '#363942', marginLeft: 14 }}>
              {filterStatus ? filterStatus : 'Status'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14 }}>
              <ArrowDown width={18} height={18} style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
          {showStatusDropdown && (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 4, marginHorizontal: 14, elevation: 2, shadowColor: '#0002', borderWidth: 1, borderColor: '#00000033' }}>
              {['Active', 'Scheduled', 'Completed', 'Expired'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={{
                    padding: 12,
                    backgroundColor: filterStatus === status ? '#E6F1FB' : '#fff',
                    borderRadius: 6,
                    borderBottomWidth: 0.35,
                    borderBottomColor: '#00000033'
                  }}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={{ color: '#363942', fontSize: 16 }}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
            <TextInput
              placeholder="Selected Date"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={filterDate}
              onChangeText={setFilterDate}
              editable={false}
            />
            <View style={styles.inputIcon}>
              <CalendarIcon width={20} height={20} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.modalBtnRow}>
          <TouchableOpacity style={styles.modalBtnApply} onPress={onReset}>
            <Text style={styles.modalBtnApplyText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalBtnApply} onPress={onApply}>
            <Text style={styles.modalBtnApplyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default FilterModal;
