'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import { getObjects } from './metadata';
import { logActivity } from './activities';
import { getCurrentUserProfileId, getFLSPermissions, applyFLSReadFilter, validateFLSEditGuard } from '@/utils/fls';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function saveRecord(objectId: string, recordData: Record<string, any>, resourceName: string) {
  try {
    // Authenticate and enforce owner spoof-proofing using SSR Client for JWT parsing
    const { createClient } = await import('@/utils/supabase/server');
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    // Force owner_id to equal the server-side authenticated user.id to prevent malicious assignment.
    // In production, currentUserId must be fully enforced.
    const currentUserId = user?.id || null;
    
    // Override any malicious owner_id injection from the frontend payload via hardcode map
    const finalRecordData = { ...recordData };
    delete finalRecordData.owner_id; // safeguard

    // FLS Mutation Guard
    const profileId = await getCurrentUserProfileId();
    if (profileId) {
      const perms = await getFLSPermissions(profileId, objectId);
      const guard = validateFLSEditGuard(finalRecordData, perms);
      if (!guard.valid) {
        return { success: false, error: `Unauthorized to edit field: ${guard.field}` };
      }
    }

    const { data, error } = await (supabaseAdmin.from('sf_records') as any).insert({
      object_id: objectId,
      record_data: finalRecordData,
      owner_id: currentUserId,
    }).select('id').single();

    if (error || !data) {
      console.error('Error inserting sf_record:', error);
      return { success: false, error: error?.message || 'Insert failed' };
    }

    // Silent background execution
    executeFlows(objectId, data.id, recordData, 'onCreate', resourceName).catch(e => console.error('Flow trap failed:', e));

    revalidatePath(`/${resourceName}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception inside saveRecord:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}

export async function getRecordsForObject(apiName: string): Promise<any[]> {
  try {
    const { getObjectByApiName } = await import('@/actions/metadata');
    const obj = await getObjectByApiName(apiName);
    
    if (!obj) {
      return [];
    }
    
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('object_id', obj.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }
    
    // Apply FLS Read Filters
    const profileId = await getCurrentUserProfileId();
    if (profileId && data) {
      const perms = await getFLSPermissions(profileId, obj.id);
      return (data as any[]).map(record => ({
        ...record,
        record_data: applyFLSReadFilter((record as any).record_data, perms)
      }));
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception fetching records for object:', err);
    return [];
  }
}

export async function getRecordById(recordId: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      console.error('Error fetching record by id:', error);
      return null;
    }

    // Apply FLS Read Filter
    const profileId = await getCurrentUserProfileId();
    if (profileId && data) {
       const perms = await getFLSPermissions(profileId, (data as any).object_id);
       return {
          ...(data as any),
          record_data: applyFLSReadFilter((data as any).record_data, perms)
       };
    }

    return data;
  } catch (err) {
    console.error('Exception fetching record by id:', err);
    return null;
  }
}

export async function updateRecord(recordId: string, recordData: Record<string, any>, resourceName: string) {
  try {
    const { data: existingRecord } = await (supabaseAdmin.from('sf_records') as any)
      .select('object_id')
      .eq('id', recordId)
      .single();

    if (!existingRecord) {
      return { success: false, error: 'Record not found' };
    }

    // FLS Mutation Guard
    const profileId = await getCurrentUserProfileId();
    if (profileId) {
      const perms = await getFLSPermissions(profileId, existingRecord.object_id);
      const guard = validateFLSEditGuard(recordData, perms);
      if (!guard.valid) {
        return { success: false, error: `Unauthorized to edit field: ${guard.field}` };
      }
    }

    const { error } = await (supabaseAdmin.from('sf_records') as any)
      .update({
        record_data: recordData,
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error updating sf_record:', error);
      return { success: false, error: error.message };
    }

    // Silent background execution
    if (existingRecord?.object_id) {
       executeFlows(existingRecord.object_id, recordId, recordData, 'onUpdate', resourceName).catch(e => console.error('Flow trap failed:', e));
    }

    revalidatePath(`/${resourceName}`);
    revalidatePath(`/${resourceName}/${recordId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Exception inside updateRecord:', err);
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}

export async function searchRecords(objectId: string, searchTerm: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sf_records')
      .select('id, record_data')
      .eq('object_id', objectId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error in searchRecords:', error);
      return [];
    }

    if (!data) return [];

    const term = searchTerm.toLowerCase();
    const matches = data.filter((record: any) => {
      const values = Object.values(record.record_data || {});
      return values.some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(term)
      );
    });

    return matches.slice(0, 5);
  } catch (err) {
    console.error('Exception in searchRecords:', err);
    return [];
  }
}

export async function getRelatedRecords(parentObjectId: string, parentRecordId: string): Promise<any[]> {
  try {
    const { data: fields, error: fieldsErr } = await (supabaseAdmin.from('sf_fields') as any)
      .select('*')
      .eq('target_object_id', parentObjectId)
      .eq('data_type', 'Lookup');

    if (fieldsErr || !fields || fields.length === 0) return [];

    const allObjects = await getObjects();
    const groupedResults = [];

    for (const field of fields) {
      const childObj = allObjects.find((o) => o.id === field.object_id);
      if (!childObj) continue;

      const { data: records, error: recErr } = await (supabaseAdmin.from('sf_records') as any)
        .select('id, record_data')
        .eq('object_id', field.object_id)
        .contains('record_data', { [field.field_api_name]: parentRecordId });

      if (records && records.length > 0) {
        groupedResults.push({
          objectLabel: childObj.plural_label,
          objectApiName: childObj.api_name,
          fieldApiName: field.field_api_name,
          records: records
        });
      }
    }
    return groupedResults;
  } catch (err) {
    console.error('Exception fetching related records:', err);
    return [];
  }
}

export async function executeFlows(objectId: string, recordId: string, recordData: any, triggerEvent: 'onCreate' | 'onUpdate', resourceName: string) {
  try {
    const { data: flows, error } = await (supabaseAdmin.from('sf_flows') as any)
      .select('*')
      .eq('object_id', objectId)
      .eq('is_active', true);

    if (error || !flows || flows.length === 0) return;

    for (const flow of flows) {
      if (flow.trigger_type !== 'onSave' && flow.trigger_type !== triggerEvent) continue;

      const { field, operator, value } = flow.conditions || {};
      if (!field || !operator || value === undefined) continue;

      const recordValue = recordData[field];
      let isMatch = false;

      // Loose type coercion for JSONB string comparison robust evaluating
      const strRecVal = String(recordValue || '').toLowerCase();
      const strCondVal = String(value).toLowerCase();

      switch (operator) {
        case 'equals':
          isMatch = (strRecVal === strCondVal);
          break;
        case 'not_equals':
          isMatch = (strRecVal !== strCondVal);
          break;
        case 'contains':
          isMatch = strRecVal.includes(strCondVal);
          break;
      }

      if (isMatch) {
         if (flow.actions?.type === 'create_activity') {
            const payload = flow.actions.payload;
            if (payload) {
               await logActivity(recordId, resourceName, {
                  type: payload.type || 'Note',
                  subject: payload.subject || 'Automated Action',
                  description: `Generated by Flow: ${flow.name}`
               });
            }
         }
      }
    }
  } catch (err) {
    console.error('Flow Execution Engine failed:', err);
  }
}
