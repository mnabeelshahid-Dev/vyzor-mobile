// services/realtimeService.ts
import { apiService } from './api';

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

class RealtimeService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private currentConversationId: number | null = null;
  private lastMessageTimestamp: string | null = null;
  private messageListeners: Map<string, (data: any) => void> = new Map();
  private isPolling = false;
  private pollingIntervalMs = 2000; // Poll every 2 seconds
  private lastKnownMessageCount = 0;

  startPolling(conversationId: number) {
    if (this.currentConversationId === conversationId && this.isPolling) {
      return; // Already polling this conversation
    }

    this.stopPolling();
    this.currentConversationId = conversationId;
    this.isPolling = true;
    this.lastMessageTimestamp = null;
    this.lastKnownMessageCount = 0;

    console.log('Starting real-time polling for conversation:', conversationId);

    // Initial fetch to get current state
    this.fetchNewMessages(true);

    // Start polling
    this.pollingInterval = setInterval(() => {
      this.fetchNewMessages(false);
    }, this.pollingIntervalMs);
  }

  private async fetchNewMessages(isInitialFetch: boolean = false) {
    if (!this.currentConversationId) return;

    try {
      const response = await apiService.get(
        `/api/notification/sms?conversationId=${this.currentConversationId}&body=&sort=createdDate,desc&size=50`,
      );

      const messagesResponse = response.data as MessagesApiResponse;

      if (messagesResponse && messagesResponse.content) {
        const messages = messagesResponse.content.sort(
          (a, b) =>
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime(),
        );

        if (isInitialFetch) {
          // For initial fetch, just set the baseline
          this.lastKnownMessageCount = messages.length;
          if (messages.length > 0) {
            this.lastMessageTimestamp =
              messages[messages.length - 1].createdDate;
          }

          // Emit all messages for initial load
          this.notifyListeners('initialMessages', { messages });
        } else {
          // Check for new messages
          const newMessages = this.getNewMessages(messages);

          if (newMessages.length > 0) {
            console.log('Found new messages:', newMessages.length);
            this.notifyListeners('newMessages', { messages: newMessages });

            // Update tracking
            this.lastKnownMessageCount = messages.length;
            this.lastMessageTimestamp =
              messages[messages.length - 1].createdDate;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  }

  private getNewMessages(allMessages: Message[]): Message[] {
    if (!this.lastMessageTimestamp) {
      return [];
    }

    const lastTimestamp = new Date(this.lastMessageTimestamp).getTime();

    return allMessages.filter(message => {
      const messageTimestamp = new Date(message.createdDate).getTime();
      return messageTimestamp > lastTimestamp;
    });
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.currentConversationId = null;
    this.lastMessageTimestamp = null;
    this.lastKnownMessageCount = 0;
    console.log('Stopped real-time polling');
  }

  addListener(event: string, callback: (data: any) => void) {
    this.messageListeners.set(event, callback);
  }

  removeListener(event: string) {
    this.messageListeners.delete(event);
  }

  private notifyListeners(event: string, data: any) {
    const listener = this.messageListeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  // Method to manually trigger a check (useful after sending a message)
  checkForNewMessages() {
    if (this.isPolling && this.currentConversationId) {
      this.fetchNewMessages(false);
    }
  }

  // Method to update polling frequency
  setPollingInterval(intervalMs: number) {
    this.pollingIntervalMs = intervalMs;

    // Restart polling with new interval if currently polling
    if (this.isPolling && this.currentConversationId) {
      const conversationId = this.currentConversationId;
      this.startPolling(conversationId);
    }
  }

  // Method to get current status
  getStatus() {
    return {
      isPolling: this.isPolling,
      currentConversationId: this.currentConversationId,
      pollingInterval: this.pollingIntervalMs,
    };
  }
}

export const realtimeService = new RealtimeService();
