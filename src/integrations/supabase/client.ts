
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uloyiazdqsnoftkmkllc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsb3lpYXpkcXNub2Z0a21rbGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzkwNTEsImV4cCI6MjA2Njc1NTA1MX0.X2G37sjj8tDpdsvCWs-xf6BLyn3FR-dYSfkBhnMDcDs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
