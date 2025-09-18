import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Pressable, ActivityIndicator } from 'react-native';
import { apiService } from '../../services/api';
import { Calendar } from 'react-native-calendars';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import LeftArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { useLogout } from '../../hooks/useAuth';

interface TaskSchedulingModel {
  compositeId: string;
  webId: number;
  updateDate: string | null;
  createdDate: string;
  startDate: string;
  endDate: string;
  completedDate: string | null;
  clientId: number;
  createdById: number | null;
  updatedById: number | null;
  updatedBy: string | null;
  createdBy: string | null;
  scheduleType: string;
  documentId: number;
  documentName: string | null;
  status: number;
  type: string | null;
  flow: string | null;
  latitude: number | null;
  longitude: number | null;
  formDefinitionId: number;
  formName: string;
  userName: string;
  formStatus: string;
  userId: number | null;
  siteId: number;
  siteName: string;
  siteCode: string;
  siteStatus: string;
  fileId: string | null;
  key: string;
  roleId: number | null;
  assignUserId: number;
  _class: string;
  deleted: boolean;
  notesCount: number;
}

// Color constants
const BLUE = '#1292E6';
const DARK_BLUE = '#184B74';
const GREEN = '#1bc768';
const RED = '#f44336';
const GRAY = '#7A8194';
const BG_GRAY = '#F6F6F6';

const HOUR_LIST = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minutesStr = minutes === 0 ? '00' : '30';
  return `${displayHour.toString().padStart(2, '0')}.${minutesStr} ${period}`;
});
const mockTasks = [
  {
    id: '1',
    hour: '12.00 PM',
    number: '#432678',
    title: 'Manage guest check-in process',
    user: 'Adnan Ali',
    borderColor: GREEN,
    bg: '#E5F6EC',
    type: 'main',
  },
  {
    id: '2',
    hour: '12.00 PM',
    number: '#432678',
    title: 'Manage guest check-in process',
    user: 'Adnan Ali',
    borderColor: RED,
    bg: '#FCE8E6',
    type: 'main',
  },
  {
    id: '3',
    hour: '01.00 PM',
    number: '#432678',
    title: 'Test task',
    user: 'Adnan Ali',
    borderColor: GREEN,
    bg: '#E5F6EC',
    type: 'main',
  },
  {
    id: '4',
    hour: '01.00 PM',
    number: '#432678',
    title: 'Test task',
    user: 'Adnan Ali',
    borderColor: RED,
    bg: '#FCE8E6',
    type: 'main',
  },
  {
    id: '5',
    hour: '02.30 PM',
    number: '#432678',
    title: 'Test task',
    user: 'Adnan Ali',
    borderColor: GREEN,
    bg: '#E5F6EC',
    type: 'mini',
  },
  {
    id: '6',
    hour: '03.00 PM',
    number: '#432678',
    title: 'Test task',
    user: 'Adnan Ali',
    borderColor: GREEN,
    bg: '#E5F6EC',
    type: 'main',
  },
  {
    id: '7',
    hour: '03.00 PM',
    number: '#432678',
    title: 'Test task',
    user: 'Adnan Ali',
    borderColor: RED,
    bg: '#FCE8E6',
    type: 'main',
  },
];

function formatTasksForUI(tasks: TaskSchedulingModel[]) {
  return tasks.map(task => {
    const startTime = new Date(task.startDate);
    const endTime = new Date(task.endDate);

    // Format time to match HOUR_LIST format for 30-minute intervals
    const formatTime = (date: Date) => {
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      // Round minutes to nearest 30-minute slot
      const roundedMinutes = minutes < 30 ? 0 : 30;
      const minutesStr = roundedMinutes === 0 ? '00' : '30';

      return `${displayHour
        .toString()
        .padStart(2, '0')}.${minutesStr} ${period}`;
    };

    // Calculate task duration and determine type
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const taskType = durationMinutes <= 30 ? 'mini' : 'main';

    // Determine border color and background based on scheduleType
    let borderColor = BLUE; // Default for ON_TIME
    let bg = '#E3F2FD'; // Light blue background

    if (task.scheduleType === 'EXPIRED') {
      borderColor = RED;
      bg = '#FCE8E6';
    } else if (task.scheduleType === 'SCHEDULED') {
      borderColor = GREEN;
      bg = '#E5F6EC';
    } else if (task.scheduleType === 'ON_TIME') {
      borderColor = BLUE;
      bg = '#E3F2FD';
    }

    return {
      id: task.webId.toString(),
      hour: formatTime(startTime),
      number: `#${task.documentId}`,
      title: task.formName || task.documentName || 'No Title',
      user: task.userName || 'Unassigned',
      borderColor,
      bg,
      type: taskType,
      startDate: task.startDate,
      endDate: task.endDate,
      scheduleType: task.scheduleType,
      rawStartTime: startTime,
      duration: durationMinutes,
    };
  });
}

