
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DesignerProfileService } from '@/services/designers/designerProfileService';

interface DesignerProfileInitProps {
  designerName: string;
  onProfileInitialized: (profile: any) => void;
}

const DesignerProfileInit = ({ designerName, onProfileInitialized }: DesignerProfileInitProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeDesignerProfile = async () => {
      try {
        console.log('=== Initializing designer profile ===');
        console.log('Designer name:', designerName);
        
        if (!designerName || designerName.trim() === '') {
          throw new Error('اسم المصمم مطلوب');
        }
        
        const profile = await DesignerProfileService.createDesignerProfile(designerName);
        
        if (!profile) {
          throw new Error('فشل في إنشاء أو جلب ملف المصمم');
        }
        
        console.log('Designer profile created/retrieved:', profile);
        onProfileInitialized(profile);
        console.log('Designer profile initialized successfully');
      } catch (error) {
        console.error('Error initializing designer profile:', error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'فشل في تهيئة ملف المصمم';
          
        toast({
          title: "خطأ في تحميل ملف المصمم",
          description: errorMessage,
          variant: "destructive"
        });
        
        // إعادة المحاولة بعد ثانيتين
        setTimeout(() => {
          if (isInitializing) {
            console.log('Retrying profile initialization...');
            initializeDesignerProfile();
          }
        }, 2000);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDesignerProfile();
  }, [designerName, onProfileInitialized, toast, isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تهيئة لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default DesignerProfileInit;
