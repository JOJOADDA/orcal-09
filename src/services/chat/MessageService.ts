
import { ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { chatRoomService } from './ChatRoomService';
import { MessageValidationService } from './MessageValidationService';
import { MessageProfileService } from './MessageProfileService';
import { MessageDataService } from './MessageDataService';

export class MessageService {
  private profileService = new MessageProfileService();
  private dataService = new MessageDataService();

  async getMessages(orderId: string): Promise<ChatMessage[]> {
    if (!MessageValidationService.isValidUUID(orderId)) {
      console.error('Invalid order ID format:', orderId);
      return [];
    }
    
    return this.dataService.getMessages(orderId);
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
    try {
      console.log('=== SENDING MESSAGE ===');
      console.log('Sender:', messageData.sender_name, 'Role:', messageData.sender_role, 'ID:', messageData.sender_id);
      console.log('Order ID:', messageData.order_id);
      console.log('Content:', messageData.content.substring(0, 100) + '...');
      
      // Validate message data
      const validation = MessageValidationService.validateMessageData(messageData);
      if (!validation.isValid) {
        console.error('Message validation failed:', validation.error);
        return { success: false, error: { message: validation.error } };
      }

      // For designers: verify profile exists
      if (messageData.sender_role === 'designer') {
        const profileExists = await this.profileService.verifyDesignerProfile(messageData.sender_id);
        if (!profileExists) {
          console.error('Designer profile verification failed');
          return { success: false, error: { message: 'Designer profile not found. Please ensure you are logged in properly.' } };
        }
      }

      // Ensure chat room exists
      const room = await chatRoomService.getOrCreateChatRoom(
        messageData.order_id, 
        messageData.sender_id, 
        messageData.sender_role
      );
      
      if (!room) {
        console.error('Failed to get or create chat room');
        return { success: false, error: { message: 'Failed to get or create chat room' } };
      }

      console.log('Using chat room:', room.id);

      // Send the message
      const result = await this.dataService.insertMessage(room.id, {
        ...messageData,
        message_type: messageData.message_type || 'text'
      });

      if (!result.success || !result.message) {
        return result;
      }

      // Upload files if present
      if (messageData.files && messageData.files.length > 0) {
        for (const file of messageData.files) {
          await this.dataService.attachFileToMessage(result.message.id, file);
        }
      }

      // Update chat room
      await chatRoomService.updateRoomUnreadCount(room.id, 1);

      console.log('=== MESSAGE SENT SUCCESSFULLY ===');
      return result;
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);
      return { success: false, error: MessageValidationService.handleError(error, 'Send Message') };
    }
  }

  async attachFileToMessage(messageId: string, file: OrderFile): Promise<boolean> {
    return this.dataService.attachFileToMessage(messageId, file);
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    return this.dataService.markMessagesAsRead(orderId, userId);
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    return this.dataService.getMessageFiles(messageId);
  }
}

export const messageService = new MessageService();
