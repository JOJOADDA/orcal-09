import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from './NotificationProvider';

interface NotificationPermissionPromptProps {
  onClose: () => void;
}

const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ onClose }) => {
  const { requestNotificationPermission } = useNotifications();

  const handleAllow = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onClose();
    }
  };

  const handleDeny = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            تفعيل الإشعارات
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center leading-relaxed">
            احصل على إشعارات فورية عند وصول رسائل جديدة حتى عندما تكون خارج التطبيق، 
            مثل الواتساب تماماً.
          </p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleAllow}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              السماح بالإشعارات
            </Button>
            
            <Button 
              onClick={handleDeny}
              variant="outline"
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              لا، شكراً
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            يمكنك تغيير هذا الإعداد في أي وقت من إعدادات المتصفح
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPermissionPrompt;