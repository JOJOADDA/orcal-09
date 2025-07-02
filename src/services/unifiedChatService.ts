
import { ChatRoom, ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { chatRoomService } from './chat/ChatRoomService';
import { messageService } from './chat/MessageService';
import { designerMessageService } from './chat/DesignerMessageService';
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
    return messageService.getMessages(orderId);
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

    // استخدام خدمة المصمم المحسنة للمصممين
    if (messageData.sender_role === 'designer') {
      console.log('Using designer message service for designer message');
      const result = await designerMessageService.sendDesignerMessage({
        order_id: messageData.order_id,
        sender_id: messageData.sender_id,
        sender_name: messageData.sender_name,
        content: messageData.content,
        message_type: messageData.message_type,
        files: messageData.files
      });
      
      // إضافة تسجيل للتأكد من إرسال الرسالة
      if (result.success) {
        console.log('Designer message sent successfully via unified service');
      } else {
        console.error('Failed to send designer message:', result.error);
      }
      
      return result;
    }

    // استخدام الخدمة العادية للعملاء والإداريين
    return messageService.sendMessage(messageData);
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    return messageService.markMessagesAsRead(orderId, userId);
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    return messageService.getMessageFiles(messageId);
  }

  // File Methods
  async uploadFile(file: File, orderId: string, uploaderId: string): Promise<OrderFile | null> {
    return fileService.uploadFile(file, orderId, uploaderId);
  }

  async attachFileToMessage(messageId: string, file: OrderFile): Promise<boolean> {
    return messageService.attachFileToMessage(messageId, file);
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
