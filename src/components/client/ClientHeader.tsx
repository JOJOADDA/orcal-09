
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { Profile } from '@/types/database';

interface ClientHeaderProps {
  user: Profile;
  onCreateOrder: () => void;
  onLogout: () => void;
}

const ClientHeader = ({ user, onCreateOrder, onLogout }: ClientHeaderProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <img 
            src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
            alt="أوركال" 
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
              مرحباً {user.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">لوحة تحكم العميل</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={onCreateOrder}
            className="text-sm sm:text-base"
            size="sm"
          >
            <Plus className="w-4 h-4 ml-2" />
            طلب جديد
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="text-sm sm:text-base"
            size="sm"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
