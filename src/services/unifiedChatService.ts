
import { ChatRoom, ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { chatRoomService } from './chat/ChatRoomService';
import { unifiedMessageService } from './chat/UnifiedMessageService';
import { realtimeService } from './chat/RealtimeService';
import { fileService } from './chat/FileService';

export class UnifiedChatService {
  private static instance: UnifiedChatService;

  static getInstance(): UnifiedChatService {
    if (!UnifiedChatService.instance) {
      UnifiedChatService.instance = new UnifiedChatService();
    }
    return UnifiedChatService.instance;
  }

  // Chat Room Methods
  async getOrCreateChatRoom(orderId: string, userId: string, userRole: string = 'client'): Promise<ChatRoom | null> {
    return chatRoomService.getOrCreateChatRoom(orderId, userId, userRole);
  }

  // Message Methods
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    return unifiedMessageService.getMessages(orderId);
  }

  async sendMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
    files?: OrderFile[];
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    console.log('=== UNIFIED CHAT SERVICE ===');
    console.log('Sending message from:', messageData.sender_role, messageData.sender_name);

    return unifiedMessageService.sendMessage(messageData);
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    return unifiedMessageService.markMessagesAsRead(orderId, userId);
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    // TODO: Implement in unified service if needed
    return [];
  }

  // File Methods
  async uploadFile(file: File, orderId: string, uploaderId: string): Promise<OrderFile | null> {
    return fileService.uploadFile(file, orderId, uploaderId);
  }

  async attachFileToMessage(messageId: string, file: OrderFile): Promise<boolean> {
    // TODO: Implement in unified service if needed
    return false;
  }

  // Real-time Methods
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    return realtimeService.subscribeToMessages(orderId, callback);
  }

  cleanup() {
    realtimeService.cleanup();
  }
}

export const unifiedChatService = UnifiedChatService.getInstance();
