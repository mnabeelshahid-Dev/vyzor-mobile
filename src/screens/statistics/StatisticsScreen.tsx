import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ReactNative from 'react-native';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';
import CloudIcon from '../../assets/svgs/cloud.svg';
import Modal from 'react-native-modal';
import CalendarModal from '../../components/modals/CalendarModal';
import ArrowDown from '../../assets/svgs/arrowDown.svg';
import { useAuthStore } from '../../store/authStore';
import { styles } from './styles';
const FlatListComponent: any = (ReactNative as any).FlatList;
const DimensionsAny: any = (ReactNative as any).Dimensions;
const { width } = DimensionsAny.get('window');
import SortIcon from '../../assets/svgs/sortIcon.svg';
import { useLogout } from '../../hooks/useAuth';
const getResponsive = (val: number) => Math.round(val * (width / 390));

import { useQuery } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchStatisticsUserDetail } from '../../api/statistics';
import { fetchDocument } from '../../api/statistics';
// ActivityIndicator already imported above
import RNFS from 'react-native-fs';
import { storage } from '../../services/storage';

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

  return `${dd}-${mm}-${yyyy} ${hours}:${minutes} ${ampm}`;
}

export default function StatisticsScreen({ navigation }) {
  // ...existing code...
  const user = useAuthStore((state) => state.user);
  const branchId = useAuthStore((state) => state.branchId);
  console.log("👤 [STORE] Current User from Auth Store:", user, branchId);
  // Only keep one set of state for tasks logic
  const [search, setSearch] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);
  // Use string for filterDate (ISO date)
  const [filterDate, setFilterDate] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Use 'documentName' instead of 'name' for backend compatibility
  const [sortField, setSortField] = useState<'documentName' | 'number'>('documentName');
  const [filterStatus, setFilterStatus] = useState('');
  const [tempFilterStatus, setTempFilterStatus] = useState('');
  const [tempFilterDate, setTempFilterDate] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);

  // Ensure statisticsParams is updated as soon as user.id or branchId become available
  useEffect(() => {
    if (user?.id && branchId) {
      setStatisticsParams(prev => {
        // Only update if userIds or filterSiteIds are missing or incorrect
        const needsUpdate =
          !Array.isArray(prev.userIds) || prev.userIds[0] !== user.id || prev.filterSiteIds !== branchId;
        if (needsUpdate) {
          return {
            ...prev,
            userIds: [user.id],
            filterSiteIds: branchId,
          };
        }
        return prev;
      });
    }
  }, [user?.id, branchId]);
  // Memoized TaskCard for FlatList performance
  const handleDownloadReport = React.useCallback(async (taskItem: any) => {
    try {
      const scheduleStatus = (taskItem?.scheduleStatus || '').toString().toUpperCase();
      const status = (taskItem?.status || '').toString().toUpperCase();
      const fileKey = Array.isArray(taskItem?.file) && taskItem.file.length > 0 ? taskItem.file[0]?.key : null;
      const isCompletedForm = status === 'COMPLETED' || scheduleStatus === 'ON_TIME' || scheduleStatus === 'OUTSIDE_PERIOD' || scheduleStatus === 'COMPLETED';
      if (!isCompletedForm) {
        Alert.alert('Unavailable', 'Report is only available for completed tasks.');
        return;
      }
      if (!fileKey) {
        Alert.alert('Not Found', 'No PDF report available for this task.');
        return;
      }

      const token = await storage.getSecureString('access_token');
      if (!token) {
        Alert.alert('Auth Error', 'You are not authenticated. Please login again.');
        return;
      }

      const safeName = `${(taskItem?.documentName || 'report').toString().replace(/[^a-z0-9]+/gi, '_')}_${taskItem?.webId || ''}`;
      const PlatformAny: any = (ReactNative as any).Platform;
      const isAndroid = PlatformAny?.OS === 'android';
      const androidDownloads = (RNFS as any).DownloadDirectoryPath;
      const baseDir = isAndroid && androidDownloads ? androidDownloads : RNFS.DocumentDirectoryPath;
      const destPath = `${baseDir}/${safeName}.pdf`;
      const url = `https://vyzor.app/api/dms/file/download/${fileKey}`;

      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: destPath,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      });
      const result = await download.promise;
      if (result.statusCode === 200) {
        // On Android, ask the media scanner to index the file (helps it show up in file managers)
        try {
          if (isAndroid && typeof (RNFS as any).scanFile === 'function') {
            await (RNFS as any).scanFile([{ path: destPath }]);
          }
        } catch {}

        // Try to open with system viewer
        try {
          const RNLinking: any = (ReactNative as any).Linking;
          if (RNLinking && typeof RNLinking.openURL === 'function') {
            await RNLinking.openURL('file://' + destPath);
            return;
          }
        } catch {}

        // Fallback: show saved location
        Alert.alert('Report Saved', `Saved to: ${destPath}`);
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (err: any) {
      Alert.alert('Download Failed', err?.message || 'Unable to download report');
    }
  }, []);

  const TaskCard = React.memo(({ item }: { item: any }) => {
    const scheduleStatus = (item?.scheduleStatus || item?.status || '').toString().toUpperCase();
    const borderColor =
      scheduleStatus === 'EXPIRED'
        ? '#EF4444' // red
        : scheduleStatus === 'ON_TIME'
          ? '#22C55E' // green for on time
          : scheduleStatus === 'OUTSIDE_PERIOD'
            ? '#ebb748ff' // yellow for outside period
            : '#22C55E'; // default completed -> green
    return (
      <View
        style={[
          styles.taskCard,
          {
            borderLeftColor: borderColor,
            borderLeftWidth: getResponsive(4),
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: getResponsive(36) }}>
          <Text style={styles.taskTitle}>{item.documentName}</Text>
          <View style={styles.taskDates}>
            <Text style={[styles.taskDate, { fontWeight: '400', color: '#021639' }]}><Text style={{ color: '#363942' }}>Starting:</Text> {formatDate(item.startDate, true)}</Text>
            <Text style={[styles.taskDate, { fontWeight: '400', color: '#021639' }]}><Text style={{ color: '#363942' }}>Ending:</Text> {formatDate(item.endDate, true)}</Text>
          </View>
        </View>
        {(scheduleStatus === 'COMPLETED' || scheduleStatus === 'ON_TIME' || scheduleStatus === 'OUTSIDE_PERIOD') && Array.isArray(item?.file) && item.file.length > 0 ? (
          <TouchableOpacity
            onPress={() => handleDownloadReport(item)}
            style={{ position: 'absolute', right: getResponsive(12), top: '80%', marginTop: -getResponsive(14), padding: getResponsive(6) }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CloudIcon width={22} height={22}  />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  });

  // Memoized renderItem and keyExtractor
  const renderTask = React.useCallback(({ item }) => <TaskCard item={item} />, []);
  const keyExtractor = React.useCallback((item, idx) => item.webId ? item.webId.toString() : idx.toString(), []);

  // Helper to update tempFilterDate in modal
  const applyFilterDateToRange = (date: string) => {
    if (date && !isNaN(new Date(date).getTime())) {
      setTempFilterDate(date);
    }
  };

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
  // Set default date range to last 7 days
  function getDefaultDateRange() {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      startDate: formatDateWithOffset(startDate, true),
      endDate: formatDateWithOffset(endDate, false)
    };
  }
  const defaultRange = getDefaultDateRange();
  const [statisticsParams, setStatisticsParams] = useState(() => {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      startDate: formatDateWithOffset(startDate, true),
      endDate: formatDateWithOffset(endDate, false),
      status: '',
      userIds: user?.id ? [user.id] : [],
      filterSiteIds: branchId,
      search: '',
      sort: '',
      page: 0,
      size: 10,
    };
  });

  let updatedStartDate = '';
  let updatedEndDate = '';
  // Move formatDateWithOffset to top-level scope
  function formatDateWithOffset(date: Date, isStart: boolean) {
    // Format: YYYY-MM-DDTHH:mm:ss+05:00
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    if (isStart) {
      return `${yyyy}-${mm}-${dd}T00:00:00+05:00`;
    } else {
      return `${yyyy}-${mm}-${dd}T23:59:00+05:00`;
    }
  }

  useEffect(() => {
    const today = new Date();
    if (filterDate) {
      updatedStartDate = formatDateWithOffset(new Date(filterDate), true);
      updatedEndDate = formatDateWithOffset(new Date(filterDate), false);
    } else {
      updatedEndDate = formatDateWithOffset(today, false);
      const startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      updatedStartDate = formatDateWithOffset(startDateObj, true);
    }
    console.log('====================================');
    console.log(updatedStartDate, updatedEndDate);
    console.log('====================================');
    if (user?.id) {
      setStatisticsParams((prev) => ({
        ...prev,
        search: search ?? '',
        sort: sortOrder ?? '',
        status: filterStatus && filterStatus.trim() !== '' ? filterStatus : 'ALL',
        startDate: updatedStartDate,
        endDate: updatedEndDate,
        userIds: [user.id], // only userIds
        filterSiteIds: branchId,
      }));
    }
  }, [search, sortOrder, filterStatus, filterDate, user]);
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['statisticsUserDetail', statisticsParams],
    queryFn: () => {
      // Build query string for debugging
      const query = new URLSearchParams();
      Object.entries(statisticsParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'userIds' && Array.isArray(value)) {
            query.append('userIds', value.join(','));
          } else if (Array.isArray(value)) {
            query.append(key, value.join(','));
          } else {
            query.append(key, value.toString());
          }
        }
      });
      const url = `/api/document/statistics/usersDetail?${query.toString()}`;
      console.log('[DEBUG] Statistics API URL:', url);
      console.log('[DEBUG] Statistics API Request Object:', statisticsParams);
      return fetchStatisticsUserDetail(statisticsParams);
    },
    enabled: Array.isArray(statisticsParams.userIds) && statisticsParams.userIds.length > 0,
  });



  const statsTyped = (statsData as { data?: { content?: any[] } })?.data?.content[0] as any || {};
  const stats = {
    onTime: Number(statsTyped.onTime) || 0,
    outside: Number(statsTyped.outsidePeriod) || 0,
    expired: Number(statsTyped.expire) || 0,
    totalOnTime: Number(statsTyped.previousOnTime) || 0,
    totalOutside: Number(statsTyped.previousOutsidePeriod) || 0,
    totalExpired: Number(statsTyped.previousExpire) || 0,
  };
  const progress = {
    onTime: parseFloat(statsTyped.onTimePercentage),
    outside: parseFloat(statsTyped.outsidePeriodPercentage),
    expired: parseFloat(statsTyped.expirePercentage),
  };

  // Build params for API
  const buildParams = (pageParam = 1) => {
    // Always use formatDateWithOffset for API params
    let startDateRaw = statisticsParams.startDate;
    let endDateRaw = statisticsParams.endDate;
    let startDate = startDateRaw ? formatDateWithOffset(new Date(startDateRaw), true) : '';
    let endDate = endDateRaw ? formatDateWithOffset(new Date(endDateRaw), false) : '';
    const params: any = {
      page: pageParam,
      size: 20,
      sort: 'startDate,desc',
      search: search ?? '',
      siteIds: branchId,
      startDate,
      endDate,
      scheduleStatus: '',
      userIds: user?.id ? [user.id] : [],
    };
    return params;
  };

  const fetchTasksInfinite = async ({ pageParam = 1 }) => {
    const params = buildParams(pageParam);
    console.log("Fetching documents with params:", params);
    const response = await fetchDocument(params);
    console.log("Fetched documents response:", response);
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
    queryKey: ['tasks', statisticsParams],
    queryFn: fetchTasksInfinite,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    initialPageParam: 0,
    enabled: !!branchId,
  });

  // Flatten all pages
  const allTasks: any[] = infiniteData?.pages?.flatMap((page: any) => page.data) ?? [];

  // Filtering logic
  // Base business rule: show only expired or completed items (completed includes ON_TIME and OUTSIDE_PERIOD)
  // Exclude scheduled
  let filteredTasks = allTasks.filter((task) => {
    const scheduleStatus = (task?.scheduleStatus || '').toString().toUpperCase();
    const status = (task?.status || '').toString().toUpperCase();
    const type = (task?.scheduleType || '').toString().toUpperCase();
    if (type === 'SCHEDULED') return false;
    if (scheduleStatus === 'SCHEDULE' || scheduleStatus === 'SCHEDULED') return false;
    const isExpired = scheduleStatus === 'EXPIRED' || status === 'EXPIRED';
    const isCompleted = status === 'COMPLETED' || scheduleStatus === 'ON_TIME' || scheduleStatus === 'OUTSIDE_PERIOD' || scheduleStatus === 'COMPLETED';
    return isExpired || isCompleted;
  });
  if (filterStatus) {
    filteredTasks = filteredTasks.filter((task) => {
      const scheduleStatus = (task?.scheduleStatus || '').toString().toUpperCase();
      const status = (task?.status || '').toString().toUpperCase();
      const choice = filterStatus.trim().toLowerCase();
      if (choice === 'on time') return scheduleStatus === 'ON_TIME';
      if (choice === 'outside period') return scheduleStatus === 'OUTSIDE_PERIOD';
      if (choice === 'expired') return scheduleStatus === 'EXPIRED' || status === 'EXPIRED';
      return true;
    });
  }
  // Removed UI-side filter by exact startDate; now all tasks in the API date range are shown.

  // Sorting logic
  let sortedTasks = [...filteredTasks];
  if (sortField === 'documentName') {
    sortedTasks.sort((a, b) => {
      if (!a.documentName || !b.documentName) return 0;
      if (sortOrder === 'asc') {
        return a.documentName.toLowerCase().localeCompare(b.documentName.toLowerCase());
      } else {
        return b.documentName.toLowerCase().localeCompare(a.documentName.toLowerCase());
      }
    });
  } else if (sortField === 'number') {
    sortedTasks.sort((a, b) => {
      if (sortOrder === 'asc') {
        return (a.status || '').toLowerCase().localeCompare((b.status || '').toLowerCase());
      } else {
        return (b.status || '').toLowerCase().localeCompare((a.status || '').toLowerCase());
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
    // Map 'name' to 'documentName' for backend compatibility
    setSortField(field === 'name' ? 'documentName' : field);
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
              style={[styles.sortModalOrderBtn, sortField === 'documentName' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('name', 'desc')}
            >
              <ArrowDownWard width={15} height={15} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortModalOrderBtn, sortField === 'documentName' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
              onPress={() => handleSort('name', 'asc')}
            >
              <ArrowUpIcon width={15} height={15} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginTop: 10 }} />
        <View style={[styles.sortModalBody, { marginTop: 10 }]}>
          <Text style={styles.sortModalField}>Status</Text>
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

  const totalTasks = stats.onTime + stats.outside + stats.expired;

  // When opening filter modal, initialize temp values from current filter
  const openFilterModal = () => {
    setTempFilterStatus(filterStatus);
    setTempFilterDate(filterDate);
    setFilterModal(true);
  };

  // When closing filter modal (without applying), reset temp values
  const closeFilterModal = () => {
    setTempFilterStatus(filterStatus);
    setTempFilterDate(filterDate);
    setFilterModal(false);
  };

  // --- Date Range Picker Logic ---
  const startDateObj = statisticsParams.startDate ? new Date(statisticsParams.startDate) : new Date();
  const endDateObj = statisticsParams.endDate ? new Date(statisticsParams.endDate) : new Date();
  const getStartDateMax = () => {
    if (statisticsParams.endDate) {
      const d = new Date(statisticsParams.endDate);
      // Allow same day selection for start and end date
      return d < new Date() ? d : new Date();
    }
    return new Date();
  };
  const getEndDateMin = () => {
    if (statisticsParams.startDate) {
      const d = new Date(statisticsParams.startDate);
      // Allow same day selection for start and end date
      return d;
    }
    return undefined;
  };

  const handleStartDateChange = (date) => {
    const newStartDate = formatDateWithOffset(date, true);
    setStatisticsParams(prev => {
      let newEndDate = prev.endDate;
      if (!prev.endDate || new Date(prev.endDate) <= new Date(date)) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const today = new Date();
        newEndDate = nextDay <= today ? formatDateWithOffset(nextDay, false) : formatDateWithOffset(today, false);
      }
      return {
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate
      };
    });
  };
  const handleEndDateChange = (date) => {
    const newEndDate = formatDateWithOffset(date, false);
    setStatisticsParams(prev => {
      let newStartDate = prev.startDate;
      if (!prev.startDate || new Date(prev.startDate) >= new Date(date)) {
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);
        newStartDate = formatDateWithOffset(prevDay, true);
      }
      return {
        ...prev,
        endDate: newEndDate,
        startDate: newStartDate
      };
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => navigation.goBack()}>
            <BackArrowIcon width={getResponsive(17)} height={getResponsive(17)} onPress={() => navigation.goBack()} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
          onPress={openFilterModal}
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
        customBackdrop={null}
        panResponderThreshold={4}
        swipeThreshold={100}
        onModalShow={() => { }}
        onModalWillShow={() => { }}
        onModalHide={() => { }}
        onModalWillHide={() => { }}
        onModalDismiss={() => { }}
        onBackButtonPress={() => setFilterModal(false)}
        onSwipeComplete={() => { }}
        swipeDirection={null}
        scrollHorizontal={false}
        statusBarTranslucent={false}
        supportedOrientations={['portrait', 'landscape']}
        scrollTo={() => { }}
        scrollOffset={0}
        scrollOffsetMax={0}
        onBackdropPress={closeFilterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity style={{ backgroundColor: '#0088E71A', borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2 }} onPress={closeFilterModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
                  {filterModal ? (tempFilterStatus ? tempFilterStatus : 'Status') : (filterStatus ? filterStatus : 'Status')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 14 }}>
                  <ArrowDown width={18} height={18} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
              {/* Status Dropdown List */}
              {showStatusDropdown && (
                <View style={{ backgroundColor: '#fff', borderRadius: 8, marginVertical: 4, marginHorizontal: 3, elevation: 2, shadowColor: '#0002', borderWidth: 1, borderColor: '#00000033', top: -10, zIndex: 10 }}>
                  {['On Time', 'Outside Period', 'Expired'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={{
                        padding: 12,
                        backgroundColor: tempFilterStatus === status ? '#E6F1FB' : '#fff',
                        borderRadius: 6,
                        borderBottomWidth: 0.35,
                        borderBottomColor: '#00000033'
                      }}
                      onPress={() => {
                        setTempFilterStatus(status);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={{ color: '#363942', fontSize: 16 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Date Picker */}
              <TouchableOpacity style={[styles.inputRow, { borderWidth: 1, borderColor: '#00000033', borderRadius: 8, marginTop: 16 }]} onPress={() => setShowFilterDatePicker(true)}>
                <TextInput
                  placeholder="Selected Date"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={tempFilterDate ? formatDate(tempFilterDate) : ''}
                  editable={false}
                />
                <View style={styles.inputIcon}>
                  <CalendarIcon width={20} height={20} />
                </View>
              </TouchableOpacity>
              {/* Calendar Modal for Filter Date */}
              <CalendarModal
                visible={showFilterDatePicker}
                onClose={() => setShowFilterDatePicker(false)}
                onDateSelect={(date) => {
                  applyFilterDateToRange(date);
                }}
                selectedDate={tempFilterDate}
                maxDate={new Date().toISOString().split('T')[0]}
                title="Select Filter Date"
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnClear}
                onPress={() => {
                  setFilterStatus('');
                  setFilterDate('');
                  // Reset statisticsParams to default date range using formatDateWithOffset
                  const today = new Date();
                  const updatedEndDate = formatDateWithOffset(today, false);
                  const startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  const updatedStartDate = formatDateWithOffset(startDateObj, true);
                  setStatisticsParams(prev => ({
                    ...prev,
                    status: '',
                    startDate: updatedStartDate,
                    endDate: updatedEndDate,
                  }));
                  closeFilterModal();
                  refetch();
                }}
              >
                <Text style={styles.modalBtnClearText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnApply} onPress={() => {
                setFilterStatus(tempFilterStatus);
                setFilterDate(tempFilterDate);
                setStatisticsParams(prev => ({
                  ...prev,
                  status: tempFilterStatus,
                  startDate: tempFilterDate ? tempFilterDate : prev.startDate,
                  endDate: tempFilterDate ? tempFilterDate : prev.endDate,
                }));
                // Reset temp values after applying
                setTempFilterStatus('');
                setTempFilterDate('');
                closeFilterModal();
                refetch();
              }}>
                <Text style={styles.modalBtnApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Sort Modal */}
      {showSortModal && (
        <SortModal />
      )}

      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: getResponsive(30),
          borderTopRightRadius: getResponsive(30),
          paddingTop: getResponsive(44),
        }}
      >
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
          <CalendarModal
            visible={showStartDatePicker}
            onClose={() => setShowStartDatePicker(false)}
            onDateSelect={(date) => handleStartDateChange(new Date(date))}
            selectedDate={statisticsParams.startDate}
            maxDate={getStartDateMax()?.toISOString().split('T')[0]}
            title="Select Start Date"
          />
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
          <CalendarModal
            visible={showEndDatePicker}
            onClose={() => setShowEndDatePicker(false)}
            onDateSelect={(date) => handleEndDateChange(new Date(date))}
            selectedDate={statisticsParams.endDate}
            maxDate={new Date().toISOString().split('T')[0]}
            minDate={getEndDateMin()?.toISOString().split('T')[0]}
            title="Select End Date"
          />
        </View>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {/* On Time = Completed Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#22C55E', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>On Time</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{Number(stats.onTime) ?? 0}</Text> of {Number(totalTasks) ?? 0}</Text>
          </View>
          {/* Outside = Scheduled Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#ebb748ff', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>Outside Period</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{Number(stats.outside) ?? 0}</Text> of {Number(totalTasks) ?? 0}</Text>
          </View>
          {/* Expired = Expired Task Count */}
          <View style={[styles.statCard, { borderLeftColor: '#EF4444', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>Expired</Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>{Number(stats.expired) ?? 0}</Text> of {Number(totalTasks) ?? 0}</Text>
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
            <Text style={styles.progressLabel}>Outside Period</Text>
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

        {/* Task List with loading and empty state */}
        {isLoading || isRefetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : sortedTasks.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
            <Text style={{ color: '#888', fontSize: 18, fontWeight: '500' }}>No Tasks Available</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatListComponent
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

      {/* Dropdown Modal */}
      <Modal
        isVisible={showDropdown}
        onBackdropPress={() => setShowDropdown(false)}
        backdropOpacity={0.3}
        backdropColor="#000"
        hasBackdrop={true}
        coverScreen={true}
        avoidKeyboard={true}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        deviceHeight={DimensionsAny.get('window').height}
        deviceWidth={DimensionsAny.get('window').width}
        customBackdrop={undefined}
        onModalShow={() => { }}
        onModalHide={() => { }}
        onBackButtonPress={() => setShowDropdown(false)}
        propagateSwipe={false}
        supportedOrientations={['portrait', 'landscape']}
        testID={"dropdown-modal"}
        {...{} as import('react-native-modal').ModalProps}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDropdown(false);
                // Add navigation to settings here
                navigation.navigate('Profile');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SettingsIcon
                  width={18}
                  height={18}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.dropdownText}>Settings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
                <Text style={styles.dropdownText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

