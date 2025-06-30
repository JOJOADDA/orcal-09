
import { useState, useEffect, useCallback } from 'react';
import { DesignOrder, Profile } from '@/types/database';
import { realtimeOrderService } from '@/services/realtime/realtimeOrderService';
import { orderService } from '@/services/orders/orderService';

interface UseRealtimeOrdersProps {
  user?: Profile | null;
  subscriptionId: string;
}

export const useRealtimeOrders = ({ user, subscriptionId }: UseRealtimeOrdersProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial orders
  const loadOrders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedOrders: DesignOrder[] = [];
      
      if (user.role === 'client') {
        fetchedOrders = await orderService.getOrdersByClientId(user.id);
      } else if (user.role === 'designer' || user.role === 'admin') {
        fetchedOrders = await orderService.getAllOrders();
      }
      
      setOrders(fetchedOrders);
      console.log(`Loaded ${fetchedOrders.length} orders for ${user.role}:`, user.name);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('فشل في تحميل الطلبات');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Load initial data
    loadOrders();

    // Set up real-time subscription
    const channel = realtimeOrderService.subscribeToOrders(
      subscriptionId,
      (updatedOrders) => {
        console.log('Received real-time orders update:', updatedOrders.length);
        setOrders(updatedOrders);
        setError(null);
      },
      user.role,
      user.id
    );

    // Cleanup on unmount
    return () => {
      realtimeOrderService.unsubscribe(subscriptionId);
    };
  }, [user, subscriptionId, loadOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: loadOrders
  };
};
