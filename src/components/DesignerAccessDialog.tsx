
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SECRET_CODE = '1987730';

interface DesignerAccessDialogProps {
  onClose: () => void;
  onAccessGranted: () => void;
}

const DesignerAccessDialog = ({ onClose, onAccessGranted }: DesignerAccessDialogProps) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرقم السري",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // محاكاة تأخير بسيط للأمان
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (code.trim() === SECRET_CODE) {
      toast({
        title: "تم الدخول بنجاح!",
        description: "مرحباً بك في لوحة تحكم المصممين"
      });
      onAccessGranted();
    } else {
      toast({
        title: "رقم سري خاطئ",
        description: "يرجى التأكد من الرقم السري والمحاولة مرة أخرى",
        variant: "destructive"
      });
      setCode('');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-6 h-6 text-orange-500" />
            دخول المصممين
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال" 
              className="w-16 h-16 mx-auto object-contain mb-4"
            />
            <p className="text-gray-600 text-sm">
              أدخل الرقم السري للوصول إلى لوحة تحكم المصممين
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">الرقم السري</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secret-code" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-500" />
                    أدخل الرقم السري
                  </Label>
                  <div className="relative">
                    <Input
                      id="secret-code"
                      type={showCode ? "text" : "password"}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="الرقم السري"
                      className="text-center text-lg tracking-widest"
                      disabled={isLoading}
                      autoFocus
                      maxLength={10}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowCode(!showCode)}
                      disabled={isLoading}
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    {isLoading ? 'جاري التحقق...' : 'دخول'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerAccessDialog;
