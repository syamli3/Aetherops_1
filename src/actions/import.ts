'use server';

import { createClient as createSSRClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bulk insert records into sf_records.
 * Strict Rule: Automation flows are bypassed for high-volume efficiency.
 */
export async function bulkImportRecords(objectId: string, mappedRecords: any[], resourceName: string) {
  try {
    const supabase = await createSSRClient();
    
    // Get current user for ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Transform into sf_records schema
    const recordsToInsert = mappedRecords.map(data => ({
      id: uuidv4(),
      object_id: objectId,
      owner_id: user.id,
      record_data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Perform bulk insert
    const { error } = await supabase
      .from('sf_records')
      .insert(recordsToInsert);

    if (error) throw error;

    // revalidate the resource path
    revalidatePath(`/${resourceName}`);
    revalidatePath('/home');

    return { success: true, count: recordsToInsert.length };
  } catch (error: any) {
    console.error('Bulk Import Error:', error);
    return { success: false, error: error.message };
  }
}
