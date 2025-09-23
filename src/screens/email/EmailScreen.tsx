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
  ActivityIndicator,
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
    { key: 'All', value: 'All' },
    { key: 'User Created', value: 'Create User' },
    { key: 'Event Created', value: 'Scheduled Event' },
    { key: 'Event Document', value: 'Event Form' },
    { key: 'Document Completed', value: 'Document Completed' },
    { key: 'Document Expired', value: 'Document Expired' },
    { key: 'Document Deleted', value: 'Document Deleted' },
    { key: 'Document Created', value: 'Document Created' },
    { key: 'Document Updated', value: 'Document Updated' },
    { key: 'Password Reset', value: 'Password Reset' },
    { key: 'User Updated', value: 'Update User' },
  ],
  status: ['All', 'Pending', 'Failed', 'Success'],
};
function formatDate(dateStrOrObj: string | Date = ''): string {
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

  return `${dd}-${mm}-${yyyy}`;
}

export default function EmailNotificationsScreen({ navigation }) {
  const [filterModal, setFilterModal] = useState(false);
  const [search, setSearch] = useState('');

  // Add this helper function after the formatDate function
  function isUserAdmin(userData: any): boolean {
    if (!userData || !userData.userRoleModels) return false;
    return userData.userRoleModels.some(
      (role: any) => role.name && role.name.toLowerCase() === 'admin',
    );
  }

  // Replace the existing usersData query with this:
  const { data: currentUserData, isLoading: loadingCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await apiService.get(
          '/api/security/userAccounts/currentUser/',
        );
        return response.data || null;
      } catch (err) {
        console.error('Current User API fetch error:', err);
        return null;
      }
    },
  });

  // Add this new query for all users (only for admins)
  const { data: allUsersData, isLoading: loadingAllUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        const response = await apiService.get('/api/security/filter/USERS');
        return Array.isArray(response.data) ? response.data : [];
      } catch (err) {
        console.error('Users API fetch error:', err);
        return [];
      }
    },
    enabled: currentUserData ? isUserAdmin(currentUserData) : false, // Only fetch if user is admin
  });

  // Add these variables after the queries
  const isAdmin = currentUserData ? isUserAdmin(currentUserData) : false;
  const usersData = isAdmin
    ? allUsersData
    : currentUserData
    ? [currentUserData]
    : [];
  const loadingUsers = isAdmin ? loadingAllUsers : loadingCurrentUser;

  const [filters, setFilters] = useState({
    to: 'All',
    toUserId: '', // This will be set when current user data loads
    type: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });
  const [dropdown, setDropdown] = useState({ field: null, visible: false });
  const [datePicker, setDatePicker] = useState({ field: null, show: false });

  const [showDropdown, setShowDropdown] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    to: 'All',
    toUserId: '', // This will be set when current user data loads
    type: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
  });

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
  params.append('search', debouncedSearch || '');
  params.append('sort', 'createdDate,desc');

  // For non-admins, always use current user ID
  // For admins, use selected user or all users
  if (!isAdmin) {
    // Non-admin: always use current user ID
    const currentUserId = currentUserData ? currentUserData.webId.toString() : '';
    if (currentUserId) {
      params.append('userIds', currentUserId);
    }
  } else {
    // Admin: use selected user ID if not 'All'
    if (appliedFilters.toUserId && appliedFilters.toUserId !== 'All') {
      params.append('userIds', appliedFilters.toUserId);
    }
    // If 'All' or no selection, don't add userIds param to get all users
  }

  if (appliedFilters.type && appliedFilters.type !== 'All') {
    const typeOption = FILTER_OPTIONS.type.find(
      opt => opt.key === appliedFilters.type,
    );
    const typeValue = typeOption ? typeOption.value : appliedFilters.type;
    params.append('type', typeValue.toUpperCase().replace(/ /g, '_'));
  }

  if (appliedFilters.status && appliedFilters.status !== 'All') {
    params.append('status', appliedFilters.status.toUpperCase());
  }

