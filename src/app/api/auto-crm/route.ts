import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS for DDL/metadata insertions
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

// Define TypeScript Interfaces exactly as expected
interface CrmObject {
  object_name: string;
  description: string;
}

interface CrmField {
  object_name: string;
  field_name: string;
  field_type: "text" | "number" | "boolean" | "date";
  is_required: boolean;
}

interface AutoCrmSchema {
  objects: CrmObject[];
  fields: CrmField[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_description, dry_run = false } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    if (!business_description) {
      return NextResponse.json({ error: 'business_description is required.' }, { status: 400 });
    }

    const systemPrompt = `You are an expert CRM Database Architect.
Your job is to analyze the user's business description and design a perfectly relational CRM schema.
You must output ONLY strict JSON data matching the exactly provided responseSchema structure.`;

    // Strict Response Schema definition for Gemini
    const geminiSchema = {
      type: "OBJECT",
      properties: {
        objects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              object_name: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["object_name", "description"]
          }
        },
        fields: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              object_name: { type: "STRING" },
              field_name: { type: "STRING" },
              field_type: { type: "STRING", enum: ["text", "number", "boolean", "date"] },
              is_required: { type: "BOOLEAN" }
            },
            required: ["object_name", "field_name", "field_type", "is_required"]
          }
        }
      },
      required: ["objects", "fields"]
    };

    // 1. Call Gemini with Structured Outputs
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: business_description }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: geminiSchema,
            temperature: 0.2 // Low temperature for consistent structural logic
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", errText);
      return NextResponse.json({ error: 'AI Schema Generation Failed', details: errText }, { status: 500 });
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      return NextResponse.json({ error: 'No structured output returned from AI.' }, { status: 500 });
    }

    // Parse strictly enforced output
    const schema = JSON.parse(contentText) as AutoCrmSchema;

    // 2. Dry Run Mode
    if (dry_run) {
      console.log('=== DRY RUN MODE: GENERATED SCHEMA ===');
      console.log(JSON.stringify(schema, null, 2));
      return NextResponse.json({
        message: 'Dry run successful. Check console or examine schema payload.',
        schema
      });
    }

    // 3. Supabase Insertion Logic (Live Mode)
    const insertedObjects = [];
    const insertedFields = [];

    // Map DB Enums
    const mapFieldType = (type: string) => {
      switch (type) {
        case 'text': return 'Text';
        case 'number': return 'Number';
        case 'boolean': return 'Checkbox';
        case 'date': return 'Date';
        default: return 'Text';
      }
    };

    // Begin transacting (simulated iteratively)
    for (const obj of schema.objects) {
      // Create sf_object
      const { data: newObj, error: objError } = await supabaseAdmin
        .from('sf_objects')
        .insert({
          api_name: obj.object_name.replace(/\\s+/g, ''),
          label: obj.object_name,
          plural_label: obj.object_name + 's',
          is_custom: true,
          description: obj.description
        })
        .select('id, api_name')
        .single();

      if (objError) {
        console.error('Failed inserting object:', obj.object_name, objError);
        continue; // Skip fields if object fails
      }

      insertedObjects.push(newObj);

      // Find fields belonging to this object
      const objectFields = schema.fields.filter(f => f.object_name === obj.object_name);

      for (const field of objectFields) {
        const { data: newField, error: fieldError } = await supabaseAdmin
          .from('sf_fields')
          .insert({
            object_id: newObj.id,
            field_label: field.field_name,
            field_api_name: field.field_name.toLowerCase().replace(/\\s+/g, '_'),
            data_type: mapFieldType(field.field_type),
            is_required: field.is_required,
            is_custom: true
          })
          .select('id, field_label, field_api_name')
          .single();

        if (fieldError) {
          console.error('Failed inserting field:', field.field_name, fieldError);
        } else {
          insertedFields.push(newField);
        }
      }
    }

    return NextResponse.json({
      message: 'Schema successfully built and deployed to database.',
      result: {
        objectsGenerated: insertedObjects.length,
        fieldsGenerated: insertedFields.length,
        schema
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Auto CRM Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
