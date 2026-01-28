import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
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
  StatusBar,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import MessegeIcon from '../../assets/svgs/chatMessageIcon.svg';
import { realtimeService } from '../../services/realtimeService';
import { Picker } from '@react-native-picker/picker';
import LogoutIcon from '../../assets/svgs/logout.svg';
import SettingsIcon from '../../assets/svgs/settings.svg';
import { useLogout } from '../../hooks/useAuth';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const { width, height } = Dimensions.get('window');

// Define the expected properties on profileData
interface ChatList {
  content: { title: string; status: string }[];
}

interface ApiResponse {
  content: Conversation[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

interface Conversation {
  webId: number;
  title: string;
  status: string;
  createdDate: string;
  createdBy: string;
  participants: Array<{
    webId: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface AvailableUser {
  value: string;
  text: string;
}

interface Message {
  webId: number;
  createdDate: string;
  createdBy: string;
  createdById: number;
  body: string;
  author: string;
  sentDate: string;
  status: string;
  userId: number;
  conversationId: number;
  type: string;
}

interface MessagesApiResponse {
  content: Message[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export default function ChatScreen({ navigation }) {
  const queryClient = useQueryClient();

  // State
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<AvailableUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);


  const logoutMutation = useLogout({
    onSuccess: () => {
      navigation.navigate('Auth', { screen: 'Login' });
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setShowDropdown(false);
  };

  // Fetch conversations using React Query
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiService.get(
        '/api/notification/conversations?status=OPEN',
      );
      console.log('Current chats', response.data);
      return response.data as ApiResponse;
    },
  });

  const removeSelectedUser = (userValue: string) => {
    setSelectedUsers(prev => prev.filter(user => user.value !== userValue));
    setGroupParticipants(prev =>
      prev.filter(participant => participant !== userValue),
    );
  };

  const getSelectedUsersDisplayText = () => {
    if (selectedUsers.length === 0) return '';
    if (selectedUsers.length === 1) return selectedUsers[0].text;
    return `${selectedUsers[0].text} + ${selectedUsers.length - 1}`;
  };

  // Fetch current user using React Query
  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiService.get(
        '/api/security/userAccounts/currentUser/',
      );
      console.log('Current User Data', response.data);
      return response.data;
    },
  });

  useFocusEffect(
    useCallback(() => {
      // Reset to chat list when screen comes into focus
      setSelectedChat(null);
      setMessages([]);
    }, []),
  );

  // Fetch available users using React Query (only when modal is open)
  const {
    data: availableUsers = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['availableUsers'],
    queryFn: async () => {
      const response = await apiService.get('/api/security/filter/USERS');
      console.log('Available users', response.data);
      return response.data as AvailableUser[];
    },
    enabled: groupModal, // Only fetch when modal is open
  });

  // Fetch conversation details using React Query
  const {
    data: conversationDetails,
    isLoading: isLoadingConversationDetails,
    error: conversationDetailsError,
  } = useQuery({
    queryKey: ['conversationDetails', selectedChat?.webId],
    queryFn: async () => {
      if (!selectedChat?.webId) return null;
      const response = await apiService.get(
        `/api/notification/conversations/${selectedChat.webId}`,
      );
      console.log('Conversation details', response.data);
      return response.data;
    },
    enabled: !!selectedChat?.webId,
  });

