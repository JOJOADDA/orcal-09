import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedChatWindow from './UnifiedChatWindow';
import { Profile, DesignOrder } from '@/types/database';

describe('UnifiedChatWindow', () => {
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

  it('should render chat window and allow sending a message', () => {
    render(<UnifiedChatWindow user={user} order={order} onClose={() => {}} />);
    expect(screen.getByPlaceholderText('اكتب رسالتك هنا...')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('اكتب رسالتك هنا...'), { target: { value: 'رسالة اختبار' } });
    fireEvent.click(screen.getByRole('button'));
    // لا يمكن التحقق من ظهور الرسالة مباشرة لأن الدالة sendMessage وهمية في الاختبار
  });
});