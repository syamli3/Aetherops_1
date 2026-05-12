'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const APP_COOKIE_NAME = 'aetherops_active_app';

export async function getApps() {
  try {
    const { data: apps, error } = await supabaseAdmin.from('sf_apps').select('*').order('name');
    if (error) {
      console.error('Error fetching apps:', error);
      return [];
    }
    return apps || [];
  } catch (err) {
    console.error('Exception fetching apps:', err);
    return [];
  }
}

export async function getActiveAppCookie() {
  const cookieStore = await cookies();
  const appId = cookieStore.get(APP_COOKIE_NAME)?.value;
  return appId || null;
}

export async function setActiveAppCookie(appId: string) {
  const cookieStore = await cookies();
  cookieStore.set(APP_COOKIE_NAME, appId, { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
  return { success: true };
}

export async function getTabsForApp(appId: string | null) {
  try {
    // 1. If no specific app is selected, fallback to standard CRM objects
    if (!appId) {
      const { data: standardObjects } = await supabaseAdmin
        .from('sf_objects')
        .select('label, api_name')
        .eq('is_custom', false);
      return standardObjects || [];
    }

    // 2. Fetch specific tabs tied to the App
    const { data: tabs, error } = await supabaseAdmin
      .from('sf_app_tabs')
      .select(`
        object_id,
        display_order,
        sf_objects:object_id (
          label,
          api_name
        )
      `)
      .eq('app_id', appId)
      .order('display_order');

    if (error) {
      console.error('Error fetching tabs for app:', error);
      return [];
    }

    // Standardize return shape to match fallback query
    if (tabs && tabs.length > 0) {
       return tabs.map((t: any) => ({
         label: t.sf_objects.label,
         api_name: t.sf_objects.api_name
       }));
    } else {
       // If an app has no tabs defined yet, return an empty array (or fallback objects if preferred).
       // By standard CRM behavior, an empty app just has Home/Dashboards.
       return [];
    }
  } catch (err) {
    console.error('Exception fetching tabs:', err);
    return [];
  }
}
