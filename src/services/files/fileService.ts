
import { supabase } from '@/integrations/supabase/client';
import { OrderFile, MessageFile } from '@/types/database';
import { CacheService } from '../cache/cacheService';

export class FileService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async getOrderFiles(orderId: string): Promise<OrderFile[]> {
    try {
      const cacheKey = `files_${orderId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get Order Files');
        return [];
      }

      const files = data.map(file => ({
        ...file,
        file_type: file.file_type as 'image' | 'document' | 'design'
      })) as OrderFile[];

      this.setCache(cacheKey, files);
      return files;
    } catch (error) {
      this.handleError(error, 'Get Order Files');
      return [];
    }
  }

  async uploadOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    try {
      console.log('Uploading order file:', fileData.name);
      
      const { data, error } = await supabase
        .from('order_files')
        .insert(fileData)
        .select()
        .single();

      if (!error) {
        this.clearCache(`files_${fileData.order_id}`);
      }

      return { data: data as OrderFile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Upload Order File') };
    }
  }

  async deleteOrderFile(fileId: string) {
    try {
      const { error } = await supabase
        .from('order_files')
        .delete()
        .eq('id', fileId);

      if (!error) {
        this.clearCache('files');
      }

      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Delete Order File') };
    }
  }

  async uploadFile(file: File, bucket: string, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // محاكاة رفع الملف - في البيئة الحقيقية سيتم استخدام Storage
      const mockUrl = `https://api.orcal.app/files/${fileName}`;
      
      console.log('File uploaded (mock):', mockUrl);
      return mockUrl;
    } catch (error) {
      this.handleError(error, 'Upload File');
      return null;
    }
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    try {
      const cacheKey = `message_files_${messageId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('message_files')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        this.handleError(error, 'Get Message Files');
        return [];
      }

      const files = data.map(file => ({
        ...file,
        file_type: file.file_type as 'image' | 'document' | 'design'
      })) as MessageFile[];

      this.setCache(cacheKey, files);
      return files;
    } catch (error) {
      this.handleError(error, 'Get Message Files');
      return [];
    }
  }

  async uploadMessageFile(fileData: {
    message_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('message_files')
        .insert(fileData)
        .select()
        .single();

      if (!error) {
        this.clearCache(`message_files_${fileData.message_id}`);
      }

      return { data: data as MessageFile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Upload Message File') };
    }
  }
}

export const fileService = new FileService();
