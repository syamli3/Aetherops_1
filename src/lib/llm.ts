export interface LeadData {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  intent: string | null;
  estimated_value: number | null;
  status: string;
}

export async function extractLeadData(text: string): Promise<LeadData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const systemPrompt = `You are a data-extraction agent for AetherOps CRM.
Extract the following exact fields from the user's unstructured text regarding a lead:
- first_name (string)
- last_name (string)
- email (string or null)
- phone (string or null)
- intent (a concise summary of what they want, string or null)
- estimated_value (their budget or expected value. IMPORTANT: Return a pure numeric integer. Absolutely NO currency symbols ($, ₹), NO commas, and NO abbreviations like 10k or 5M. Convert "$10k" directly to 10000. If no value is mentioned, return null.)
- status (string, default to "New" if not mentioned)

Return ONLY valid JSON matching this exact structure. Do not include markdown formatting or extra text.`;

  // Using Gemini API directly via fetch
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('No content returned from the Gemini model.');
  }

  const parsed = JSON.parse(content) as Partial<LeadData>;

  return {
    first_name: parsed.first_name || 'Unknown',
    last_name: parsed.last_name || 'Unknown',
    email: parsed.email || null,
    phone: parsed.phone || null,
    intent: parsed.intent || null,
    estimated_value: parsed.estimated_value || null,
    status: parsed.status || 'New'
  };
}
