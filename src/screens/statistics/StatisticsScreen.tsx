import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');
const getResponsive = (val: number) => Math.round(val * (width / 390));

// Card colors for statuses
const statusConfig = {
  onTime: { border: '#22C55E', bar: '#22C55E', label: 'On Time task' },
  outside: { border: '#A35F94', bar: '#A35F94', label: 'Outside Period' },
  expired: { border: '#EF4444', bar: '#EF4444', label: 'Expired Task' },
};

const tasks = [
  { status: 'onTime', label: 'Test Task for the Branding', color: '#22C55E' },
  { status: 'outside', label: 'Test Task for the Branding', color: '#A35F94' },
  { status: 'expired', label: 'Test Task for the Branding', color: '#EF4444' },
  { status: 'onTime', label: 'Test Task for the Branding', color: '#22C55E' },
  { status: 'outside', label: 'Test Task for the Branding', color: '#A35F94' },
  { status: 'expired', label: 'Test Task for the Branding', color: '#EF4444' },
];

export default function StatisticsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtered and sorted tasks
  const filteredTasks = tasks
    .filter(b => b.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.label.localeCompare(b.label)
        : b.label.localeCompare(a.label)
    );

  // Responsive styling helpers
  const statCardWidth = (width - getResponsive(16) * 2 - getResponsive(12) * 2) / 3;

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
          onPress={() => setShowSortModal(true)}
        >
          <FilterIcon width={getResponsive(32)} height={getResponsive(32)} />
        </TouchableOpacity>
      </View>

      {/* Content Background */}
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
          data={filteredTasks}
          style={{ flex: 1, marginTop: getResponsive(8) }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={{ paddingBottom: getResponsive(24) }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskCard,
                {
                  borderLeftColor:
                    item.status === 'onTime'
                      ? '#22C55E'
                      : item.status === 'outside'
                        ? '#A35F94'
                        : '#EF4444',
                  borderLeftWidth: getResponsive(4),
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.label}</Text>
                <View style={styles.taskDates}>
                  <Text style={[styles.taskDate,{ fontWeight: '500', color:'#021639F5' }]}>
                    Starting: 15-07-2025 12:00 PM
                  </Text>
                  <Text style={[styles.taskDate,{ fontWeight: '500', color:'#021639F5' }]}>
                    Ending: 15-07-2025 12:00 PM
                  </Text>
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
    marginHorizontal: getResponsive(24),
    zIndex: 2,
    top: getResponsive(25),
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: getResponsive(16),
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
    borderRadius: getResponsive(16),
    padding: getResponsive(10),
    marginLeft: getResponsive(12),
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
    fontSize: getResponsive(15),
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
