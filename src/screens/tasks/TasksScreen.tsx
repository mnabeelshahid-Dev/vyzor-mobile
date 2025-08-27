import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';

import { Platform } from 'react-native';

const tasks = [
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Active',
    progress: 75,
    devices: 0,
    sections: 2,
    notes: 0,
  },
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Expired',
    progress: 0,
    devices: 0,
    sections: 2,
    notes: 0,
  },
  {
    id: '403124',
    title: 'Manage Guest Check-In Process',
    date: '8 Apr, 12.00 AM - 10 Apr, 08.00 PM',
    status: 'Completed',
    progress: 100,
    devices: 0,
    sections: 2,
    notes: 0,
  },
];

const statusStyles = {
  Active: { color: '#007AFF', bg: '#E6F0FF' },
  Expired: { color: '#FF3B30', bg: '#FFE6E6' },
  Completed: { color: '#34C759', bg: '#E6FFE6' },
};

const TasksScreen = () => {
  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = order => {
    setSortOrder(order);
    setShowSortModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter */}
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
      {/* Tasks List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {tasks
          .filter(b => b.title.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) =>
            sortOrder === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title)
          )
          .map((task, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskId}># {task.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyles[task.status].bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusStyles[task.status].color },
                    ]}
                  >
                    {task.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.dateRow}>
                {/* Replace with calendar icon */}
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>{task.date}</Text>
              </View>
              {/* Progress Bar */}
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: statusStyles[task.status].color,
                        width: `${task.progress}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{task.progress}%</Text>
              </View>
              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with user icon */}
                  <Text style={styles.actionIcon}>👤</Text>
                  <Text style={styles.actionText}>Reassign</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with sections icon */}
                  <Text style={styles.actionIcon}>≡</Text>
                  <Text style={styles.actionText}>Sections</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{task.sections}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with devices icon */}
                  <Text style={styles.actionIcon}>⚙️</Text>
                  <Text style={[styles.actionText, { color: '#A0A4A8' }]}>
                    Devices
                  </Text>
                  <View style={styles.badgeGray}>
                    <Text style={styles.badgeTextGray}>{task.devices}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  {/* Replace with notes icon */}
                  <Text style={styles.actionIcon}>📝</Text>
                  <Text style={[styles.actionText, { color: '#A0A4A8' }]}>
                    Notes
                  </Text>
                  <View style={styles.badgeGray}>
                    <Text style={styles.badgeTextGray}>{task.notes}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Get Started Button */}
              <TouchableOpacity style={styles.startBtn}>
                <Text style={styles.startBtnText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.sortModal}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort By</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.sortModalCloseBtn}
              >
                <View style={styles.sortModalCloseCircle}>
                  <Text
                    style={{
                      fontSize: 22,
                      color: '#007AFF',
                      fontWeight: 'bold',
                    }}
                  >
                    ×
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.sortModalBody}>
              <Text style={styles.sortModalField}>Name</Text>
              <View style={styles.sortModalOrderBtns}>
                <TouchableOpacity
                  style={styles.sortModalOrderBtn}
                  onPress={() => handleSort('desc')}
                >
                  <ArrowDownWard width={22} height={22} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sortModalOrderBtn}
                  onPress={() => handleSort('asc')}
                >
                  <ArrowUpIcon width={22} height={22} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskId: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
    color: '#222B45',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  dateText: {
    color: '#8F9BB3',
    fontSize: 15,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E4E9F2',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#222B45',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sortModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  sortModalCloseBtn: {
    marginLeft: 12,
  },
  sortModalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortModalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortModalField: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
  sortModalOrderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortModalOrderBtn: {
    backgroundColor: '#F2F6FF',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 4,
  },
  badge: {
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  badgeText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  badgeGray: {
    backgroundColor: '#E4E9F2',
    borderRadius: 8,
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  badgeTextGray: {
    color: '#A0A4A8',
    fontWeight: 'bold',
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default TasksScreen;
