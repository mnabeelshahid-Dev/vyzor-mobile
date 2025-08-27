import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ArrowBackIcon from '../../assets/svgs/backArrowIcon.svg';
import CalanderIcon from '../../assets/svgs/calendar.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';

const days = [
  { label: 'Mon', date: 6 },
  { label: 'Tue', date: 7 },
  { label: 'Wed', date: 8 },
  { label: 'Thu', date: 9 },
  { label: 'Fri', date: 10 },
  { label: 'Sat', date: 11 },
  { label: 'Sun', date: 12 },
];

type TimelineSlot = {
  time: string;
  tasks: {
    id: string;
    user: string;
    title: string;
    border: string;
    bg: string;
    tagColor: string;
    textColor: string;
  }[];
};

const mockTimelines: Record<number, TimelineSlot[]> = {
  6: [
    {
      time: '12.00 PM',
      tasks: [
        {
          id: '#432111',
          user: 'Ali Raza',
          title: 'Prepare meeting',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432112',
          user: 'Ali Raza',
          title: 'Review docs',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
    {
      time: '01.00 PM',
      tasks: [
        {
          id: '#432113',
          user: 'Ali Raza',
          title: 'Test task',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432114',
          user: 'Ali Raza',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
  ],
  7: [
    {
      time: '12.00 PM',
      tasks: [
        {
          id: '#432115',
          user: 'Sara Khan',
          title: 'Design review',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432116',
          user: 'Sara Khan',
          title: 'Client call',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
    {
      time: '03.00 PM',
      tasks: [
        {
          id: '#432117',
          user: 'Sara Khan',
          title: 'Test task',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432118',
          user: 'Sara Khan',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
  ],
  8: [
    {
      time: '01.00 PM',
      tasks: [
        {
          id: '#432119',
          user: 'John Doe',
          title: 'Code review',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432120',
          user: 'John Doe',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
    {
      time: '03.00 PM',
      tasks: [
        {
          id: '#432121',
          user: 'John Doe',
          title: 'Test task',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432122',
          user: 'John Doe',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
  ],
  9: [
    {
      time: '12.00 PM',
      tasks: [
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Manage guest check-in process',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Manage guest check-in process',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
    {
      time: '01.00 PM',
      tasks: [
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Test task',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
    {
      time: '03.00 PM',
      tasks: [
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Test task',
          border: '#22C55E',
          bg: '#EAF8F0',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
        {
          id: '#432678',
          user: 'Adnan Ali',
          title: 'Test task',
          border: '#EF4444',
          bg: '#FDE6E6',
          tagColor: '#155E91',
          textColor: '#155E91',
        },
      ],
    },
  ],
  10: [],
  11: [],
  12: [],
};

const timeSlots = [
  '10.00 AM',
  '11.00 PM',
  '12.00 PM',
  '01.00 PM',
  '02.00 PM',
  '03.00 PM',
  '04.00 PM',
];

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState<number>(9);

  const timeline = mockTimelines[selectedDay] || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <ArrowBackIcon width={24} height={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CalanderIcon width={24} height={24} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>July 09, 2025 ( 12:00 PM )</Text>
        </View>
        <ThreeDotIcon width={23} height={23} />
      </View>

      {/* Days Row */}
      <View style={styles.daysRow}>
        {days.map((d, idx) => (
          <TouchableOpacity
            key={idx}
            style={d.date === selectedDay ? styles.activeDay : styles.day}
            onPress={() => setSelectedDay(d.date)}
          >
            <Text
              style={
                d.date === selectedDay ? styles.activeDayLabel : styles.dayLabel
              }
            >
              {d.label}
            </Text>
            <Text
              style={
                d.date === selectedDay ? styles.activeDayDate : styles.dayDate
              }
            >
              {d.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.timeline}>
          {timeSlots.map((time, idx) => {
            const slot = timeline.find(t => t.time === time);
            return (
              <View key={idx} style={styles.timeRow}>
                <Text style={styles.timeLabel}>{time}</Text>
                {/* Timeline indicator for 12.00 PM */}
                {time === '12.00 PM' && (
                  <View style={styles.timelineIndicatorRow}>
                    <View style={styles.timelineIndicatorDot} />
                    <View style={styles.timelineIndicatorLine} />
                  </View>
                )}
                {slot && (
                  <View style={styles.tasksRow}>
                    {slot.tasks.map((task, tIdx) => (
                      <View
                        key={tIdx}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: task.border,
                            backgroundColor: task.bg,
                          },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <Text style={styles.taskId}>{task.id}</Text>
                          <View
                            style={[
                              styles.userTag,
                              { borderColor: task.tagColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.userTagText,
                                { color: task.tagColor },
                              ]}
                            >
                              {task.user}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[styles.taskTitle, { color: task.textColor }]}
                        >
                          {task.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  daysRow: {
    flexDirection: 'row',
    backgroundColor: '#155E91',
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  day: { alignItems: 'center', flex: 1 },
  activeDay: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginHorizontal: 2,
    paddingVertical: 4,
  },
  dayLabel: { color: '#fff', fontSize: 13, marginBottom: 2 },
  dayDate: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  activeDayLabel: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  activeDayDate: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timeline: { paddingHorizontal: 16, paddingTop: 8 },
  timeRow: { marginBottom: 24, position: 'relative' },
  timeLabel: { color: '#888', fontSize: 15, marginBottom: 8 },
  tasksRow: { flexDirection: 'row', gap: 12 },
  taskCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 10,
    marginRight: 8,
    minWidth: 140,
    maxWidth: 180,
  },
  taskId: { color: '#666', fontSize: 13, marginRight: 8 },
  userTag: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  userTagText: { fontSize: 12, fontWeight: 'bold' },
  taskTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  timelineIndicatorRow: {
    position: 'absolute',
    left: -16,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  timelineIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginRight: 2,
  },
  timelineIndicatorLine: {
    width: 60,
    height: 2,
    backgroundColor: '#007AFF',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
  },
});
