import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../../../api/tasks';
import { apiClient } from '../../../utils/apiHelpers';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';
import Modal from 'react-native-modal';
import ArrowUpIcon from '../../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../../assets/svgs/arrowDown.svg';
import FilterIcon from '../../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../../assets/svgs/searchIcon.svg';
import BackArrowIcon from '../../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../../assets/svgs/threeDotIcon.svg';
import CalendarIcon from '../../../assets/svgs/calendar.svg';
import SettingsIcon from '../../../assets/svgs/settingsIcon.svg';
import MenuIcon from '../../../assets/svgs/menuIcon.svg';
import NotesIcon from '../../../assets/svgs/notesIcon.svg';
import UserIcon from '../../../assets/svgs/user.svg';
import SortIcon from '../../../assets/svgs/sortIcon.svg';
import { useLogout } from '../../../hooks/useAuth';



const STATUS_COLORS: Record<string, string> = {
  Active: '#0088E7',
  Expired: '#E4190A',
  Completed: '#11A330',
  Scheduled: '#E09200',
};

const STATUS_BG_COLORS: Record<string, string> = {
  Active: '#E6F1FB',
  Expired: '#FDEBEB',
  Completed: '#E6FAEF',
  Scheduled: '#FFF7E7',
};


export default function TaskScreen({ navigation }) {
  // Add missing state for dropdown and date picker
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const route = useRoute<RouteProp<{ params: { branchId?: string } }, 'params'>>();
  const branchId = route.params?.branchId;

  // State
  const [filterModal, setFilterModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [sectionsModal, setSectionsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [devicesModal, setDevicesModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'number'>('name');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterUser, setFilterUser] = useState('');
  const [searchUser, setSearchUser] = useState('');
  interface UserType {
    id?: string | number;
    name?: string;
    username?: string;
    email?: string;
  }
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');

  // API params
  const [tasksParams, setTasksParams] = useState({
    startDate: '',
    endDate: '',
    siteIds: branchId ? [branchId] : [],
    userIds: [],
    scheduleStatus: '',
    search: '',
    sort: sortOrder,
    sortField: sortField,
    page: 0,
    size: 20,
  });

  useEffect(() => {
    setTasksParams((prev) => ({
      ...prev,
      siteIds: branchId ? [branchId] : [],
      search,
      sort: sortOrder,
      sortField,
      scheduleStatus: filterStatus,
      // Add other filter params as needed
    }));
  }, [branchId, search, sortOrder, sortField, filterStatus]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', tasksParams],
    queryFn: () => fetchTasks(tasksParams),
    enabled: !!branchId,
  });

  // Type assertion for API response
  type TasksApiResponse = { data?: { content?: any[] } };
  const typedData = data as TasksApiResponse;
  const tasks = typedData?.data?.content || [];
  // Sort tasks by status order: Active, Expired, Completed, Scheduled
  const statusOrder = ['Active', 'Expired', 'Completed', 'Scheduled'];
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIdx = statusOrder.indexOf(a.status);
    const bIdx = statusOrder.indexOf(b.status);
    return aIdx - bIdx;
  });

  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  // Keep original openModal for single modal logic
  const openModal = async (type: string) => {
    setFilterModal(type === 'filter');
    setUserModal(type === 'user');
    setSectionsModal(type === 'sections');
    setNotesModal(type === 'notes');
    setDevicesModal(type === 'devices');
    setShowDropdown(type === 'dropdown');
    setShowSortModal(type === 'sort');
    if (type === 'user') {
      setLoadingUsers(true);
      setUserError('');
      try {
        const response = await apiClient.get('/users');
        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data as UserType[]);
        } else {
          setUserError(response.message || 'Failed to fetch users');
        }
      } catch (err) {
        setUserError('Failed to fetch users');
      }
      setLoadingUsers(false);
    }
  };


  const handleSort = (field: 'name' | 'number', order: 'asc' | 'desc') => {
    setSortField(field);
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
    setShowSortModal(false);
  };

  const renderTask = ({ item }: any) => {
    // Card status color logic
    const statusColor = STATUS_COLORS[item.status] || '#0088E7';
    const statusBg = STATUS_BG_COLORS[item.status] || '#E6F1FB';
    const statusText = item.status;
    // Progress color same as statusColor
    return (
      <View style={[styles.taskCard, { borderRadius: 18, padding: 20, marginBottom: 22, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}> 
        {/* Top Row: Number, Status Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ color: statusColor, fontWeight: '500', fontSize: 15 }}>#{item.webId}</Text>
          <View style={{ flex: 1 }} />
          <View style={{ backgroundColor: statusColor, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{statusText}</Text>
          </View>
        </View>
        {/* Title */}
        <Text style={{ color: '#222E44', fontWeight: '600', fontSize: 17, marginBottom: 2 }}>{item.documentName}</Text>
        {/* Date Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CalendarIcon width={20} height={20} style={{ opacity: 0.7 }} />
          <Text style={{ color: '#AAB3BB', fontSize: 11, marginLeft: 8, fontWeight: '500' }}>{item.startDate} --- {item.endDate}</Text>
        </View>
        {/* Progress Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1, height: 6, backgroundColor: '#E6F1FB', borderRadius: 6, overflow: 'hidden', marginRight: 8 }}>
            <View style={{ height: 6, width: `${item.percentage}%`, backgroundColor: statusColor, borderRadius: 6 }} />
          </View>
          <Text style={{ color: '#222E44', fontWeight: '600', fontSize: 14 }}>{item.percentage}%</Text>
        </View>
        {/* Button Row */}
        <View style={{ backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0' }}>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, }}>
            {/* Reassign */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('user')}>
              <UserIcon width={20} height={20} color={'#1292E6'} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 15, marginLeft: 8 }}>Reassign</Text>
            </TouchableOpacity>
            {/* Devices */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('devices')}>
              <SettingsIcon width={20} height={20} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 15, marginLeft: 8 }}>Devices</Text>
              <View style={{ backgroundColor: '#F1F1F6', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>{item.devices ?? 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, marginTop: -28 }}>
            {/* Sections */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('sections')}>
              <MenuIcon width={20} height={20} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 15, marginLeft: 8 }}>Sections</Text>
              <View style={{ backgroundColor: '#E6F1FB', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#1292E6', fontWeight: 'bold', fontSize: 16 }}>{tasks.length ?? 0}</Text>
              </View>
            </TouchableOpacity>
            {/* Notes */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('notes')}>
              <NotesIcon width={22} height={22} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 17, marginLeft: 8 }}>Notes</Text>
              <View style={{ backgroundColor: '#F1F1F6', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>{item.notes ?? 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Get Started Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Section')} style={{ backgroundColor: '#1292E6', borderRadius: 8, alignItems: 'center', paddingVertical: 8, marginTop: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Modals
  const FilterModal = (
    <Modal
      isVisible={filterModal}
      backdropOpacity={0.18}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      coverScreen={true}
      style={{ margin: 0 }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }} onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 16 }}>
            {/* Status Dropdown */}
            <TouchableOpacity
              onPress={() => setShowStatusDropdown((prev) => !prev)}
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 0 }]}
            >
              <Text style={{ flex: 1, fontSize: 15, color: '#363942', marginLeft: 14 }}>
                {filterStatus ? filterStatus : 'Status'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14 }}>
                <ArrowDownWard width={18} height={18} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
            {/* Status Dropdown List */}
            {showStatusDropdown && (
              <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 4, marginHorizontal: 14, elevation: 2, shadowColor: '#0002', borderWidth: 1, borderColor: '#00000033' }}>
                {['Active', 'Completed', 'Expired'].map((status) => (
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
            {/* Date Picker */}
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
            {/* Date Picker Modal */}
            <Modal
              isVisible={showDatePicker}
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
              onBackdropPress={() => setShowDatePicker(false)}
              useNativeDriver={true}
              deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
              deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
              hideModalContentWhileAnimating={false}
              propagateSwipe={false}
            >
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', paddingBottom: 16 }}>
                  {/* Custom Header */}
                  <View style={{ backgroundColor: '#0088E7', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, alignItems: 'center' }}>
                    <Text style={{ color: '#ffff', fontSize: 16, fontWeight: '500'}}>
                      Select Date
                    </Text>
                  </View>
                  <Calendar
                    current={calendarDate}
                    onDayPress={day => setCalendarDate(day.dateString)}
                    markedDates={{
                      [calendarDate]: {
                        selected: true,
                        selectedColor: '#0088E7',
                      },
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#0088E7',
                      todayTextColor: '#0088E7',
                      arrowColor: '#0088E7',
                      monthTextColor: '#0088E7',
                      textSectionTitleColor: '#0088E7',
                      calendarBackground: '#fff',
                    }}
                    style={{ marginTop: 8, marginBottom: 8 }}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 24 }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setFilterDate(new Date(calendarDate).toLocaleDateString());
                      setShowDatePicker(false);
                    }}>
                      <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalBtnClear}
              onPress={() => {
                setFilterStatus('');
                setFilterDate('');
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

  const handleUserSearch = async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const response = await apiClient.get(`/users?search=${encodeURIComponent(searchUser)}`);
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data as UserType[]);
      } else {
        setUserError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setUserError('Failed to fetch users');
    }
    setLoadingUsers(false);
  };
  const filteredUsers = users.filter(
    (u) =>
      !searchUser ||
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );
  const UserModal = (
    <Modal
      isVisible={userModal}
      backdropOpacity={0.18}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      coverScreen={true}
      style={{ margin: 0 }}
      onBackdropPress={closeModal}
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { borderRadius: 18, padding: 0 }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F1F6' }}>
            <Text style={{ fontWeight: '700', fontSize: 22, color: '#222E44' }}>Users</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 22, color: '#AAB3BB' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 0 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FC', borderRadius: 12, paddingHorizontal: 14, height: 48 }}>
              <SearchIcon width={22} height={22} style={{ marginRight: 8, opacity: 0.6 }} />
              <TextInput
                placeholder="Search username"
                style={{ flex: 1, fontSize: 17, color: '#363942', fontWeight: '500' }}
                value={searchUser}
                onChangeText={setSearchUser}
                onSubmitEditing={handleUserSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={{ marginLeft: 12, backgroundColor: '#0088E7', borderRadius: 12, paddingHorizontal: 22, height: 48, justifyContent: 'center', alignItems: 'center' }} onPress={handleUserSearch}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 19 }}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 18, paddingHorizontal: 20, flex: 1 }}>
            {loadingUsers ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Loading...</Text>
            ) : userError ? (
              <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 24 }}>{userError}</Text>
            ) : filteredUsers.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>No users found</Text>
            ) : (
              filteredUsers.map((u, idx) => (
                <View key={u.id || idx} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ fontWeight: '700', fontSize: 18, color: '#222E44', marginBottom: 2 }}>{u.name || u.username || u.email}</Text>
                  <Text style={{ color: '#0088E7', fontSize: 16, textDecorationLine: 'underline' }}>{u.email}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const SectionsModal = (
    <Modal
      isVisible={sectionsModal}
      hasBackdrop={true}
      backdropColor="#000"
      backdropOpacity={0.18}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      coverScreen={true}
      style={{ margin: 0 }}
      onBackdropPress={closeModal}
      useNativeDriver={true}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sections</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {/* TODO: Replace with API sections if available */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const DevicesModal = (
    <Modal
      isVisible={devicesModal}
      hasBackdrop={true}
      backdropColor="#000"
      backdropOpacity={0.18}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      coverScreen={true}
      style={{ margin: 0 }}
      onBackdropPress={closeModal}
      useNativeDriver={true}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Devices</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {/* TODO: Replace with API devices if available */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const NotesModal = (
    <Modal
      isVisible={notesModal}
      hasBackdrop={true}
      backdropColor="#000"
      backdropOpacity={0.18}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={300}
      animationOutTiming={300}
      avoidKeyboard={true}
      coverScreen={true}
      style={{ margin: 0 }}
      onBackdropPress={closeModal}
      useNativeDriver={true}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {/* TODO: Replace with API notes if available */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const DropDownModal = (
    <Modal
      isVisible={showDropdown}
      hasBackdrop={true}
      backdropColor="#000"
      backdropOpacity={0.18}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
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
      onBackdropPress={() => setShowDropdown(false)}
      useNativeDriver={true}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
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
        <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
          <Text style={styles.dropdownText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )

  const SortModal = () => (
    // Redesigned Dropdown Sort Modal
    showSortModal ? (
      <View style={[styles.dropdownCard, { position: 'absolute', top: 170, right: 24, zIndex: 100 }]}> {/* Adjust top/right for placement */}
        <View style={styles.sortModalHeader}>
          <Text style={styles.sortModalTitle}>Sort By</Text>
          <TouchableOpacity
            onPress={() => setShowSortModal(false)}
            style={styles.sortModalCloseBtn}
          >
            <View style={styles.sortModalCloseCircle}>
              <Text style={{ fontSize: 18, color: '#007AFF', bottom: 2 }}>x</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.sortModalBody}>
          <Text style={styles.sortModalField}>Name</Text>
          <View style={styles.sortModalOrderBtns}>
            <TouchableOpacity
              style={styles.filterBtnFloat}
              onPress={() => setShowSortModal(true)}
            >
              <SortIcon width={32} height={32} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterBtnFloat}
              onPress={() => setFilterModal(true)}
            >
              <FilterIcon width={32} height={32} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.sortModalBody, { marginTop: 14 }]}>
          <Text style={styles.sortModalField}>Number</Text>
          <View style={styles.sortModalOrderBtns}>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('number', 'desc')}
            >
              <ArrowDownWard width={18} height={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('number', 'asc')}
            >
              <ArrowUpIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ) : null
  );

  return (
    <>
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
              <ThreeDotIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

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
            <SortIcon width={32} height={32} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtnFloat}
            onPress={() => setFilterModal(true)}
          >
            <FilterIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
        {/* Task List */}
        <View style={{ flex: 1, backgroundColor: '#F2F2F2', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          {isLoading ? (
            <Text style={{ color: '#007AFF', fontSize: 18, textAlign: 'center', marginTop: 40 }}>Loading tasks...</Text>
          ) : isError ? (
            <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginTop: 40 }}>Error loading tasks</Text>
          ) : tasks.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ fontSize: 20, color: '#888', marginBottom: 12 }}>No tasks Found</Text>
            </View>
          ) : (
            <FlatList
              data={sortedTasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={{ paddingVertical: 24, paddingTop: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
          {/* Modals */}
          {/* <Modal visible={filterModal} transparent animationType="slide" onRequestClose={closeModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Filter Modal</Text>
              <TouchableOpacity onPress={closeModal}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={userModal} transparent animationType="slide" onRequestClose={closeModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>User Modal</Text>
              <TouchableOpacity onPress={closeModal}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={sectionsModal} transparent animationType="slide" onRequestClose={closeModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Sections Modal</Text>
              <TouchableOpacity onPress={closeModal}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={devicesModal} transparent animationType="slide" onRequestClose={closeModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Devices Modal</Text>
              <TouchableOpacity onPress={closeModal}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={notesModal} transparent animationType="slide" onRequestClose={closeModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Notes Modal</Text>
              <TouchableOpacity onPress={closeModal}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal> */}
          {FilterModal}
          {UserModal}
          {SectionsModal}
          {DevicesModal}
          {NotesModal}
          {DropDownModal}
        </View>
        {showSortModal && (
          <SortModal />
        )}

      </SafeAreaView>
    </>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
    zIndex: 0,
  },
  dropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
    maxWidth: 340,
    alignSelf: 'flex-end',
  },
  activeSortBtn: {
    backgroundColor: '#E6F0FF',
    borderColor: '#007AFF',
    borderWidth: 2,
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
    marginLeft: 6,
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
    backgroundColor: '#2B292999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontWeight: '500',
    fontSize: 17,
    color: '#222E44',
    flex: 1,
  },
  closeBtn: {
    fontSize: 16,
    color: '#0088E7',
    marginLeft: 12,
    fontWeight: '600',
    right: 5,
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
    paddingVertical: 8,
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
    fontWeight: '500',
    fontSize: 15,
    top: 5,
  },
  modalBtnApplyText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
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
  rightCircleWrap: {
    marginLeft: 12,
  },
  rightCircle: {
    width: 35,
    height: 35,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  sortModalCloseBtn: {
    marginLeft: 12,
  },
  sortModalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: '#0088E71A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortModalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortModalField: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
  },
  sortModalOrderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortModalOrderBtn: {
    backgroundColor: '#F2F6FF',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});