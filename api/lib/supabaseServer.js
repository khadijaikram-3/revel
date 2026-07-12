/**
 * Server-side Supabase client for API routes.
 * Uses the service role key to bypass RLS for server-side operations.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[supabaseServer] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function createScan(data) {
  const { data: scan, error } = await supabase
    .from('scans')
    .insert({
      target_url: data.target_url,
      status: data.status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return scan;
}

async function getScan(scanId) {
  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .maybeSingle();

  if (error) throw error;
  return scan;
}

async function updateScan(scanId, updates) {
  const { data: scan, error } = await supabase
    .from('scans')
    .update(updates)
    .eq('id', scanId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return scan;
}

module.exports = { createScan, getScan, updateScan };