// Start date - beginning of day (00:00:00) in UTC
if (appliedFilters.startDate) {
  const startDate = new Date(
    appliedFilters.startDate.split('-').reverse().join('-'),
  );
  const formattedStartDate = startDate.toISOString().slice(0, 19) + 'Z';
  params.append('startDate', formattedStartDate);
}

// End date - end of day (23:59:59) in UTC
if (appliedFilters.endDate) {
  const endDate = new Date(
    appliedFilters.endDate.split('-').reverse().join('-'),
  );
  // Set to end of day (23:59:59)
  endDate.setHours(23, 59, 59, 999);
  const formattedEndDate = endDate.toISOString().slice(0, 19) + 'Z';
  params.append('endDate', formattedEndDate);
}

  return params.toString();
};

  const {
    data: emailData,
    isLoading: loadingEmails,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['emails', appliedFilters, debouncedSearch], // Changed from filters to appliedFilters
    queryFn: async () => {
      const params = getEmailParams();
      try {
        const response = await apiService.get(
          `/api/notification/emails?${params}`,
        );
        console.log('Email API Params:', params);
        if (Array.isArray(response.data)) return response.data;
        if (
          response.data &&
          Array.isArray((response.data as { content?: unknown[] }).content)
        )
          return (response.data as { content: unknown[] }).content;
        return [];
      } catch (err) {
        console.error('Emails API fetch error:', err);
        return [];
      }
    },
  });
  const emails = Array.isArray(emailData) ? emailData : [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Replace the existing useEffect that sets initial user data with this:
  useEffect(() => {
    if (currentUserData) {
      const currentUserId = currentUserData.webId.toString();
      const currentUserName = currentUserData.firstName;

      if (isAdmin) {
        // For admins, set to 'All' initially
        setFilters(prev => ({
          ...prev,
          to: 'All',
          toUserId: 'All',
        }));

        setAppliedFilters(prev => ({
          ...prev,
          to: 'All',
          toUserId: 'All',
        }));
      } else {
        // For non-admins, always set to current user
        setFilters(prev => ({
          ...prev,
          to: currentUserName,
          toUserId: currentUserId,
        }));

        setAppliedFilters(prev => ({
          ...prev,
          to: currentUserName,
          toUserId: currentUserId,
        }));
      }
    }
  }, [currentUserData, isAdmin]);

  // Helper function to get cleared filters with current user
  // Replace the existing getClearedFiltersWithCurrentUser function with this:
  const getClearedFiltersWithCurrentUser = () => {
    if (isAdmin) {
      return {
        to: 'All',
        toUserId: 'All',
        type: 'All',
        status: 'All',
        startDate: '',
        endDate: '',
      };
    } else {
      const currentUserId = currentUserData
        ? currentUserData.webId.toString()
        : '';
      const currentUserName = currentUserData
        ? currentUserData.firstName
        : 'All';

      return {
        to: currentUserName,
        toUserId: currentUserId,
        type: 'All',
        status: 'All',
        startDate: '',
        endDate: '',
      };
    }
  };

  // Filtering logic
  const filteredEmails = emails;

  const renderEmail = ({
    item: { subject = '', recipientEmails = '', startDate = '', status = '' },
  }) => (
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
  // const getToOptions = () => {
  //   if (!usersData || !Array.isArray(usersData)) return ['All'];
  //   const userOptions = usersData.map(user => ({
  //     text: user.text,
  //     value: user.value,
  //   }));
  //   return [{ text: 'All', value: 'All' }, ...userOptions];
  // };

  // const getToOptions = () => {
  //   if (!usersData || !Array.isArray(usersData) || usersData.length === 0)
  //     return ['All'];
  //   const userOptions = usersData.map(user => ({
  //     text: user.firstName,
  //     value: user.webId.toString(),
  //   }));
  //   // return [{ text: 'All', value: 'All' }, ...userOptions];
  //   return [...userOptions];
  // };

  const getToOptions = () => {
    if (!usersData || !Array.isArray(usersData) || usersData.length === 0)
      return isAdmin ? [{ text: 'All', value: 'All' }] : [];

    const userOptions = usersData.map(user => ({
      text: user.firstName || user.text,
      value: user.webId ? user.webId.toString() : user.value,
    }));

    return isAdmin
      ? [{ text: 'All', value: 'All' }, ...userOptions]
      : userOptions;
  };

  const renderDropdown = field => {
    if (!(dropdown.visible && dropdown.field === field)) return null;
    let options = FILTER_OPTIONS[field];
    let optionsToRender = [];

    if (field === 'to') {
      const userOptions = getToOptions();
      optionsToRender = userOptions;
    } else if (field === 'type') {
      // Handle key-value pairs for type
      optionsToRender = options.map(opt => ({
        text: opt.key,
        value: opt.value,
      }));
    } else {
      // Handle simple arrays for other fields
      optionsToRender = options.map(opt => ({ text: opt, value: opt }));
    }

    return (
      <View
        style={[
          styles.dropdownOverlay,
          { position: 'relative', top: 0, zIndex: 1000 },
        ]}
      >
        <View style={[styles.dropdownMenu, { maxHeight: 150 }]}>
          <ScrollView
            style={{ maxHeight: 150 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
            nestedScrollEnabled={true}
          >
            {optionsToRender.map((item, index) => (
              <TouchableOpacity
                key={`${field}-${index}`}
                style={styles.dropdownItem}
                onPress={() => {
                  if (field === 'to') {
                    setFilters(f => ({
                      ...f,
                      to: item.text,
                      toUserId: item.value,
                    }));
                  } else {
                    setFilters(f => ({
                      ...f,
                      [field]: item.text || item.value,
                    }));
                  }
                  setDropdown({ field: null, visible: false });
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    filters[field] === (item.text || item.value) && {
                      color: '#1292E6',
                      fontWeight: 'bold',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.text || item.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Date picker (native)
  const renderDatePicker = field =>
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
            setFilters(f => ({
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
        return (
          <Text
            style={{
              fontSize: labelFont,
              color: '#184B74',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {filters[field]}
          </Text>
        );
      } else {
        return (
          <Text
            style={{
              fontSize: labelFont,
              color: '#7A8194',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {field === 'startDate' ? 'Start Date' : 'End Date'}
          </Text>
        );
      }
    }
    // Dropdown fields
    let placeholder = '';
    if (field === 'to') placeholder = 'To';
    if (field === 'type') placeholder = 'Email Type';
    if (field === 'status') placeholder = 'Status';
    if (!filters[field] || filters[field] === 'All') {
      return (
        <Text
          style={{
            fontSize: labelFont,
            color: '#7A8194',
            flex: 1,
            textAlign: 'left',
            fontWeight: '400',
          }}
        >
          {placeholder}
        </Text>
      );
    }
    return (
      <Text
        style={{
          fontSize: labelFont,
          color: '#184B74',
          flex: 1,
          textAlign: 'left',
          fontWeight: '600',
        }}
      >
        {filters[field]}
      </Text>
    );
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
            <ThreeDotIcon
              width={20}
              height={20}
              onPress={() => setShowDropdown(true)}
            />
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
        {/* Loading State */}
        {loadingEmails ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading emails...</Text>
          </View>
        ) : isError ? (
          /* Error State */
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {error?.message || 'Unable to fetch emails. Please try again.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEmails.length === 0 ? (
          /* No Data State */
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataTitle}>No emails found</Text>
            {/* <Text style={styles.noDataMessage}>
              No data found for this query or filter. Try adjusting your search
              criteria.
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                const clearedFilters = getClearedFiltersWithCurrentUser();
                setFilters(clearedFilters);
                setAppliedFilters(clearedFilters);
                setDropdown({ field: null, visible: false });
                setFilterModal(false);
              }}
            >
              <Text style={styles.clearFiltersButtonText}>
                Clear All Filters
              </Text>
            </TouchableOpacity> */}
          </View>
        ) : (
          /* Email List */
          <FlatList
            data={filteredEmails}
            keyExtractor={(item, index) =>
              item.id?.toString() || `email-${index}`
            }
            renderItem={renderEmail}
            style={styles.emailList}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshing={loadingEmails}
            onRefresh={refetch}
          />
        )}
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
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: labelFont }]}>
                Filter Options
              </Text>
              <TouchableOpacity
                style={styles.closeBtnWrap}
                onPress={() => {
                  const clearedFilters = getClearedFiltersWithCurrentUser();
                  setFilters(clearedFilters);
                  setAppliedFilters(clearedFilters);
                  setDropdown({ field: null, visible: false });
                  setFilterModal(false);
                }}
              >
                <Text style={styles.closeBtn}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* Filter Fields */}
              {(isAdmin ? ['to', 'type', 'status'] : ['type', 'status']).map(
                field => (
                  <View
                    key={field}
                    style={{
                      marginBottom: 16,
                      zIndex:
                        dropdown.visible && dropdown.field === field ? 999 : 1,
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.filterInput, { height: inputHeight }]}
                      activeOpacity={0.7}
                      onPress={() =>
                        setDropdown({
                          field,
                          visible:
                            !dropdown.visible || dropdown.field !== field,
                        })
                      }
                    >
                      {getInputText(field, false)}
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#A6B0C3',
                          marginLeft: 'auto',
                        }}
                      >
                        ▼
                      </Text>
                    </TouchableOpacity>
                    {dropdown.visible &&
                      dropdown.field === field &&
                      renderDropdown(field)}
                  </View>
                ),
              )}
              <TouchableOpacity
                style={[
                  styles.filterInput,
                  { flex: 1, height: inputHeight, marginBottom: 15 },
                ]}
                onPress={() =>
                  setDatePicker({ field: 'startDate', show: true })
                }
                activeOpacity={0.7}
              >
                {getInputText('startDate', true)}
                <CalendarIcon
                  width={16}
                  height={16}
                  color={'#A6B0C3'}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
              {renderDatePicker('startDate')}
              <TouchableOpacity
                style={[styles.filterInput, { flex: 1, height: inputHeight }]}
                onPress={() => setDatePicker({ field: 'endDate', show: true })}
                activeOpacity={0.7}
              >
                {getInputText('endDate', true)}
                <CalendarIcon
                  width={16}
                  height={16}
                  color={'#A6B0C3'}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
              {renderDatePicker('endDate')}
              {/* Buttons */}
              <View style={styles.filterBtnRow}>
                <TouchableOpacity
                  style={[
                    styles.clearBtn,
                    { flex: 1, height: inputHeight * 0.95 },
                  ]}
                  onPress={() => {
                    const clearedFilters = getClearedFiltersWithCurrentUser();
                    setFilters(clearedFilters);
                    setAppliedFilters(clearedFilters);
                    setDropdown({ field: null, visible: false });
                    setFilterModal(false);
                  }}
                >
                  <Text
                    style={{
                      color: '#1292E6',
                      fontWeight: '600',
                      fontSize: labelFont,
                    }}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.applyBtn,
                    {
                      flex: 1,
                      height: inputHeight * 0.95,
                      opacity: loadingEmails ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    setAppliedFilters({
                      ...filters,
                      toUserId: filters.toUserId || 'All',
                    });
                    setDropdown({ field: null, visible: false });
                    setFilterModal(false);
                  }}
                  disabled={loadingEmails}
                >
                  {loadingEmails ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: labelFont,
                      }}
                    >
                      Apply Filters
                    </Text>
                  )}
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    minWidth: 210,
    maxWidth: 340,
    maxHeight: 200, // Add fixed max height
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 7,
  },
  closeBtn: {
    fontSize: 22,
    color: '#007AFF',
    // fontWeight: 'bold',
    marginLeft: 0,
    marginTop: -4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E4190A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#6c6c6cff',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1292E6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#1292E6',
    fontSize: 16,
    fontWeight: '600',
  },
});
