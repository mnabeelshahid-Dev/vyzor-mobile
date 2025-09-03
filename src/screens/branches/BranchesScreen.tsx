import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import { useLogout } from '../../hooks/useAuth';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import FilterIcon from '../../assets/svgs/sortIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import ArrowUpIcon from '../../assets/svgs/arrowUpWard.svg';
import ArrowDownWard from '../../assets/svgs/arrowDownward.svg';
import ArrowRight from '../../assets/svgs/rightArrow.svg';
import { fetchBranches } from '../../api/branches';
import { useQuery } from '@tanstack/react-query';

const BranchesScreen = ({ navigation }) => {
  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  const [search, setSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'number'>('name');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['branches', search, sortOrder, sortField],
    queryFn: async () => {
      console.log('Fetching branches...');
      const res = await fetchBranches({ search, sort: sortOrder, sortField });
      console.log('Branches response:', res);
      return res;
    },
  });


  const handleSort = (field: 'name' | 'number', order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setShowSortModal(false);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  const navigateToTask = () => {
    navigation.navigate('Task');
  };

  // Extract branches from paginated response
  const branches = data?.data?.content || [];
  const renderBranch = ({ item = { name: '', code: '', webId: '' } }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Task', { branchId: item.webId })}
      style={styles.branchCard}
    >
      <View style={{ width: '80%' }}>
        <Text style={styles.branchName}>{item.name}</Text>
        <Text style={styles.branchNumber}>
          Branch #; {item.code}
        </Text>
      </View>
      <View style={{ width: "20%", alignItems: 'flex-end' }}>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
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
            <Text style={styles.dropdownText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
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
          <FilterIcon width={32} height={32} />
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
          <Text style={{ color: '#007AFF', fontSize: 18 }}>Loading branches...</Text>
        ) : isError ? (
          <Text style={{ color: 'red', fontSize: 18 }}>Error loading branches</Text>
        ) : branches.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* Replace below with Lottie or SVG animation if available */}
            <Text style={{ fontSize: 24, color: '#888', marginBottom: 12 }}>No branches yet</Text>
            <Text style={{ fontSize: 16, color: '#aaa' }}>Branches you create will show up here.</Text>
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
          <View style={[styles.sortModalBody, { marginTop: 14 }]}>
            <Text style={styles.sortModalField}>Number</Text>
            <View style={styles.sortModalOrderBtns}>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'desc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('number', 'desc')}
              >
                <ArrowDownWard width={18} height={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortModalOrderBtn, sortField === 'number' && sortOrder === 'asc' ? styles.activeSortBtn : null]}
                onPress={() => handleSort('number', 'asc')}
              >
                <ArrowUpIcon width={18} height={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    width: '100%',
  },
  dropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
    maxWidth: 340,
    alignSelf: 'flex-end',
  },
  activeSortBtn: {
    backgroundColor: '#E6F0FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
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
    height: 52,
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? 90 : 82,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
  },
  listContent: {
    paddingTop: 40,
    paddingBottom: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: 'transparent',
    flex: 1,
    position: 'relative',
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    justifyContent: 'space-between',
  },
  leftBorder: {
    width: 5,
    height: '80%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
    marginRight: 14,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    lineHeight: 20,
  },
  branchNumber: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 2,
  },
  rightCircleWrap: {
    marginLeft: 12,
  },
  rightCircle: {
    width: 30,
    height: 30,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  sortModalCloseBtn: {
    marginLeft: 12,
  },
  sortModalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: '#0088E71A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortModalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortModalField: {
    fontSize: 14,
    color: '#222',
    fontWeight: '400',
  },
  sortModalOrderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortModalOrderBtn: {
    backgroundColor: '#F2F6FF',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default BranchesScreen;