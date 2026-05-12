import { createClient as createSSRClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Fetches the Profile ID for the currently authenticated user.
 */
export async function getCurrentUserProfileId() {
  const supabase = await createSSRClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('sf_users')
    .select('profile_id')
    .eq('id', user.id)
    .single();

  return (profile as any)?.profile_id || null;
}

/**
 * Fetches FLS permissions for a specific profile and object.
 */
export async function getFLSPermissions(profileId: string, objectId: string) {
  const { data: perms } = await supabaseAdmin
    .from('sf_field_permissions')
    .select('field_id, is_readable, is_editable, sf_fields(field_api_name)')
    .eq('profile_id', profileId)
    .filter('sf_fields.object_id', 'eq', objectId);

  return (perms || []).map((p: any) => ({
    apiName: p.sf_fields.field_api_name,
    isReadable: p.is_readable,
    isEditable: p.is_editable
  }));
}

/**
 * Strips unreadable fields from a record_data JSON object.
 */
export function applyFLSReadFilter(recordData: any, permissions: any[]) {
  if (!recordData) return recordData;
  const filtered = { ...recordData };
  
  // For each key in the record data, check if there's a permission that allows reading.
  // If the field isn't in the permissions table, we default to TRUE for standard fields (like Name)
  // but in a strict FLS system, we might default to FALSE. 
  // Directive says: "dynamically delete restricted keys".
  
  permissions.forEach(p => {
    if (!p.isReadable) {
      delete filtered[p.apiName];
    }
  });

  return filtered;
}

/**
 * Validates that an incoming payload only contains editable fields.
 */
export function validateFLSEditGuard(payload: any, permissions: any[]) {
  const payloadKeys = Object.keys(payload);
  
  for (const key of payloadKeys) {
    const perm = permissions.find(p => p.apiName === key);
    if (perm && !perm.isEditable) {
      return { valid: false, field: key };
    }
  }
  
  return { valid: true };
}
