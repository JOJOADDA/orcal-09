
import { supabase } from '@/integrations/supabase/client';
import { OrderFile } from '@/types/database';

export class FileService {
  private handleError(error: any, context: string) {
    console.error(`[FileService ${context}] Error:`, error);
    return error;
  }

  async uploadFile(file: File, orderId: string, uploaderId: string): Promise<OrderFile | null> {
    try {
      console.log('Uploading file:', file.name);
      
      // محاكاة رفع الملف
      const fileUrl = `https://api.orcal.app/files/${uploaderId}/${Date.now()}_${file.name}`;
      
      const fileData: OrderFile = {
        id: `file-${Date.now()}`,
        order_id: orderId,
        name: file.name,
        url: fileUrl,
        file_type: this.getFileType(file.name),
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: uploaderId
      };

      const { data, error } = await supabase
        .from('order_files')
        .insert(fileData)
        .select()
        .single();

      if (error) {
        console.error('Error saving file info:', error);
        return null;
      }

      console.log('File uploaded successfully:', fileUrl);
      return data as OrderFile;
    } catch (error) {
      this.handleError(error, 'Upload File');
      return null;
    }
  }

  private getFileType(fileName: string): 'image' | 'document' | 'design' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document';
    }
    return 'design';
  }
}

export const fileService = new FileService();
