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
} from 'react-native';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import Modal from 'react-native-modal';
import { Calendar } from 'react-native-calendars';
import ArrowDown from '../../assets/svgs/arrowDown.svg';

const { width } = Dimensions.get('window');
const getResponsive = (val: number) => Math.round(val * (width / 390));

// Card colors for statuses
const statusConfig = {
  onTime: { border: '#22C55E', bar: '#22C55E', label: 'On Time task' },
  outside: { border: '#A35F94', bar: '#A35F94', label: 'Outside Period' },
  expired: { border: '#EF4444', bar: '#EF4444', label: 'Expired Task' },
};

import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../../api/tasks';

function formatDate(dateStrOrObj: string | Date = ""): string {
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

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${dd}-${mm}-${yyyy}  ${hours}:${minutes} ${ampm}`;
}

export default function StatisticsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'number'>('name');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
    const [datePicker, setDatePicker] = useState({ field: null, show: false });
  
  const [tasksParams, setTasksParams] = useState({
    startDate: '',
    endDate: '',
    userIds: [],
    scheduleStatus: '',
    branchId: '',
    search: '',
    sort: sortOrder,
    sortField: sortField,
    page: 0,
    size: 20,
  });

  useEffect(() => {
    setTasksParams((prev) => ({
      ...prev,
      search,
      sort: sortOrder,
      sortField,
      scheduleStatus: filterStatus,
      startDate,
      endDate,
    }));
  }, [search, sortOrder, sortField, filterStatus, startDate, endDate]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', tasksParams],
    queryFn: () => fetchTasks(tasksParams),
    enabled: true,
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

  // Responsive styling helpers
  const statCardWidth = (width - getResponsive(16) * 2 - getResponsive(12) * 2) / 3;

  // Filter modal logic can be added here, similar to TaskScreen

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={getResponsive(17)} height={getResponsive(17)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={getResponsive(20)} height={getResponsive(20)} />
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
          onPress={() => setFilterModal(true)}
        >
          <FilterIcon width={getResponsive(32)} height={getResponsive(32)} />
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
                avoidKeyboard={true}
                coverScreen={true}
                style={{ margin: 0 }}
                onBackdropPress={() => setShowDatePicker(false)}
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
              <TouchableOpacity style={styles.modalBtnApply} onPress={() => {
                setStartDate(filterDate ? filterDate : '');
                setEndDate(filterDate ? filterDate : '');
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
          <View style={[styles.statCard, { borderLeftColor: '#22C55E', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>
              On Time task
            </Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>10</Text> of 20</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#A35F94', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>
              Outside Period
            </Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>0</Text> of 10</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#EF4444', width: statCardWidth }]}>
            <Text style={[styles.statTitle, { color: '#8C8C98' }]}>
              Expired Task
            </Text>
            <Text style={styles.statValue}><Text style={styles.boldNum}>10</Text> of 30</Text>
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
                  { backgroundColor: '#22C55E', width: '75%' },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Outside</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: '#A35F94', width: '25%' },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>25%</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Expired</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: '#EF4444', width: '75%' },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeBox}>
          <CalendarIcon width={getResponsive(20)} height={getResponsive(20)} />
          <Text style={styles.dateRangeText}>
            July 09, 2025 - July 23, 2025 ( 12:00 PM )
          </Text>
        </View>

        {/* Task List */}
        <FlatList
          data={sortedTasks}
          style={{ flex: 1, marginTop: getResponsive(8) }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, idx) => item.webId ? item.webId.toString() : idx.toString()}
          contentContainerStyle={{ paddingBottom: getResponsive(24) }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskCard,
                {
                  borderLeftColor:
                    item.status === 'Active'
                      ? '#22C55E'
                      : item.status === 'Expired'
                        ? '#A35F94'
                        : '#EF4444',
                  borderLeftWidth: getResponsive(4),
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.documentName || item.label}</Text>
                <View style={styles.taskDates}>
                  <Text style={[styles.taskDate,{ fontWeight: '400', color:'#021639' }]}><Text style={{color:'#363942'}}>Starting:</Text> { formatDate(item.startDate) }</Text>
                  <Text style={[styles.taskDate,{ fontWeight: '400', color:'#021639' }]}><Text style={{color:'#363942'}}>Ending:</Text> { formatDate(item.endDate) }</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '60%',
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
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? getResponsive(18) : getResponsive(55),
    paddingBottom: getResponsive(20),
    paddingHorizontal: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: getResponsive(24),
  },
  headerTitle: {
    color: '#fff',
    fontSize: getResponsive(18),
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -getResponsive(32),
    marginHorizontal: getResponsive(20),
    zIndex: 2,
    top: getResponsive(25),
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: getResponsive(8),
    height: getResponsive(52),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: getResponsive(10),
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#222',
    fontSize: getResponsive(17),
  },
  filterBtnFloat: {
    backgroundColor: '#fff',
    borderRadius: getResponsive(8),
    padding: getResponsive(10),
    marginLeft: getResponsive(8),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: getResponsive(16),
    marginBottom: getResponsive(14),
    marginTop: getResponsive(8),
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: getResponsive(14),
    padding: getResponsive(10),
    marginHorizontal: getResponsive(4),
    borderLeftWidth: getResponsive(6),
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    elevation: 2,
    minHeight: getResponsive(64),
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#0002',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statTitle: {
    fontSize: getResponsive(10),
    lineHeight: getResponsive(14),
  },
  statValue: {
    fontSize: getResponsive(12),
    fontWeight: '400',
    color: '#222',
  },
  boldNum: {
    fontWeight: 'bold',
    fontSize: getResponsive(13),
    color: '#222',
  },
  progressBox: {
    backgroundColor: '#fff',
    borderRadius: getResponsive(13),
    marginHorizontal: getResponsive(16),
    padding: getResponsive(18),
    marginBottom: getResponsive(16),
    elevation: 2,
    shadowColor: '#0002',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsive(8),
  },
  progressLabel: {
    width: getResponsive(78),
    fontSize: getResponsive(10),
    color: '#7A8194',
  },
  progressBarBg: {
    flex: 1,
    height: getResponsive(6),
    backgroundColor: '#E5E7EB',
    borderRadius: getResponsive(8),
    marginHorizontal: getResponsive(8),
    overflow: 'hidden',
  },
  progressBar: {
    height: getResponsive(6),
    borderRadius: getResponsive(8),
  },
  progressPercent: {
    width: getResponsive(50),
    textAlign: 'right',
    fontSize: getResponsive(10),
    color: '#222',
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0088E714',
    borderRadius: getResponsive(11),
    marginHorizontal: getResponsive(16),
    padding: getResponsive(13),
    marginBottom: getResponsive(10),
    marginTop: getResponsive(4),
  },
  dateRangeText: {
    marginLeft: getResponsive(8),
    color: '#184B74',
    fontSize: getResponsive(14),
    fontWeight: '400',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: getResponsive(14),
    marginHorizontal: getResponsive(16),
    marginVertical: getResponsive(6),
    padding: getResponsive(14),
    elevation: 1,
    shadowColor: '#0001',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },

  },
  taskIndicator: {
    width: getResponsive(6),
    height: getResponsive(56),
    borderRadius: getResponsive(6),
    marginRight: getResponsive(14),
  },
  taskTitle: {
    fontSize: getResponsive(14),
    fontWeight: '500',
    color: '#021639F5',
    marginBottom: getResponsive(3),
  },
  taskDates: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // marginTop: getResponsive(2),
  },
  taskDate: {
    fontSize: getResponsive(10),
    color: '#7A8194',
    marginRight: getResponsive(22),
    fontWeight: '400',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: getResponsive(60),
    backgroundColor: '#fff',
    borderTopLeftRadius: getResponsive(18),
    borderTopRightRadius: getResponsive(18),
    elevation: 10,
  },
});
