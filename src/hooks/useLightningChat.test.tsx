import { renderHook, act } from '@testing-library/react-hooks';
import { Profile, DesignOrder } from '@/types/database';
import { useLightningChat } from './useLightningChat';

describe('useLightningChat', () => {
  const user: Profile = {
    id: 'user1',
    name: 'مستخدم تجريبي',
    role: 'client',
    created_at: '',
    updated_at: '',
    phone: '',
    avatar_url: null
  };
  const order: DesignOrder = {
    id: 'order1',
    client_id: 'user1',
    client_name: 'مستخدم تجريبي',
    design_type: 'شعار',
    description: 'طلب شعار',
    status: 'pending',
    priority: 'medium',
    created_at: '',
    updated_at: '',
    total_price: 0,
    client_phone: '',
    designer_id: null,
    designer_name: null,
    delivered_at: null
  };

  it('should initialize and allow sending a message', async () => {
    const { result } = renderHook(() => useLightningChat({ user, order }));
    expect(result.current.messages).toBeDefined();
    await act(async () => {
      await result.current.sendMessage('رسالة اختبار');
    });
  });
});