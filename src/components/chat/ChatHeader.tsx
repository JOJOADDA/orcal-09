
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CardHeader } from '@/components/ui/card';
import { 
  X, Phone, Video, MoreVertical
} from 'lucide-react';
import { DesignOrder, Profile } from '@/types/database';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  order: DesignOrder;
  user: Profile;
  onlineStatus: boolean;
  onClose: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSettings?: () => void;
}

const ChatHeader = ({ order, user, onlineStatus, onClose, onCall, onVideoCall, onSettings }: ChatHeaderProps) => {
  const getStatusColor = (status: DesignOrder['status']) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'in-progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'delivered': 'bg-purple-500'
    };
    return colors[status];
  };

  const getStatusText = (status: DesignOrder['status']) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'delivered': 'تم التسليم'
    };
    return statusMap[status];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-white/20">
          <AvatarFallback className="bg-white/10 text-white font-semibold">
            {order.client_name ? getInitials(order.client_name) : 'ع'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{order.design_type}</h3>
            <Badge 
              className={cn(
                "text-xs text-white border-white/20",
                getStatusColor(order.status)
              )}
            >
              {getStatusText(order.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>العميل: {order.client_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                onlineStatus ? "bg-green-400" : "bg-gray-400"
              )} />
              {onlineStatus ? "متصل" : "غير متصل"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onCall && (
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onCall}>
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {onVideoCall && (
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onVideoCall}>
            <Video className="w-4 h-4" />
          </Button>
        )}
        {onSettings && (
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onSettings}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        )}
        <Separator orientation="vertical" className="h-6 bg-white/20" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-red-500/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
