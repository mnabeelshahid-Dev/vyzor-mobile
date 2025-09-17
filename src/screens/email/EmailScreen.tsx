import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';
import CalendarIcon from '../../assets/svgs/calendar.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { useLogout } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { apiService } from '../../services/api';

const STATUS_COLORS = {
  SUCCESS: '#28B446',
  FAILED: '#E4190A',
  PENDING: '#9C528B',
};

const FILTER_OPTIONS = {
  to: ['All', 'jack@vyzor.com', 'jill@vyzor.com'],
  type: [
    'All',
    'Create User',
    'Event Created',
    'Event Document',
    'Document Completed',
    'Document Expired',
    'Document Deleted',
    'Document Created',
    'Password Reset',
    'User Updated'
  ],
  status: ['All', 'Pending', 'Failed', 'Success'],
};

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

  return `${dd}-${mm}-${yyyy} at ${hours}:${minutes} ${ampm}`;
}

export default function EmailNotificationsScreen({ navigation }) {
  const [filterModal, setFilterModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    to: 'All',
    type: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });
  const [dropdown, setDropdown] = useState({ field: null, visible: false });
  const [datePicker, setDatePicker] = useState({ field: null, show: false });

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

  const { width } = useWindowDimensions();
  const isSmall = width < 350;
  const containerPadding = Math.max(12, width * 0.04);
  const modalWidth = Math.min(420, width - 2 * containerPadding);

  const getEmailParams = () => {
    const params = new URLSearchParams();
    params.append('page', '0');
    params.append('size', '20');
    params.append('search', search || '');
    params.append('sort', 'createdDate,desc');
    if (filters.to && filters.to !== 'All') params.append('to', filters.to);
    if (filters.type && filters.type !== 'All') params.append('emailType', filters.type);
    if (filters.status && filters.status !== 'All') {
      // Map status to uppercase enum value
      params.append('status', filters.status.toUpperCase());
    }
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return params.toString();
  };

  const {
    data: emailData,
    isLoading: loadingEmails,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['emails', filters, search],
    queryFn: async () => {
      const params = getEmailParams();
      try {
        const response = await apiService.get(`/api/notification/emails?${params}`);
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray((response.data as { content?: unknown[] }).content)) return (response.data as { content: unknown[] }).content;
        if (response.data && Array.isArray((response.data as { content?: unknown[] }).content)) return (response.data as { content: unknown[] }).content;
        return [];
      } catch (err) {
        console.error('Emails API fetch error:', err);
        return [];
      }
    },
  });
  const emails = Array.isArray(emailData) ? emailData : [];

  useEffect(() => {
      refetch();
    }, [refetch]
  );

  // Filtering logic
  const filteredEmails = emails.filter(item => {
    if (filters.to !== 'All' && item.email !== filters.to) return false;
    if (filters.type !== 'All' && item.title !== filters.type) return false;
    if (filters.status !== 'All' && item.status !== filters.status) return false;
    if (filters.startDate) {
      const [sday, smonth, syear] = filters.startDate.split('-');
      const itemDate = new Date(item.date.split(' at')[0].split('-').reverse().join('-'));
      const filterDate = new Date(`${syear}-${smonth}-${sday}`);
      if (itemDate < filterDate) return false;
    }
    if (filters.endDate) {
      const [eday, emonth, eyear] = filters.endDate.split('-');
      const itemDate = new Date(item.date.split(' at')[0].split('-').reverse().join('-'));
      const filterDate = new Date(`${eyear}-${emonth}-${eday}`);
      if (itemDate > filterDate) return false;
    }
    if (
      search &&
      !(
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const renderEmail = ({ item: { subject = "", recipientEmails = "", startDate = "", status = "" } }) => (
    <View style={[styles.emailRow, { padding: containerPadding }]}>
      <View style={styles.emailTextBlock}>
        <Text style={styles.emailTitle}>{subject}</Text>
        <Text style={styles.emailAddress}>{recipientEmails}</Text>
      </View>
      <View style={styles.emailMetaBlock}>
        <Text style={styles.emailDate}>{formatDate(startDate)}</Text>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: STATUS_COLORS[status],
              borderColor: STATUS_COLORS[status],
            },
          ]}
        >
          <Text style={[styles.statusText]}>{status}</Text>
        </View>
      </View>
    </View>
  );

  // Responsive font
  const labelFont = isSmall ? 13 : 16;
  const inputHeight = isSmall ? 38 : 44;

  // Dropdown menu (now: overlays just under input, no red dot, matches Figma)
  const getToOptions = () => {
    // Always start with 'All'
    const userNames = emails
      .flatMap(email => Array.isArray(email.emailRecipientModel) ? email.emailRecipientModel.map(r => r.name) : [])
      .filter(Boolean);
    // Remove duplicates
    const uniqueNames = Array.from(new Set(userNames));
    return [ ...uniqueNames];
  };

  const renderDropdown = (field) => {
    if (!(dropdown.visible && dropdown.field === field)) return null;
    let options = FILTER_OPTIONS[field];
    if (field === 'to') {
      options = getToOptions();
    }
    return (
      <View style={styles.dropdownOverlay}>
        <View style={[styles.dropdownMenu, { maxHeight: 260 }]}> {/* Increased maxHeight for more scrollable area */}
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setFilters((f) => ({ ...f, [field]: item }));
                  setDropdown({ field: null, visible: false });
                }}
              >
                <Text
                  style={[styles.dropdownText, filters[field] === item && { color: '#1292E6', fontWeight: 'bold' }]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </View>
      </View>
    );
  };

  // Date picker (native)
  const renderDatePicker = (field) =>
    datePicker.show && datePicker.field === field ? (
      <DateTimePicker
        value={
          filters[field]
            ? new Date(filters[field].split('-').reverse().join('-'))
            : new Date()
        }
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedDate) => {
          setDatePicker({ field: null, show: false });
          if (selectedDate) {
            setFilters((f) => ({
              ...f,
              [field]: formatDate(selectedDate),
            }));
          }
        }}
      />
    ) : null;

  // Helper to show value or placeholder for dropdowns & dates
  const getInputText = (field, isDate = false) => {
    if (isDate) {
      if (filters[field]) {
        return <Text style={{ fontSize: labelFont, color: '#184B74', flex: 1, textAlign: 'left' }}>{filters[field]}</Text>;
      } else {
        return <Text style={{ fontSize: labelFont, color: '#7A8194', flex: 1, textAlign: 'left' }}>{field === 'startDate' ? 'Start Date' : 'End Date'}</Text>;
      }
    }
    // Dropdown fields
    let placeholder = '';
    if (field === 'to') placeholder = 'To';
    if (field === 'type') placeholder = 'Email Type';
    if (field === 'status') placeholder = 'Status';
    if (!filters[field] || filters[field] === 'All') {
      return <Text style={{ fontSize: labelFont, color: '#7A8194', flex: 1, textAlign: 'left', fontWeight: '400' }}>{placeholder}</Text>;
    }
    return <Text style={{ fontSize: labelFont, color: '#184B74', flex: 1, textAlign: 'left', fontWeight: '600' }}>{filters[field]}</Text>;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email Notifications</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={20} height={20} onPress={() => setShowDropdown(true)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchBarFloatWrap}>
        <View style={styles.searchBarFloat}>
          <SearchIcon width={25} height={25} style={{ marginLeft: 8 }} />
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
          <FilterIcon width={25} height={25} />
        </TouchableOpacity>
      </View>
      {/* Branches List */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop: 50,
          paddingHorizontal: 16,
        }}
      >
        {/* Email List */}
        <FlatList
          data={filteredEmails}
          keyExtractor={(item) => item.id}
          renderItem={renderEmail}
          style={styles.emailList}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFilterModal(false)}
        >
          <Pressable
            style={[
              styles.modalBox,
              {
                width: modalWidth,
                padding: Math.max(16, modalWidth * 0.06),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              // style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontSize: labelFont }]}>Filter Options</Text>
                <TouchableOpacity
                  style={styles.closeBtnWrap}
                  onPress={() => setFilterModal(false)}
                >
                  <Text style={styles.closeBtn}>×</Text>
                </TouchableOpacity>
              </View>
              {/* Filter Fields */}
              {['to', 'type', 'status'].map((field) => (
                <View key={field} style={{ marginBottom: 16, zIndex: dropdown.visible && dropdown.field === field ? 999 : 1 }}>
                  <TouchableOpacity
                    style={[
                      styles.filterInput,
                      { height: inputHeight },
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      setDropdown({ field, visible: !dropdown.visible || dropdown.field !== field })
                    }
                  >
                    {getInputText(field, false)}
                    <Text style={{ fontSize: 13, color: '#A6B0C3', marginLeft: 'auto' }}>▼</Text>
                  </TouchableOpacity>
                  {dropdown.visible && dropdown.field === field && renderDropdown(field)}
                </View>
              ))}
              <TouchableOpacity
                style={[styles.filterInput, { flex: 1, height: inputHeight, marginBottom: 15 }]}
                onPress={() => setDatePicker({ field: 'startDate', show: true })}
                activeOpacity={0.7}
              >
                {getInputText('startDate', true)}
                <CalendarIcon width={16} height={16} color={'#A6B0C3'} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              {renderDatePicker('startDate')}
              <TouchableOpacity
                style={[styles.filterInput, { flex: 1, height: inputHeight }]}
                onPress={() => setDatePicker({ field: 'endDate', show: true })}
                activeOpacity={0.7}
              >
                {getInputText('endDate', true)}
                <CalendarIcon width={16} height={16} color={'#A6B0C3'} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
              {renderDatePicker('endDate')}
              {/* Buttons */}
              <View style={styles.filterBtnRow}>
                <TouchableOpacity
                  style={[styles.clearBtn, { flex: 1, height: inputHeight * 0.95 }]}
                  onPress={() =>
                    setFilters({
                      to: 'All',
                      type: 'All',
                      status: 'All',
                      startDate: '',
                      endDate: '',
                    })
                  }
                >
                  <Text style={{ color: '#1292E6', fontWeight: '600', fontSize: labelFont }}>
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applyBtn, { flex: 1, height: inputHeight * 0.95 }]}
                  onPress={() => setFilterModal(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: labelFont }}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

         {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlayIcon}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenuIcon}>
            <TouchableOpacity
              style={styles.dropdownItemIcon}
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
                <Text style={styles.dropdownTextIcon}>Settings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItemIcon}
              onPress={handleLogout}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
                <Text style={styles.dropdownTextIcon}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1292E6',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
    // paddingBottom: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 20,
    marginHorizontal: 24,
    zIndex: 2,
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#222',
    fontSize: 18,
  },
  filterBtnFloat: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 14,
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
  dropdownOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 44,
    zIndex: 1001,
    alignItems: 'flex-start',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    minWidth: 210,
    maxWidth: 340,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  emailList: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  emailRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    elevation: 1,
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#1292E6',
  },
  emailTextBlock: {
    flex: 1.6,
    justifyContent: 'center',
  },
  emailTitle: {
    color: '#111111ff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  emailAddress: {
    color: '#1292E6',
    fontSize: 12,
    fontWeight: '400',
  },
  emailMetaBlock: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  emailDate: {
    color: '#7A8194',
    fontSize: 11,
    marginBottom: 7,
  },
  statusPill: {
    borderRadius: 8,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 64,
  },
  statusText: {
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'center',
    color: '#fff',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    minHeight: 340,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 15,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#111111ff',
    fontWeight: '600',
  },
  closeBtnWrap: {
    backgroundColor: '#0088E71A',
    borderRadius: 50,
    paddingHorizontal: 7,
    paddingBottom: 1,
  },
  closeBtn: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 0,
    marginTop: -1,
  },
  filterInput: {
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D5D8E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  filterBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#1292E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  applyBtn: {
    backgroundColor: '#1292E6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  bottomNav: {
    height: 62,
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
    color: '#7A8194',
  },
    dropdownOverlayIcon: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
    dropdownMenuIcon: {
    marginTop: Platform.OS === 'ios' ? 90 : 85,
    marginRight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // elevation: 8,
  },
  dropdownItemIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownTextIcon: {
    fontSize: 16,
    color: '#1A1A1A',
  },
});