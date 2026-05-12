'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getActivitiesForRecord(recordId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_activities')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) {
       console.error('Error fetching activities:', error);
       return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception fetching activities:', err);
    return [];
  }
}

export async function logActivity(
  recordId: string, 
  resourceName: string,
  payload: { type: 'Call' | 'Email' | 'Note' | 'Meeting', subject: string, description: string, activityData?: Record<string, any> }
) {
  try {
    const { error } = await (supabaseAdmin.from('sf_activities') as any).insert({
         record_id: recordId,
         type: payload.type,
         subject: payload.subject,
         description: payload.description,
         activity_data: payload.activityData || {},
         // user_id would be inserted here from auth session usually
      });

    if (error) {
       console.error('Error logging activity:', error);
       return { success: false, error: error.message };
    }

    revalidatePath(`/${resourceName}/${recordId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception logging activity:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
