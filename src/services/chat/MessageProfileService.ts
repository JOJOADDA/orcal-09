
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

      if (existingProfile) {
        console.log('Designer profile verified:', existingProfile);
        return true;
      }

      console.log('Designer profile not found - this should not happen for authenticated users');
      return false;
    } catch (error) {
      MessageValidationService.handleError(error, 'Verify Designer Profile');
      return false;
    }
  }
}
