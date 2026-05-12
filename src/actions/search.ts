'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { getObjects } from './metadata';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function globalSearch(searchTerm: string) {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
       return {};
    }

    const term = searchTerm.toLowerCase();
    
    // Fetch all objects for mapping
    const allObjects = await getObjects();
    const objectMap = allObjects.reduce((acc: any, obj: any) => {
        acc[obj.id] = obj;
        return acc;
    }, {});
    
    // Fetch records (limiting to 200 for MVP JSONB filtering performance)
    const { data: records, error } = await (supabaseAdmin.from('sf_records') as any)
      .select('id, object_id, record_data')
      .order('updated_at', { ascending: false })
      .limit(200);
      
    if (error) {
      console.error('Error in globalSearch fetch:', error);
      return {};
    }
    
    if (!records) return {};

    const matches = records.filter((record: any) => {
      const values = Object.values(record.record_data || {});
      return values.some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(term)
      );
    });
    
    // Group matches by Object Type
    const groupedResults: Record<string, { label: string, api_name: string, items: any[] }> = {};
    
    matches.forEach((rec: any) => {
        const objDef = objectMap[rec.object_id];
        if (!objDef) return;
        
        const groupKey = objDef.id;
        
        if (!groupedResults[groupKey]) {
            groupedResults[groupKey] = {
                label: objDef.plural_label,
                api_name: objDef.api_name,
                items: []
            };
        }
        
        groupedResults[groupKey].items.push(rec);
    });
    
    // Cap results per group to 5 to avoid enormous dropdowns
    Object.keys(groupedResults).forEach(key => {
        groupedResults[key].items = groupedResults[key].items.slice(0, 5);
    });

    return groupedResults;
  } catch (err) {
    console.error('Exception in globalSearch:', err);
    return {};
  }
}
