import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
  title?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
  title = 'Select Date',
}) => {
  const markedDates = selectedDate
    ? {
        [selectedDate]: {
          selected: true,
          selectedColor: '#007AFF',
        },
      }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Calendar
            current={selectedDate || new Date().toISOString().split('T')[0]}
            minDate={minDate}
            maxDate={maxDate}
            onDayPress={(day) => {
              onDateSelect(day.dateString);
              onClose();
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#007AFF',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#007AFF',
              monthTextColor: '#2d4150',
              indicatorColor: '#007AFF',
              textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
});

export default CalendarModal;
