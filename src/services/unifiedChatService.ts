
import { ChatRoom, ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { ultraFastChatService } from './chat/UltraFastChatService';
import { fileService } from './chat/FileService';

export class UnifiedChatService {
  private static instance: UnifiedChatService;

  static getInstance(): UnifiedChatService {
    if (!UnifiedChatService.instance) {
      UnifiedChatService.instance = new UnifiedChatService();
    }
    return UnifiedChatService.instance;
  }

  // Message Methods - Ultra Fast 🚀
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    return ultraFastChatService.getMessages(orderId);
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
    console.log('🚀 ULTRA FAST UNIFIED CHAT SERVICE 🚀');
    console.log('Sending message from:', messageData.sender_role, messageData.sender_name);

    return ultraFastChatService.sendMessage(messageData);
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    return ultraFastChatService.markMessagesAsRead(orderId, userId);
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

  // Real-time Methods - Ultra Fast 🚀
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    return ultraFastChatService.subscribeToMessages(orderId, callback);
  }

  cleanup() {
    ultraFastChatService.cleanup();
  }

  // إحصائيات الأداء
  getPerformanceStats(): Record<string, any> {
    return ultraFastChatService.getPerformanceStats();
  }
}

export const unifiedChatService = UnifiedChatService.getInstance();
