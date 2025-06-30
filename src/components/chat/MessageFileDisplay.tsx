
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Download, File, Image, Eye, X } from 'lucide-react';
import { MessageFile } from '@/types/database';
import { unifiedFileService } from '@/services/unified/unifiedFileService';

interface MessageFileDisplayProps {
  files: MessageFile[];
  className?: string;
}

const MessageFileDisplay = ({ files, className = '' }: MessageFileDisplayProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!files || files.length === 0) return null;

  const handleDownload = async (file: MessageFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {files.map((file) => (
        <div key={file.id} className="border rounded-lg overflow-hidden bg-white/50">
          {unifiedFileService.isImageFile(file.name) ? (
            // Image display
            <div className="relative group">
              <img
                src={file.url}
                alt={file.name}
                className="w-full max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(file.url)}
                onError={(e) => {
                  console.error('Image failed to load:', file.url);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => setSelectedImage(file.url)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  عرض
                </Button>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{unifiedFileService.formatFileSize(file.size_bytes)}</p>
              </div>
            </div>
          ) : (
            // File display
            <div className="p-3 flex items-center gap-3">
              <div className="flex-shrink-0">
                <File className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{unifiedFileService.formatFileSize(file.size_bytes)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(file)}
                className="flex-shrink-0"
              >
                <Download className="w-4 h-4 mr-1" />
                تحميل
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Image preview modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MessageFileDisplay;
