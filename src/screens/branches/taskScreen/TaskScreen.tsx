import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import FilterIcon from '../../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../../assets/svgs/searchIcon.svg';
import BackArrowIcon from '../../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../../assets/svgs/threeDotIcon.svg';
import CalendarIcon from '../../../assets/svgs/calendar.svg';
import SettingsIcon from '../../../assets/svgs/settingsIcon.svg';
import MenuIcon from '../../../assets/svgs/menuIcon.svg';
import NotesIcon from '../../../assets/svgs/notesIcon.svg';
import UserIcon from '../../../assets/svgs/user.svg';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

const tasks = [
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Active',
    progress: 75,
    devices: 0,
    sections: 2,
    notes: 0,
  },
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Expired',
    progress: 0,
    devices: 0,
    sections: 2,
    notes: 0,
  },
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Completed',
    progress: 100,
    devices: 0,
    sections: 2,
    notes: 0,
  },
];

const statusStyles = {
  Active: { color: '#007AFF', bg: '#E6F0FF' },
  Expired: { color: '#FF3B30', bg: '#FFE6E6' },
  Completed: { color: '#34C759', bg: '#E6FFE6' },
};

const statusOptions = ['Active', 'Expired', 'Completed'];
const sortOptions = ['Name', 'Date', 'Status'];
const assignedOptions = ['Me', 'User 1', 'User 2'];

const TasksScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSort, setFilterSort] = useState('');
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterAssigned, setFilterAssigned] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={26} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchBarFloatWrap}>
        <View style={styles.searchBarFloat}>
          <SearchIcon width={25} height={25} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your task..."
            placeholderTextColor="#8E8E93"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtnFloat}
          onPress={() => setShowSortModal(true)}
        >
          <FilterIcon width={32} height={32} />
        </TouchableOpacity>
      </View>
      {/* Tasks List */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 16,
          backgroundColor: '#F2F2F2',
          paddingTop: 50,
          paddingHorizontal: 20,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        {tasks.map((task, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskId}># {task.id}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyles[task.status].bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusStyles[task.status].color },
                  ]}
                >
                  {task.status}
                </Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <CalendarIcon width={20} height={20} />
              <Text style={styles.dateText}>{task.date}</Text>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: statusStyles[task.status].color,
                      width: `${task.progress}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{task.progress}%</Text>
            </View>
            {/* Actions */}
            <View style={styles.actionsRow}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with user icon */}
                  <UserIcon height={20} width={20} color={'#0088E7'} />
                  <Text style={styles.actionText}>Reassign</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with devices icon */}
                  <SettingsIcon height={20} width={20} />
                  <Text style={[styles.actionText, { color: '#A0A4A8' }]}>
                    Devices
                  </Text>
                  <View style={styles.badgeGray}>
                    <Text style={styles.badgeTextGray}>{task.devices}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with sections icon */}
                  <MenuIcon height={20} width={20} />
                  <Text style={styles.actionText}>Sections</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{task.sections}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with notes icon */}
                  <NotesIcon height={20} width={20} />
                  <Text style={[styles.actionText, { color: '#A0A4A8' }]}>
                    Notes
                  </Text>
                  <View style={styles.badgeGray}>
                    <Text style={styles.badgeTextGray}>{task.notes}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {/* Get Started Button */}
            <TouchableOpacity style={styles.startBtn}>
              <Text style={styles.startBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {/* Sort Modal */}
      <Modal
        isVisible={showSortModal}
        onBackdropPress={() => setShowSortModal(false)}
        onBackButtonPress={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter Options</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.filterModalCloseBtn}
              >
                <View style={styles.filterModalCloseCircle}>
                  <Text
                    style={{
                      fontSize: 22,
                      color: '#007AFF',
                      fontWeight: 'bold',
                    }}
                  >
                    ×
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.filterModalBody}>
              {/* Status */}
              <Text style={styles.filterLabel}>Status</Text>
              <Picker
                selectedValue={filterStatus}
                style={styles.filterPicker}
                onValueChange={itemValue => setFilterStatus(itemValue)}
              >
                <Picker.Item label="Select" value="" />
                {statusOptions.map(opt => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>
              {/* Date */}
              <Text style={styles.filterLabel}>Date</Text>
              <TouchableOpacity
                style={styles.filterDateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{filterDate.toLocaleDateString()}</Text>
                <CalendarIcon width={20} height={20} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={filterDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setFilterDate(selectedDate);
                  }}
                />
              )}
            </View>
            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.filterClearBtn}
                onPress={() => {
                  setFilterSort('');
                  setFilterStatus('');
                  setFilterDate(new Date());
                  setFilterAssigned('');
                }}
              >
                <Text style={styles.filterBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => {
                  // Apply filter logic here
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.filterBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    width: '100%',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 10,
    paddingBottom: 10,
    paddingHorizontal: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 15,
    // marginTop: 16, // changed from -48
    marginHorizontal: 24,
    zIndex: 2,
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 52,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#222',
    fontSize: 18,
  },
  filterBtnFloat: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 14,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  filterModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'center',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222B45',
  },
  filterModalCloseBtn: {
    marginLeft: 12,
  },
  filterModalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModalBody: {
    marginBottom: 18,
  },
  filterLabel: {
    fontSize: 16,
    color: '#222B45',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  filterPicker: {
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    marginBottom: 8,
  },
  filterDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    flex: 1,
  },
  filterClearBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterApplyBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  filterBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskId: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
    color: '#222B45',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  dateText: {
    color: '#8F9BB3',
    fontSize: 15,
    marginLeft: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E4E9F2',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#222B45',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sortModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  sortModalCloseBtn: {
    marginLeft: 12,
  },
  sortModalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortModalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortModalField: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
  sortModalOrderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortModalOrderBtn: {
    backgroundColor: '#F2F6FF',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionsRow: {
    // flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginVertical: 7,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginVertical: 12,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 4,
    marginLeft: 10,
  },
  badge: {
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  badgeText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  badgeGray: {
    backgroundColor: '#E4E9F2',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  badgeTextGray: {
    color: '#A0A4A8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default TasksScreen;
