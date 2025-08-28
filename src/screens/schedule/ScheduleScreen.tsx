import React, { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import LeftArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';

// Color constants
const BLUE = '#1292E6';
const DARK_BLUE = '#184B74';
const GREEN = '#1bc768';
const RED = '#f44336';
const GRAY = '#7A8194';
const BG_GRAY = '#F6F6F6';

const HOUR_LIST = [
  '10.00 AM',
  '11.00 AM',
  '12.00 PM',
  '01.00 PM',
  '02.00 PM',
  '02.30 PM',
  '03.00 PM',
  '04.00 PM',
];

const mockTasks = [
  { id: '1', hour: '12.00 PM', number: '#432678', title: 'Manage guest check-in process', user: 'Adnan Ali', borderColor: GREEN, bg: '#E5F6EC', type: 'main' },
  { id: '2', hour: '12.00 PM', number: '#432678', title: 'Manage guest check-in process', user: 'Adnan Ali', borderColor: RED, bg: '#FCE8E6', type: 'main' },
  { id: '3', hour: '01.00 PM', number: '#432678', title: 'Test task', user: 'Adnan Ali', borderColor: GREEN, bg: '#E5F6EC', type: 'main' },
  { id: '4', hour: '01.00 PM', number: '#432678', title: 'Test task', user: 'Adnan Ali', borderColor: RED, bg: '#FCE8E6', type: 'main' },
  { id: '5', hour: '02.30 PM', number: '#432678', title: 'Test task', user: 'Adnan Ali', borderColor: GREEN, bg: '#E5F6EC', type: 'mini' },
  { id: '6', hour: '03.00 PM', number: '#432678', title: 'Test task', user: 'Adnan Ali', borderColor: GREEN, bg: '#E5F6EC', type: 'main' },
  { id: '7', hour: '03.00 PM', number: '#432678', title: 'Test task', user: 'Adnan Ali', borderColor: RED, bg: '#FCE8E6', type: 'main' },
];

function getTasksByHour(hour: string) {
  return mockTasks.filter((t) => t.hour === hour);
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
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 9)); // 2025-07-09
  const weekDays = getWeekDays(selectedDate);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const isSelectedDay = (dayObj) =>
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
          <LeftArrowIcon width={16} height={16} />
        </TouchableOpacity>
        <Pressable style={styles.headerTitle} onPress={() => setCalendarVisible(true)}>
          <CalendarIcon height={20} width={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>{formattedDate()}</Text>
          <Text style={{ fontSize: 16, fontWeight: '400', color: '#fff' }}> ( 12:00 PM )</Text>
        </Pressable>
        <ThreeDotIcon width={20} height={20} />
      </View>
      {/* Floating Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarModalBox}>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: BLUE,
                },
              }}
              onDayPress={day => {
                setSelectedDate(new Date(day.dateString));
                setCalendarVisible(false);
              }}
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
                <Text style={{ color: '#1292E6', fontSize: 22 }}>{direction === 'left' ? '<' : '>'}</Text>
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
                onPress={() => setSelectedDate(new Date(dayObj.date))}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.dayNumberWrap,
                    selected && styles.dayNumberWrapSelected,
                  ]}
                >
                <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                  {dayObj.label}
                </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      selected && styles.dayNumSelected,
                    ]}
                  >
                    {dayObj.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Agenda */}
        <View style={styles.agendaContainer}>
          <ScrollView
            style={{ flex: 1, }}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {HOUR_LIST.map((hour) => (
              <View key={hour} style={styles.hourBlock}>
                {/* Horizontal grid line */}
                <View style={styles.gridLine} />
                <View style={styles.hourRow}>
                  {/* Time label */}
                  <View style={styles.hourLabelWrap}>
                    <Text style={styles.hourLabel}>{hour}</Text>
                  </View>
                  {/* Tasks */}
                  <View style={styles.tasksRow}>
                    {getTasksByHour(hour).map((item) => (
                      <View
                        key={item.id}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: item.borderColor,
                            backgroundColor: item.bg,
                            minWidth: item.type === 'mini' ? 60 : 100,
                            maxWidth: 140,
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
                            <Text style={styles.taskUserText}>{item.user}</Text>
                          </View>
                        </View>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
            {/* Last grid line */}
            <View style={styles.gridLine} />
          </ScrollView>
        </View>
      </View>

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
    minHeight: 88,
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
  tasksRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 4,
    marginTop: 8,
  },
  taskCard: {
    borderWidth: 1,
    borderRadius: 14,
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
});