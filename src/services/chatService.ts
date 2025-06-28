
import { User, DesignOrder, ChatMessage, ChatRoom, OrderFile } from '@/types/chat';

class ChatService {
  private static instance: ChatService;
  private users: User[] = [];
  private orders: DesignOrder[] = [];
  private messages: ChatMessage[] = [];
  private chatRooms: ChatRoom[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeAdminUser();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem('orcal_users');
      const ordersData = localStorage.getItem('orcal_orders');
      const messagesData = localStorage.getItem('orcal_messages');
      const roomsData = localStorage.getItem('orcal_chat_rooms');

      if (usersData) this.users = JSON.parse(usersData);
      if (ordersData) this.orders = JSON.parse(ordersData);
      if (messagesData) this.messages = JSON.parse(messagesData);
      if (roomsData) this.chatRooms = JSON.parse(roomsData);
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('orcal_users', JSON.stringify(this.users));
      localStorage.setItem('orcal_orders', JSON.stringify(this.orders));
      localStorage.setItem('orcal_messages', JSON.stringify(this.messages));
      localStorage.setItem('orcal_chat_rooms', JSON.stringify(this.chatRooms));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private initializeAdminUser() {
    const adminExists = this.users.some(user => user.role === 'admin');
    if (!adminExists) {
      const admin: User = {
        id: 'admin-1',
        name: 'فريق أوركال',
        phone: '+249112596876',
        role: 'admin',
        createdAt: new Date()
      };
      this.users.push(admin);
      this.saveToStorage();
    }
  }

  // User Management
  createUser(name: string, phone: string): User {
    const existingUser = this.users.find(u => u.phone === phone);
    if (existingUser) return existingUser;

    const user: User = {
      id: `user-${Date.now()}`,
      name,
      phone,
      role: 'client',
      createdAt: new Date()
    };

    this.users.push(user);
    this.saveToStorage();
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getCurrentUser(): User | null {
    const userId = localStorage.getItem('current_user_id');
    return userId ? this.getUserById(userId) : null;
  }

  setCurrentUser(userId: string) {
    localStorage.setItem('current_user_id', userId);
  }

  // Order Management
  createOrder(orderData: Omit<DesignOrder, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'files'>): DesignOrder {
    const order: DesignOrder = {
      ...orderData,
      id: `order-${Date.now()}`,
      status: 'pending',
      files: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(order);
    
    // Create chat room for this order
    this.createChatRoom(order.id, order.clientId);
    
    // Send system message
    this.sendSystemMessage(order.id, `تم إنشاء طلب تصميم جديد: ${order.designType}`);
    
    this.saveToStorage();
    return order;
  }

  getOrdersByClientId(clientId: string): DesignOrder[] {
    return this.orders.filter(order => order.clientId === clientId);
  }

  getAllOrders(): DesignOrder[] {
    return this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateOrderStatus(orderId: string, status: DesignOrder['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.sendSystemMessage(orderId, `تم تحديث حالة الطلب إلى: ${this.getStatusText(status)}`);
      this.saveToStorage();
    }
  }

  private getStatusText(status: DesignOrder['status']): string {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'delivered': 'تم التسليم'
    };
    return statusMap[status];
  }

  // Chat Management
  createChatRoom(orderId: string, clientId: string): ChatRoom {
    const existingRoom = this.chatRooms.find(room => room.orderId === orderId);
    if (existingRoom) return existingRoom;

    const room: ChatRoom = {
      id: `room-${Date.now()}`,
      orderId,
      clientId,
      adminId: 'admin-1',
      unreadCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.chatRooms.push(room);
    this.saveToStorage();
    return room;
  }

  getChatRoomByOrderId(orderId: string): ChatRoom | undefined {
    return this.chatRooms.find(room => room.orderId === orderId);
  }

  getAllChatRooms(): ChatRoom[] {
    return this.chatRooms.filter(room => room.isActive)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  sendMessage(orderId: string, senderId: string, content: string, files?: OrderFile[]): ChatMessage {
    const sender = this.getUserById(senderId);
    if (!sender) throw new Error('Sender not found');

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderId,
      senderName: sender.name,
      senderRole: sender.role,
      content,
      type: files && files.length > 0 ? 'file' : 'text',
      files,
      timestamp: new Date(),
      isRead: false
    };

    this.messages.push(message);
    
    // Update chat room
    const room = this.getChatRoomByOrderId(orderId);
    if (room) {
      room.lastMessage = message;
      room.updatedAt = new Date();
      if (sender.role === 'client') {
        room.unreadCount += 1;
      }
    }

    this.saveToStorage();
    return message;
  }

  sendSystemMessage(orderId: string, content: string): ChatMessage {
    const message: ChatMessage = {
      id: `sys-${Date.now()}`,
      orderId,
      senderId: 'system',
      senderName: 'النظام',
      senderRole: 'admin',
      content,
      type: 'system',
      timestamp: new Date(),
      isRead: false
    };

    this.messages.push(message);
    this.saveToStorage();
    return message;
  }

  getMessagesByOrderId(orderId: string): ChatMessage[] {
    return this.messages
      .filter(msg => msg.orderId === orderId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  markMessagesAsRead(orderId: string, userId: string) {
    this.messages.forEach(msg => {
      if (msg.orderId === orderId && msg.senderId !== userId) {
        msg.isRead = true;
      }
    });

    const room = this.getChatRoomByOrderId(orderId);
    if (room) {
      room.unreadCount = 0;
    }

    this.saveToStorage();
  }

  // File Management
  addFileToOrder(orderId: string, file: OrderFile) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.files.push(file);
      order.updatedAt = new Date();
      this.saveToStorage();
    }
  }

  // Statistics for Admin
  getStatistics() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const inProgressOrders = this.orders.filter(o => o.status === 'in-progress').length;
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const activeClients = new Set(this.orders.map(o => o.clientId)).size;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      activeClients
    };
  }
}

export const chatService = ChatService.getInstance();
