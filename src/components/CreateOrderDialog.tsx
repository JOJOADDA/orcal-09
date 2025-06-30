
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import OrderDialogHeader from './create-order/OrderDialogHeader';
import OrderFormFields from './create-order/OrderFormFields';
import FileUploadSection from './create-order/FileUploadSection';
import OrderFormActions from './create-order/OrderFormActions';

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
        <OrderDialogHeader onClose={onClose} />
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <OrderFormFields
              formData={formData}
              onInputChange={handleInputChange}
              isLoading={isLoading}
            />

            <FileUploadSection
              files={files}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              isLoading={isLoading}
            />

            <OrderFormActions
              onClose={onClose}
              isLoading={isLoading}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrderDialog;
