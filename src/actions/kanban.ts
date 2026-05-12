'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import { getCurrentUserProfileId, getFLSPermissions, applyFLSReadFilter, validateFLSEditGuard } from '@/utils/fls';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getKanbanData(apiName: string, groupByField: string) {
  try {
    // 1. Resolve object ID
    const { data: objectDef } = await supabaseAdmin
      .from('sf_objects')
      .select('id')
      .eq('api_name', apiName)
      .single();

    if (!objectDef) {
      console.error('getKanbanData: Object not found:', apiName);
      return [];
    }

    // 2. Fetch specific fields
    const { data: records, error } = await (supabaseAdmin
      .from('sf_records')
      .select('id, record_data')
      .eq('object_id', (objectDef as any).id) as any);

    if (error) {
      console.error('getKanbanData Error:', error);
      return [];
    }

    if (!records) return [];

    // FLS Read Filter
    const profileId = await getCurrentUserProfileId();
    let perms: any[] = [];
    if (profileId) {
      perms = await getFLSPermissions(profileId, (objectDef as any).id);
    }

    // Map to a cleaner structure for the Client UI
    return records.map((r: any) => ({
      id: r.id,
      name: r.record_data?.Name || r.record_data?.Subject || 'Unnamed Record',
      // We explicitly extract the group_by value here
      status: r.record_data[groupByField] || 'New',
      // Pass the raw data in case the card needs to display secondary fields
      raw_data: profileId ? applyFLSReadFilter(r.record_data, perms) : r.record_data
    }));

  } catch (err) {
    console.error('Exception fetching kanban data:', err);
    return [];
  }
}

// Lightweight JSONB patcher specifically for Kanban moves
export async function updateRecordField(recordId: string, apiName: string, fieldApiName: string, newValue: string) {
  try {
    // 1. Fetch current payload to avoid overwrites
    const { data: existingRecord } = await supabaseAdmin
      .from('sf_records')
      .select('record_data')
      .eq('id', recordId)
      .single();

    if (!existingRecord) {
       return { success: false, error: 'Record not found' };
    }

    // 2. Patch specific key
    const patchedData = { 
       ...((existingRecord as any).record_data as Record<string, any>), 
       [fieldApiName]: newValue 
    };

    // FLS Mutation Guard
    // We need to resolve the object_id first
    const { data: recInfo } = await supabaseAdmin.from('sf_records').select('object_id').eq('id', recordId).single();
    if (recInfo) {
      const profileId = await getCurrentUserProfileId();
      if (profileId) {
        const perms = await getFLSPermissions(profileId, (recInfo as any).object_id);
        const guard = validateFLSEditGuard({ [fieldApiName]: newValue }, perms);
        if (!guard.valid) {
          return { success: false, error: `Unauthorized to edit field: ${fieldApiName}` };
        }
      }
    }

    // 3. Commit patched JSONB
    const { error } = await (supabaseAdmin.from('sf_records') as any)
      .update({
        record_data: patchedData,
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error updating sf_record via Kanban:', error);
      return { success: false, error: error.message };
    }

    // Attempt to evaluate Record-Triggered Flows if we were fully hooked in,
    // but for Kanban drag-and-drop, it might trigger too many background rules if not careful.
    // For now, simple patch.

    revalidatePath(`/${apiName}`);
    revalidatePath(`/${apiName}/${recordId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating record field:', err);
    return { success: false, error: err.message };
  }
}

// Helper to deduce columns
export async function getPicklistOptions(apiName: string, fieldApiName: string) {
   try {
      const { data: objectDef } = await supabaseAdmin
        .from('sf_objects')
        .select('id')
        .eq('api_name', apiName)
        .single() as any;
  
      if (!objectDef) return ['New', 'Working', 'Closed']; // fallback
  
      const { data: fieldDef } = await (supabaseAdmin
        .from('sf_fields')
        .select('picklist_options')
        .eq('object_id', objectDef.id)
        .eq('api_name', fieldApiName)
        .single() as any);
      
      // We expect comma separated 'New,Working,Closed'
      if (fieldDef && fieldDef.picklist_options) {
         return fieldDef.picklist_options.split(',').map((opt: string) => opt.trim());
      }

      return ['New', 'Working', 'Closed']; // Default fallback if field isn't picklist
   } catch(e) {
      return ['New', 'Working', 'Closed'];
   }
}
