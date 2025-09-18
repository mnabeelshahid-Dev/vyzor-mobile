import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';
import Modal from 'react-native-modal';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import ArrowDown from '../../assets/svgs/arrowDown.svg';
import { useAuthStore } from '../../store/authStore';
import { styles } from './styles';
const { width } = Dimensions.get('window');
import SortIcon from '../../assets/svgs/sortIcon.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { useLogout } from '../../hooks/useAuth';
const getResponsive = (val: number) => Math.round(val * (width / 390));

import { useQuery } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchStatisticsUserDetail } from '../../api/statistics';
import { fetchTasks } from '../../api/tasks';
// ActivityIndicator already imported above

function formatDate(dateStrOrObj: string | Date = "", showTime = false): string {
  if (!dateStrOrObj) return '';
  let dateObj: Date;
  if (typeof dateStrOrObj === 'string') {
    dateObj = new Date(dateStrOrObj);
    if (isNaN(dateObj.getTime())) return '';
  } else {
    dateObj = dateStrOrObj;
  }
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();

  if (!showTime) {
    return `${dd}-${mm}-${yyyy}`;
  }

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${dd}-${mm}-${yyyy}  ${hours}:${minutes} ${ampm}`;
}

export default function StatisticsScreen({ navigation }) {
  const branchId = useAuthStore((state) => state.branchId);
  // Memoized TaskCard for FlatList performance
  const TaskCard = React.memo(({ item }: { item: any }) => (
    <View
      style={[
        styles.taskCard,
        {
          borderLeftColor:
            item.status === 'Active'
              ? '#22C55E'
              : item.status === 'Expired'
                ? '#ebb748ff'
                : '#EF4444',
          borderLeftWidth: getResponsive(4),
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.formName || item.label}</Text>
        <View style={styles.taskDates}>
          <Text style={[styles.taskDate, { fontWeight: '400', color: '#021639' }]}><Text style={{ color: '#363942' }}>Starting:</Text> {formatDate(item.startDate)}</Text>
          <Text style={[styles.taskDate, { fontWeight: '400', color: '#021639' }]}><Text style={{ color: '#363942' }}>Ending:</Text> {formatDate(item.endDate)}</Text>
        </View>
      </View>
    </View>
  ));

  // Memoized renderItem and keyExtractor
  const renderTask = React.useCallback(({ item }) => <TaskCard item={item} />, []);
  const keyExtractor = React.useCallback((item, idx) => item.webId ? item.webId.toString() : idx.toString(), []);

  const user = useAuthStore((state) => state.user);
  console.log("👤 [STORE] Current User from Auth Store:", user);
  // Only keep one set of state for tasks logic
  const [search, setSearch] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);
  // Use string for filterDate (ISO date)
  const [filterDate, setFilterDate] = useState('');
  // Helper to sync filter modal date with main date pickers
  const applyFilterDateToRange = (date: string) => {
    if (date && !isNaN(new Date(date).getTime())) {
      setStatisticsParams(prev => ({
        ...prev,
        startDate: date,
        endDate: date,
      }));
    }
  };
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'number'>('name');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);

  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  // --- Statistics API logic for stats cards, progress bars, and date range ---
  const [statisticsParams, setStatisticsParams] = useState({
    startDate: '',
    endDate: '',
    status: '',
    userId: '',
    search: '',
    sort: '',
    page: 0,
    size: 10,
  });

  useEffect(() => {
    const today = new Date();
    function formatDateFull(date: Date) {
      return date.toISOString().split('.')[0] + 'Z';
    }

    let updatedStartDate = '';
    let updatedEndDate = '';

    if (filterDate) {
      updatedStartDate = formatDateFull(new Date(filterDate));
      updatedEndDate = formatDateFull(new Date(filterDate));
    } else {
      updatedEndDate = formatDateFull(today);
      const startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      updatedStartDate = formatDateFull(startDateObj);
    }

    if (user?.id) {
      setStatisticsParams((prev) => ({
        ...prev,
        search,
        sort: sortOrder,
        status: filterStatus,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
        userId: user.id,
      }));
    }
  }, [search, sortOrder, filterStatus, filterDate, user]);

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['statisticsUserDetail', statisticsParams],
    queryFn: () => fetchStatisticsUserDetail(statisticsParams),
    enabled: !!statisticsParams.userId,
  });

  const statsTyped = (statsData as { data?: { content?: any[] } })?.data?.content[0] as any || {};
  const stats = {
    onTime: statsTyped.onTime,
    outside: statsTyped.outsidePeriod,
    expired: statsTyped.expire,
    totalOnTime: statsTyped.previousOnTime,
    totalOutside: statsTyped.previousOutsidePeriod,
    totalExpired: statsTyped.previousExpire,
  };
  const progress = {
    onTime: parseFloat(statsTyped.onTimePercentage),
    outside: parseFloat(statsTyped.outsidePeriodPercentage),
    expired: parseFloat(statsTyped.expirePercentage),
  };

  // Build params for API
  const buildParams = (pageParam = 1) => {
    return { 
  startDate: filterDate,
  endDate: filterDate,
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
    console.log("Fetching tasks with params:", params);
    
    const response = await fetchTasks(params);
    let content: any[] = [];
    if (Array.isArray(response?.data)) {
      content = response.data as any[];
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data?.content)) {
      content = (response as any).data.content;
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

  // Flatten all pages
  const allTasks: any[] = infiniteData?.pages?.flatMap((page: any) => page.data) ?? [];

  // Filtering logic
  let filteredTasks = allTasks;
  if (filterStatus) {
    filteredTasks = filteredTasks.filter((task) => {
      // Use scheduleType for filtering if present, fallback to siteStatus/status
      const s = (task.scheduleType || task.siteStatus || task.status || '').toString().toLowerCase();
      return s === filterStatus.toLowerCase();
    });
  }
  if (filterDate) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskDate = task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '';
      return taskDate === filterDate;
    });
  }

  // Sorting logic
  let sortedTasks = [...filteredTasks];
  if (sortField === 'name') {
    sortedTasks.sort((a, b) => {
      if (!a.documentName || !b.documentName) return 0;
      if (sortOrder === 'asc') {
        return a.documentName.localeCompare(b.documentName);
      } else {
        return b.documentName.localeCompare(a.documentName);
      }
    });
  } else if (sortField === 'number') {
    sortedTasks.sort((a, b) => {
      if (sortOrder === 'asc') {
        return (a.webId ?? 0) - (b.webId ?? 0);
      } else {
        return (b.webId ?? 0) - (a.webId ?? 0);
      }
    });
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Auto-refetch every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);
  // --- End TaskScreen logic for fetchTasks ---

  // Responsive styling helpers
  const statCardWidth = (width - getResponsive(16) * 2 - getResponsive(12) * 2) / 3;

  // Filter modal logic can be added here, similar to TaskScreen

  const handleSort = (field: 'name' | 'number', order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setShowSortModal(false);
  };


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

  console.log(filterModal, " filterStatus, filterDate");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={getResponsive(17)} height={getResponsive(17)} onPress={() => navigation.goBack()} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={getResponsive(20)} height={getResponsive(20)} onPress={() => setShowDropdown(true)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchBarFloatWrap}>
        <View style={styles.searchBarFloat}>
          <SearchIcon width={getResponsive(25)} height={getResponsive(25)} style={{ marginLeft: 8 }} />
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
          <SortIcon width={25} height={25} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterBtnFloat}
          onPress={() => setFilterModal(true)}
        >
          <FilterIcon width={getResponsive(25)} height={getResponsive(25)} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        isVisible={filterModal}
        hasBackdrop={true}
        backdropColor="#000"
        backdropOpacity={0.18}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        avoidKeyboard={true}
        coverScreen={true}
        style={{ margin: 0 }}
        useNativeDriver={true}
        hideModalContentWhileAnimating={false}
        propagateSwipe={false}
        deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
        deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
        onBackdropPress={() => setFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }} onPress={() => setFilterModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
                  <ArrowDown width={18} height={18} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
              {/* Status Dropdown List */}
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
              {/* Date Picker */}
              <TouchableOpacity style={styles.inputRow} onPress={() => setShowFilterDatePicker(true)}>
                <TextInput
                  placeholder="Selected Date"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={filterDate}
                  editable={false}
                />
                <View style={styles.inputIcon}>
                  <CalendarIcon width={20} height={20} />
                </View>
              </TouchableOpacity>
              {/* Date Picker Modal */}
              <Modal
                isVisible={showFilterDatePicker}
                hasBackdrop={true}
                backdropColor="#000"
                backdropOpacity={0.18}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationInTiming={300}
                animationOutTiming={300}
                backdropTransitionInTiming={300}
                backdropTransitionOutTiming={300}
                avoidKeyboard={true}
                coverScreen={true}
                style={{ margin: 0 }}
                onBackdropPress={() => setShowFilterDatePicker(false)}
                useNativeDriver={true}
                hideModalContentWhileAnimating={false}
                propagateSwipe={false}
                deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
                deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
              >
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', paddingBottom: 16 }}>
                    {/* Custom Header */}
                    <View style={{ backgroundColor: '#0088E7', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, alignItems: 'center' }}>
                      <Text style={{ color: '#ffff', fontSize: 16, fontWeight: '500' }}>
                        Select Date
                      </Text>
                    </View>
                    <DatePicker
                      date={filterDate ? new Date(filterDate) : new Date()}
                      mode="date"
                      maximumDate={new Date()}
                      onDateChange={date => setFilterDate(date.toISOString().split('T')[0])}
                      androidVariant="nativeAndroid"
                      style={{ alignSelf: 'center', marginVertical: 16 }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 24, width: '100%' }}>
                      <TouchableOpacity onPress={() => setShowFilterDatePicker(false)}>
                        <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        setShowFilterDatePicker(false);
                        applyFilterDateToRange(filterDate);
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
                  setFilterModal(false);
                  
                }}
              >
                <Text style={styles.modalBtnClearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnApply} onPress={() => {
                // Apply both status and date filters
                setStatisticsParams(prev => ({
                  ...prev,
                  status: filterStatus,
                  startDate: filterDate ? filterDate : prev.startDate,
                  endDate: filterDate ? filterDate : prev.endDate,
                }));
                setFilterModal(false);
                refetch();
              }}>
                <Text style={styles.modalBtnApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: getResponsive(30),
          borderTopRightRadius: getResponsive(30),
          paddingTop: getResponsive(44),
        }}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {/* On Time = Completed Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#22C55E', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>Completed Tasks</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{stats.onTime ?? 0}</Text> of {stats.totalOnTime ?? 0}</Text>
          </View>
          {/* Outside = Scheduled Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#ebb748ff', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>Scheduled Tasks</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{stats.outside ?? 0}</Text> of {stats.totalOutside ?? 0}</Text>
          </View>
          {/* Expired = Expired Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#EF4444', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>Expired Tasks</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{stats.expired ?? 0}</Text> of {stats.totalExpired ?? 0}</Text>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressBox}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>On Time</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: '#22C55E', width: `${isNaN(Math.abs(Number(progress.onTime))) ? 0 : Math.abs(Number(progress.onTime))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {isNaN(Math.abs(Number(progress.onTime))) ? 0 : Math.abs(Number(progress.onTime))}%
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Outside</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: '#ebb748ff', width: `${isNaN(Math.abs(Number(progress.outside))) ? 0 : Math.abs(Number(progress.outside))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {isNaN(Math.abs(Number(progress.outside))) ? 0 : Math.abs(Number(progress.outside))}%
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Expired</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: '#EF4444', width: `${isNaN(Math.abs(Number(progress.expired))) ? 0 : Math.abs(Number(progress.expired))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {isNaN(Math.abs(Number(progress.expired))) ? 0 : Math.abs(Number(progress.expired))}%
            </Text>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeBox}>
          <CalendarIcon width={getResponsive(20)} height={getResponsive(20)} />
          {/* Start Date Picker */}
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            disabled={false}
            style={{}}
          >
            <Text style={styles.dateRangeText}>
              {statisticsParams.startDate ? formatDate(statisticsParams.startDate, false) : ''}
            </Text>
          </TouchableOpacity>
          <Modal
            isVisible={showStartDatePicker}
            hasBackdrop={true}
            backdropColor="#000"
            backdropOpacity={0.18}
            animationIn="fadeIn"
            animationOut="fadeOut"
            animationInTiming={300}
            animationOutTiming={300}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={300}
            avoidKeyboard={true}
            coverScreen={true}
            style={{ margin: 0 }}
            useNativeDriver={true}
            hideModalContentWhileAnimating={false}
            propagateSwipe={false}
            deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
            deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
          >
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', paddingBottom: 16, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#0088E7', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: '#ffff', fontSize: 16, fontWeight: '500' }}>
                    Select Start Date
                  </Text>
                </View>
                <DatePicker
                  date={statisticsParams.startDate ? new Date(statisticsParams.startDate) : new Date()}
                  mode="date"
                  maximumDate={new Date()}
                  onDateChange={date => {
                    setStatisticsParams(prev => ({
                      ...prev,
                      startDate: date.toISOString().split('T')[0]
                    }));
                  }}
                  androidVariant="nativeAndroid"
                  style={{ alignSelf: 'center', marginVertical: 16 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 24, width: '100%' }}>
                  <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                    <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                    <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Text style={styles.dateRangeText}> -- </Text>
          {/* End Date Picker */}
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(true)}
            disabled={false}
            style={{}}
          >
            <Text style={styles.dateRangeText}>
              {statisticsParams.endDate ? formatDate(statisticsParams.endDate, false) : ''}
            </Text>
          </TouchableOpacity>
          <Modal
            isVisible={showEndDatePicker}
            hasBackdrop={true}
            backdropColor="#000"
            backdropOpacity={0.18}
            animationIn="fadeIn"
            animationOut="fadeOut"
            animationInTiming={300}
            animationOutTiming={300}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={300}
            avoidKeyboard={true}
            coverScreen={true}
            style={{ margin: 0 }}
            useNativeDriver={true}
            hideModalContentWhileAnimating={false}
            propagateSwipe={false}
            deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
            deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
          >
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', paddingBottom: 16, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#0088E7', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: '#ffff', fontSize: 16, fontWeight: '500' }}>
                    Select End Date
                  </Text>
                </View>
                <DatePicker
                  date={statisticsParams.endDate ? new Date(statisticsParams.endDate) : new Date()}
                  mode="date"
                  maximumDate={new Date()}
                  onDateChange={date => {
                    setStatisticsParams(prev => ({
                      ...prev,
                      endDate: date.toISOString().split('T')[0]
                    }));
                  }}
                  androidVariant="nativeAndroid"
                  style={{ alignSelf: 'center', marginVertical: 16 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 24, width: '100%' }}>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={{ color: '#0088E7', fontSize: 14, fontWeight: '500' }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* Task List with empty state */}
        {sortedTasks.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
            <Text style={{ color: '#888', fontSize: 18, fontWeight: '500' }}>No tasks Found</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={sortedTasks}
              style={{ flex: 1, marginTop: getResponsive(8) }}
              showsVerticalScrollIndicator={false}
              keyExtractor={keyExtractor}
              contentContainerStyle={{ paddingBottom: getResponsive(24) }}
              renderItem={renderTask}
              onEndReached={handleEndReached}
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
              onMomentumScrollBegin={() => {
                console.log('FlatList onMomentumScrollBegin');
              }}
              extraData={isFetchingNextPage}
            />
          </View>
        )}
      </View>
// Remove stray Modal and ensure all JSX blocks are closed properly


    </SafeAreaView>
  );
}

