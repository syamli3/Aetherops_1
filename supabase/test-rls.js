import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testQuery() {
  const { data, error } = await supabase.from('deals').select('*');
  if (error) {
    console.error("Query Error:", error.message);
  } else {
    console.log("Deals found using ANON key:", data.length);
    if (data.length === 0) {
      console.log("⚠️ If data.length is 0 but we seeded deals, RLS is likely blocking the ANON key.");
    } else {
      console.log(data);
    }
  }
}
testQuery();
