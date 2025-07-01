
export class MessageValidationService {
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }

  static validateMessageData(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    content: string;
  }): { isValid: boolean; error?: string } {
    
    if (!messageData.order_id || !this.isValidUUID(messageData.order_id)) {
      return { isValid: false, error: 'معرف الطلب غير صالح' };
    }

    if (!messageData.sender_id || !this.isValidUUID(messageData.sender_id)) {
      return { isValid: false, error: 'معرف المرسل غير صالح' };
    }

    if (!messageData.sender_name || messageData.sender_name.trim().length === 0) {
      return { isValid: false, error: 'اسم المرسل مطلوب' };
    }

    if (!messageData.sender_role || !['client', 'admin', 'designer', 'system'].includes(messageData.sender_role)) {
      return { isValid: false, error: 'دور المرسل غير صالح' };
    }

    if (!messageData.content || messageData.content.trim().length === 0) {
      return { isValid: false, error: 'محتوى الرسالة لا يمكن أن يكون فارغاً' };
    }

    if (messageData.content.length > 5000) {
      return { isValid: false, error: 'محتوى الرسالة طويل جداً (الحد الأقصى 5000 حرف)' };
    }

    return { isValid: true };
  }

  static handleError(error: any, context: string): any {
    console.error(`[MessageValidation ${context}] Error:`, error);
    
    if (error?.code === 'PGRST116') {
      return { message: 'البيانات المطلوبة غير موجودة' };
    }
    
    if (error?.code === '42501') {
      return { message: 'ليس لديك صلاحية للقيام بهذا الإجراء' };
    }
    
    if (error?.code === '23505') {
      return { message: 'البيانات مكررة' };
    }

    if (error?.message) {
      return { message: error.message };
    }

    return { message: 'حدث خطأ غير متوقع' };
  }

  static sanitizeMessageContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // إزالة HTML tags والمحتوى الضار
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 5000); // تحديد الحد الأقصى
  }
}
