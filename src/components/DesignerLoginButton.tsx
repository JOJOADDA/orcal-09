
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface DesignerLoginButtonProps {
  onShowDesignerAuth: () => void;
}

const DesignerLoginButton = ({ onShowDesignerAuth }: DesignerLoginButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onShowDesignerAuth}
        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
        size="lg"
      >
        <Palette className="w-6 h-6 mr-2" />
        دخول المصممين
      </Button>
    </div>
  );
};

export default DesignerLoginButton;
