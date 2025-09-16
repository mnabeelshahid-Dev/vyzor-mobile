import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import { useLogout } from '../../hooks/useAuth';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/sortIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';
import ArrowRight from '../../assets/svgs/rightArrow.svg';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { fetchBranches } from '../../api/branches';
import { ApiResponse } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { styles } from './styles';
import { useAuthStore } from '../../store/authStore';

const BranchesScreen = ({ navigation }) => {
  const { setBranchId } = useAuthStore.getState();
  const logoutMutation = useLogout({
    onSuccess: () => {
  navigation.navigate('Login');
    },
  });

  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'number'>('name');

  type Branch = { name: string; code: string; webId: string };
  const { data, isLoading, isError, error, refetch } = useQuery<ApiResponse<any>, Error>({
    queryKey: ['branches', search, sortOrder, sortField],
    queryFn: async () => {
      console.log('Fetching branches...');
      const res = await fetchBranches({ search, sort: sortOrder, sortField });
      console.log('Branches response:', res);
      return res;
    }
  });

  // Redirect to login if token expired in API response
  React.useEffect(() => {
    if (
      data?.message?.includes('invalid_token') ||
      data?.message?.includes('Access token expired') ||
      (data?.success === false && data?.message?.includes('HTTP 401'))
    ) {
  navigation.navigate('Login');
    }
  }, [data, navigation]);

  React.useEffect(() => {
    if (isError && error) {
      const errorObj = error as any;
      if (
        errorObj?.message?.includes('invalid_token') ||
        errorObj?.message?.includes('Access token expired') ||
        errorObj?.response?.status === 401
      ) {
        navigation.navigate('Login');
      }
    }
  }, [isError, error, navigation]);

  const handleSort = (field: 'name' | 'number', order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setShowSortModal(false);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  // Extract branches from paginated response
  const branches = data?.data?.content || [];
  const renderBranch = ({ item = { name: '', code: '', webId: '' } }) => (
    <TouchableOpacity
      onPress={() => {
        // Set branchId in global store
        setBranchId(item.webId);
        navigation.navigate('Main', {
          screen: 'Task',
          params: {
            screen: 'Task',
            params: { branchId: item.webId },
          },
        });
      }}
      style={styles.branchCard}
    >
      <View style={{ width: '80%' }}>
        <Text style={styles.branchName}>{item.name}</Text>
        <Text style={styles.branchNumber}>Branch #; {item.code}</Text>
      </View>
      <View style={{ width: '20%', alignItems: 'flex-end' }}>
        <View style={styles.rightCircle}>
          <ArrowRight width={16} height={16} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Branches</Text>
          <TouchableOpacity onPress={() => setShowDropdown(true)}>
            <ThreeDotIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Modal */}
      <Modal
        isVisible={showDropdown}
        onBackdropPress={() => setShowDropdown(false)}
        backdropOpacity={0.18}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        avoidKeyboard={true}
        coverScreen={true}
        style={{
          margin: 0,
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
        }}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setShowDropdown(false);
              navigation.navigate('Profile');
            }}
          >
            <SettingsIcon width={18} height={18} style={{ marginRight: 8 }} />
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
            <Text style={styles.dropdownText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
          onPress={() => setShowSortModal(true)}
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
          // paddingTop: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <Text style={{ color: '#007AFF', fontSize: 18 }}>
            Loading branches...
          </Text>
        ) : isError ? (
          <Text style={{ color: 'red', fontSize: 18 }}>
            Error loading branches
          </Text>
        ) : branches.length === 0 ? (
          <View
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
          >
            {/* Replace below with Lottie or SVG animation if available */}
            <Text style={{ fontSize: 24, color: '#888', marginBottom: 12 }}>
              No branches found
            </Text>
          </View>
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={renderBranch}
            contentContainerStyle={{ paddingVertical: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Redesigned Dropdown Sort Modal */}
      {showSortModal && (
        <View style={[styles.dropdownCard, { position: 'absolute', top: 170, right: 24, zIndex: 100 }]}> {/* Adjust top/right for placement */}
          <View style={styles.sortModalHeader}>
            <Text style={styles.sortModalTitle}>Sort By</Text>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              style={styles.sortModalCloseBtn}
            >
              <View style={styles.sortModalCloseCircle}>
                <Text style={{ fontSize: 18, color: '#007AFF', bottom: 2 }}>x</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginVertical: 8 }} />
          <View style={styles.sortModalBody}>
            <Text style={styles.sortModalField}>Name</Text>
            <View style={styles.sortModalOrderBtns}>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('name', 'desc')}
              >
                <ArrowDownWard width={15} height={15} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'name' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('name', 'asc')}
              >
                <ArrowUpIcon width={15} height={15} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#0000001A', width: '100%', marginTop: 10 }} />
          <View style={[styles.sortModalBody, { marginTop: 10 }]}>
            <Text style={styles.sortModalField}>Number</Text>
            <View style={styles.sortModalOrderBtns}>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('number', 'desc')}
              >
                <ArrowDownWard width={15} height={15} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('number', 'asc')}
              >
                <ArrowUpIcon width={15} height={15} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};


export default BranchesScreen;
