
import { useState, useEffect } from 'react';
import { chatService } from '@/services/chatService';
import { User } from '@/types/chat';
import LoginForm from '@/components/LoginForm';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import Home from './Home';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = chatService.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleLogin = (userId: string) => {
    const user = chatService.getUserById(userId);
    setCurrentUser(user || null);
    // Don't automatically show dashboard, show home page first
    setShowDashboard(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user_id');
    setCurrentUser(null);
    setShowDashboard(false);
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
            alt="أوركال" 
            className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse"
          />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show dashboard only when requested
  if (showDashboard) {
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }
    return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // Show home page with dashboard access
  return <Home user={currentUser} onDashboardClick={handleDashboardClick} />;
};

export default Index;
