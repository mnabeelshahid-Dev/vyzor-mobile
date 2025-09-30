import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ActivityIndicator,
} from 'react-native';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import LeftArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { useLogout } from '../../hooks/useAuth';
import UserIcon from '../../assets/svgs/user.svg';
import MenuIcon from '../../assets/svgs/menuIcon.svg';
import NotesIcon from '../../assets/svgs/notesIcon.svg';

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
  bg = '#E6F1FB';
  effectiveScheduleType = 'ACTIVE';
} else if (task.scheduleType === 'EXPIRED') {
  borderColor = EXPIRED_RED;
  bg = '#FDEBEB';
} else if (task.scheduleType === 'COMPLETED') {
  borderColor = COMPLETED_GREEN;
  bg = '#ECEFF3';
} else if (task.scheduleType === 'SCHEDULED') {
  borderColor = SCHEDULED_ORANGE;
  bg = '#FEF4E6';  // Light orange background for scheduled
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
      const tasksArray = response.data as unknown as any[];
      console.log('Tasks count:', (Array.isArray(tasksArray) ? tasksArray.length : 0));

      return response.data as TaskSchedulingModel[];
    },
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
                  const groups: Record<number, any[]> = {};
                  formattedTasks
                    .filter(t => Array.isArray(t.slots) && t.slots.length > 0)
                    .forEach(item => {
                      const startIndex = HOUR_LIST.indexOf(item.slots[0]);
                      if (startIndex >= 0) {
                        if (!groups[startIndex]) groups[startIndex] = [];
                        groups[startIndex].push(item);
                      }
                    });

                  return Object.entries(groups).map(([indexStr, items]) => {
                    const index = Number(indexStr);
                    const top = index * SLOT_HEIGHT + 4;
                    const height = Math.max(
                      54,
                      ...items.map(it => (it.slotCount || 1) * SLOT_HEIGHT - 8),
                    );
                    return (
                      <View key={`band-${index}`} style={[styles.overlayBand, { top, height }]}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.overlayBandScrollContent}
                        >
{items.map(item => (
  <RNPressable
    key={item.id}
    style={[
      styles.taskCard,
      {
        position: 'relative',
        height: Math.max(54, (item.slotCount || 1) * SLOT_HEIGHT - 8),
        borderColor: item.borderColor,
        backgroundColor: item.bg,
        marginRight: 14,
        width: item.type === 'mini' ? 140 : 220,  // Fixed width instead of min/max
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
                            </RNPressable>
                          ))}
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
          <View style={styles.taskModalBox}>
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
                          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <UserIcon width={14} height={14} />
                            <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Reassign</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.6 }}>
                            <SettingsIcon width={14} height={14} />
                            <Text style={{ color: '#888', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Devices</Text>
                            <View style={{ backgroundColor: '#D9D9D9', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                              <Text style={{ color: '#868696', fontWeight: '500', fontSize: 14 }}>0</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', padding: 12, paddingTop: 0 }}>
                          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <MenuIcon width={14} height={14} />
                            <Text style={{ color: '#1292E6', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Sections</Text>
                            <View style={{ backgroundColor: '#D0ECFF', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                              <Text style={{ color: '#1292E6', fontWeight: '600', fontSize: 12 }}>0</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: 0.6 }}>
                            <NotesIcon width={14} height={14} />
                            <Text style={{ color: '#888', fontWeight: '500', fontSize: 12, marginLeft: 8 }}>Notes</Text>
                            <View style={{ backgroundColor: '#D9D9D9', borderRadius: 12, minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                              <Text style={{ color: '#868696', fontWeight: '500', fontSize: 14 }}>{selectedTask.notesCount ?? 0}</Text>
                            </View>
                          </TouchableOpacity>
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
          </View>
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
