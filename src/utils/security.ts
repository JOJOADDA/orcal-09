
// Security utilities for input validation and sanitization
export class SecurityUtils {
  // XSS Protection - sanitize HTML content
  static sanitizeHtml(input: string): string {
    if (!input) return '';
    
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  }

  // Validate and sanitize message content
  static sanitizeMessageContent(content: string): string {
    if (!content) return '';
    
    // Trim whitespace and limit length
    const trimmed = content.trim().substring(0, 10000);
    
    // Sanitize HTML
    return this.sanitizeHtml(trimmed);
  }

  // Validate phone number format
  static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid format (8-15 digits)
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must be between 8-15 digits' };
    }

    // Additional validation for common formats
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    if (!phoneRegex.test(digitsOnly)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return { isValid: true };
  }

  // Validate email format
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  // Generate secure email from phone number
  static generateSecureEmailFromPhone(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');
    const timestamp = Date.now();
    return `user_${digitsOnly}_${timestamp}@temp.local`;
  }

  // Validate UUID format
  static isValidUUID(uuid: string): boolean {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Validate user role
  static isValidRole(role: string): role is 'client' | 'admin' | 'designer' {
    return ['client', 'admin', 'designer'].includes(role);
  }

  // Rate limiting check (simple in-memory implementation)
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    const existing = this.rateLimitMap.get(key);
    
    if (!existing || now > existing.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (existing.count >= maxAttempts) {
      return false;
    }
    
    existing.count++;
    return true;
  }

  // Sanitize file name
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return 'unnamed_file';
    
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // Validate file type
  static validateFileType(fileName: string, allowedTypes: string[] = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']): boolean {
    if (!fileName) return false;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  // Log security event helper
  static async logSecurityEvent(action: string, resourceType: string, resourceId?: string) {
    try {
      // This would be called from service layer with proper supabase client
      console.log(`Security Event: ${action} on ${resourceType}${resourceId ? ` (ID: ${resourceId})` : ''}`);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}
