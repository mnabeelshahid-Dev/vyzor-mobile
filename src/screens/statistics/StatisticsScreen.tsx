import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';

const tasks = [
  { status: 'onTime', label: 'Test Task for the Branding', color: '#22C55E' },
  { status: 'outside', label: 'Test Task for the Branding', color: '#A855F7' },
  { status: 'expired', label: 'Test Task for the Branding', color: '#EF4444' },
  { status: 'onTime', label: 'Test Task for the Branding', color: '#22C55E' },
  { status: 'outside', label: 'Test Task for the Branding', color: '#A855F7' },
  { status: 'expired', label: 'Test Task for the Branding', color: '#EF4444' },
];

function StatisticsScreen() {
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = order => {
    setSortOrder(order);
    setShowSortModal(false);
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Branches</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={26} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchBarFloatWrap}>
        <View style={styles.searchBarFloat}>
          <SearchIcon width={22} height={22} style={{ marginLeft: 8 }} />
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
          <FilterIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: '#22C55E' }]}>
          <Text style={[styles.statTitle, { color: '#22C55E' }]}>
            On Time task
          </Text>
          <Text style={styles.statValue}>10 of 20</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#A855F7' }]}>
          <Text style={[styles.statTitle, { color: '#A855F7' }]}>
            Outside Period
          </Text>
          <Text style={styles.statValue}>0 of 10</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#EF4444' }]}>
          <Text style={[styles.statTitle, { color: '#EF4444' }]}>
            Expired Task
          </Text>
          <Text style={styles.statValue}>10 of 30</Text>
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
                { backgroundColor: '#A855F7', width: '25%' },
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
        <CalendarIcon width={18} height={18} />
        <Text style={styles.dateRangeText}>
          July 09, 2025 - July 23, 2025 ( 12:00 PM )
        </Text>
      </View>

      {/* Task List */}
      <ScrollView style={{ flex: 1 }}>
        {tasks
          .filter(b => b.label.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) =>
            sortOrder === 'asc'
              ? a.label.localeCompare(b.label)
              : b.label.localeCompare(a.label)
          )
          .map((task, idx) => (
            <View key={idx} style={styles.taskCard}>
              <View
                style={[styles.taskIndicator, { backgroundColor: task.color }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.label}</Text>
                <View style={styles.taskDates}>
                  <Text style={styles.taskDate}>
                    Starting: 15-07-2025 12:00 PM
                  </Text>
                  <Text style={styles.taskDate}>
                    Ending: 15-07-2025 12:00 PM
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 88 : 80,
    paddingBottom: 50,
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
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -48,
    marginHorizontal: 24,
    zIndex: 2,
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#222',
    fontSize: 17,
  },
  filterBtnFloat: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  statTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  progressBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { width: 70, fontSize: 14, color: '#222' },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#222',
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F0FF',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 8,
    marginBottom: 8,
  },
  dateRangeText: {
    marginLeft: 8,
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    elevation: 1,
  },
  taskIndicator: {
    width: 6,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  taskDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  taskDate: { fontSize: 13, color: '#666', marginRight: 12 },
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
export default StatisticsScreen;
