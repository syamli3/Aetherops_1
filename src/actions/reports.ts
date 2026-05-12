'use server';

import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import { getObjectByApiName } from './metadata';
import { createClient as createSSRClient } from '@/utils/supabase/server';

// Service role for bypass where needed (though we want SSR client for reports to enforce RLS naturally)
const supabaseAdmin = createClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export type FilterLogic = {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
};

export type ReportConfig = {
  id?: string;
  name: string;
  object_id: string; // sf_objects.id
  selected_columns: string[]; // array of field_api_names
  filters: FilterLogic[];
};

export async function saveReport(config: ReportConfig) {
  try {
    const supabaseSession = await createSSRClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    const { data, error } = await supabaseAdmin
      .from('sf_reports' as any)
      .upsert({
        ...(config.id ? { id: config.id } : {}),
        name: config.name,
        object_id: config.object_id,
        selected_columns: config.selected_columns,
        filters: config.filters,
        owner_id: user?.id || null 
      })
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath('/reports');
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Error saving report:', err);
    return { success: false, error: err.message };
  }
}

export async function executeReport(config: ReportConfig) {
    try {
      // 1. We must execute via SSR client to implicitly enforce sf_records RLS policies!
      const supabaseSession = await createSSRClient();
      
      // 2. Start the query builder
      let query = supabaseSession
        .from('sf_records')
        .select('id, record_data, created_at, updated_at')
        .eq('object_id', config.object_id);
  
      // 3. Translate Filters into PostgREST JSONB logic
      for (const filter of config.filters) {
        if (!filter.field || !filter.operator || filter.value === undefined || filter.value === '') continue;
        
        // Supabase JS requires specific syntaxes for deep JSONB querying:
        // Syntax: column->>key
        const jsonbTarget = `record_data->>${filter.field}`;
        
        switch (filter.operator) {
          case 'equals':
            query = query.eq(jsonbTarget, filter.value as any);
            break;
          case 'not_equals':
            query = query.neq(jsonbTarget, filter.value as any);
            break;
          case 'contains':
            // ilike natively wraps text in wildcards, so we append them manually for safety
            query = query.ilike(jsonbTarget, `%${filter.value}%`);
            break;
          case 'greater_than':
            // Note: Postgres compares text natively when pulling ->>. 
            // In a strict prod environment, we would use an RPC to cast it `(record_data->>'key')::NUMERIC > val`
            query = query.gt(jsonbTarget, filter.value as any);
            break;
          case 'less_than':
            query = query.lt(jsonbTarget, filter.value as any);
            break;
        }
      }
  
      // 4. Execute
      const { data, error } = await query;
  
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception executing report:', err);
      return [];
    }
  }

export async function getSavedReports() {
    try {
        const supabaseSession = await createSSRClient();
        const { data, error } = await supabaseSession
            .from('sf_reports' as any)
            .select(`
                id,
                name,
                object_id,
                sf_objects ( label )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching reports:', err);
        return [];
    }
}
