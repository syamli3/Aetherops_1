'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getCoreMetrics() {
  try {
    // Note: Supabase JS client doesn't explicitly have a GROUP BY aggregator in the standard select
    // We will fetch all records and group them in-memory, or use an RPC if scale is huge.
    // For this CRM scaffold, fetching all basic info and grouping is fine for thousands of records.
    // To be more efficient, we just fetch id and object_id.
    
    const { data: records, error } = await supabaseAdmin
      .from('sf_records')
      .select(`
        id,
        object_id,
        sf_objects:object_id (
          label,
          api_name
        )
      `);

    if (error) {
      console.error('Error fetching core metrics:', error);
      return [];
    }

    if (!records) return [];

    const grouped: Record<string, { label: string; count: number }> = {};

    records.forEach((record: any) => {
       const objLabel = record.sf_objects?.label || 'Unknown';
       if (!grouped[objLabel]) {
          grouped[objLabel] = { label: objLabel, count: 0 };
       }
       grouped[objLabel].count += 1;
    });

    return Object.values(grouped).sort((a, b) => b.count - a.count); // Highest count first
  } catch (err) {
    console.error('Exception fetching core metrics:', err);
    return [];
  }
}

export async function getRecentRecords() {
  try {
    const { data: records, error } = await supabaseAdmin
      .from('sf_records')
      .select(`
        id,
        record_data,
        created_at,
        object_id,
        sf_objects:object_id (
          label,
          api_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent records:', error);
      return [];
    }

    if (!records) return [];

    return records.map((r: any) => {
      // Best effort to find a "Name" field in the dynamic JSONB payload
      const recordName = r.record_data?.Name || r.record_data?.Subject || 'Unnamed Record';
      return {
         id: r.id,
         name: recordName,
         objectLabel: r.sf_objects?.label || 'Unknown',
         apiName: r.sf_objects?.api_name || 'unknown',
         createdAt: r.created_at
      };
    });

  } catch (err) {
    console.error('Exception fetching recent records:', err);
    return [];
  }
}
