
export class MessageValidationService {
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
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
    if (!this.isValidUUID(messageData.order_id)) {
      return { isValid: false, error: 'Invalid order ID format' };
    }

    if (!this.isValidUUID(messageData.sender_id)) {
      return { isValid: false, error: 'Invalid sender ID format' };
    }

    if (!messageData.content.trim()) {
      return { isValid: false, error: 'Message content cannot be empty' };
    }

    return { isValid: true };
  }
}
