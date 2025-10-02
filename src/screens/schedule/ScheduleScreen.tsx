import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDevices, fetchSections, fetchNotes, fetchUserSites } from '../../api/tasks';
// ActivityIndicator moved into the main import block below
import { apiService } from '../../services/api';
import { Calendar } from 'react-native-calendars';
import * as RN from 'react-native';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import LeftArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import LocationIcon from '../../assets/svgs/locationIcon.svg';

import SettingsIcon from '../../assets/svgs/deviceIcon.svg';
import { useLogout } from '../../hooks/useAuth';
import UserIcon from '../../assets/svgs/user.svg';
import MenuIcon from '../../assets/svgs/menuIcon.svg';
import NotesIcon from '../../assets/svgs/notesIcon.svg';
import { useAuthStore } from '../../store/authStore';
import { useRoute } from '@react-navigation/native';




// Fallbacks for environments where Modal/Pressable types are not exposed
const RNModal: any = (RN as any).Modal;
const RNPressable: any = (RN as any).Pressable;

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
const BLUE = '#007AFF'; //This is good working copy
const DARK_BLUE = '#184B74';
const GREEN = '#1bc768';
const RED = '#f44336';
const GRAY = '#7A8194';
const BG_GRAY = '#F6F6F6';

// Visual height for each 30-minute slot row (should match styles.hourRow.minHeight)
const SLOT_HEIGHT = 60;

const HOUR_LIST = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minutesStr = minutes === 0 ? '00' : '30';
  return `${displayHour.toString().padStart(2, '0')}.${minutesStr} ${period}`;
});

function formatTasksForUI(tasks: TaskSchedulingModel[]) {
  // Filter out tasks with empty or whitespace-only userNames
  const filteredTasks = tasks.filter(task => {
    return task.userName && task.userName.trim().length > 0;
  });

  return filteredTasks.map(task => {
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

    // Helpers to align times to 30-minute boundaries
    const roundDownTo30 = (date: Date) => {
      const d = new Date(date);
      d.setSeconds(0, 0);
      const minutes = d.getMinutes();
      d.setMinutes(minutes < 30 ? 0 : 30);
      return d;
    };

    const roundUpTo30 = (date: Date) => {
      const d = new Date(date);
      d.setSeconds(0, 0);
      const minutes = d.getMinutes();
      if (minutes === 0) {
        // already aligned
      } else if (minutes <= 30) {
        d.setMinutes(30);
      } else {
        d.setHours(d.getHours() + 1, 0, 0, 0);
      }
      return d;
    };

    // Build the list of 30-minute slots the task occupies [start, end)
    const alignedStart = roundDownTo30(startTime);
    const alignedEnd = roundUpTo30(endTime);
    const slots: string[] = [];
    for (
      let cursor = new Date(alignedStart);
      cursor < alignedEnd;
      cursor = new Date(cursor.getTime() + 30 * 60 * 1000)
    ) {
      slots.push(formatTime(cursor));
    }

    // Calculate task duration and determine type
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const taskType = durationMinutes <= 30 ? 'mini' : 'main';




const now = new Date();
const isActive = task.scheduleType === 'SCHEDULED' && 
                 now >= startTime && 
                 now < endTime;

const ACTIVE_BLUE = '#0088E7';
const SCHEDULED_ORANGE = '#E09200';
const COMPLETED_GREEN = '#11A330';
const EXPIRED_RED = '#E4190A';

let borderColor = BLUE; // Default
let bg = '#E3F2FD'; // Light blue background
let effectiveScheduleType = task.scheduleType;

// Determine border color and background based on scheduleType and current time
if (isActive) {
  borderColor = ACTIVE_BLUE;
  bg = '#a9d3fbff';
  effectiveScheduleType = 'ACTIVE';
} else if (task.scheduleType === 'EXPIRED') {
  borderColor = EXPIRED_RED;
  bg = '#E4190A1A';
} else if (task.scheduleType === 'COMPLETED') {
  borderColor = COMPLETED_GREEN;
  bg = '#ECEFF3';
} else if (task.scheduleType === 'SCHEDULED') {
  borderColor = SCHEDULED_ORANGE;
  bg = '#f6e0c1ff';  // Light orange background for scheduled
} else if (task.scheduleType === 'ON_TIME') {
  borderColor = BLUE;
  bg = '#E3F2FD';
}
return {
  id: task.webId.toString(),
  hour: formatTime(startTime),
  number: `#${task.documentId}`,
  title: task.formName || task.documentName || 'No Title',
  user: task.userName,
  borderColor,
  bg,
  type: taskType,
  startDate: task.startDate,
  endDate: task.endDate,
  scheduleType: effectiveScheduleType, // Use the modified schedule type
  notesCount: task.notesCount ?? 0,
  rawStartTime: startTime,
  duration: durationMinutes,
  slots,
  slotCount: slots.length,
  formDefinitionId: task.formDefinitionId,
};
  });
}

