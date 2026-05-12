'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Bypass offline generics bug in TS when using service-role in Next.js Server Actions
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getObjects(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('sf_objects')
    .select('*')
    .order('label', { ascending: true });
    
  if (error) {
    console.error('Error fetching objects:', error);
    return [];
  }
  return data || [];
}

export async function getObjectByApiName(apiName: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('sf_objects')
    .select('*')
    .ilike('api_name', apiName)
    .single();
    
  if (error) {
    console.error('Error fetching object:', error);
    return null;
  }
  return data;
}

export async function getFieldsForObject(objectId: string): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('sf_fields')
    .select('*')
    .eq('object_id', objectId)
    .order('field_label', { ascending: true });
    
  if (error) {
    console.error('Error fetching fields:', error);
    return [];
  }
  return data || [];
}

export async function createField(
  objectId: string,
  apiName: string,
  payload: {
    field_label: string;
    field_api_name: string;
    data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup';
    is_required: boolean;
    target_object_id?: string;
  }
) {
  try {
    const { error } = await (supabaseAdmin.from('sf_fields') as any).insert({
        object_id: objectId,
        field_label: payload.field_label,
        field_api_name: payload.field_api_name,
        data_type: payload.data_type,
        is_required: payload.is_required,
        is_custom: true, // all UI-created fields are custom
        target_object_id: payload.target_object_id || null,
      });

    if (error) {
      console.error('Error creating field:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception creating field:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

export async function createObject(payload: {
  label: string;
  plural_label: string;
  api_name: string;
  description: string;
}) {
  try {
    // 1. Insert Object
    const { data: objectData, error: objectError } = await (supabaseAdmin.from('sf_objects') as any).insert({
      label: payload.label,
      plural_label: payload.plural_label,
      api_name: payload.api_name,
      description: payload.description,
      is_custom: true
    }).select('id').single();

    if (objectError || !objectData) throw new Error(objectError?.message || 'Failed to create object');

    // 2. Create Default 'Name' Field
    const { error: fieldError } = await (supabaseAdmin.from('sf_fields') as any).insert({
      object_id: objectData.id,
      field_label: `${payload.label} Name`,
      field_api_name: 'name',
      data_type: 'Text',
      is_required: true,
      is_custom: false // Auto-generated standard identifier
    });

    if (fieldError) console.error("Could not create standard Name field:", fieldError);

    // 3. Link to Default App (AetherOps CRM)
    const { data: defaultApp } = await (supabaseAdmin.from('sf_apps') as any).select('id').eq('name', 'AetherOps CRM').single();
    if (defaultApp) {
      // Find max display_order
      const { data: tabs } = await (supabaseAdmin.from('sf_app_tabs') as any)
        .select('display_order')
        .eq('app_id', defaultApp.id)
        .order('display_order', { ascending: false })
        .limit(1);
        
      const nextOrder = tabs && tabs.length > 0 ? tabs[0].display_order + 10 : 10;
      
      await (supabaseAdmin.from('sf_app_tabs') as any).insert({
        app_id: defaultApp.id,
        object_id: objectData.id,
        display_order: nextOrder
      });
    }

    return { success: true, objectId: objectData.id };
  } catch (err: any) {
    console.error('Exception creating object:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
