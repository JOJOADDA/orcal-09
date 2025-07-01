
import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder } from '@/types/database';

class OptimizedSupabaseService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

  // تخزين مؤقت محسن
  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // مصادقة محسنة
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { data: null, error, success: false };
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) return { data: null, error, success: false };
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      this.clearCache();
      if (error) return { error, success: false };
      return { error: null, success: true };
    } catch (error: any) {
      return { error: error.message, success: false };
    }
  }

  // طلبات محسنة للبيانات
  async getOrders(userId: string): Promise<DesignOrder[]> {
    const cacheKey = `orders_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.setCachedData(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    const cacheKey = 'all_orders';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.setCachedData(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  // تنظيف التخزين المؤقت
  clearCache() {
    this.cache.clear();
  }

  invalidateCache(pattern?: string) {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.clearCache();
    }
  }
}

export const optimizedSupabaseService = new OptimizedSupabaseService();
