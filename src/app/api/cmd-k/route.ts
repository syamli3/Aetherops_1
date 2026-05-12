import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'Command string is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const systemPrompt = `You are AetherOps, an AI CRM operating system.
Your job is to translate the user's natural language command into specific database function operations.
You have three tools available: search_records, update_record_field, create_new_record.
Analyze the user's intent. If they want to update something but don't know the ID, you might need to search first.
For now, we only support direct one-shot actions (assume the user provides enough context, or use search query directly if it's a search request).
If the request is a clear update, use update_record_field.
If the request is to create something, use create_new_record.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: "update_record_field",
            description: "Update a specific field on a dynamic CRM object.",
            parameters: {
              type: "OBJECT",
              properties: {
                object_name: { type: "STRING", description: "The API name of the object, e.g., 'Lead', 'VIP_Table'" },
                record_id: { type: "STRING", description: "The UUID of the record in sf_records" },
                field_name: { type: "STRING", description: "The field to update, e.g., 'minimum_spend', 'status'" },
                new_value: { type: "STRING", description: "The new value as a string (will be parsed safely internally)." }
              },
              required: ["object_name", "record_id", "field_name", "new_value"]
            }
          },
          {
            name: "create_new_record",
            description: "Create a new dynamic CRM object record.",
            parameters: {
              type: "OBJECT",
              properties: {
                object_name: { type: "STRING", description: "The API name of the object, e.g., 'Promoter'" },
                record_data_json_string: { type: "STRING", description: "A JSON string containing the fields and values for the new record." }
              },
              required: ["object_name", "record_data_json_string"]
            }
          },
          {
            name: "search_records",
            description: "Search for records inside a specific object type to find their IDs or details.",
            parameters: {
              type: "OBJECT",
              properties: {
                object_name: { type: "STRING", description: "The API name of the object" },
                query: { type: "STRING", description: "The search string to look for inside record_data" }
              },
              required: ["object_name", "query"]
            }
          }
        ]
      }
    ];

    // Call Gemini API with Tool Calling
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: command }] }],
          tools: tools,
          generationConfig: {
            temperature: 0.1
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: 'LLM Error', details: err }, { status: 500 });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const functionCall = candidate?.content?.parts?.find((p: any) => p.functionCall)?.functionCall;
    const textResponse = candidate?.content?.parts?.find((p: any) => p.text)?.text;

    // Output natural language response if no tool called
    if (!functionCall) {
      return NextResponse.json({
        message: textResponse || "No database action identified. Please be more specific.",
        action_taken: null
      });
    }

    const args = functionCall.args;
    let actionResult: any = null;
    let confirmationMessage = "Action completed successfully.";

    // Tool Execution Block
    if (functionCall.name === "update_record_field") {
      // 1. Fetch current record
      const { data: record, error: fetchErr } = await supabaseAdmin
        .from('sf_records')
        .select('*')
        .eq('id', args.record_id)
        .single();
      
      if (fetchErr || !record) {
        return NextResponse.json({ error: `Record not found: ${args.record_id}` }, { status: 404 });
      }

      // Safe parse numeric or boolean values
      let parsedValue: any = args.new_value;
      if (parsedValue.toLowerCase() === 'true') parsedValue = true;
      if (parsedValue.toLowerCase() === 'false') parsedValue = false;
      if (!isNaN(Number(parsedValue)) && parsedValue.trim() !== "") parsedValue = Number(parsedValue);

      const updatedData = {
        ...record.record_data,
        [args.field_name]: parsedValue
      };

      // 2. Perform Update
      const { data: updatedRecord, error: updateErr } = await supabaseAdmin
        .from('sf_records')
        .update({ record_data: updatedData })
        .eq('id', args.record_id)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);

      actionResult = { tool: "update_record_field", record: updatedRecord };
      confirmationMessage = `Got it! Updated ${args.field_name} on record ${args.record_id} to ${parsedValue}.`;

    } else if (functionCall.name === "create_new_record") {
      // Find object ID
      const { data: obj } = await supabaseAdmin
        .from('sf_objects')
        .select('id')
        .eq('api_name', args.object_name)
        .single();
      
      if (!obj) throw new Error(`Object ${args.object_name} doesn't exist.`);

      let recordData;
      try {
        recordData = JSON.parse(args.record_data_json_string);
      } catch {
        throw new Error('Invalid JSON payload for new record.');
      }

      const { data: newRecord, error: insertErr } = await supabaseAdmin
        .from('sf_records')
        .insert({ object_id: obj.id, record_data: recordData })
        .select()
        .single();
      
      if (insertErr) throw new Error(insertErr.message);

      actionResult = { tool: "create_new_record", record: newRecord };
      confirmationMessage = `Done! Inserted a new ${args.object_name} into the database.`;

    } else if (functionCall.name === "search_records") {
      // Find object ID first
      const { data: obj } = await supabaseAdmin
        .from('sf_objects')
        .select('id')
        .eq('api_name', args.object_name)
        .single();

      if (!obj) throw new Error(`Object ${args.object_name} doesn't exist.`);

      // Hacky text-based search on jsonb. Supabase/Postgres syntax: record_data::text ilike %query%
      // Supabase JS doesn't have a direct 'jsonb cast text ilike' without raw RPC, so we'll fetch all and filter in JS for MVP since it's a small app
      const { data: allRecords } = await supabaseAdmin
        .from('sf_records')
        .select('*')
        .eq('object_id', obj.id);

      const hits = (allRecords || []).filter(r => 
        JSON.stringify(r.record_data).toLowerCase().includes(args.query.toLowerCase())
      );

      actionResult = { tool: "search_records", hits };
      confirmationMessage = `Found ${hits.length} records matching "${args.query}". ${hits.map(h => h.id).join(', ')}`;
    }

    return NextResponse.json({
      message: confirmationMessage,
      action_taken: actionResult
    }, { status: 200 });

  } catch (error: any) {
    console.error('Cmd+K Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
