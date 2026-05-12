'use server';

import { createClient as createSSRClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type LayoutSection = {
  id: string; // Used for drag-and-drop unique keys local to UI
  sectionName: string;
  columns: 1 | 2;
  fields: string[]; // field_api_names
};

export type ObjectLayoutConfig = LayoutSection[];

export async function saveLayout(objectId: string, layoutName: string, config: ObjectLayoutConfig) {
  try {
    const supabase = await createSSRClient();
    
    // We do a simple approach: One active layout per object in this schema version
    // Upserting based on object_id to ensure a single layout
    // First, check if one exists to grab its ID, or simply insert/update.
    
    // To cleanly upsert, we should try selecting first.
    const { data: existing } = await supabase
      .from('sf_layouts' as any)
      .select('id')
      .eq('object_id', objectId)
      .single();

    const { data, error } = await supabase
      .from('sf_layouts' as any)
      .upsert({
        ...(existing?.id ? { id: existing.id } : {}),
        object_id: objectId,
        layout_name: layoutName,
        layout_config: config as any
      })
      .select('id')
      .single();

    if (error) throw error;

    revalidatePath('/', 'layout'); // revalidate entire CRM cache since layouts affect many pages
    
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('Error saving layout:', error);
    return { success: false, error: error.message };
  }
}

export async function getLayoutForObject(objectId: string): Promise<ObjectLayoutConfig | null> {
  try {
    const supabase = await createSSRClient();
    const { data, error } = await supabase
      .from('sf_layouts' as any)
      .select('layout_config')
      .eq('object_id', objectId)
      .single();

    // Not finding a layout isn't an error, it just means we render standard generic mode
    if (error || !data) {
      return null;
    }

    return data.layout_config as ObjectLayoutConfig;
  } catch (error) {
    console.error('Error fetching layout:', error);
    return null;
  }
}
