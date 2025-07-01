
import { SecurityUtils } from '@/utils/security';
import { SecurityService } from '@/services/security/securityService';
import { MessageService } from './MessageService';
import { ChatMessage, OrderFile } from '@/types/database';

export class SecureMessageService {
  private messageService = new MessageService();

  // Send message with enhanced security validation
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
      // Validate authentication
      const authValidation = await SecurityService.validateAuthState();
      if (!authValidation.isValid) {
        await SecurityService.logSecurityEvent('UNAUTHORIZED_MESSAGE_SEND_ATTEMPT', 'chat_messages', undefined, {
          order_id: messageData.order_id
        });
        return { success: false, error: { message: 'Authentication required' } };
      }

      // Validate order access
      const orderAccess = await SecurityService.validateOrderAccess(messageData.order_id);
      if (!orderAccess.hasAccess) {
        return { success: false, error: { message: orderAccess.error } };
      }

      // Verify sender ID matches authenticated user
      if (messageData.sender_id !== authValidation.user.id) {
        await SecurityService.logSecurityEvent('SENDER_ID_MISMATCH_ATTEMPT', 'chat_messages', undefined, {
          claimed_sender: messageData.sender_id,
          actual_user: authValidation.user.id
        });
        return { success: false, error: { message: 'Sender verification failed' } };
      }

      // Sanitize message content
      const sanitizedContent = SecurityUtils.sanitizeMessageContent(messageData.content);
      if (!sanitizedContent.trim()) {
        return { success: false, error: { message: 'Message content cannot be empty' } };
      }

      // Sanitize sender name
      const sanitizedSenderName = SecurityUtils.sanitizeHtml(messageData.sender_name);

      // Rate limiting for message sending
      if (!SecurityUtils.checkRateLimit(`message_${messageData.sender_id}`, 30, 60 * 1000)) {
        await SecurityService.logSecurityEvent('MESSAGE_RATE_LIMIT_EXCEEDED', 'chat_messages', undefined, {
          sender_id: messageData.sender_id,
          order_id: messageData.order_id
        });
        return { success: false, error: { message: 'Too many messages sent. Please slow down.' } };
      }

      // Validate and sanitize files if present
      const sanitizedFiles = messageData.files?.map(file => ({
        ...file,
        name: SecurityUtils.sanitizeFileName(file.name)
      })).filter(file => SecurityUtils.validateFileType(file.name));

      // Prepare sanitized message data
      const sanitizedMessageData = {
        ...messageData,
        content: sanitizedContent,
        sender_name: sanitizedSenderName,
        files: sanitizedFiles
      };

      // Send message using existing service
      const result = await this.messageService.sendMessage(sanitizedMessageData);

      if (result.success) {
        await SecurityService.logSecurityEvent('MESSAGE_SENT', 'chat_messages', result.message?.id, {
          order_id: messageData.order_id,
          sender_role: messageData.sender_role,
          content_length: sanitizedContent.length
        });
      }

      return result;
    } catch (error) {
      console.error('Secure message send error:', error);
      return { success: false, error: { message: 'Failed to send message securely' } };
    }
  }

  // Get messages with security validation
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      // Validate authentication
      const authValidation = await SecurityService.validateAuthState();
      if (!authValidation.isValid) {
        await SecurityService.logSecurityEvent('UNAUTHORIZED_MESSAGE_ACCESS_ATTEMPT', 'chat_messages', undefined, {
          order_id: orderId
        });
        return [];
      }

      // Validate order access
      const orderAccess = await SecurityService.validateOrderAccess(orderId);
      if (!orderAccess.hasAccess) {
        return [];
      }

      // Get messages using existing service
      const messages = await this.messageService.getMessages(orderId);

      await SecurityService.logSecurityEvent('MESSAGES_ACCESSED', 'chat_messages', undefined, {
        order_id: orderId,
        message_count: messages.length
      });

      return messages;
    } catch (error) {
      console.error('Secure get messages error:', error);
      return [];
    }
  }

  // Mark messages as read with security validation
  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    try {
      // Validate authentication
      const authValidation = await SecurityService.validateAuthState();
      if (!authValidation.isValid || authValidation.user.id !== userId) {
        return false;
      }

      // Validate order access
      const orderAccess = await SecurityService.validateOrderAccess(orderId);
      if (!orderAccess.hasAccess) {
        return false;
      }

      const result = await this.messageService.markMessagesAsRead(orderId, userId);

      if (result) {
        await SecurityService.logSecurityEvent('MESSAGES_MARKED_AS_READ', 'chat_messages', undefined, {
          order_id: orderId,
          user_id: userId
        });
      }

      return result;
    } catch (error) {
      console.error('Secure mark messages as read error:', error);
      return false;
    }
  }
}

export const secureMessageService = new SecureMessageService();
