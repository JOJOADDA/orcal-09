
import { supabase } from '@/integrations/supabase/client';
import { OrderFile } from '@/types/database';

export class FileService {
  private handleError(error: any, context: string) {
    console.error(`[FileService ${context}] Error:`, error);
    return error;
  }

  async uploadFile(file: File, orderId: string, uploaderId: string): Promise<OrderFile | null> {
    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${orderId}/${fileName}`;

      // رفع الملف إلى Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return null;
      }

      // الحصول على URL العام للملف
      const { data: urlData } = supabase.storage
        .from('order-files')
        .getPublicUrl(uploadData.path);

      // حفظ معلومات الملف في قاعدة البيانات
      const { data: fileRecord, error: dbError } = await supabase
        .from('order_files')
        .insert({
          order_id: orderId,
          uploaded_by: uploaderId,
          name: file.name,
          url: urlData.publicUrl,
          file_type: this.getFileType(file.name),
          size_bytes: file.size
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database save error:', dbError);
        return null;
      }

      console.log('File uploaded and saved successfully');
      return fileRecord;
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
