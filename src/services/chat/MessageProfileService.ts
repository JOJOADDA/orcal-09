
import { supabase } from '@/integrations/supabase/client';
import { MessageValidationService } from './MessageValidationService';

export class MessageProfileService {
  async verifyDesignerProfile(designerId: string): Promise<boolean> {
    try {
      console.log('Verifying designer profile exists:', designerId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', designerId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking designer profile:', fetchError);
        return false;
      }

      if (!existingProfile) {
        console.log('Profile not found for user:', designerId);
        return false;
      }

      if (existingProfile.role === 'designer') {
        console.log('Designer profile verified:', existingProfile);
        return true;
      }

      console.log('User exists but is not a designer. Role:', existingProfile.role);
      return false;
    } catch (error) {
      MessageValidationService.handleError(error, 'Verify Designer Profile');
      return false;
    }
  }

  async verifyClientProfile(userId: string): Promise<boolean> {
    try {
      console.log('Verifying client profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error verifying client profile:', error);
        return false;
      }

      const isValid = !!data;
      console.log('Client profile verification result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Unexpected error in verifyClientProfile:', error);
      return false;
    }
  }
}
