
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  senderName: string;
  senderInitials: string;
}

const TypingIndicator = ({ senderName, senderInitials }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
          {senderInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-gray-200 rounded-2xl px-4 py-3 rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2">{senderName} يكتب...</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
