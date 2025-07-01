import { SecurityUtils } from '@/utils/security';

export class MessageValidationService {
  static isValidUUID(uuid: string): boolean {
    return SecurityUtils.isValidUUID(uuid);
  }

  static handleError(error: any, context: string) {
    console.error(`[MessageService ${context}] Error:`, error);
    return error;
  }

  static validateMessageData(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }): { isValid: boolean; error?: string } {
    if (!SecurityUtils.isValidUUID(messageData.order_id)) {
      return { isValid: false, error: 'Invalid order ID format' };
    }

    if (!SecurityUtils.isValidUUID(messageData.sender_id)) {
      return { isValid: false, error: 'Invalid sender ID format' };
    }

    // Enhanced content validation with XSS protection
    const sanitizedContent = SecurityUtils.sanitizeMessageContent(messageData.content);
    if (!sanitizedContent.trim()) {
      return { isValid: false, error: 'Message content cannot be empty' };
    }

    // Validate sender name
    const sanitizedName = SecurityUtils.sanitizeHtml(messageData.sender_name);
    if (!sanitizedName.trim()) {
      return { isValid: false, error: 'Sender name cannot be empty' };
    }

    // Validate role
    if (!SecurityUtils.isValidRole(messageData.sender_role)) {
      return { isValid: false, error: 'Invalid sender role' };
    }

    return { isValid: true };
  }

  // Enhanced file validation
  static validateFileData(file: {
    name: string;
    url: string;
    file_type: string;
    size_bytes: number;
  }): { isValid: boolean; error?: string } {
    // Validate file name
    if (!file.name || !SecurityUtils.validateFileType(file.name)) {
      return { isValid: false, error: 'Invalid or unsupported file type' };
    }

    // Validate file size (max 10MB)
    if (file.size_bytes > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Validate URL format
    try {
      new URL(file.url);
    } catch {
      return { isValid: false, error: 'Invalid file URL format' };
    }

    return { isValid: true };
  }
}
