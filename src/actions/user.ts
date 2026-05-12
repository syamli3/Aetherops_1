'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function createUser(formData: FormData) {
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const alias = formData.get('alias') as string;
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const nickname = formData.get('nickname') as string;
  const title = formData.get('title') as string;
  const company = formData.get('company') as string;
  const department = formData.get('department') as string;
  const roleId = formData.get('role_id') as string;
  const profileId = formData.get('profile_id') as string;
  const isActive = formData.get('is_active') === 'on';
  const password = formData.get('password') as string;

  // Basic Server-Side Validation
  if (!lastName || !alias || !email || !username || !password) {
    return { error: 'Missing required fields: Last Name, Alias, Email, Username, or Password' };
  }

  // 1. Create secure Auth User using Admin API
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error('Error creating Auth user:', authError);
    return { error: authError?.message || 'Failed to create secure auth identity' };
  }

  // 2. Insert into sf_users linking the new secure Auth ID
  // @ts-expect-error: Supabase client fails to infer generic tables without CLI regenerator
  const { error } = await supabaseAdmin.from('sf_users').insert({
    id: authData.user.id,
    first_name: firstName,
    last_name: lastName,
    alias,
    email,
    username,
    nickname: nickname || null,
    title: title || null,
    company: company || null,
    department: department || null,
    role_id: roleId || null,
    profile_id: profileId || null,
    is_active: isActive
  });

  if (error) {
    console.error('Error creating user:', error);
    return { error: error.message };
  }

  // Revalidate the users list so the new user appears immediately
  revalidatePath('/setup/users');
  return { success: true };
}

export async function getUserPreferences(userId?: string) {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      // Logic for trial/mock mode: get the first user
      const { data: users } = await (supabaseAdmin.from('sf_users') as any).select('id').limit(1);
      if (users && users.length > 0) {
        targetUserId = users[0].id;
      }
    }

    if (!targetUserId) return null;

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching preferences:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Exception fetching preferences:', err);
    return null;
  }
}

export async function updateUserPreferences(payload: any, userId?: string) {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: users } = await (supabaseAdmin.from('sf_users') as any).select('id').limit(1);
      if (users && users.length > 0) {
        targetUserId = users[0].id;
      }
    }

    if (!targetUserId) return { success: false, error: 'No user identified' };

    const { error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: targetUserId,
        ...payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/home');
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating preferences:', err);
    return { success: false, error: err.message };
  }
}