function getTasksByHour(tasks: any[], hour: string) {
  console.log(
    'tasks by hour: ',
    tasks.filter(t => t.hour === hour),
  );
  // Render only once at the starting slot to avoid duplicates across covered slots
  return tasks.filter(t =>
    Array.isArray(t.slots) && t.slots.length > 0
      ? t.slots[0] === hour
      : t.hour === hour,
  );
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
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [userModal, setUserModal] = useState(false);
const [sectionsModal, setSectionsModal] = useState(false);
const [notesModal, setNotesModal] = useState(false);
const [devicesModal, setDevicesModal] = useState(false);
const [searchUser, setSearchUser] = useState('');
const [selectedTaskForModal, setSelectedTaskForModal] = useState<any | null>(null);

const user = useAuthStore((state) => state.user);
const branchId = useAuthStore((state) => state.branchId);
const route: any = useRoute();

// Get branchId from route params (similar to TaskScreen)
// const branchId =
//   route.params?.branchId ||
//   route.params?.params?.branchId ||
//   route.params?.params?.params?.branchId;

const userId = user?.id || '';


    useEffect(() => {
      console.log("Web ID from Store", user?.id)
      console.log("Site ID from Store", user?.currentUserSite[0]?.siteId)
      console.log("User Data from Store", user)
    }, [])
  

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
  // const {
  //   data: tasksData,
  //   isLoading: isLoadingTasks,
  //   error: tasksError,
  //   refetch: refetchTasks,
  // } = useQuery({
  //   queryKey: ['scheduleTasks', selectedDate.toISOString().split('T')[0]],
  //   queryFn: async () => {
  //     const { startDate: apiStartDate, endDate: apiEndDate } =
  //       formatDateForAPI(selectedDate);
  //     // const url = `/api/document/schedule?startDate=${apiStartDate}&endDate=${apiEndDate}&search=`;
  //     const url = `/api/document/schedule?startDate=${apiStartDate}&endDate=${apiEndDate}&siteIds=7181512&userIds=7187169&search=`;
  //     console.log('Fetching tasks with URL:', url);
  //     console.log('Selected date:', selectedDate);
  //     console.log('API Start Date:', apiStartDate);
  //     console.log('API End Date:', apiEndDate);

  //     const response = await apiService.get(url);
  //     console.log('Schedule tasks response:', response.data);
  //     const tasksArray = response.data as unknown as any[];
  //     console.log('Tasks count:', (Array.isArray(tasksArray) ? tasksArray.length : 0));

  //     return response.data as TaskSchedulingModel[];
  //   },
  // });


  


const {
  data: tasksData,
  isLoading: isLoadingTasks,
  error: tasksError,
  refetch: refetchTasks,
} = useQuery({
  queryKey: ['scheduleTasks', selectedDate.toISOString().split('T')[0], userId, branchId],
  queryFn: async () => {
    const { startDate: apiStartDate, endDate: apiEndDate } =
      formatDateForAPI(selectedDate);
    
    // Build dynamic URL with user ID and selected branch ID
    const url = `/api/document/schedule?startDate=${apiStartDate}&endDate=${apiEndDate}&siteIds=${branchId || ''}&userIds=${userId}&search=`;
    
    console.log('Fetching tasks with URL:', url);
    console.log('Selected date:', selectedDate);
    console.log('User ID:', userId);
    console.log('Branch/Site ID:', branchId);

    const response = await apiService.get(url);
    console.log('Schedule tasks response:', response.data);

    return response.data as TaskSchedulingModel[];
  },
  // enabled: !!userId && !!branchId, // Only fetch when we have both user ID and branch ID
});


// Devices Query
const {
  data: devicesData,
  isLoading: isDevicesLoading,
  isError: isDevicesError,
  refetch: refetchDevices,
} = useQuery({
  queryKey: ['devices'],
  queryFn: fetchDevices,
  enabled: devicesModal,
});

// Sections Query
const {
  data: sectionsData,
  isLoading: isSectionsLoading,
  isError: isSectionsError,
  refetch: refetchSections,
} = useQuery({
  queryKey: ['sections'],
  queryFn: fetchSections,
  enabled: sectionsModal,
});

// Notes Query
const {
  data: notesData,
  isLoading: isNotesLoading,
  isError: isNotesError,
  refetch: refetchNotes,
} = useQuery({
  queryKey: ['notes'],
  queryFn: fetchNotes,
  enabled: notesModal,
});

// UserSites Query
const {
  data: userSitesData,
  isLoading: isUserSitesLoading,
  isError: isUserSitesError,
  refetch: refetchUserSites,
} = useQuery({
  queryKey: ['userSites', branchId, searchUser],
  queryFn: () => fetchUserSites(branchId, searchUser),
  enabled: !!branchId && userModal,
});

  // Format tasks for UI
  const formattedTasks = tasksData ? formatTasksForUI(tasksData) : [];

  // Debug logs after formattedTasks is defined
  console.log('Formatted tasks:', formattedTasks);
  console.log('Selected date for display:', selectedDate.toDateString());

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
const normalizeStatus = (status: string = '') => {
  const s = (status || '').trim().toLowerCase();
  if (s === 'schedule' || s === 'scheduled') return 'Scheduled';
  if (s === 'active') return 'Active';
  if (s === 'expired') return 'Expired';
  if (s === 'completed') return 'Completed';
  return status || '';
};
  const STATUS_COLORS: Record<string, string> = {
    Active: '#0088E7',
    Scheduled: '#E09200',
    Completed: '#11A330',
    Expired: '#E4190A',
  };
  const STATUS_BG_COLORS: Record<string, string> = {
    Active: '#E6F1FB',
    Scheduled: '#E6FAEF',
    Completed: '#ECEFF3',
    Expired: '#FDEBEB',
  };
  const formatTaskDateRange = (startDate: any, endDate: any) => {
    const format = (date: any) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return (
        d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    if (startDate && endDate) {
      if (startDate === endDate) return format(startDate);
      return `${format(startDate)} - ${format(endDate)}`;
    }
    return format(startDate || endDate);
  };


  const openModal = (type: string, task?: any) => {
  if (task) setSelectedTaskForModal(task);
  setUserModal(type === 'user');
  setSectionsModal(type === 'sections');
  setNotesModal(type === 'notes');
  setDevicesModal(type === 'devices');
};

const closeModal = () => {
  setUserModal(false);
  setSectionsModal(false);
  setNotesModal(false);
  setDevicesModal(false);
  setSelectedTaskForModal(null);
  // Don't close the task modal when closing sub-modals
};

const filteredUsers = Array.isArray(userSitesData) ? userSitesData : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Branches')}>
          <LeftArrowIcon
            width={16}
            height={16}
          />
        </TouchableOpacity>
        <RNPressable
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
        </RNPressable>
        <TouchableOpacity>
          <ThreeDotIcon
            width={20}
            height={20}
            onPress={() => setShowDropdown(true)}
          />
        </TouchableOpacity>
      </View>
      {/* Floating Calendar Modal */}
      <RNModal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <RNPressable
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
        </RNPressable>
      </RNModal>

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
            <View style={{ minHeight: HOUR_LIST.length * SLOT_HEIGHT, position: 'relative' }}>
              {HOUR_LIST.map(hour => (
                <View key={hour} style={styles.hourBlock}>
                  {/* Horizontal grid line */}
                  <View style={styles.gridLine} />
                  <View style={styles.hourRow}>
                    {/* Time label */}
                    <View style={styles.hourLabelWrap}>
                      <Text style={styles.hourLabel}>{hour}</Text>
                    </View>
                    {/* Empty space for grid; tasks are rendered in overlay */}
                    <View style={styles.tasksRow} />
                  </View>
                </View>
              ))}

              {/* Absolute-positioned task overlay spanning multiple slots */}
              <View style={styles.overlayContainer}>
                {(() => {
                  // Function to detect overlapping tasks and assign columns
                  const assignTaskColumns = (tasks: any[]) => {
                    const sortedTasks = tasks
                      .filter(t => Array.isArray(t.slots) && t.slots.length > 0)
                      .map(task => ({
                        ...task,
                        startIndex: HOUR_LIST.indexOf(task.slots[0]),
                        endIndex: HOUR_LIST.indexOf(task.slots[0]) + (task.slotCount || 1) - 1,
                      }))
                      .filter(task => task.startIndex >= 0)
                      .sort((a, b) => a.startIndex - b.startIndex || (a.endIndex - b.endIndex));

                    const columns: any[][] = [];
                    
                    sortedTasks.forEach(task => {
                      let placed = false;
                      
                      // Try to place in existing columns
                      for (let i = 0; i < columns.length; i++) {
                        const column = columns[i];
                        const lastTaskInColumn = column[column.length - 1];
                        
                        // Check if task can be placed in this column (no overlap)
                        if (!lastTaskInColumn || lastTaskInColumn.endIndex < task.startIndex) {
                          column.push({ ...task, column: i });
                          placed = true;
                          break;
                        }
                      }
                      
                      // If not placed, create new column
                      if (!placed) {
                        columns.push([{ ...task, column: columns.length }]);
                      }
                    });

                    return columns.flat();
                  };

                  const tasksWithColumns = assignTaskColumns(formattedTasks);

                  // Group tasks by their start index for rendering
                  const groups: Record<number, any[]> = {};
                  tasksWithColumns.forEach(task => {
                    const startIndex = task.startIndex;
                    if (!groups[startIndex]) groups[startIndex] = [];
                    groups[startIndex].push(task);
                  });

                  return Object.entries(groups).map(([indexStr, items]) => {
                    const index = Number(indexStr);
                    const top = index * SLOT_HEIGHT + 4;
                    const maxHeight = Math.max(
                      54,
                      ...items.map(it => (it.slotCount || 1) * SLOT_HEIGHT - 8),
                    );

                    // Calculate max columns for this time band
                    const maxColumnsInBand = Math.max(1, ...items.map(t => t.column + 1));
                    const taskWidth = maxColumnsInBand === 1 ? 220 : Math.max(140, 200);
                    const totalContentWidth = maxColumnsInBand * (taskWidth + 8) - 8; // Remove last margin
                    
                    return (
                      <View key={`band-${index}`} style={[styles.overlayBand, { top, height: maxHeight }]}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={[
                            styles.overlayBandScrollContent,
                            { width: Math.max(totalContentWidth, 220) }
                          ]}
                        >
                          <View style={{ position: 'relative', width: totalContentWidth, height: maxHeight }}>
                            {items.map(item => (
                              <RNPressable
                                key={item.id}
                                style={[
                                  styles.taskCard,
                                  {
                                    position: 'absolute',
                                    left: item.column * (taskWidth + 8),
                                    top: 0,
                                    height: Math.max(54, (item.slotCount || 1) * SLOT_HEIGHT - 8),
                                    borderColor: item.borderColor,
                                    backgroundColor: item.bg,
                                    width: taskWidth,
                                    marginRight: 0, // Remove margin since we're using absolute positioning
                                  },
                                ]}
                                onPress={() => {
                                  setSelectedTask(item);
                                  setShowTaskModal(true);
                                }}
                              >
                                <View style={styles.taskMetaRow}>
                                  <Text style={styles.taskNumber}>{item.number}</Text>
                                  <View style={styles.taskUserPill}>
                                    <Text style={styles.taskUserText}>
                                      {maxColumnsInBand > 2 || item.type === 'mini'
                                        ? item.user.split(' ')[0]
                                        : item.user}
                                    </Text>
                                  </View>
                                </View>
                                <Text
                                  style={[
                                    styles.taskTitle,
                                    { fontSize: maxColumnsInBand > 2 || item.type === 'mini' ? 11 : 12 },
                                  ]}
                                  numberOfLines={maxColumnsInBand > 2 || item.type === 'mini' ? 2 : 3}
                                >
                                  {item.title}
                                </Text>
                              </RNPressable>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    );
                  });
                })()}
              </View>
              
            </View>
          )}
        </ScrollView>
      </View>

      {/* Task Details Modal */}
      <RNModal
        visible={showTaskModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <RNPressable style={styles.modalBackdrop} onPress={() => setShowTaskModal(false)}>
          <RNPressable style={styles.taskModalBox} onPress={(e) => e.stopPropagation()}>
            {selectedTask ? (
              <>
                {(() => {
                  const normalizedStatus = normalizeStatus(selectedTask.scheduleType);
                  const statusColor = STATUS_COLORS[normalizedStatus] || '#0088E7';
                  const statusBg = STATUS_BG_COLORS[normalizedStatus] || '#E6F1FB';
                  const dateRange = formatTaskDateRange(selectedTask.startDate, selectedTask.endDate);
                  // Enable Get Started only when Active and within time range
                  const now = new Date();
                  const start = new Date(selectedTask.startDate);
                  const end = new Date(selectedTask.endDate);
                  const isCurrentlyActive = normalizedStatus === 'Active' && now >= start && now <= end;
                  const canStart = isCurrentlyActive;
                  const progressPct = Math.min(100, Math.round(((selectedTask.slotCount || 1) * 30) / ((selectedTask.duration || 30)) * 100));

                  return (
                    <>
                      {/* Top row: Number and Status */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ color: statusColor, fontWeight: '500', fontSize: 15 }}>{selectedTask.number}</Text>
                        <View style={{ flex: 1 }} />
                        <View style={{ backgroundColor: statusColor, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>{normalizedStatus || 'Active'}</Text>
                        </View>
                      </View>

                      {/* Title */}
                      <Text style={{ color: '#222E44', fontWeight: '700', fontSize: 17 }}>{selectedTask.title}</Text>

                      {/* Date range under title */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <CalendarIcon width={15} height={15} />
                        <Text style={{ color: '#676869ff', fontSize: 11, marginLeft: 8 }}>{dateRange}</Text>
                      </View>

                      {/* Progress bar */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <View style={{ flex: 1, height: 6, backgroundColor: statusBg, borderRadius: 6, overflow: 'hidden', marginRight: 8 }}>
                          <View style={{ height: 6, width: `${progressPct}%`, backgroundColor: statusColor, borderRadius: 6 }} />
                        </View>
                        <Text style={{ color: '#222E44', fontWeight: '400', fontSize: 12 }}>{`${progressPct}%`}</Text>
                      </View>

{/* Summary section */}
<View style={{ backgroundColor: '#F7F9FC', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', marginTop: 14 }}>
  <View style={{ flexDirection: 'row', padding: 12 }}>
    {(() => {
      const userCount = Array.isArray(filteredUsers) ? filteredUsers.length : 0;
      const isReassignDisabled = userCount === 0;
      
      return (
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center',
            opacity: isReassignDisabled ? 0.5 : 1 
          }}
          onPress={() => {
            if (!isReassignDisabled) {
              openModal('user', selectedTask);
            }
          }}
          disabled={isReassignDisabled}
        >
          <UserIcon width={14} height={14} style={{ opacity: isReassignDisabled ? 0.5 : 1 }} />
          <Text style={{ 
            color: isReassignDisabled ? '#AAB3BB' : '#1292E6', 
            fontWeight: '500', 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            Reassign
          </Text>
        </TouchableOpacity>
      );
    })()}
    
    {(() => {
      const deviceCount = Array.isArray((devicesData?.data as any)?.content) ? (devicesData.data as any).content.length : 0;
      const isDevicesDisabled = deviceCount === 0;
      
      return (
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center',
            opacity: isDevicesDisabled ? 0.5 : 1 
          }}
          onPress={() => {
            if (!isDevicesDisabled) {
              openModal('devices', selectedTask);
            }
          }}
          disabled={isDevicesDisabled}
        >
          <SettingsIcon width={14} height={14} style={{ opacity: isDevicesDisabled ? 0.5 : 1 }} />
          <Text style={{ 
            color: isDevicesDisabled ? '#AAB3BB' : '#1292E6', 
            fontWeight: '500', 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            Devices
          </Text>
          <View style={{ 
            backgroundColor: isDevicesDisabled ? '#F0F0F0' : '#D0ECFF', 
            borderRadius: 12, 
            minWidth: 28, 
            height: 28, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginLeft: 8 
          }}>
            <Text style={{ 
              color: isDevicesDisabled ? '#AAB3BB' : '#1292E6', 
              fontWeight: '600', 
              fontSize: 12 
            }}>
              {deviceCount}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })()}
  </View>
  <View style={{ flexDirection: 'row', padding: 12, paddingTop: 0 }}>
    {(() => {
      const sectionCount = Array.isArray((sectionsData?.data as any)?.content) ? (sectionsData.data as any).content.length : 0;
      const isSectionsDisabled = sectionCount === 0;
      
      return (
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center',
            opacity: isSectionsDisabled ? 0.5 : 1 
          }}
          onPress={() => {
            if (!isSectionsDisabled) {
              openModal('sections', selectedTask);
            }
          }}
          disabled={isSectionsDisabled}
        >
          <MenuIcon width={14} height={14} style={{ opacity: isSectionsDisabled ? 0.5 : 1 }} />
          <Text style={{ 
            color: isSectionsDisabled ? '#AAB3BB' : '#1292E6', 
            fontWeight: '500', 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            Sections
          </Text>
          <View style={{ 
            backgroundColor: isSectionsDisabled ? '#F0F0F0' : '#D0ECFF', 
            borderRadius: 12, 
            minWidth: 28, 
            height: 28, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginLeft: 8 
          }}>
            <Text style={{ 
              color: isSectionsDisabled ? '#AAB3BB' : '#1292E6', 
              fontWeight: '600', 
              fontSize: 12 
            }}>
              {sectionCount}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })()}
    
    {(() => {
      const notesCount = selectedTask.notesCount ?? 0;
      const isNotesDisabled = notesCount === 0;
      
      return (
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center',
            opacity: isNotesDisabled ? 0.5 : 1 
          }}
          onPress={() => {
            if (!isNotesDisabled) {
              openModal('notes', selectedTask);
            }
          }}
          disabled={isNotesDisabled}
        >
          <NotesIcon width={14} height={14} style={{ opacity: isNotesDisabled ? 0.5 : 1 }} />
          <Text style={{ 
            color: isNotesDisabled ? '#AAB3BB' : '#1292E6', 
            fontWeight: '500', 
            fontSize: 12, 
            marginLeft: 8 
          }}>
            Notes
          </Text>
          <View style={{ 
            backgroundColor: isNotesDisabled ? '#F0F0F0' : '#D0ECFF', 
            borderRadius: 12, 
            minWidth: 28, 
            height: 28, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginLeft: 8 
          }}>
            <Text style={{ 
              color: isNotesDisabled ? '#AAB3BB' : '#1292E6', 
              fontWeight: '600', 
              fontSize: 12 
            }}>
              {notesCount}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })()}
  </View>
</View>

                      {/* Get Started button */}
                      <TouchableOpacity
                        disabled={!canStart}
                        onPress={() => {
                          if (canStart && selectedTask) {
                            setShowTaskModal(false);
                      navigation.navigate('Task', {
                        screen: 'Section',
                        params: {
                          formDefinitionId: selectedTask.formDefinitionId || selectedTask.id,
                          status: selectedTask.scheduleType,
                          sourceScreen: 'Schedule', // Add source information
                        },
                      });
                          }
                        }}
                        style={{ 
                          backgroundColor: canStart ? '#1292E6' : '#bac0cdff', 
                          paddingVertical: 12, 
                          borderRadius: 10, 
                          alignItems: 'center', 
                          marginTop: 14 
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Get Started</Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
              </>
            ) : null}
          </RNPressable>
        </RNPressable>
      </RNModal>

      {/* Dropdown Modal */}
      <RNModal
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
      </RNModal>


{/* User Modal */}
<RNModal
  visible={userModal}
  transparent
  animationType="fade"
  onRequestClose={closeModal}
>
  <RNPressable style={styles.modalBackdrop} onPress={(e) => { e.stopPropagation(); closeModal(); }}>
    <RNPressable style={{ borderRadius: 18, backgroundColor: '#fff', padding: 0, justifyContent: 'flex-start', width: '90%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 8, minHeight: '60%' }} onPress={(e) => e.stopPropagation()}>
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
        <TouchableOpacity onPress={() => refetchUserSites()} style={{ backgroundColor: '#0088E7', borderBottomRightRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>Search</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 14, paddingHorizontal: 18, flex: 1, paddingVertical: 8 }}>
        {isUserSitesLoading ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
        ) : isUserSitesError ? (
          <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading users</Text>
        ) : filteredUsers.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredUsers.map((item, idx) => (
              <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 10, marginBottom: 12 }}>
                <Text style={{ fontWeight: '500', fontSize: 16, color: '#222E44' }}>{item.name || item.username || item.storeEmail}</Text>
                <Text style={{ color: '#0088E7', fontSize: 14 }}>
                  {item.email || 'email@example.com'}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No users found</Text>
        )}
      </View>
    </RNPressable>
  </RNPressable>
</RNModal>

{/* Sections Modal */}
<RNModal
  visible={sectionsModal}
  transparent
  animationType="fade"
  onRequestClose={closeModal}
>
  <RNPressable style={styles.modalBackdrop} onPress={(e) => { e.stopPropagation(); closeModal(); }}>
    <RNPressable style={{ borderRadius: 18, backgroundColor: '#fff', padding: 20, width: '90%', maxHeight: '60%' }} onPress={(e) => e.stopPropagation()}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44', flex: 1 }}>Sections</Text>
        <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#0088E7' }}>✕</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {isSectionsLoading ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
        ) : isSectionsError ? (
          <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading sections</Text>
        ) : Array.isArray((sectionsData?.data as any)?.content) && (sectionsData.data as any).content.length > 0 ? (
          (sectionsData.data as any).content.map((section, idx) => (
            <View key={section.documentId || idx} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', fontSize: 15, color: '#222E44' }}>{section.name || 'Cleaning'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <LocationIcon width={16} height={16} style={{ opacity: 0.7 }} />
                  <Text style={{ color: '#676869', fontSize: 12, marginLeft: 8 }}>
                    {section.location || 'No Location Available'}
                  </Text>
                </View>
              </View>
              <View>
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
    </RNPressable>
  </RNPressable>
</RNModal>

{/* Devices Modal */}
<RNModal
  visible={devicesModal}
  transparent
  animationType="fade"
  onRequestClose={closeModal}
>
  <RNPressable style={styles.modalBackdrop} onPress={(e) => { e.stopPropagation(); closeModal(); }}>
    <RNPressable style={{ borderRadius: 18, backgroundColor: '#fff', padding: 0, width: '90%', minHeight: 320, maxHeight: '60%' }} onPress={(e) => e.stopPropagation()}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6' }}>
        <Text style={{ fontWeight: '700', fontSize: 20, color: '#222E44' }}>Devices</Text>
        <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, color: '#0088E7' }}>✕</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
        {isDevicesLoading ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
        ) : isDevicesError ? (
          <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading devices</Text>
        ) : Array.isArray((devicesData?.data as any)?.content) && (devicesData.data as any).content.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {(devicesData.data as any).content.map((item, idx) => (
              <View key={item.uuid || idx} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 17, color: '#222E44' }}>{item.name || ''}</Text>
                  <Text style={{ color: '#0088E7', fontSize: 12, marginTop: 2 }}>{item.macAddress || ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#AAB3BB', fontSize: 12 }}>uuid # {item.uuId ?? ''}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No devices found</Text>
        )}
      </View>
    </RNPressable>
  </RNPressable>
</RNModal>

{/* Notes Modal */}
<RNModal
  visible={notesModal}
  transparent
  animationType="fade"
  onRequestClose={closeModal}
>
  <RNPressable style={styles.modalBackdrop} onPress={(e) => { e.stopPropagation(); closeModal(); }}>
    <RNPressable style={{ borderRadius: 18, backgroundColor: '#fff', padding: 0, width: '90%', minHeight: 320, maxHeight: '60%' }} onPress={(e) => e.stopPropagation()}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6' }}>
        <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44' }}>Notes</Text>
        <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, color: '#0088E7' }}>✕</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 12 }}>
        {isNotesLoading ? (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
        ) : isNotesError ? (
          <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading notes</Text>
        ) : Array.isArray((notesData?.data as any)?.list) && (notesData.data as any).list.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {(notesData.data as any).list.map((item, idx) => (
              <View key={item.id || idx} style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 16, marginBottom: 16 }}>
                <Text style={{ color: '#222E44', fontSize: 16, fontWeight: '600' }}>{item.text || item.note || ''}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No notes found</Text>
        )}
      </View>
    </RNPressable>
  </RNPressable>
</RNModal>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#007AFF",
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
    // top: -4,
    height: 1,
    backgroundColor: '#E1E8F0',
    zIndex: 0,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 0,
    minHeight: 60,
  },
  // hourLabelWrap: {
  //   width: 80,
  //   alignItems: 'flex-end',
  //   paddingTop: 0,
  //   borderRightWidth: 0.5,
  //   borderRightColor: '#bec2c7ff',
  // },
  hourLabelWrap: {
  width: 80,
  alignItems: 'flex-end',
  paddingTop: 0,
  marginTop: -1,  // Add negative margin to move text up to touch the line
  borderRightWidth: 0.5,
  borderRightColor: '#bec2c7ff',
  // borderRightColor: '#bec2c7ff',
},
  hourLabel: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 9,
  },
  taskCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 14,
    marginBottom: 4,
    padding: 8,
    minHeight: 54,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
taskOverlayCard: {
  position: 'absolute',
  left: 88,
  right: 90,
  marginRight: 0,
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
  taskScheduleType: {
    color: GRAY,
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
  taskModalBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 320,
    maxWidth: 420,
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
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
overlayBand: {
  position: 'absolute',
  left: 88,  // Start after the time labels
  right: 0,  // Changed from 90 to 0 to extend full width
  paddingRight: 16,  // Add padding instead of margin
},
overlayBandScrollContent: {
  paddingRight: 16,
  alignItems: 'flex-start',
  flexDirection: 'row',  // Add this to ensure horizontal layout
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
