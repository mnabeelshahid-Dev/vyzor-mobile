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
import Modal from 'react-native-modal';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import ClanderIcon from '../../assets/svgs/calendar.svg';

const emails = [
  {
    subject: 'Document Created',
    email: 'jack@vyzor.com',
    date: '11-08-2025 at 4:14 pm',
    status: 'Success',
  },
  {
    subject: 'Document Created',
    email: 'jack@vyzor.com',
    date: '11-08-2025 at 4:14 pm',
    status: 'Failed',
  },
  {
    subject: 'Document Created',
    email: 'jack@vyzor.com',
    date: '11-08-2025 at 4:14 pm',
    status: 'Pending',
  },
  {
    subject: 'Document Created',
    email: 'jack@vyzor.com',
    date: '11-08-2025 at 4:14 pm',
    status: 'Success',
  },
  {
    subject: 'Document Created',
    email: 'jack@vyzor.com',
    date: '11-08-2025 at 4:14 pm',
    status: 'Failed',
  },
];

const statusColors = {
  Success: '#22B573',
  Failed: '#E53935',
  Pending: '#8E44AD',
};

const EmailScreen = () => {
  const [search, setSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTo, setSelectedTo] = useState('');
  const [selectedEmailType, setSelectedEmailType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email Notifications</Text>
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
          onPress={() => setShowFilterModal(true)}
        >
          <FilterIcon width={22} height={22} />
        </TouchableOpacity>
        {/* Filter Modal */}
        <Modal
          style={{ width: '100%' }}
          isVisible={showFilterModal}
          animationIn="fadeIn"
          animationOut="fadeOut"
        >
          <TouchableOpacity onPress={() => setShowFilterModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableOpacity>
          <View style={styles.filterModalWrap}>
            <View style={styles.filterModal}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter Options</Text>
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  style={styles.filterModalCloseBtn}
                >
                  <View style={styles.filterModalCloseCircle}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#007AFF',
                        fontWeight: 'bold',
                      }}
                    >
                      ×
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Dropdowns and Date Pickers */}
              <View style={styles.filterModalBody}>
                {/* To Dropdown */}
                <TouchableOpacity style={styles.filterDropdown}>
                  <Text style={styles.filterDropdownText}>
                    {selectedTo || 'To'}
                  </Text>
                  <Text style={styles.filterDropdownArrow}>▼</Text>
                </TouchableOpacity>
                {/* Email Type Dropdown */}
                <TouchableOpacity style={styles.filterDropdown}>
                  <Text style={styles.filterDropdownText}>
                    {selectedEmailType || 'Email Type'}
                  </Text>
                  <Text style={styles.filterDropdownArrow}>▼</Text>
                </TouchableOpacity>
                {/* Status Dropdown */}
                <TouchableOpacity style={styles.filterDropdown}>
                  <Text style={styles.filterDropdownText}>
                    {selectedStatus || 'Status'}
                  </Text>
                  <Text style={styles.filterDropdownArrow}>▼</Text>
                </TouchableOpacity>
                {/* Start Date Picker */}
                <TouchableOpacity style={styles.filterDropdown}>
                  <Text style={styles.filterDropdownText}>
                    {startDate || 'Start Date'}
                  </Text>
                  <ClanderIcon height={25} width={25} />
                </TouchableOpacity>
                {/* End Date Picker */}
                <TouchableOpacity style={styles.filterDropdown}>
                  <Text style={styles.filterDropdownText}>
                    {endDate || 'End Date'}
                  </Text>
                  <ClanderIcon height={25} width={25} />
                </TouchableOpacity>
              </View>
              {/* Buttons */}
              <View style={styles.filterModalActions}>
                <TouchableOpacity style={styles.filterModalBtn}>
                  <Text style={styles.filterModalBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterModalBtn,
                    { backgroundColor: '#007AFF' },
                  ]}
                >
                  <Text style={[styles.filterModalBtnText, { color: '#fff' }]}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Search Bar */}

      {/* Email List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {emails
          .filter(
            e =>
              e.subject.toLowerCase().includes(search.toLowerCase()) ||
              e.email.toLowerCase().includes(search.toLowerCase())
          )
          .map((item, idx) => (
            <View key={idx} style={styles.emailCard}>
              <View style={styles.leftBorder} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emailSubject}>{item.subject}</Text>
                <Text style={styles.emailAddress}>{item.email}</Text>
              </View>
              <View
                style={{ alignItems: 'flex-end', justifyContent: 'center' }}
              >
                <Text style={styles.emailDate}>{item.date}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors[item.status] },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
  listContent: {
    paddingTop: 32,
    paddingBottom: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    zIndex: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
    position: 'relative',
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 24,
    marginTop: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  leftBorder: {
    width: 5,
    height: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
    marginRight: 14,
  },
  emailSubject: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  emailAddress: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  emailDate: {
    fontSize: 13,
    color: '#222',
    marginBottom: 6,
    textAlign: 'right',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    minWidth: 70,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 10,
  },
  filterModalWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  filterModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  filterModalCloseBtn: {
    marginLeft: 12,
  },
  filterModalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModalBody: {
    marginBottom: 18,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#222',
  },
  filterDropdownArrow: {
    fontSize: 18,
    color: '#222',
    marginLeft: 8,
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filterModalBtn: {
    flex: 1,
    backgroundColor: '#F2F6FF',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  filterModalBtnText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default EmailScreen;
