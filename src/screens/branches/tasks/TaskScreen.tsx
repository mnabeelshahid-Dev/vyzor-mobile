import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { useRoute } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { fetchDevices, fetchSections, fetchNotes, fetchUserSites, fetchTasks } from '../../../api/tasks';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { styles } from './style';
import Modal from 'react-native-modal';
import ArrowUpIcon from '../../../assets/svgs/arrowUpWard.svg';
import LocationIcon from '../../../assets/svgs/locationIcon.svg';
import ArrowDownWard from '../../../assets/svgs/arrowDownward.svg';
import ArrowDown from '../../../assets/svgs/arrowDown.svg';
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
import LogoutIcon from '../../../assets/svgs/logout.svg';
import Settings from '../../../assets/svgs/settings.svg';
import { useLogout } from '../../../hooks/useAuth';
import { STATUS_BG_COLORS, STATUS_COLORS } from './utils/taskUtils';
import { useAuthStore } from '../../../store/authStore';


export default function TaskScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  
  // State
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
  // Main filter state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  // API filter date range
  // Default startDate: 2 days before today, endDate: 1 day in future
  function formatDateWithOffset(date: Date, hour: number, min: number, sec: number, ms: number) {
    const pad = (n: number) => String(n).padStart(2, '0');
    date.setHours(hour, min, sec, ms);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    return `${yyyy}-${mm}-${dd}T${pad(hour)}:${pad(min)}:${pad(sec)}+05:00`;
  }
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() - 1);
  const defaultEnd = new Date(today);
  defaultEnd.setDate(today.getDate() + 1);
  const [startDate, setStartDate] = useState(formatDateWithOffset(defaultStart, 0, 0, 0, 0));
  const [endDate, setEndDate] = useState(formatDateWithOffset(defaultEnd, 23, 59, 59, 0));
  // Modal temporary state
  const [modalFilterStatus, setModalFilterStatus] = useState('');
  const [modalFilterDate, setModalFilterDate] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchUser, setSearchUser] = useState('');


  const route: any = useRoute();
  const branchId =
    route.params?.branchId ||
    route.params?.params?.branchId ||
    route.params?.params?.params?.branchId;
  // Devices Query
  const {
    data: devicesData,
    isLoading: isDevicesLoading,
    isError: isDevicesError,
    refetch: refetchDevices,
    isRefetching: isDevicesRefetching,
  } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    refetchInterval: 120000,
  });
  // Sections Query
  const {
    data: sectionsData,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
    refetch: refetchSections,
    isRefetching: isSectionsRefetching,
  } = useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
    refetchInterval: 120000,
  });

  // Notes Query
  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
    isRefetching: isNotesRefetching,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    refetchInterval: 120000,
  });
  // UserSites Query (for user modal)
  const {
    data: userSitesData,
    isLoading: isUserSitesLoading,
    isError: isUserSitesError,
    refetch: refetchUserSites,
    isRefetching: isUserSitesRefetching,
  } = useQuery({
    queryKey: ['userSites', branchId, searchUser],
    queryFn: () => fetchUserSites(branchId, searchUser),
    enabled: !!branchId,
    refetchInterval: 120000,
  });




  // Helper function for ISO date formatting
  const formatDateFull = (date: Date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };

  // Build params for API
  const buildParams = (pageParam = 1) => {
    // Always use startDate and endDate from state if set
    let apiStartDate = startDate;
    let apiEndDate = endDate;
    // If no filter date is set, fallback to today for both
    if (!apiStartDate || !apiEndDate) {
      const today = new Date();
      apiStartDate = formatDateFull(today);
      apiEndDate = formatDateFull(today);
    }
    return {
      startDate: apiStartDate,
      endDate: apiEndDate,
      siteIds: branchId ? [branchId] : [],
      userIds: [user?.id],
      scheduleStatus: filterStatus.toUpperCase(),
      search,
      sort: sortOrder,
      sortField: sortField,
      page: pageParam,
      size: 20,
    };
  };

  const fetchTasksInfinite = async ({ pageParam = 1 }) => {
    const params = buildParams(pageParam);
    const response = await fetchTasks(params);
    // Support both array and paginated object
    let content = [];
    if (Array.isArray(response?.data)) {
      content = response.data;
    }
    return {
      data: content,
      nextPage: pageParam + 1,
      hasMore: content.length === params.size,
    };
  };

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['tasks', branchId, search, sortOrder, sortField, filterStatus, filterDate],
    queryFn: fetchTasksInfinite,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    initialPageParam: 1,
    enabled: !!branchId,
  });

  console.log(isError);
  


  // Flatten all pages, no deduplication (show all items)
  const allTasks = infiniteData?.pages.flatMap((page) => page.data) ?? [];

  // Filtering logic
  let filteredTasks = allTasks;
  if (filterStatus) {
    filteredTasks = filteredTasks.filter((task) => {
      // Use scheduleType for filtering if present, fallback to siteStatus/status
      const s = (task.scheduleType || task.siteStatus || task.status || '').toLowerCase();
      return s === filterStatus.toLowerCase();
    });
  }
  if (filterDate) {
    filteredTasks = filteredTasks.filter((task) => {
      // Compare only date part
      const taskDate = task.startDate ? new Date(task.startDate).toLocaleDateString() : '';
      return taskDate === filterDate;
    });
  }

  // Sorting logic
  let sortedTasks = [...filteredTasks];
  // Custom order for scheduleType: ACTIVE, SCHEDULED, COMPLETED, EXPIRED
  const scheduleTypeOrder = ['ACTIVE', 'SCHEDULED', 'COMPLETED', 'EXPIRED'];
  sortedTasks.sort((a, b) => {
    const aType = (a.scheduleType || '').toUpperCase();
    const bType = (b.scheduleType || '').toUpperCase();
    const aIdx = scheduleTypeOrder.indexOf(aType);
    const bIdx = scheduleTypeOrder.indexOf(bType);
    // If both are valid scheduleTypes, sort by custom order
    if (aIdx !== -1 && bIdx !== -1) {
      return aIdx - bIdx;
    }
    // If only one is valid, put valid first
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    // Otherwise, fallback to name or number sort
    if (sortField === 'name') {
      if (!a.formName || !b.formName) return 0;
      if (sortOrder === 'asc') {
        return a.formName.localeCompare(b.formName);
      } else {
        return b.formName.localeCompare(a.formName);
      }
    } else if (sortField === 'number') {
      if (sortOrder === 'asc') {
        return (a.webId ?? 0) - (b.webId ?? 0);
      } else {
        return (b.webId ?? 0) - (a.webId ?? 0);
      }
    }
    return 0;
  });

  const handleEndReached = () => {
    console.log('FlatList onEndReached', { hasNextPage, isFetchingNextPage });
    if (hasNextPage && !isFetchingNextPage) {
      console.log('Calling fetchNextPage');
      fetchNextPage();
    }
  };

  // Auto-refetch every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [refetch]);

  // Helper to show loader overlay when refetching or loading
  const showLoader = isLoading || isFetchingNextPage || isRefetching;
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
    setUserModal(type === 'user');
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


  // Memoized Task Card for FlatList performance
  const TaskCard = React.memo(({ item }: any) => {
    // ...existing code from renderTask...
    const normalizeStatus = (status: string = '') => {
      const s = status.trim().toLowerCase();
      if (s === 'schedule' || s === 'scheduled' || s === 'schedule') return 'Scheduled';
      if (s === 'active') return 'Active';
      if (s === 'expired') return 'Expired';
      if (s === 'completed') return 'Completed';
      return status;
    };
    const normalizedStatus = normalizeStatus(item.scheduleType)
    const statusColor = STATUS_COLORS[normalizedStatus] || '#0088E7';
    const statusBg = STATUS_BG_COLORS[normalizedStatus] || '#E6F1FB';
    const statusText = item.normalizedStatus || item.scheduleType;

    function formatTaskDateRange(startDate: any, endDate: any) {
      if (!startDate && !endDate) return 'No date';
      const format = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
          ' ' +
          d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      };
      if (startDate && endDate) {
        if (startDate === endDate) return format(startDate);
        return `${format(startDate)} - ${format(endDate)}`;
      }
      return format(startDate || endDate);
    }

    return (
      <View key={item?.webId} style={[styles.taskCard, { borderRadius: 18, padding: 20, marginBottom: 22, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}>
        {/* Top Row: Number, Status Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ color: statusColor, fontWeight: '500', fontSize: 15 }}>#{item.webId}</Text>
          <View style={{ flex: 1 }} />
          <View style={{ backgroundColor: statusColor, borderRadius: 6, paddingHorizontal: 16 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '400' }}>{statusText}</Text>
          </View>
        </View>
        {/* Title */}
        <Text style={{ color: '#222E44', fontWeight: '600', fontSize: 17, marginBottom: 2 }}>{item.formName}</Text>
        {/* Date Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CalendarIcon width={15} height={15} style={{ opacity: 0.7 }} />
          <Text style={{ color: '#676869ff', fontSize: 10, marginLeft: 8, fontWeight: '400' }}>
            {formatTaskDateRange(item.startDate, item.endDate)}
          </Text>
        </View>
        {/* Progress Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1, height: 6, backgroundColor: statusBg, borderRadius: 6, overflow: 'hidden', marginRight: 8 }}>
            <View style={{ height: 6, width: `${item.percentage ? item.percentage : '0'}%`, backgroundColor: statusColor, borderRadius: 6 }} />
          </View>
          <Text style={{ color: '#222E44', fontWeight: '400', fontSize: 12 }}>{item.percentage ? `${item.percentage}%` : '0.00%'}</Text>
        </View>
        {/* Button Row */}
        <View style={{ backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0' }}>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, }}>
            {/* Reassign */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('user')}>
              <UserIcon width={14} height={14} color={'#1292E6'} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Reassign</Text>
            </TouchableOpacity>
            {/* Devices */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('devices')}>
              <SettingsIcon width={14} height={14} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Devices</Text>
              <View style={{ backgroundColor: '#D9D9D9', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#868696', fontWeight: '500', fontSize: 14 }}>{Array.isArray((devicesData?.data as any)?.content) ? (devicesData.data as any).content.length : 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, marginBottom: 16, marginTop: -28 }}>
            {/* Sections */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => openModal('sections')}>
              <MenuIcon width={14} height={14} />
              <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Sections</Text>
              <View style={{ backgroundColor: '#D0ECFF', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#1292E6', fontWeight: '600', fontSize: 12 }}>{Array.isArray((sectionsData?.data as any)?.content) ? (sectionsData.data as any).content.length : 0}</Text>
              </View>
            </TouchableOpacity>
            {/* Notes */}
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }} onPress={() => openModal('notes')}>
              <NotesIcon width={14} height={14} />
              <Text style={{ color: '#888', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Notes</Text>
              <View style={{ backgroundColor: '#D9D9D9', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                <Text style={{ color: '#868696', fontWeight: '500', fontSize: 14 }}>{Array.isArray((notesData?.data as any)?.list) ? (notesData.data as any).list.length : 0}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Get Started Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Section', { formDefinitionId: item?.formDefinitionId, status: item?.status })} style={{ backgroundColor: '#1292E6', borderRadius: 8, alignItems: 'center', paddingVertical: 8, marginTop: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  });

  // Use memoized TaskCard in FlatList
  const renderTask = React.useCallback(({ item }) => <TaskCard item={item} />, []);

  // Modals
  const FilterModal = (
    <Modal
      customBackdrop={null}
      panResponderThreshold={4}
      swipeThreshold={100}
      onModalShow={() => { }}
      onModalWillShow={() => { }}
      onModalHide={() => { }}
      onModalWillHide={() => { }}
      onModalDismiss={() => { }}
      onBackButtonPress={() => { }}
      onSwipeComplete={() => { }}
      swipeDirection={null}
      scrollHorizontal={false}
      statusBarTranslucent={false}
      supportedOrientations={['portrait', 'landscape']}
      scrollTo={() => { }}
      scrollOffset={0}
      scrollOffsetMax={0}
      isVisible={filterModal}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }} onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginVertical: 8 }} />
          <View style={{ marginTop: 16 }}>
            {/* Status Dropdown */}
            <TouchableOpacity
              onPress={() => setShowStatusDropdown((prev) => !prev)}
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, paddingVertical: 0, borderWidth: 1, borderColor: '#00000033', borderRadius: 8 }]}
            >
              <Text style={{ flex: 1, fontSize: 15, color: '#363942', marginLeft: 14 }}>
                {modalFilterStatus ? modalFilterStatus : 'Status'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14 }}>
                <ArrowDown width={18} height={18} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
            {/* Status Dropdown List */}
            {showStatusDropdown && (
              <View style={{ backgroundColor: '#fff', borderRadius: 8, marginVertical: 4, marginHorizontal: 3, elevation: 2, shadowColor: '#0002', borderWidth: 1, borderColor: '#00000033', top:-10, zIndex: 10 }}>
                {['Active', 'Scheduled', 'Completed', 'Expired'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      padding: 12,
                      backgroundColor: modalFilterStatus === status ? '#E6F1FB' : '#fff',
                      borderRadius: 6,
                      borderBottomWidth: 0.35,
                      borderBottomColor: '#00000033'
                    }}
                    onPress={() => {
                      setModalFilterStatus(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={{ color: '#363942', fontSize: 16 }}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Date Picker */}
            <TouchableOpacity style={[styles.inputRow, { borderWidth: 1, borderColor: '#00000033', borderRadius: 8, marginTop: 16 }]} onPress={() => setShowDatePicker(true)}>
              <TextInput
                placeholder="Selected Date"
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={modalFilterDate}
                onChangeText={setModalFilterDate}
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
              backdropTransitionInTiming={300}
              backdropTransitionOutTiming={300}
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
              customBackdrop={null}
              panResponderThreshold={4}
              swipeThreshold={100}
              onModalShow={() => { }}
              onModalWillShow={() => { }}
              onModalHide={() => { }}
              onModalWillHide={() => { }}
              onModalDismiss={() => { }}
              onBackButtonPress={() => { }}
              onSwipeComplete={() => { }}
              swipeDirection={null}
              scrollHorizontal={false}
              statusBarTranslucent={false}
              supportedOrientations={['portrait', 'landscape']}
              onBackdropPress={() => setShowDatePicker(false)}
              scrollTo={() => { }}
              scrollOffset={0}
              scrollOffsetMax={0}
            >
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', paddingBottom: 16 }}>
                  {/* Custom Header */}
                  <View style={{ backgroundColor: '#0088E7', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, alignItems: 'center' }}>
                    <Text style={{ color: '#ffff', fontSize: 16, fontWeight: '500' }}>
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
                      setModalFilterDate(new Date(calendarDate).toLocaleDateString());
                      setShowDatePicker(false);
                    }}>
                      <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%' }} />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalBtnApply}
              onPress={() => {
                setModalFilterStatus('');
                setModalFilterDate('');
                setFilterStatus('');
                setFilterDate('');
                closeModal();
                setUpdatedDate('');
                setStartDate('');
                setEndDate('');
                refetch();
              }}
            >
              <Text style={styles.modalBtnApplyText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnApply} onPress={() => {
              // Apply filter changes and trigger refetch
              setFilterStatus(modalFilterStatus);
              if (modalFilterDate) {
                const selected = new Date(modalFilterDate);
                if (!isNaN(selected.getTime())) {
                  setFilterDate(modalFilterDate);
                  setUpdatedDate(modalFilterDate);
                  setStartDate(formatDateWithOffset(new Date(selected), 0, 0, 0, 0));
                  setEndDate(formatDateWithOffset(new Date(selected), 23, 59, 59, 0));
                } else {
                  setFilterDate('');
                  setUpdatedDate('');
                  // Reset to default range
                  setStartDate(formatDateWithOffset(defaultStart, 0, 0, 0, 0));
                  setEndDate(formatDateWithOffset(defaultEnd, 23, 59, 59, 0));
                }
              } else {
                setFilterDate('');
                setUpdatedDate('');
                // Reset to default range
                setStartDate(formatDateWithOffset(defaultStart, 0, 0, 0, 0));
                setEndDate(formatDateWithOffset(defaultEnd, 23, 59, 59, 0));
              }
              closeModal();
              refetch();
            }}>
              <Text style={styles.modalBtnApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  const filteredUsers = Array.isArray(userSitesData) ? userSitesData : [];
  const UserModal = (
    <Modal
      customBackdrop={null}
      panResponderThreshold={4}
      swipeThreshold={100}
      onModalShow={() => { }}
      onModalWillShow={() => { }}
      onModalHide={() => { }}
      onModalWillHide={() => { }}
      onModalDismiss={() => { }}
      onBackButtonPress={() => { }}
      onSwipeComplete={() => { }}
      swipeDirection={null}
      scrollHorizontal={false}
      statusBarTranslucent={false}
      supportedOrientations={['portrait', 'landscape']}
      scrollTo={() => { }}
      scrollOffset={0}
      scrollOffsetMax={0}
      isVisible={userModal}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={{ borderRadius: 18, backgroundColor: '#fff', padding: 0, justifyContent: 'flex-start', width: '90%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 8, minHeight: '60%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6' }}>
            <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44' }}>Users</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, color: '#0088E7' }}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 0 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, paddingHorizontal: 12, height: 44 }}>
              <SearchIcon width={22} height={22} style={{ marginRight: 8, opacity: 0.6 }} />
              <TextInput
                placeholder="Search ..."
                style={{ flex: 1, fontSize: 16, color: '#363942', fontWeight: '500', padding: 0 }}
                value={searchUser}
                onChangeText={setSearchUser}
                onSubmitEditing={() => refetchUserSites()}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity onPress={() => refetchUserSites()} style={{ backgroundColor: '#0088E7', borderBottomRightRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center', shadowColor: '#0088E7', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 14, paddingHorizontal: 18, flex: 1, paddingVertical: 8 }}>
            {isUserSitesLoading ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
            ) : isUserSitesError ? (
              <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>{isUserSitesError}</Text>
            ) : filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
                renderItem={({ item }) => (
                  <View key={item.id} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                    <Text style={{ fontWeight: '500', fontSize: 16, color: '#222E44' }}>{item.name || item.username || item.storeEmail}</Text>
                    <Text style={{ color: '#0088E7', fontSize: 14 }}>
                      {item.email ? item.email : <Text style={{ color: '#0088E7' }}>email@example.com</Text>}
                    </Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No users found</Text>
                }
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No users found</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const SectionsModal = (
    <Modal
      customBackdrop={null}
      panResponderThreshold={4}
      swipeThreshold={100}
      onModalShow={() => { }}
      onModalWillShow={() => { }}
      onModalHide={() => { }}
      onModalWillHide={() => { }}
      onModalDismiss={() => { }}
      onBackButtonPress={() => { }}
      onSwipeComplete={() => { }}
      swipeDirection={null}
      scrollHorizontal={false}
      statusBarTranslucent={false}
      supportedOrientations={['portrait', 'landscape']}
      scrollTo={() => { }}
      scrollOffset={0}
      scrollOffsetMax={0}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sections</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ marginTop: 12 }} showsVerticalScrollIndicator={false}>
            {isSectionsLoading ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
            ) : isSectionsError ? (
              <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading sections</Text>
            ) : Array.isArray(sectionsData?.data?.content) && sectionsData.data.content.length > 0 ? (
              sectionsData.data.content.map((section, idx) => (
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

  const DevicesModal = (
    <Modal
      customBackdrop={null}
      panResponderThreshold={4}
      swipeThreshold={100}
      onModalShow={() => { }}
      onModalWillShow={() => { }}
      onModalHide={() => { }}
      onModalWillHide={() => { }}
      onModalDismiss={() => { }}
      onBackButtonPress={() => { }}
      onSwipeComplete={() => { }}
      swipeDirection={null}
      scrollHorizontal={false}
      statusBarTranslucent={false}
      supportedOrientations={['portrait', 'landscape']}
      scrollTo={() => { }}
      scrollOffset={0}
      scrollOffsetMax={0}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { padding: 0, minHeight: 320 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
            <Text style={{ fontWeight: '700', fontSize: 20, color: '#222E44' }}>Devices</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#0088E7' }}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
            {isDevicesLoading || isDevicesRefetching ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
            ) : isDevicesError ? (
              <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading devices</Text>
            ) : Array.isArray((devicesData?.data as any)?.content) && (devicesData.data as any).content.length > 0 ? (
              <FlatList
                data={(devicesData.data as any).content}
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

  const NotesModal = (
    <Modal
      customBackdrop={null}
      panResponderThreshold={4}
      swipeThreshold={100}
      onModalShow={() => { }}
      onModalWillShow={() => { }}
      onModalHide={() => { }}
      onModalWillHide={() => { }}
      onModalDismiss={() => { }}
      onBackButtonPress={() => { }}
      onSwipeComplete={() => { }}
      swipeDirection={null}
      scrollHorizontal={false}
      statusBarTranslucent={false}
      supportedOrientations={['portrait', 'landscape']}
      scrollTo={() => { }}
      scrollOffset={0}
      scrollOffsetMax={0}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { padding: 0, minHeight: 320 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
            <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44' }}>Notes</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#0088E7' }}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
            {isNotesLoading || isNotesRefetching ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
            ) : isNotesError ? (
              <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading notes</Text>
            ) : Array.isArray((notesData?.data as any)?.list) && (notesData.data as any).list.length > 0 ? (
              <FlatList
                data={(notesData.data as any).list}
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
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
      deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
      deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
      onBackdropPress={() => setShowDropdown(false)}
    >
      <View style={styles.dropdownMenu}>
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => {
            setShowDropdown(false);
            navigation.navigate('Profile');
          }}
        >
          <Settings width={18} height={18} style={{ marginRight: 8 }} />
          <Text style={styles.dropdownText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
          <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
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
        <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginVertical: 8 }} />
        <View style={styles.sortModalBody}>
          <Text style={styles.sortModalField}>Name</Text>
          <View style={styles.sortModalOrderBtns}>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('name', 'desc')}
            >
              <ArrowDownWard width={15} height={15} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('name', 'asc')}
            >
              <ArrowUpIcon width={15} height={15} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginTop: 10 }} />
        <View style={[styles.sortModalBody, { marginTop: 10 }]}>
          <Text style={styles.sortModalField}>Number</Text>
          <View style={styles.sortModalOrderBtns}>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('number', 'desc')}
            >
              <ArrowDownWard width={15} height={15} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('number', 'asc')}
            >
              <ArrowUpIcon width={15} height={15} />
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
              onChangeText={(text) => {
                setSearch(text);
                // Trigger refetch on search
                setTimeout(() => refetch(), 0);
              }}
              returnKeyType="search"
              onSubmitEditing={() => refetch()}
            />
          </View>
          <TouchableOpacity
            style={styles.filterBtnFloat}
            onPress={() => setShowSortModal(true)}
          >
            <SortIcon width={25} height={25} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtnFloat}
            onPress={() => setFilterModal(true)}
          >
            <FilterIcon width={25} height={25} />
          </TouchableOpacity>
        </View>
        {/* Task List */}
        <View style={{ flex: 1, backgroundColor: '#F2F2F2', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          {showLoader ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : isError ? (
            <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginTop: 40 }}>Error loading tasks</Text>
          ) : sortedTasks.length === 0 ? (
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
              onEndReached={() => {
                console.log('FlatList onEndReached event');
                handleEndReached();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={{ paddingVertical: 24 }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                ) : null
              }
              refreshing={isRefetching}
              onRefresh={refetch}
              // Fix momentum bug for onEndReached
              onMomentumScrollBegin={() => {
                console.log('FlatList onMomentumScrollBegin');
                // @ts-ignore
                if (typeof this !== 'undefined') {
                  this.onEndReachedCalledDuringMomentum = false;
                }
              }}
              // Remove onEndReachedCalledDuringMomentum prop
              extraData={isFetchingNextPage}
            />
          )}

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
