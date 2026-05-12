import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Supabase Database Webhook Payload structure
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record: any;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming Supabase Trigger payload
    const payload: WebhookPayload = await req.json();

    // We only care about sf_records for Flow triggers
    if (payload.table !== 'sf_records') {
      return NextResponse.json({ message: 'Ignored: not a record' }, { status: 200 });
    }

    const { type, record } = payload;
    const objectId = record.object_id;

    // Map DB trigger to Flow trigger type
    const triggerEventMap: Record<string, string[]> = {
      'INSERT': ['onCreate', 'onSave'],
      'UPDATE': ['onUpdate', 'onSave']
    };
    
    const validTriggers = triggerEventMap[type] || [];
    if (validTriggers.length === 0) {
      return NextResponse.json({ message: 'Ignored: unhandled event type' }, { status: 200 });
    }

    // 2. Fetch Active Flows for this Object
    const { data: activeFlows, error } = await supabaseAdmin
      .from('sf_flows')
      .select('*')
      .eq('object_id', objectId)
      .eq('is_active', true)
      .in('trigger_type', validTriggers);

    if (error || !activeFlows || activeFlows.length === 0) {
      return NextResponse.json({ message: 'No active flows triggered' }, { status: 200 });
    }

    const flowResults = [];

    // 3. Evaluate each Flow
    for (const flow of activeFlows) {
      try {
        const conditions = flow.conditions as any[];
        const actions = flow.actions as any[];
        
        let conditionsMet = true;

        // Condition Engine (Example: check if intent == 'High')
        if (Array.isArray(conditions) && conditions.length > 0) {
          for (const cond of conditions) {
            const { field, operator, value } = cond;
            const recordValue = record.record_data?.[field];

            switch(operator) {
              case 'equals':
                if (recordValue !== value) conditionsMet = false;
                break;
              case 'contains':
                if (!String(recordValue).includes(String(value))) conditionsMet = false;
                break;
              case 'greater_than':
                if (Number(recordValue) <= Number(value)) conditionsMet = false;
                break;
              // Add more operators as needed
            }
          }
        }

        if (conditionsMet) {
          // 4. Execute Actions
          if (Array.isArray(actions)) {
            for (const action of actions) {
              if (action.type === 'webhook') {
                // Fire outbound HTTP request
                await fetch(action.url, {
                  method: action.method || 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    flow_name: flow.name,
                    record_id: record.id,
                    event_type: type,
                    data: record.record_data
                  })
                }).catch(err => console.error(`Failed executing webhook for flow ${flow.id}:`, err));
              }
              // Add more action types (e.g. 'send_email', 'update_record')
            }
          }
          flowResults.push({ flowId: flow.id, status: 'executed' });
        } else {
          flowResults.push({ flowId: flow.id, status: 'conditions_failed' });
        }
      } catch (flowError) {
        console.error(`Error processing flow ${flow.id}:`, flowError);
        flowResults.push({ flowId: flow.id, status: 'error' });
      }
    }

    return NextResponse.json({ message: 'Flows processed', results: flowResults }, { status: 200 });
  } catch (error: any) {
    console.error('Flow Engine Fatal Error:', error);
    // Return 200 even on error so Supabase doesn't infinitely retry unless configured to
    return NextResponse.json({ error: 'Flow Engine Error', details: error.message }, { status: 200 });
  }
}
