import React from 'react';
import Modal from 'react-native-modal';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import { styles } from '../../screens/branches/tasks/style';

interface UserType {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
}

interface UserModalProps {
  isVisible: boolean;
  onClose: () => void;
  searchUser: string;
  setSearchUser: (val: string) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  users: UserType[];
}

const UserModal: React.FC<UserModalProps> = ({
  isVisible,
  onClose,
  searchUser,
  setSearchUser,
  isLoading,
  isError,
  refetch,
  users,
}) => (
  <Modal
    isVisible={isVisible}
    hasBackdrop={true}
    backdropColor="#000"
    backdropOpacity={0.18}
    animationIn="fadeIn"
    animationOut="fadeOut"
    animationInTiming={300}
    animationOutTiming={300}
    avoidKeyboard={true}
    coverScreen={true}
    style={{ margin: 0 }}
    useNativeDriver={true}
    hideModalContentWhileAnimating={false}
    propagateSwipe={false}
    deviceHeight={typeof window !== 'undefined' ? window.innerHeight : 800}
    deviceWidth={typeof window !== 'undefined' ? window.innerWidth : 400}
    onBackdropPress={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={{ borderRadius: 18, backgroundColor: '#fff', padding: 0, justifyContent: 'flex-start', width: '90%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 8, minHeight: '60%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F1F6' }}>
          <Text style={{ fontWeight: '600', fontSize: 18, color: '#222E44' }}>Users</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#0088E71A', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, color: '#0088E7' }}>✕</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 0 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, paddingHorizontal: 12, height: 44 }}>
            <SearchIcon width={22} height={22} style={{ marginRight: 8, opacity: 0.6 }} />
            <TextInput
              placeholder="Search ..."
              style={{ flex: 1, fontSize: 16, color: '#363942', fontWeight: '500', padding: 0 }}
              value={searchUser}
              onChangeText={setSearchUser}
              onSubmitEditing={refetch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={{ backgroundColor: '#0088E7', borderBottomRightRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center', shadowColor: '#0088E7', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }} onPress={refetch}>
            <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 14, paddingHorizontal: 18, flex: 1, paddingVertical: 8 }}>
          {isLoading ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>Loading...</Text>
          ) : isError ? (
            <Text style={{ textAlign: 'center', color: '#E4190A', marginTop: 18 }}>Error loading users</Text>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF0', padding: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
                  <Text style={{ fontWeight: '500', fontSize: 16, color: '#222E44' }}>{item.name || item.username || item.email}</Text>
                  <Text style={{ color: '#0088E7', fontSize: 14 }}>
                    {item.email ? item.email : <Text style={{ color: '#0088E7' }}>email@example.com</Text>}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No users found</Text>
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 18 }}>No users found</Text>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

export default UserModal;
