/**
 * Supabase server client for API routes.
 * Falls back to in-memory storage when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * are not configured, so the scan flow always works (mock mode).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.SUPABASE_URL
  || (typeof process !== 'undefined' && process.env?.SUPABASE_URL)
  || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);

const supabaseServiceKey = typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY;

const useMock = !supabaseUrl || !supabaseServiceKey;

if (useMock) {
  console.warn('[supabaseServer] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — using in-memory mock store');
} else {
  console.log('[supabaseServer] Using Supabase at:', supabaseUrl);
}

const supabase = useMock ? null : createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// In-memory fallback store
const memoryStore = new Map();

export async function createScan(data) {
  if (useMock) {
    const id = crypto.randomUUID?.() || `mock-${Date.now()}`;
    const scan = {
      id,
      target_url: data.target_url,
      status: data.status || 'pending',
      risk_score: null,
      risk_level: null,
      vulnerabilities: null,
      executive_report: null,
      technical_report: null,
      duration: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    memoryStore.set(id, scan);
    console.log('[supabaseServer] [mock] createScan:', id);
    return scan;
  }

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

export async function getScan(scanId) {
  if (useMock) {
    const scan = memoryStore.get(scanId) || null;
    console.log('[supabaseServer] [mock] getScan:', scanId, '— found:', !!scan);
    return scan;
  }

  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .maybeSingle();

  if (error) throw error;
  return scan;
}

export async function updateScan(scanId, updates) {
  if (useMock) {
    const scan = memoryStore.get(scanId);
    if (!scan) throw new Error(`Scan ${scanId} not found in memory store`);
    const updated = { ...scan, ...updates };
    memoryStore.set(scanId, updated);
    console.log('[supabaseServer] [mock] updateScan:', scanId, '— status:', updates.status);
    return updated;
  }

  const { data: scan, error } = await supabase
    .from('scans')
    .update(updates)
    .eq('id', scanId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return scan;
}
