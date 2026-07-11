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

/**
 * Create a new scan row.
 * @param {{ target_url: string, status?: string }} data
 * @returns {Promise<object>} the created scan row
 */
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

/**
 * Get a scan row by ID.
 * @param {string} scanId
 * @returns {Promise<object|null>}
 */
async function getScan(scanId) {
  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .maybeSingle();

  if (error) throw error;
  return scan;
}

/**
 * Update a scan row by ID.
 * @param {string} scanId
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
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