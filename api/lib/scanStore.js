/**
 * In-memory scan store for scan data persistence.
 * Scan data lives for the lifetime of the serverless function invocation
 * (or the dev server session). No external database required.
 */

const store = new Map();

function newId() {
  return crypto.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function createScan(data) {
  const id = newId();
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
  store.set(id, scan);
  console.log('[scanStore] createScan:', id);
  return scan;
}

async function getScan(scanId) {
  const scan = store.get(scanId) || null;
  console.log('[scanStore] getScan:', scanId, '— found:', !!scan);
  return scan;
}

async function updateScan(scanId, updates) {
  const scan = store.get(scanId);
  if (!scan) throw new Error(`Scan ${scanId} not found`);
  const updated = { ...scan, ...updates };
  store.set(scanId, updated);
  console.log('[scanStore] updateScan:', scanId, '— status:', updates.status || scan.status);
  return updated;
}

export { createScan, getScan, updateScan };
