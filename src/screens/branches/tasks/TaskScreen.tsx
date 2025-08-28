import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import RNModal from 'react-native-modal';

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

const { width } = Dimensions.get('window');

const STATUS_COLORS: Record<string, string> = {
  Active: '#1292E6',
  Expired: '#F44336',
  Completed: '#1BC768',
  Scheduled: '#FFB400',
};

const STATUS_BG_COLORS: Record<string, string> = {
  Active: '#E6F1FB',
  Expired: '#FDEBEB',
  Completed: '#E6FAEF',
  Scheduled: '#FFF7E7',
};

const mockTasks = [
  {
    id: '1',
    number: '# 403124',
    title: 'Manage Guest Check-In Process',
    status: 'Active',
    percentage: 75,
    start: '8 Apr, 12.00 AM',
    end: '10 Apr, 08.00 PM',
    sections: 2,
    devices: 0,
    notes: 0,
  },
  {
    id: '2',
    number: '# 403124',
    title: 'Manage Guest Check-In Process',
    status: 'Expired',
    percentage: 0,
    start: '8 Apr, 12.00 AM',
    end: '10 Apr, 08.00 PM',
    sections: 2,
    devices: 0,
    notes: 0,
  },
  {
    id: '3',
    number: '# 403124',
    title: 'Manage Guest Check-In Process',
    status: 'Completed',
    percentage: 100,
    start: '8 Apr, 12.00 AM',
    end: '10 Apr, 08.00 PM',
    sections: 2,
    devices: 0,
    notes: 0,
  },
  {
    id: '4',
    number: '# 403124',
    title: 'Manage Guest Check-In Process',
    status: 'Scheduled',
    percentage: 100,
    start: '8 Apr, 12.00 AM',
    end: '10 Apr, 08.00 PM',
    sections: 2,
    devices: 0,
    notes: 0,
  },
];

const mockUsers = [
  { name: 'Waqar khan', email: 'waqar@khan.com' },
  { name: 'Waqar khan', email: 'waqar@khan.com' },
  { name: 'Waqar khan', email: 'waqar@khan.com' },
];

const mockSections = [
  { name: 'Cleaning', location: 'No Location Available', completed: false },
  { name: 'Cleaning', location: 'Wapda town lahore', completed: true },
];

const mockNotes = [
  'Please clean the entire house thoroughly focus on floors, dusting, and kitchen.',
  'Please clean the entire house thoroughly focus on floors, dusting, and kitchen.',
  'Please clean the entire house thoroughly focus on floors, dusting, and kitchen.',
  'Please clean the entire house thoroughly focus on floors, dusting, and kitchen.',
];

const mockDevices = [
  { type: 'Sensor', uuid: 'd6-b9-f2-fb-cc-71', id: '34892' },
  { type: 'Sensor', uuid: 'd6-b9-f2-fb-cc-71', id: '34892' },
];