  // Fetch messages using React Query
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ['messages', selectedChat?.webId],
    queryFn: async () => {
      if (!selectedChat?.webId) return null;
      const response = await apiService.get(
        `/api/notification/sms?conversationId=${selectedChat.webId}&body=&sort=createdDate,desc`,
      );
      console.log(
        'Messages for conversation',
        selectedChat.webId,
        response.data,
      );
      const messagesResponse = response.data as MessagesApiResponse;
      if (messagesResponse && messagesResponse.content) {
        const sortedMessages = messagesResponse.content.sort(
          (a, b) =>
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime(),
        );
        return sortedMessages;
      }
      return [];
    },
    enabled: !!selectedChat?.webId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (conversationData: {
      title: string;
      status: string;
      clientId: number;
      participants: Array<{ webId: number }>;
    }) => {
      const response = await apiService.post(
        '/api/notification/conversations/',
        conversationData,
      );
      console.log('Add conversations response', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: error => {
      console.log('Error Adding conversations:', error);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      author: string;
      body: string;
      clientId: string;
      conversationId: string;
      sentDate: string;
      status: string;
      receiveDate: string;
      type: string;
      url: string;
      userId: string;
      id: string;
      uuid: string;
      token: string;
    }) => {
      const payload = {
        operationName: 'SmsPostMutation',
        variables: messageData,
        query:
          'mutation SmsPostMutation($body: String, $author: String, $uuid: String, $userId: String, $url: String, $type: String, $token: String, $sentDate: String, $status: String, $receiveDate: String, $clientId: String, $conversationId: ID, $id: String) {\n  smsPost(\n    body: {conversationId: $conversationId, body: $body, author: $author, clientId: $clientId, uuid: $uuid, userId: $userId, url: $url, type: $type, token: $token, sentDate: $sentDate, status: $status, receiveDate: $receiveDate, id: $id}\n    query: {}\n  ) {\n    conversationId\n    body\n    author\n    clientId\n    uuid\n    userId\n    url\n    type\n    token\n    sentDate\n    status\n    receiveDate\n    __typename\n  }\n}',
      };

      const response = await fetch(
        'https://agxlhr3v7nfdnhfv3ssxsfdcpe.appsync-api.us-east-1.amazonaws.com/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'x-api-key': 'da2-jrr6ci5j6jhh3jiop4kv3gbtem',
            'x-amz-user-agent': 'aws-amplify/3.0.7',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (!result.data?.smsPost) {
        throw new Error('Failed to send message');
      }
      return result.data.smsPost;
    },
    onSuccess: () => {
      // Clear the input
      setMessage('');
      // Invalidate and refetch messages
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedChat?.webId],
      });
      // Scroll to bottom
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    },
    onError: error => {
      console.log('Error sending message:', error);
    },
  });

  // Extract data and loading states
  const chats = conversationsData?.content || [];
  const currentUserClientId = currentUser?.webId || null;
  const isLoadings = isLoadingConversations;

  // Update messages state when query data changes
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Filtered chats
  const filteredChats = chats
    .filter(
      c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.participants.some(
          p =>
            p.email.toLowerCase().includes(search.toLowerCase()) ||
            `${p.firstName} ${p.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
    )
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  // Real-time messaging effect
  useEffect(() => {
    if (selectedChat && currentUserClientId) {
      console.log('Setting up real-time for conversation:', selectedChat.webId);

      setIsRealTimeActive(true);

      // Start polling for new messages
      realtimeService.startPolling(selectedChat.webId);

      // Listen for new messages
      realtimeService.addListener('newMessages', data => {
        console.log('Received new messages via polling:', data.messages);

        if (data.messages && data.messages.length > 0) {
          setMessages(prevMessages => {
            const existingMessageIds = new Set(
              prevMessages.map(msg => msg.webId),
            );
            const newUniqueMessages = data.messages.filter(
              (msg: Message) => !existingMessageIds.has(msg.webId),
            );

            if (newUniqueMessages.length > 0) {
              // Add new messages and sort
              const updatedMessages = [
                ...prevMessages,
                ...newUniqueMessages,
              ].sort(
                (a, b) =>
                  new Date(a.createdDate).getTime() -
                  new Date(b.createdDate).getTime(),
              );

              // Auto scroll to bottom when new message arrives
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd({ animated: true });
                }
              }, 100);

              return updatedMessages;
            }
            return prevMessages;
          });
        }
      });

      // Cleanup function
      return () => {
        realtimeService.removeListener('newMessages');
        realtimeService.stopPolling();
        setIsRealTimeActive(false);
      };
    } else {
      // Stop polling when no chat is selected
      realtimeService.stopPolling();
      setIsRealTimeActive(false);
    }
  }, [selectedChat, currentUserClientId]);

  useEffect(() => {
    return () => {
      realtimeService.stopPolling();
    };
  }, []);

  // Chat List UI
  const renderChatItem = ({ item }: { item: Conversation }) => {
    const getParticipantText = () => {
      if (item.participants.length === 0) return '';
      if (item.participants.length === 1) {
        return `${item.participants[0].firstName} ${item.participants[0].lastName}`;
      }
      const firstName = `${item.participants[0].firstName} ${item.participants[0].lastName}`;
      const remainingCount = item.participants.length - 1;
      return `${firstName} + ${remainingCount} more`;
    };

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => {
          setSelectedChat(item);
        }}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.chatTitle}>{item.title}</Text>
          <Text style={styles.chatEmail}>{getParticipantText()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.chatTime}>
          {new Date(item.createdDate).toLocaleDateString()} at{' '}
          {new Date(item.createdDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
          {selectedChat?.webId === item.webId && isRealTimeActive && (
            <View style={styles.realtimeIndicator}>
              <View style={styles.realtimeDot} />
              <Text style={styles.realtimeText}>Live</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = (message: Message, index: number) => {
    // Check if message is from current user using createdById
    const isMe = message.createdById === currentUserClientId;

    return (
      <View
        key={message.webId}
        style={[
          styles.chatBubbleRow,
          isMe
            ? { justifyContent: 'flex-end' }
            : { justifyContent: 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.chatBubble,
            isMe ? { backgroundColor: '#1292E6' } : { backgroundColor: '#fff' },
          ]}
        >
          {!isMe && (
            <Text
              style={[
                styles.chatBubbleUser,
                { color: isMe ? '#fff' : '#1292E6' },
              ]}
            >
              {message.author}
            </Text>
          )}
          <Text
            style={[
              styles.chatBubbleText,
              { color: isMe ? '#fff' : '#222E44' },
            ]}
          >
            {message.body}
          </Text>
          <Text
            style={[
              styles.chatBubbleTime,
              { color: isMe ? '#E6F1FB' : '#7A8194' },
            ]}
          >
            {new Date(message.sentDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
      </View>
    );
  };

  const handleAddConversation = async () => {
    try {
      if (!currentUserClientId) {
        console.log('Client ID not available');
        return;
      }

      // Create participants array including current user
      const participants = groupParticipants.map(participantValue => ({
        webId: parseInt(participantValue),
      }));

      // Add current user to participants if not already included
      const currentUserAlreadyIncluded = participants.some(
        participant => participant.webId === currentUserClientId,
      );

      if (!currentUserAlreadyIncluded) {
        participants.push({ webId: currentUserClientId });
      }

      const updatePayload = {
        title: groupName,
        status: 'OPEN',
        clientId: currentUserClientId,
        participants: participants,
      };

      await createConversationMutation.mutateAsync(updatePayload);
      setGroupModal(false);
      setGroupName('');
      setGroupParticipants([]);
    } catch (error) {
      console.log('Error in handleAddConversation:', error);
    }
  };

  const sendMessage = async () => {
    console.log('Send button clicked');
    if (!message.trim() || !selectedChat || !currentUser) {
      return;
    }

    try {
      // Generate UUID using crypto random method
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
      };

      const messageUuid = generateUUID();

      const messageData = {
        author: `${currentUser.firstName} ${currentUser.lastName}`,
        body: message.trim(),
        clientId: currentUser.clientId.toString(),
        conversationId: selectedChat.webId.toString(),
        sentDate: new Date().toISOString(),
        status: 'SENT',
        receiveDate: '',
        type: 'SMS',
        url: '',
        userId: currentUser.webId.toString(),
        id: '',
        uuid: messageUuid,
        token: '',
      };

      await sendMessageMutation.mutateAsync(messageData);
    } catch (error) {
      console.log('Error in sendMessage:', error);
    }
  };

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
          {/* <Text style={styles.inputLabel}>Name</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={groupName}
            onChangeText={setGroupName}
            placeholderTextColor="#AAB3BB"
          />
          {/* <Text style={styles.inputLabel}>Participants</Text> */}
<View style={styles.participantsInputContainer}>
  <View style={styles.customDropdownTrigger}>
    <View style={styles.dropdownContent}>
      <View style={styles.dropdownLeft}>
        {selectedUsers.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.inlineChipsScroll}
            contentContainerStyle={styles.inlineChipsContent}
            nestedScrollEnabled={true}
          >
            {selectedUsers.map(user => (
              <View key={user.value} style={styles.inlineInputChip}>
                <Text style={styles.inlineInputChipText}>{user.text}</Text>
                <TouchableOpacity
                  onPress={() => removeSelectedUser(user.value)}
                  style={styles.inlineInputChipRemove}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={styles.inlineInputChipRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.placeholderText}>Select participants</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.dropdownArrowButton}
        onPress={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
      >
        <Text style={styles.dropdownArrow}>
          {showParticipantsDropdown ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>

  {/* Custom dropdown list */}
  {showParticipantsDropdown && (
    <View style={styles.customDropdownList}>
      <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
        {isLoadingUsers ? (
          <View style={styles.dropdownItem}>
            <ActivityIndicator size="small" color="#1292E6" />
            <Text style={styles.dropdownItemText}>Loading users...</Text>
          </View>
        ) : (
          availableUsers
            .filter(user => !groupParticipants.includes(user.value))
            .map((user, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.dropdownItem}
                onPress={() => {
                  if (!groupParticipants.includes(user.value)) {
                    setGroupParticipants(prev => [...prev, user.value]);
                    setSelectedUsers(prev => [...prev, user]);
                    setShowParticipantsDropdown(false);
                  }
                }}
              >
                <Text style={styles.dropdownItemText}>{user.text}</Text>
              </TouchableOpacity>
            ))
        )}
        {availableUsers.filter(user => !groupParticipants.includes(user.value)).length === 0 && !isLoadingUsers && (
          <View style={styles.dropdownItem}>
            <Text style={styles.dropdownItemTextEmpty}>No more users available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )}
</View>

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalBtnClear}
              onPress={() => {
                setGroupName('');
                setGroupParticipants([]);
                setSelectedUsers([]);
              }}
            >
              <Text style={styles.modalBtnClearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSave}
              onPress={async () => {
                if (!groupName.trim()) {
                  alert('Please enter a group name');
                  return;
                }

                if (groupParticipants.length === 0) {
                  alert('Please select at least one participant');
                  return;
                }

                await handleAddConversation();
              }}
            >
              <Text style={styles.modalBtnSaveText}>
                {createConversationMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Chat Detail UI
  const renderChatDetail = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#007AFF' }}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={() => {
            setSelectedChat(null);
            setMessages([]); // Clear messages when going back
          }}
        >
          <Text style={{ color: '#fff', fontSize: 28 }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>
          {conversationDetails?.title || selectedChat?.title || 'Loading...'}
        </Text>
        {/* <View style={{ marginLeft: 'auto' }}>
          <Text style={{ color: '#fff', fontSize: 26 }}>⋮</Text>
        </View> */}
      </View>
      {/* Chat Content */}
      <View style={styles.chatDetailCard}>
        {isLoadingConversationDetails || isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {isLoadingConversationDetails
                ? 'Loading conversation...'
                : 'Loading messages...'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: 12,
              flexGrow: 1,
            }}
            ref={scrollViewRef}
            onContentSizeChange={() => {
              // Auto scroll to bottom when new messages are loaded
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }
            }}
          >
            {messages.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.emptyText}>No messages available yet</Text>
                {conversationDetails && (
                  <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
                    <Text style={styles.conversationInfo}>
                      Participants:{' '}
                      {conversationDetails.participants?.length || 0}
                    </Text>
                    <Text style={styles.conversationInfo}>
                      Created by: {conversationDetails.createdBy}
                    </Text>
                    <Text style={styles.conversationInfo}>
                      Status: {conversationDetails.status}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ paddingTop: 10 }}>
                {messages.map((message, index) =>
                  renderMessage(message, index),
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
      {/* Input -  send message API */}
      {/* Input - send message API */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.select({
          ios: 20,
          android: StatusBar.currentHeight || 0,
        })}
        style={{ flexShrink: 0 }}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputMessage}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#AAB3BB"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.inputSend,
              {
                opacity:
                  message.trim() && !sendMessageMutation.isPending ? 1 : 0.5,
              },
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator size="small" color="#1292E6" />
            ) : (
              <Text style={{ fontSize: 23, color: '#1292E6' }}>➤</Text>
            )}
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
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => navigation.goBack()}>
            <BackArrowIcon width={17} height={17} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
      </View>
      {/* Branches List */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          paddingTop: 50,
        }}
      >
        {isLoadings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1292E6" />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={item => item.webId.toString()}
            contentContainerStyle={{ paddingBottom: 60, paddingTop: 6 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No conversations found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Group Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Clear any previous form data when opening modal
          setGroupName('');
          setGroupParticipants([]);
          setSelectedUsers([]);
          setGroupModal(true);
        }}
        activeOpacity={0.8}
      >
        <MessegeIcon width={28} height={28} fill="#fff" />
      </TouchableOpacity>
      {renderGroupModal}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
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
                <Text style={styles.dropdownText}>Settings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LogoutIcon width={18} height={18} style={{ marginRight: 8 }} />
                <Text style={styles.dropdownText}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  // dropdownItem: {
  //   paddingVertical: 12,
  //   paddingHorizontal: 16,
  // },
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
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
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
    maxHeight: '95%',
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
    marginTop: 16,
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
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: '#1292E6',
    borderRadius: 10,
    paddingVertical: 8,
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
    backgroundColor: '#007AFF',
    paddingVertical: 50,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    minHeight: 70,
  },
  detailHeaderTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 0,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7A8194',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7A8194',
    fontWeight: '500',
  },
  conversationInfo: {
    fontSize: 14,
    color: '#7A8194',
    marginBottom: 4,
    textAlign: 'center',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C851',
    marginRight: 4,
  },
  realtimeText: {
    fontSize: 10,
    color: '#00C851',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedParticipantsList: {
    maxHeight: 120,
    marginVertical: 8,
  },
  selectedParticipantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 6,
  },
  selectedParticipantText: {
    color: '#1292E6',
    fontSize: 14,
    flex: 1,
  },
  removeParticipantBtn: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeParticipantBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
participantsInputContainer: {
  marginVertical: 8,
},
chipsContainer: {
  paddingHorizontal: 0,
  paddingVertical: 8,
  marginTop: 8,
},
  chipsScrollContent: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1292E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginVertical: 2,
  },
  inputChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  inputChipRemove: {
    marginLeft: 4,
    padding: 1,
  },
  inputChipRemoveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullWidthDropdownContainer: {
    width: '100%',
    paddingHorizontal: 4,
  },
  fullWidthDropdownPicker: {
    width: '100%',
    height: 55,
  },
  customDropdownTrigger: {
  backgroundColor: '#F7F9FC',
  borderRadius: 9,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  paddingHorizontal: 14,
  paddingVertical: 12,
  minHeight: 44,
},

dropdownContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

// dropdownLeft: {
//   flex: 1,
// },

selectedUsersPreview: {
  flexDirection: 'row',
  alignItems: 'center',
},

selectedUsersText: {
  color: '#222E44',
  fontSize: 16,
  fontWeight: '500',
},

placeholderText: {
  color: '#AAB3BB',
  fontSize: 16,
},

dropdownArrow: {
  color: '#1292E6',
  fontSize: 12,
  fontWeight: 'bold',
},

customDropdownList: {
  position: 'absolute',
  top: 44, // Height of the trigger
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 9,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  maxHeight: 200,
  elevation: 5,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  zIndex: 1000,
},

dropdownScrollView: {
  maxHeight: 200,
},

dropdownItem: {
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#F1F1F6',
  flexDirection: 'row',
  alignItems: 'center',
},

dropdownItemText: {
  color: '#222E44',
  fontSize: 16,
  marginLeft: 8,
},

dropdownItemTextEmpty: {
  color: '#AAB3BB',
  fontSize: 16,
  fontStyle: 'italic',
},
customDropdownTrigger: {
  backgroundColor: '#F7F9FC',
  borderRadius: 9,
  borderWidth: 1,
  borderColor: '#E0E0E0',
  paddingHorizontal: 14,
  paddingVertical: 12,
  minHeight: 44,
},

inlineChipsScroll: {
  flexGrow: 1,
  maxHeight: 32,
},

inlineChipsContent: {
  alignItems: 'center',
  minWidth: '100%',
},

dropdownLeft: {
  flex: 1,
  marginRight: 12,
  overflow: 'hidden',
},

dropdownArrowButton: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  justifyContent: 'center',
  alignItems: 'center',
},
inlineChipsScroll: {
  maxHeight: 32,
  flexGrow: 0,
},

inlineChipsContent: {
  alignItems: 'center',
  paddingRight: 8,
},

inlineInputChip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#1292E6',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 16,
  marginRight: 6,
  height: 24,
},

inlineInputChipText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '500',
},

inlineInputChipRemove: {
  marginLeft: 4,
  padding: 1,
},

inlineInputChipRemoveText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},

// Update the existing dropdownLeft style:
// dropdownLeft: {
//   flex: 1,
//   marginRight: 8,
// },
});
