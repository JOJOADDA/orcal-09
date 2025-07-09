import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnifiedChatWindow from './UnifiedChatWindow';
import { vi } from 'vitest';

// Mockات أساسية
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/useLightningChat', () => ({
  useLightningChat: () => ({
    messages: [
      { id: '1', sender_id: 'u1', sender_name: 'أحمد', sender_role: 'client', content: 'مرحبا', message_type: 'text' },
      { id: '2', sender_id: 'u2', sender_name: 'سارة', sender_role: 'designer', content: 'أهلا بك', message_type: 'text' },
    ],
    isLoading: false,
    isLoadingMessages: false,
    onlineStatus: true,
    messagesEndRef: { current: null },
    sendMessage: vi.fn(async () => true),
    isTyping: false,
  })
}));
vi.mock('@/services/unifiedChatService', () => ({
  unifiedChatService: {
    uploadFile: vi.fn(async () => ({ name: 'test.png', url: 'https://test.com/test.png' }))
  }
}));

const user = { id: 'u1', name: 'أحمد', role: 'client' };
const order = { id: 'o1', client_name: 'أحمد', design_type: 'شعار', status: 'pending' };

describe('UnifiedChatWindow', () => {
  it('يظهر الرسائل بشكل صحيح', () => {
    render(<UnifiedChatWindow user={user as any} order={order as any} onClose={() => {}} />);
    expect(screen.getByText('مرحبا')).toBeInTheDocument();
    expect(screen.getByText('أهلا بك')).toBeInTheDocument();
  });

  it('يرسل رسالة نصية', async () => {
    render(<UnifiedChatWindow user={user as any} order={order as any} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('اكتب رسالتك هنا...');
    fireEvent.change(input, { target: { value: 'اختبار' } });
    fireEvent.click(screen.getByRole('button', { name: /إرسال/i }));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('يرفض رفع ملف غير مدعوم', async () => {
    render(<UnifiedChatWindow user={user as any} order={order as any} onClose={() => {}} />);
    const fileInput = screen.getByLabelText('إرفاق ملف');
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.queryByText('test.exe')).not.toBeInTheDocument();
    });
  });

  it('يظهر معاينة الملف عند رفع صورة', async () => {
    render(<UnifiedChatWindow user={user as any} order={order as any} onClose={() => {}} />);
    const fileInput = screen.getByLabelText('إرفاق ملف');
    const file = new File(['img'], 'img.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByAltText('img.png')).toBeInTheDocument();
    });
  });

  it('يدعم الرد على رسالة', async () => {
    render(<UnifiedChatWindow user={user as any} order={order as any} onClose={() => {}} />);
    const replyBtns = screen.getAllByTitle('رد');
    fireEvent.click(replyBtns[0]);
    expect(screen.getByText(/رد على:/)).toBeInTheDocument();
  });
});