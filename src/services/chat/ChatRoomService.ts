
import { ChatRoom } from '@/types/database';
import { ChatRoomValidationService } from './ChatRoomValidationService';
import { ChatRoomDataService } from './ChatRoomDataService';

export class ChatRoomService {
  private dataService = new ChatRoomDataService();

  async getOrCreateChatRoom(orderId: string, userId: string, userRole: string = 'client'): Promise<ChatRoom | null> {
    try {
      console.log('=== Getting/Creating chat room ===');
      console.log('Order ID:', orderId, 'User:', userId, 'Role:', userRole);
      
      if (!ChatRoomValidationService.isValidUUID(orderId)) {
        console.error('Invalid order ID format:', orderId);
        return null;
      }

      // محاولة جلب الغرفة الموجودة
      const existingRoom = await this.dataService.getExistingRoom(orderId);

      if (existingRoom) {
        console.log('Found existing chat room:', existingRoom.id);
        
      // تحديث admin_id إذا كان المستخدم مصمم ولم يكن محدد
      if (userRole === 'designer' && !existingRoom.admin_id) {
        console.log('Updating chat room admin_id for designer:', userId);
        const updatedRoom = await this.dataService.updateRoomAdmin(existingRoom.id, userId);
        return updatedRoom || existingRoom;
      }
      
      // أيضاً تحديث admin_id للمصممين حتى لو كان موجود (للتأكد من الصحة)
      if (userRole === 'designer' && existingRoom.admin_id !== userId) {
        console.log('Ensuring correct admin_id for designer:', userId);
        const updatedRoom = await this.dataService.updateRoomAdmin(existingRoom.id, userId);
        return updatedRoom || existingRoom;
      }
        
        return existingRoom;
      }

      // الحصول على معلومات الطلب
      const orderData = await this.dataService.getOrderData(orderId);
      if (!orderData) {
        return null;
      }

      // إنشاء غرفة جديدة
      const adminId = userRole === 'designer' ? userId : undefined;
      return await this.dataService.createNewRoom(orderId, orderData.client_id, adminId);
    } catch (error) {
      ChatRoomValidationService.handleError(error, 'Get/Create Chat Room');
      return null;
    }
  }

  async updateRoomUnreadCount(roomId: string, increment: number = 1): Promise<void> {
    return this.dataService.updateUnreadCount(roomId, increment);
  }
}

export const chatRoomService = new ChatRoomService();