function getTasksByHour(tasks: any[], hour: string) {
  console.log(
    'tasks by hour: ',
    tasks.filter(t => t.hour === hour),
  );
  return tasks.filter(t => t.hour === hour);
}

// Replace the formatDateForAPI function with this:
function formatDateForAPI(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Format for API - using the exact format from your sample URL
  const formatForAPI = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    // Get timezone offset in format -07:00
    const offset = d.getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const offsetHours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0');
    const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}%3A${minutes}%3A${seconds}${sign}${offsetHours}%3A${offsetMinutes}`;
  };

  return {
    startDate: formatForAPI(startOfDay),
    endDate: formatForAPI(endOfDay),
  };
}

function getWeekDays(selectedDate: Date) {
  const base = new Date(selectedDate);
  const dayOfWeek = (base.getDay() + 6) % 7; // 0=Mon
  const monday = new Date(base);
  monday.setDate(base.getDate() - dayOfWeek);
  let days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d,
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      dateString: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function CalendarAgendaScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = getWeekDays(selectedDate);
  const [calendarVisible, setCalendarVisible] = useState(false);

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

  // Add React Query for fetching tasks
  const { startDate: apiStartDate, endDate: apiEndDate } =
    formatDateForAPI(selectedDate);

  // Update the React Query section with better error handling and logging:
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['scheduleTasks', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const { startDate: apiStartDate, endDate: apiEndDate } =
        formatDateForAPI(selectedDate);
      const url = `/api/document/schedule?startDate=${apiStartDate}&endDate=${apiEndDate}&search=`;
      console.log('Fetching tasks with URL:', url);
      console.log('Selected date:', selectedDate);
      console.log('API Start Date:', apiStartDate);
      console.log('API End Date:', apiEndDate);

      const response = await apiService.get(url);
      console.log('Schedule tasks response:', response.data);
      console.log('Tasks count:', response.data?.length || 0);

      return response.data as TaskSchedulingModel[];
    },
  });

  // Add this after the formattedTasks line for debugging:
  console.log('Formatted tasks:', formattedTasks);
  console.log('Selected date for display:', selectedDate.toDateString());

  // Format tasks for UI
  const formattedTasks = tasksData ? formatTasksForUI(tasksData) : [];

  const handleDateSelect = (newDate: Date) => {
    setSelectedDate(newDate);
    // The query will automatically refetch due to the queryKey dependency
  };

  // Update the calendar day press handler
  const handleCalendarDayPress = (day: any) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
    setCalendarVisible(false);
    // The query will automatically refetch due to the queryKey dependency
  };

  const isSelectedDay = dayObj =>
    dayObj.date.getDate() === selectedDate.getDate() &&
    dayObj.date.getMonth() === selectedDate.getMonth() &&
    dayObj.date.getFullYear() === selectedDate.getFullYear();

  const formattedDate = () => {
    const date = selectedDate;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <LeftArrowIcon
            width={16}
            height={16}
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <Pressable
          style={styles.headerTitle}
          onPress={() => setCalendarVisible(true)}
        >
          <CalendarIcon
            height={20}
            width={20}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
            {formattedDate()}
          </Text>
        </Pressable>
        <TouchableOpacity>
          <ThreeDotIcon
            width={20}
            height={20}
            onPress={() => setShowDropdown(true)}
          />
        </TouchableOpacity>
      </View>
      {/* Floating Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCalendarVisible(false)}
        >
          <View style={styles.calendarModalBox}>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: BLUE,
                },
              }}
              onDayPress={handleCalendarDayPress}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#184B74',
                selectedDayBackgroundColor: '#1292E6',
                selectedDayTextColor: '#fff',
                todayTextColor: '#1292E6',
                dayTextColor: '#184B74',
                textDisabledColor: '#C1C6CE',
                arrowColor: '#1292E6',
                monthTextColor: '#184B74',
                textMonthFontWeight: 'bold',
                textDayFontFamily: 'Prompt-Regular',
                textMonthFontFamily: 'Prompt-Bold',
                textDayHeaderFontFamily: 'Prompt-Medium',
              }}
              renderArrow={direction => (
                <Text style={{ color: '#1292E6', fontSize: 22 }}>
                  {direction === 'left' ? '<' : '>'}
                </Text>
              )}
              style={{ borderRadius: 18 }}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Day Selector */}
      <View style={styles.daysOuter}>
        <View style={styles.daysInner}>
          {weekDays.map((dayObj, idx) => {
            const selected = isSelectedDay(dayObj);
            return (
              <TouchableOpacity
                key={dayObj.dateString}
                style={styles.dayCol}
                onPress={() => handleDateSelect(new Date(dayObj.date))}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.dayNumberWrap,
                    selected && styles.dayNumberWrapSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      selected && styles.dayLabelSelected,
                    ]}
                  >
                    {dayObj.label}
                  </Text>
                  <Text
                    style={[styles.dayNum, selected && styles.dayNumSelected]}
                  >
                    {dayObj.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Agenda */}

        {/* Scrollable Hours/Agenda Section */}
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            marginTop: 16,
          }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
        >
          {/* Agenda */}
          {isLoadingTasks ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 50,
              }}
            >
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={{ marginTop: 10, color: GRAY }}>
                Loading tasks...
              </Text>
            </View>
          ) : tasksError ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 50,
              }}
            >
              <Text
                style={{ color: RED, textAlign: 'center', marginBottom: 10 }}
              >
                Error loading tasks
              </Text>
              <TouchableOpacity
                onPress={() => refetchTasks()}
                style={{
                  backgroundColor: BG_GRAY,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'black' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            HOUR_LIST.map(hour => (
              <View key={hour} style={styles.hourBlock}>
                {/* Horizontal grid line */}
                <View style={styles.gridLine} />
                <View style={styles.hourRow}>
                  {/* Time label */}
                  <View style={styles.hourLabelWrap}>
                    <Text style={styles.hourLabel}>{hour}</Text>
                  </View>
                  {/* Tasks */}
                  <ScrollView
                    horizontal
                    style={styles.tasksRow}
                    contentContainerStyle={styles.tasksScrollContent}
                    showsHorizontalScrollIndicator={false}
                  >
                    {getTasksByHour(formattedTasks, hour).map(item => (
                      <View
                        key={item.id}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: item.borderColor,
                            backgroundColor: item.bg,
                            minWidth: item.type === 'mini' ? 120 : 150,
                            maxWidth: item.type === 'mini' ? 150 : 250,
                            shadowColor: '#184B74',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 6,
                            elevation: 3,
                          },
                        ]}
                      >
                        <View style={styles.taskMetaRow}>
                          <Text style={styles.taskNumber}>{item.number}</Text>
                          <View style={styles.taskUserPill}>
                            <Text style={styles.taskUserText}>
                              {item.type === 'mini'
                                ? item.user.split(' ')[0]
                                : item.user}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.taskTitle,
                            { fontSize: item.type === 'mini' ? 11 : 12 },
                          ]}
                          numberOfLines={item.type === 'mini' ? 2 : 3}
                        >
                          {item.title}
                        </Text>
                        {item.scheduleType && (
                          <Text
                            style={[
                              styles.taskScheduleType,
                              {
                                color:
                                  item.scheduleType === 'EXPIRED'
                                    ? RED
                                    : item.scheduleType === 'SCHEDULED'
                                    ? GREEN
                                    : BLUE,
                                fontSize: item.type === 'mini' ? 9 : 10,
                                fontWeight: '500',
                                marginTop: 2,
                              },
                            ]}
                          >
                            {item.scheduleType}
                          </Text>
                        )}
                        {/* {item.duration && (
    <Text
      style={{
        color: GRAY,
        fontSize: item.type === 'mini' ? 8 : 9,
        marginTop: 1,
      }}
    >
      {item.duration}min
    </Text>
  )} */}
                      </View>
                    ))}
                    {getTasksByHour(formattedTasks, hour).length === 0 && (
                      <Text
                        style={{
                          color: GRAY,
                          fontSize: 12,
                          fontStyle: 'italic',
                        }}
                      ></Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  daysOuter: {
    flex: 1,
    backgroundColor: DARK_BLUE,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingBottom: 4,
    paddingTop: 2,
    marginBottom: -34, // more overlap
  },
  daysInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 3,
  },
  dayLabel: {
    color: '#C1C6CE',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayNumberWrap: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberWrapSelected: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C1C6CE',
  },
  dayNumSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: BG_GRAY,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingTop: 20,
    paddingHorizontal: 0,
    marginTop: 16,
  },
  hourBlock: {
    minHeight: 44,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: '#E1E8F0',
    zIndex: 0,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 0,
    minHeight: 88,
  },
  hourLabelWrap: {
    width: 80,
    alignItems: 'flex-end',
    paddingTop: 18,
    borderRightWidth: 0.5,
    borderRightColor: '#bec2c7ff',
  },
  hourLabel: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 9,
  },
  // tasksRow: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   marginLeft: 4,
  //   marginTop: 8,
  // },
  taskCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 14,
    marginBottom: 4,
    padding: 12,
    minHeight: 54,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskNumber: {
    color: GRAY,
    fontWeight: '600',
    fontSize: 10,
    marginRight: 6,
  },
  taskUserPill: {
    backgroundColor: '#fff',
    borderColor: GRAY,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 1,
    paddingHorizontal: 8,
    marginLeft: 3,
  },
  taskUserText: {
    color: '#121213ff',
    fontWeight: '400',
    fontSize: 10,
  },
  taskTitle: {
    color: '#121213ff',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#fff',
    borderTopColor: '#E1E8F0',
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
  },
  navIcon: {
    fontSize: 27,
    color: '#C1C6CE',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 320,
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksScrollContent: {
    paddingRight: 16,
    alignItems: 'flex-start',
  },

  tasksRow: {
    flex: 1,
    marginLeft: 4,
    marginTop: 8,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? 90 : 72,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
});
