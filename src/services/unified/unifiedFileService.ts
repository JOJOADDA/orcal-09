
import { supabase } from '@/integrations/supabase/client';
import { OrderFile, MessageFile } from '@/types/database';

export class UnifiedFileService {
  private readonly bucketName = 'chat-files';

  async uploadFile(file: File, orderId: string, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}/${userId}/${Date.now()}.${fileExt}`;

      console.log('Uploading file to Supabase Storage:', fileName);

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('File upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('File uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async createMessageFile(messageId: string, file: File, fileUrl: string): Promise<MessageFile | null> {
    try {
      const fileType = this.getFileType(file.type);
      
      const { data, error } = await supabase
        .from('message_files')
        .insert({
          message_id: messageId,
          name: file.name,
          url: fileUrl,
          file_type: fileType,
          size_bytes: file.size
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating message file record:', error);
        return null;
      }

      return data as MessageFile;
    } catch (error) {
      console.error('Error creating message file:', error);
      return null;
    }
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    try {
      const { data, error } = await supabase
        .from('message_files')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error fetching message files:', error);
        return [];
      }

      return data as MessageFile[];
    } catch (error) {
      console.error('Error getting message files:', error);
      return [];
    }
  }

  private getFileType(mimeType: string): 'image' | 'document' | 'design' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType.includes('pdf') || mimeType.includes('doc') || mimeType.includes('text')) {
      return 'document';
    }
    return 'design';
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const unifiedFileService = new UnifiedFileService();
