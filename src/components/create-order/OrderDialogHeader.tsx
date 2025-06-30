
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { X, FileText } from 'lucide-react';

interface OrderDialogHeaderProps {
  onClose: () => void;
}

const OrderDialogHeader = ({ onClose }: OrderDialogHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-red-50 to-purple-50">
      <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
        <FileText className="w-6 h-6 text-red-500" />
        إنشاء طلب تصميم جديد
      </CardTitle>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 hover:bg-red-100"
      >
        <X className="w-4 h-4" />
      </Button>
    </CardHeader>
  );
};

export default OrderDialogHeader;
