
import { Button } from '@/components/ui/button';

interface OrderFormActionsProps {
  onClose: () => void;
  isLoading: boolean;
}

const OrderFormActions = ({ onClose, isLoading }: OrderFormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="submit"
        className="flex-1 h-12 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="px-8 h-12 rounded-xl border-2 hover:bg-gray-50"
        disabled={isLoading}
      >
        إلغاء
      </Button>
    </div>
  );
};

export default OrderFormActions;
