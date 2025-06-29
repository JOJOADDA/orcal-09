
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, FileText, Palette, File, Image, Trash2 } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderDialogProps {
  user: Profile;
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderDialog = ({ user, onClose, onOrderCreated }: CreateOrderDialogProps) => {
  const [formData, setFormData] = useState({
    design_type: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.design_type || !formData.description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the order
      const { data: order, error: orderError } = await supabaseService.createOrder({
        client_id: user.id,
        client_name: user.name,
        client_phone: user.phone,
        design_type: formData.design_type,
        description: formData.description,
        priority: formData.priority
      });

      if (orderError || !order) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileUrl = await supabaseService.uploadFile(file, 'order-files', user.id);
          if (fileUrl) {
            await supabaseService.addOrderFile({
              order_id: order.id,
              name: file.name,
              url: fileUrl,
              file_type: file.type.startsWith('image/') ? 'image' : 'document',
              size_bytes: file.size,
              uploaded_by: user.id
            });
          }
        }

        // Send file message
        const room = await supabaseService.getChatRoomByOrderId(order.id);
        if (room) {
          await supabaseService.sendMessage({
            room_id: room.id,
            order_id: order.id,
            sender_id: user.id,
            sender_name: user.name,
            sender_role: 'client',
            content: `تم رفع ${files.length} ملف(ات) مرفقة مع الطلب`,
            message_type: 'file'
          });
        }
      }

      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "سيتم التواصل معك قريباً من فريق التصميم",
      });

      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
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
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="اكتب هنا تفاصيل التصميم بدقة: الألوان المفضلة، النص المطلوب، الأسلوب، أي ملاحظات خاصة..."
                className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-xl"
                required
                disabled={isLoading}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <Label className="font-semibold text-gray-700">
                رفع ملفات مرجعية (اختياري)
              </Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2 font-medium">اضغط لرفع الملفات</p>
                  <p className="text-sm text-gray-500">
                    يمكنك رفع صور، PDF، أو مستندات (الحد الأقصى: 10 ملفات)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">الملفات المرفوعة:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrderDialog;
