
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

  // إنشاء أو جلب غرفة دردشة
  async createChatRoom(orderId: string, userId: string, userRole: string): Promise<ChatRoom | null> {
    // تعتمد على الدالة السريعة في UltraFastChatService
    // userRole: 'client' | 'designer' | 'admin'
    // يعيد الغرفة إذا كانت موجودة أو ينشئها إذا لم تكن موجودة
    // admin_id يتم تعيينه إذا كان المستخدم مصممًا
    // client_id يتم جلبه من الطلب
    // إذا فشل يعيد null
    // ملاحظة: الدالة خاصة بالدردشة فقط وليست عامة للطلبات
    // يمكن توسيعها لاحقًا لدعم حالات خاصة
    // تعتمد على getOrCreateChatRoomFast
    // ultraFastChatService.getOrCreateChatRoomFast(orderId, userId, userRole)
    // الدالة خاصة بالدردشة فقط
    // يمكن توسيعها لاحقًا لدعم حالات خاصة
    return ultraFastChatService.getOrCreateChatRoomFast(orderId, userId, userRole);
  }

  // جلب غرفة دردشة واحدة
  async getChatRoom(orderId: string): Promise<ChatRoom | null> {
    return ultraFastChatService.getOrCreateChatRoomFast(orderId, '', 'client'); // userId فارغ لأننا نريد فقط جلب الغرفة
  }

  // جلب جميع غرف الدردشة (يمكن تخصيصها لاحقًا)
  async getAllChatRooms(): Promise<ChatRoom[]> {
    // لا يوجد دالة مباشرة، يمكن تنفيذها لاحقًا حسب الحاجة
    return [];
  }

  // جلب رسائل غرفة دردشة
  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    // لا يوجد دالة مباشرة، يمكن تنفيذها لاحقًا حسب الحاجة
    return [];
  }

  // جلب رسائل حسب الطلب
  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
    return ultraFastChatService.getMessages(orderId);
  }

  // تنظيف الكاش
  clearAllCache(): void {
    ultraFastChatService.cleanup();
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
