import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const rawPayload = await request.json();

    // Auto-bootstrap WebhookLog sf_object if it doesn't exist
    let { data: logObj } = await supabaseAdmin.from('sf_objects').select('id').eq('api_name', 'WebhookLog').single();
    if (!logObj) {
        const { data: newObj } = await supabaseAdmin
          .from('sf_objects')
          .insert({ api_name: 'WebhookLog', label: 'Webhook Log', plural_label: 'Webhook Logs', is_custom: true })
          .select('id').single();
        logObj = newObj;
    }

    if (!logObj) throw new Error("Could not initialize WebhookLog object");

    // 1. Insert into tracking table dynamically
    const { data: logEntry, error } = await supabaseAdmin
      .from('sf_records')
      .insert({
        object_id: logObj.id,
        record_data: { payload: rawPayload, status: 'pending' }
      })
      .select('id')
      .single();

    if (error || !logEntry) {
       console.error("Failed to insert log:", error);
       return NextResponse.json({ error: 'Database logging failed: ' + error?.message }, { status: 500 });
    }

    // 2. Trigger the asynchronous background worker
    const workerUrl = new URL('/api/webhooks/worker', request.url).toString();
    const workerSecret = process.env.AETHEROPS_WEBHOOK_SECRET || 'fallback_secret';

    fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerSecret}`
      },
      body: JSON.stringify({ log_id: logEntry.id })
    }).catch(err => console.error("Failed to trigger worker fetch:", err));

    return NextResponse.json({
      success: true,
      message: 'Payload received and queued for background processing.',
      log_id: logEntry.id
    }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Ingest Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
