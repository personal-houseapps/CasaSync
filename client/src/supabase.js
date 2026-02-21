import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hwmrhrgsodzzmkkenntn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bC9uf-9AOCbRqFS5wEqafw_qXICOznU';

export const supabase = createClient(supabaseUrl, supabaseKey);
