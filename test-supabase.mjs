import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://utqmofhwthpsqhtmhebv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cW1vZmh3dGhwc3FodG1oZWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzQ3MzksImV4cCI6MjA2OTYxMDczOX0.5QlKwASftxicoUFPCcFfgsjL2PY_cfkgqVP1h5hzncU"
);

async function run() {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      user_id: '3WK7sgMjJmEhwvraWMhUscIb', // dummy or existing? wait, it will fail FK if not existing. Let's just see the error.
      provider_name: 'Test',
      facility_name: 'Test',
      appointment_type: 'In-person',
      appointment_date: new Date().toISOString(),
      location: 'Test',
      is_virtual: false,
      notes: 'Test'
    }])
    .select()
    .single();
    
  console.log("Error:", error);
}

run();