export default function TaskScreen({ navigation }) {
  const [filterModal, setFilterModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [sectionsModal, setSectionsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [devicesModal, setDevicesModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter Modal State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // User Modal State
  const [searchUser, setSearchUser] = useState('');

  const openModal = (type: string) => {
    setFilterModal(type === 'filter');
    setUserModal(type === 'user');
    setSectionsModal(type === 'sections');
    setNotesModal(type === 'notes');
    setDevicesModal(type === 'devices');
    setShowDropdown(type === 'dropdown');
  };

  const handleSort = order => {
    setSortOrder(order);
    setShowSortModal(false);
  };

  const closeModal = () => {
    setFilterModal(false);
    setUserModal(false);
    setSectionsModal(false);
    setNotesModal(false);
    setDevicesModal(false);
    setShowDropdown(false);
  };

  const renderTask = ({ item }: any) => {
    // Card status color logic
    const statusColor = STATUS_COLORS[item.status] || '#1292E6';
    const statusBg = STATUS_BG_COLORS[item.status] || '#E6F1FB';
    const statusText = item.status;
    return (
      <View style={[styles.taskCard, { borderRadius: 18, padding: 20, marginBottom: 22, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}>
        {/* Top Row: Number, Status Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: 16 }}>{item.number}</Text>
          <View style={{ flex: 1 }} />
          <View style={{ backgroundColor: statusColor, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{statusText}</Text>
          </View>
        </View>
        {/* Title */}
        <Text style={{ color: '#222E44', fontWeight: 'bold', fontSize: 18, marginBottom: 2 }}>{item.title}</Text>
        {/* Date Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CalendarIcon width={20} height={20} style={{ opacity: 0.7 }} />
          <Text style={{ color: '#AAB3BB', fontSize: 16, marginLeft: 8, fontWeight: '500' }}>{item.start} - {item.end}</Text>
        </View>
        {/* Progress Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1, height: 6, backgroundColor: '#E6F1FB', borderRadius: 6, overflow: 'hidden', marginRight: 8 }}>
            <View style={{ height: 6, width: `${item.percentage}%`, backgroundColor: statusColor, borderRadius: 6 }} />
          </View>
          <Text style={{ color: '#222E44', fontWeight: 'bold', fontSize: 16 }}>{item.percentage}%</Text>
        </View>
        {/* Button Row */}
        <View style={{ backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0' }}>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, }}>
            {/* Reassign */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('user')}>
              <UserIcon width={22} height={22} color={'#1292E6'} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 17, marginLeft: 8 }}>Reassign</Text>
            </TouchableOpacity>
            {/* Devices */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('devices')}>
              <SettingsIcon width={22} height={22} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 17, marginLeft: 8 }}>Devices</Text>
              <View style={{ backgroundColor: '#F1F1F6', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>{item.devices}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, marginTop: -28 }}>
            {/* Sections */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('sections')}>
              <MenuIcon width={22} height={22} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 17, marginLeft: 8 }}>Sections</Text>
              <View style={{ backgroundColor: '#E6F1FB', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: 16 }}>{item.sections}</Text>
              </View>
            </TouchableOpacity>
            {/* Notes */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('notes')}>
              <NotesIcon width={22} height={22} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 17, marginLeft: 8 }}>Notes</Text>
              <View style={{ backgroundColor: '#F1F1F6', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>{item.notes}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Get Started Button */}
        <TouchableOpacity onPress={()=> navigation.navigate('Section')} style={{ backgroundColor: '#1292E6', borderRadius: 8, alignItems: 'center', paddingVertical: 8, marginTop: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Modals
  const FilterModal = (
    <Modal visible={filterModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: 16 }}>
            <TextInput
              placeholder="Status"
              style={styles.input}
              value={filterStatus}
              onChangeText={setFilterStatus}
            />
            <View style={styles.inputRow}>
              <TextInput
                placeholder="9/5/2023"
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={filterDate}
                onChangeText={setFilterDate}
              />
              <View style={styles.inputIcon}>
                <CalendarIcon width={20} height={20} />
              </View>
            </View>
            <TextInput
              placeholder="Assigned To"
              style={styles.input}
              value={filterUser}
              onChangeText={setFilterUser}
            />
          </View>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalBtnClear}
              onPress={() => {
                setFilterStatus('');
                setFilterDate('');
                setFilterUser('');
              }}
            >
              <Text style={styles.modalBtnClearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnApply} onPress={closeModal}>
              <Text style={styles.modalBtnApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const UserModal = (
    <Modal visible={userModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Users</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Search username"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={searchUser}
              onChangeText={setSearchUser}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {mockUsers.map((u, i) => (
              <View key={i} style={styles.userCard}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const SectionsModal = (
    <Modal visible={sectionsModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sections</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {mockSections.map((section, idx) => (
              <View key={idx} style={styles.sectionCard}>
                <View>
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                  <Text style={styles.sectionLocation}>{section.location}</Text>
                </View>
                <View
                  style={[
                    styles.sectionStatus,
                    { backgroundColor: section.completed ? '#E6FAEF' : '#FDEBEB' },
                  ]}
                >
                  <Text style={{ color: section.completed ? '#1BC768' : '#F44336', fontWeight: 'bold', fontSize: 18 }}>
                    {section.completed ? '✓' : '✕'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const DevicesModal = (
    <Modal visible={devicesModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Devices</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {mockDevices.map((device, idx) => (
              <View key={idx} style={styles.deviceCard}>
                <View>
                  <Text style={styles.deviceType}>{device.type}</Text>
                  <Text style={styles.deviceUuid}>{device.uuid}</Text>
                </View>
                <Text style={styles.deviceId}>uuid # {device.id}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NotesModal = (
    <Modal visible={notesModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes</Text>
            <Pressable onPress={closeModal} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {mockNotes.map((note, idx) => (
              <View key={idx} style={styles.noteCard}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
          <TouchableOpacity onPress={() => openModal('dropdown')}>
            <ThreeDotIcon width={26} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal (fix: use react-native-modal) */}
      <RNModal
        isVisible={showDropdown}
        onBackdropPress={closeModal}
        backdropOpacity={0.18}
        style={{
          margin: 0,
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
        }}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setShowDropdown(false);
              navigation.navigate('Profile');
            }}
          >
            <Text style={styles.dropdownText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* Floating Search Bar */}
      <View style={styles.searchBarFloatWrap}>
        <View style={styles.searchBarFloat}>
          <SearchIcon width={25} height={25} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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
      {/* Task List */}
      <View style={{ flex: 1, backgroundColor: '#F2F2F2', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 50 }}>
        <FlatList
          data={mockTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
        {/* Modals */}
        {FilterModal}
        {UserModal}
        {SectionsModal}
        {DevicesModal}
        {NotesModal}
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,

  },
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 20,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 18,
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
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    elevation: 1,
    shadowColor: '#0002',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? 90 : 82,
    marginRight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  filterBtn: {
    backgroundColor: '#fff',
    marginLeft: 12,
    padding: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#0001',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#0003',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  taskNumber: {
    color: '#1292E6',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
  },
  taskTitle: {
    color: '#222E44',
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 7,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskDate: {
    color: '#AAB3BB',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 60,
  },
  progressBarBg: {
    backgroundColor: '#E6F1FB',
    borderRadius: 8,
    height: 6,
    marginTop: 10,
    marginBottom: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  progressText: { fontSize: 13, color: '#222', fontWeight: 'bold' },
  rowBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 6,
    justifyContent: 'space-between',
  },
  rowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  rowBtnText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
    color: '#1292E6',
  },
  badgeGray: {
    backgroundColor: '#F1F1F6',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeGrayText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 13,
  },
  badgeBlue: {
    backgroundColor: '#E6F1FB',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeBlueText: {
    color: '#1292E6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  getStartedBtn: {
    backgroundColor: '#1292E6',
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  getStartedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#fff',
    borderTopColor: '#E6F1FB',
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: '#2227',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: width * 0.88,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    maxHeight: '78%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 19,
    color: '#222E44',
    flex: 1,
  },
  closeBtn: {
    fontSize: 20,
    color: '#AAB3BB',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 9,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 22,
  },
  modalBtnClear: {
    flex: 1,
    backgroundColor: '#E6F1FB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnApply: {
    flex: 1,
    backgroundColor: '#1292E6',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnClearText: {
    color: '#1292E6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnApplyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: '#1292E6',
    borderRadius: 9,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F1F6',
  },
  userName: {
    color: '#1292E6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: '#1292E6',
    fontSize: 14,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F1F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#222E44',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionLocation: {
    color: '#AAB3BB',
    fontSize: 13,
    marginTop: 2,
  },
  sectionStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F1F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceType: {
    color: '#222E44',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceUuid: {
    color: '#1292E6',
    fontSize: 15,
    marginTop: 2,
  },
  deviceId: {
    color: '#AAB3BB',
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '500',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F1F6',
  },
  noteText: {
    color: '#222E44',
    fontSize: 16,
    fontWeight: '500',
  },
});