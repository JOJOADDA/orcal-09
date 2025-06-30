
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';
import { authService } from './auth/authService';
import { profileService } from './profiles/profileService';
import { orderService } from './orders/orderService';
import { chatService } from './chat/chatService';
import { designerService } from './designers/designerService';
import { fileService } from './files/fileService';
import { statisticsService } from './statistics/statisticsService';

class SupabaseService {
  // Authentication methods
  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    return await authService.signUp(identifier, password, name, phone);
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    return await authService.signIn(identifier, password, type);
  }

  async signOut() {
    const result = await authService.signOut();
    this.clearAllCache();
    return result;
  }

  async getCurrentUser() {
    return await authService.getCurrentUser();
  }

  async getCurrentSession() {
    return await authService.getCurrentSession();
  }

  async resendConfirmation(email: string) {
    return await authService.resendConfirmation(email);
  }

  // Profile Management
  async createProfile(userId: string, name: string, email: string, phone: string, role: 'client' | 'admin' | 'designer' = 'client') {
    return await profileService.createProfile(userId, name, email, phone, role);
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return await profileService.getProfile(userId);
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    return await profileService.updateProfile(userId, updates);
  }

  // Design Orders
  async createOrder(orderData: {
    client_id: string;
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    total_price?: number;
  }) {
    const result = await orderService.createOrder(orderData);
    if (result.data && !result.error) {
      await chatService.createChatRoom(result.data.id, orderData.client_id);
    }
    return result;
  }

  async getOrdersByClientId(clientId: string): Promise<DesignOrder[]> {
    return await orderService.getOrdersByClientId(clientId);
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    return await orderService.getAllOrders();
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') {
    return await orderService.updateOrderStatus(orderId, status);
  }

  async updateOrder(orderId: string, updates: Partial<DesignOrder>) {
    return await orderService.updateOrder(orderId, updates);
  }

  async deleteOrder(orderId: string) {
    return await orderService.deleteOrder(orderId);
  }

  // File Management
  async getOrderFiles(orderId: string): Promise<OrderFile[]> {
    return await fileService.getOrderFiles(orderId);
  }

  async uploadOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    return await fileService.uploadOrderFile(fileData);
  }

  async deleteOrderFile(fileId: string) {
    return await fileService.deleteOrderFile(fileId);
  }

  async uploadFile(file: File, bucket: string, userId: string): Promise<string | null> {
    return await fileService.uploadFile(file, bucket, userId);
  }

  async addOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    return await fileService.uploadOrderFile(fileData);
  }

  // Chat Management
  async createChatRoom(orderId: string, clientId: string, adminId?: string) {
    return await chatService.createChatRoom(orderId, clientId, adminId);
  }

  async getChatRoom(orderId: string): Promise<ChatRoom | null> {
    return await chatService.getChatRoom(orderId);
  }

  async getChatRoomByOrderId(orderId: string): Promise<ChatRoom | null> {
    return await chatService.getChatRoom(orderId);
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    return await chatService.getAllChatRooms();
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return await chatService.getChatMessages(roomId);
  }

  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
    return await chatService.getMessagesByOrderId(orderId);
  }

  async sendMessage(messageData: {
    room_id: string;
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }) {
    return await chatService.sendMessage(messageData);
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    return await chatService.markMessagesAsRead(roomId, userId);
  }

  // Statistics
  async getStatistics() {
    return await statisticsService.getStatistics();
  }

  // Real-time subscriptions
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void) {
    return chatService.subscribeToMessages(orderId, callback);
  }

  // Message Files
  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    return await fileService.getMessageFiles(messageId);
  }

  async uploadMessageFile(fileData: {
    message_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
  }) {
    return await fileService.uploadMessageFile(fileData);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    return await statisticsService.healthCheck();
  }

  // Clear all cache
  clearAllCache(): void {
    profileService.clearAllCache();
    orderService.clearAllCache();
    chatService.clearAllCache();
    designerService.clearAllCache();
    fileService.clearAllCache();
    statisticsService.clearAllCache();
  }

  // Designer Management
  async signUpDesigner(designerData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    specialization?: string;
    experienceYears?: number;
    portfolioUrl?: string;
  }) {
    return await designerService.signUpDesigner(designerData);
  }

  async getDesignerByUserId(userId: string) {
    return await designerService.getDesignerByUserId(userId);
  }

  async getAllDesigners() {
    return await designerService.getAllDesigners();
  }

  async updateDesigner(userId: string, updates: Partial<{
    name: string;
    phone: string;
    specialization: string;
    experience_years: number;
    portfolio_url: string;
    status: 'active' | 'inactive' | 'pending';
  }>) {
    return await designerService.updateDesigner(userId, updates);
  }
}

export const supabaseService = new SupabaseService();
