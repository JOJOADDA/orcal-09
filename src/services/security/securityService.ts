
import { supabase } from '@/integrations/supabase/client';
import { SecurityUtils } from '@/utils/security';

export class SecurityService {
  // Log security events to audit table
  static async logSecurityEvent(
    action: string, 
    resourceType: string, 
    resourceId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Also log to console for development
      console.log(`[SECURITY] ${action} on ${resourceType}`, {
        resourceId,
        ...additionalData
      });
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  // Validate authentication state
  static async validateAuthState(): Promise<{ isValid: boolean; user?: any; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { isValid: false, error: 'Authentication error' };
      }

      if (!session?.user) {
        return { isValid: false, error: 'Not authenticated' };
      }

      return { isValid: true, user: session.user };
    } catch (error) {
      return { isValid: false, error: 'Authentication validation failed' };
    }
  }

  // Check if user has required role
  static async checkUserRole(requiredRole: string): Promise<{ hasRole: boolean; userRole?: string; error?: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        return { hasRole: false, error: 'Failed to check user role' };
      }

      const hasRole = profile?.role === requiredRole || profile?.role === 'admin';
      return { hasRole, userRole: profile?.role };
    } catch (error) {
      return { hasRole: false, error: 'Role validation failed' };
    }
  }

  // Validate order access permissions
  static async validateOrderAccess(orderId: string): Promise<{ hasAccess: boolean; error?: string }> {
    try {
      if (!SecurityUtils.isValidUUID(orderId)) {
        return { hasAccess: false, error: 'Invalid order ID format' };
      }

      const { data: order, error } = await supabase
        .from('design_orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (error) {
        await this.logSecurityEvent('UNAUTHORIZED_ORDER_ACCESS_ATTEMPT', 'design_orders', orderId);
        return { hasAccess: false, error: 'Order access denied' };
      }

      await this.logSecurityEvent('ORDER_ACCESS_VALIDATED', 'design_orders', orderId);
      return { hasAccess: true };
    } catch (error) {
      return { hasAccess: false, error: 'Access validation failed' };
    }
  }

  // Validate message access permissions
  static async validateMessageAccess(messageId: string): Promise<{ hasAccess: boolean; error?: string }> {
    try {
      if (!SecurityUtils.isValidUUID(messageId)) {
        return { hasAccess: false, error: 'Invalid message ID format' };
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('id', messageId)
        .single();

      if (error) {
        await this.logSecurityEvent('UNAUTHORIZED_MESSAGE_ACCESS_ATTEMPT', 'chat_messages', messageId);
        return { hasAccess: false, error: 'Message access denied' };
      }

      return { hasAccess: true };
    } catch (error) {
      return { hasAccess: false, error: 'Message access validation failed' };
    }
  }
}
