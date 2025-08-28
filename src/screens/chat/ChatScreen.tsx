import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import MessegeIcon from '../../assets/svgs/chatMessageIcon.svg';

const { width, height } = Dimensions.get('window');

// Mock Data
const mockChats = [
  {
    id: '1',
    name: 'Daily Updates',
    email: 'jack@vyzor.com',
    lastMessage: 'All task are done on the time.',
    time: '08/12/2025 at 5:55pm',
    messages: [
      {
        id: 'm1',
        user: 'John Alex',
        text: 'All task are done on the time.',
        time: '5.55 pm',
        isMe: true,
      },
      {
        id: 'm2',
        user: 'John Alex',
        text: "okey that's great",
        time: '5:58 pm',
        isMe: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Daily Updates',
    email: 'jack@vyzor.com',
    lastMessage: '',
    time: '08/12/2025 at 5:55pm',
    messages: [],
  },
  {
    id: '3',
    name: 'Daily Updates',
    email: 'jack@vyzor.com',
    lastMessage: '',
    time: '08/12/2025 at 5:55pm',
    messages: [],
  },
  {
    id: '4',
    name: 'Daily Updates',
    email: 'jack@vyzor.com',
    lastMessage: '',
    time: '08/12/2025 at 5:55pm',
    messages: [],
  },
];

const mockParticipants = [
  'Jack Alex',
  'Waqar khan',
  'John Alex'
];

export default function ChatScreen({navigation}) {
  // State
  const [chats, setChats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<any>(null);

  // Filtered chats
  const filteredChats = chats.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Chat List UI
  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => setSelectedChat(item)}
      activeOpacity={0.7}
    >
      <View>
        <Text style={styles.chatTitle}>{item.name}</Text>
        <Text style={styles.chatEmail}>{item.email}</Text>
      </View>
      <Text style={styles.chatTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  // Group Modal UI
  const renderGroupModal = (
    <Modal visible={groupModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity onPress={() => setGroupModal(false)} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={groupName}
            onChangeText={setGroupName}
            placeholderTextColor="#AAB3BB"
          />
          <Text style={styles.inputLabel}>Participants</Text>
          <ScrollView style={styles.participantList}>
            {mockParticipants.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.participantItem,
                  groupParticipants.includes(p) && styles.participantItemSelected,
                ]}
                onPress={() =>
                  setGroupParticipants(prev =>
                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                  )
                }
              >
                <Text
                  style={[
                    styles.participantText,
                    groupParticipants.includes(p) && styles.participantTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalBtnClear}
              onPress={() => {
                setGroupName('');
                setGroupParticipants([]);
              }}
            >
              <Text style={styles.modalBtnClearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSave}
              onPress={() => {
                setGroupModal(false);
                // Add group to chats (mock)
                setChats([
                  ...chats,
                  {
                    id: Date.now().toString(),
                    name: groupName,
                    email: '',
                    lastMessage: '',
                    time: new Date().toLocaleString(),
                    messages: [],
                  },
                ]);
                setGroupName('');
                setGroupParticipants([]);
              }}
            >
              <Text style={styles.modalBtnSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Chat Detail UI
  const renderChatDetail = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1292E6' }}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setSelectedChat(null)}>
          <Text style={{ color: '#fff', fontSize: 28 }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>{selectedChat?.name}</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Text style={{ color: '#fff', fontSize: 26 }}>⋮</Text>
        </View>
      </View>
      {/* Chat Bubbles */}
      <View style={styles.chatDetailCard}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {selectedChat?.messages.map((msg: any, idx: number) => (
            <View
              key={msg.id || idx}
              style={[
                styles.chatBubbleRow,
                msg.isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
              ]}
            >
              <View
                style={[
                  styles.chatBubble,
                  msg.isMe
                    ? { backgroundColor: '#1292E6', alignItems: 'flex-end' }
                    : { backgroundColor: '#ECECEC', alignItems: 'flex-start' },
                ]}
              >
                <Text
                  style={[
                    styles.chatBubbleUser,
                    msg.isMe ? { color: '#fff' } : { color: '#19233C' },
                  ]}
                >
                  {msg.user}
                </Text>
                <Text
                  style={[
                    styles.chatBubbleText,
                    msg.isMe ? { color: '#fff' } : { color: '#19233C' },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.chatBubbleTime,
                    msg.isMe ? { color: '#fff' } : { color: '#6F7A8A' },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputMessage}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#AAB3BB"
          />
          <TouchableOpacity
            style={styles.inputSend}
            disabled={!message.trim()}
            onPress={() => {
              if (!message.trim()) return;
              // Add message to chat (mock)
              setChats((prev) =>
                prev.map((c) =>
                  c.id === selectedChat.id
                    ? {
                        ...c,
                        messages: [
                          ...c.messages,
                          {
                            id: Date.now().toString(),
                            user: 'John Alex',
                            text: message,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: true,
                          },
                        ],
                      }
                    : c
                )
              );
              setSelectedChat((prev: any) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  {
                    id: Date.now().toString(),
                    user: 'John Alex',
                    text: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                  },
                ],
              }));
              setMessage('');
            }}
          >
            <Text style={{ fontSize: 23, color: '#1292E6' }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // Main Chat List UI
  return selectedChat ? (
    renderChatDetail()
  ) : (
   <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity>
            <ThreeDotIcon width={26} height={26} />
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
      </View>
      {/* Branches List */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop: 50,
        }}
      >
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 6 }}
        showsVerticalScrollIndicator={false}
      />
      </View>
      {/* Floating Group Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setGroupModal(true)}
        activeOpacity={0.8}
      >
        <MessegeIcon width={28} height={28} fill="#fff" />
      </TouchableOpacity>
      {renderGroupModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
    paddingBottom: 10,
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
    fontSize: 22,
    fontWeight: 'bold',
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
  chatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0001',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chatTitle: {
    color: '#222E44',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  chatEmail: {
    color: '#1292E6',
    fontSize: 13,
  },
  chatTime: {
    color: '#7A8194',
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    backgroundColor: '#1292E6',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1292E6',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 2,
  },
  bottomNav: {
    height: 58,
    backgroundColor: '#fff',
    borderTopColor: '#E6F1FB',
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  navIcon: {
    fontSize: 27,
    color: '#7A8194',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#2227',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: width * 0.88,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    maxHeight: '78%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 19,
    color: '#222E44',
    flex: 1,
  },
  closeBtn: {
    fontSize: 20,
    color: '#AAB3BB',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 9,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  inputLabel: {
    color: '#7A8194',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  participantList: {
    maxHeight: 120,
    marginBottom: 16,
  },
  participantItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F6',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  participantItemSelected: {
    backgroundColor: '#E6F1FB',
  },
  participantText: {
    color: '#222E44',
    fontSize: 15,
  },
  participantTextSelected: {
    color: '#1292E6',
    fontWeight: 'bold',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalBtnClear: {
    flex: 1,
    backgroundColor: '#E6F1FB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: '#1292E6',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnClearText: {
    color: '#1292E6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Chat detail
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1292E6',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    minHeight: 70,
  },
  detailHeaderTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 18,
    flex: 1,
    textAlign: 'center',
  },
  chatDetailCard: {
    flex: 1,
    marginTop: -16,
    backgroundColor: '#F7F9FC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 6,
  },
  chatBubble: {
    maxWidth: width * 0.7,
    minWidth: 110,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 6,
    marginTop: 0,
  },
  chatBubbleUser: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatBubbleText: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 4,
  },
  chatBubbleTime: {
    fontSize: 12,
    fontWeight: '400',
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F6',
    marginBottom: 0,
  },
  inputMessage: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 11,
    fontSize: 16,
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    marginRight: 8,
    color: '#222',
  },
  inputSend: {
    backgroundColor: '#f7f9fc',
    borderRadius: 18,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});