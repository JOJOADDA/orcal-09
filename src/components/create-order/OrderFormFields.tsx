
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette } from 'lucide-react';

interface OrderFormFieldsProps {
  formData: {
    design_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isLoading: boolean;
}

const OrderFormFields = ({ formData, onInputChange, isLoading }: OrderFormFieldsProps) => {
  const designTypes = [
    'تصميم شعار (Logo)',
    'هوية بصرية كاملة',
    'منشورات سوشيال ميديا',
    'تصميم بروشور أو فلاير',
    'تصميم بانر إعلاني',
    'تصميم كارت شخصي',
    'تصميم مطبوعات',
    'تصميم عرض تقديمي',
    'تصميم تغليف منتج',
    'أخرى'
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="design_type" className="flex items-center gap-2 font-semibold text-gray-700">
            <Palette className="w-4 h-4 text-red-500" />
            نوع التصميم المطلوب *
          </Label>
          <select
            id="design_type"
            name="design_type"
            value={formData.design_type}
            onChange={onInputChange}
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-red-400 transition-colors"
            required
            disabled={isLoading}
          >
            <option value="">اختر نوع التصميم</option>
            {designTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="font-semibold text-gray-700">
            الأولوية
          </Label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={onInputChange}
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-red-400 transition-colors"
            disabled={isLoading}
          >
            <option value="low">عادية</option>
            <option value="medium">متوسطة</option>
            <option value="high">عاجلة</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-semibold text-gray-700">
          تفاصيل التصميم المطلوب *
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="اكتب هنا تفاصيل التصميم بدقة: الألوان المفضلة، النص المطلوب، الأسلوب، أي ملاحظات خاصة..."
          className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-xl"
          required
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default OrderFormFields;
