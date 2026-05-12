import { NextResponse } from 'next/server';
import { extractLeadData } from '@/lib/llm';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS, using the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // 1. Basic API Key Authentication
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.AETHEROPS_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing webhook secret' },
        { status: 401 }
      );
    }

    // 2. Parse Incoming Request Payload
    const body = await request.json();
    const { raw_text, source } = body;

    if (!raw_text || typeof raw_text !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request: "raw_text" must be a provided and be a non-empty string.' },
        { status: 400 }
      );
    }

    // 3. AI Parsing Layer
    let leadData;
    try {
      leadData = await extractLeadData(raw_text);
    } catch (llmError: any) {
      console.error('LLM Extraction Error:', llmError);
      return NextResponse.json(
        { error: 'Failed to extract structured data from text.', details: llmError.message },
        { status: 500 }
      );
    }

    // 4. Secure Database Insertion via Admin Client (Bypassing RLS)
    // First, verify if the "Lead" sf_object exists
    let { data: leadObject, error: leadObjectError } = await supabaseAdmin
      .from('sf_objects')
      .select('id')
      .eq('api_name', 'Lead')
      .single();

    let objectId: string;

    if (!leadObject || leadObjectError) {
      // Create the 'Lead' dynamic metadata object if it doesn't already exist
      const { data: newLeadObj, error: createError } = await supabaseAdmin
        .from('sf_objects')
        .insert({
          api_name: 'Lead',
          label: 'Lead',
          plural_label: 'Leads',
          is_custom: false, // Indicates a core object in our CRM
          description: 'Auto-ingested Leads from natural language webhook'
        })
        .select('id')
        .single();

      if (createError || !newLeadObj) {
        console.error('Failed to create Lead sf_object:', createError);
        return NextResponse.json(
          { error: 'Internal Server Error: Could not configure metadata schema system.' },
          { status: 500 }
        );
      }
      objectId = newLeadObj.id;
    } else {
      objectId = leadObject.id;
    }

    // Insert into sf_records dynamically linked to the "Lead" object
    const { data: newRecord, error: insertError } = await supabaseAdmin
      .from('sf_records')
      .insert({
        object_id: objectId,
        record_data: { 
          ...leadData, 
          source: source || 'unknown_webhook'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database Insertion Error:', insertError);
      return NextResponse.json(
        { error: 'Internal Server Error: Failed to insert lead dynamic record.' },
        { status: 500 }
      );
    }

    // 5. Success Response
    return NextResponse.json(
      { 
        message: 'Lead successfully extracted and ingested.',
        record: newRecord 
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Ingest Lead Webhook General Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
