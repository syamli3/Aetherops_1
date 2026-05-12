'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activities';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * PHASE 3: Omnichannel Email Engine
 * Sends an outbound email via Resend (or Mock) and logs it in the Activity Timeline.
 */
export async function sendExternalEmail(
  to: string,
  subject: string,
  body: string,
  relatedRecordId: string,
  resourceName: string
) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    let sentSuccessfully = false;

    if (!resendApiKey) {
      // MOCK LOGGING for development
      console.log('--- 📧 MOCK EMAIL SENT ---');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body:', body);
      console.log('--- END MOCK ---');
      sentSuccessfully = true;
    } else {
      // REAL RELAY using Resend API (native fetch for portability)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'AetherOps <onboarding@resend.dev>', // Default Resend test domain
          to: [to],
          subject: subject,
          text: body
        })
      });

      if (response.ok) {
        sentSuccessfully = true;
      } else {
        const errorData = await response.json();
        console.error('Resend API Error:', errorData);
        return { success: false, error: errorData.message || 'Failed to send email via Resend' };
      }
    }

    if (sentSuccessfully) {
      // 2. LOG THE ACTIVITY
      // We store the email metadata in sf_activities to maintain the historical feed
      await logActivity(relatedRecordId, resourceName, {
        type: 'Email',
        subject: subject,
        description: body, // Full body stored in description
        activityData: { to: to }
      });

      // 3. CACHE REVALIDATION
      // Ensure the timeline updates immediately
      revalidatePath(`/${resourceName}/${relatedRecordId}`);
      
      return { success: true };
    }

    return { success: false, error: 'Unknown email failure' };
  } catch (error: any) {
    console.error('Exception in sendExternalEmail:', error);
    return { success: false, error: error.message || 'Server error' };
  }
}
