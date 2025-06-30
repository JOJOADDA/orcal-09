
import { supabase } from '@/integrations/supabase/client';
import { CacheService } from '../cache/cacheService';

export class StatisticsService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async getStatistics() {
    try {
      const cacheKey = 'statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const [ordersData, profilesData] = await Promise.all([
        supabase.from('design_orders').select('status'),
        supabase.from('profiles').select('role').eq('role', 'client')
      ]);

      const orders = ordersData.data || [];
      const clients = profilesData.data || [];

      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inProgressOrders: orders.filter(o => o.status === 'in-progress').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        activeClients: clients.length
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      this.handleError(error, 'Get Statistics');
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        activeClients: 0
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch (error) {
      this.handleError(error, 'Health Check');
      return false;
    }
  }
}

export const statisticsService = new StatisticsService();
