// api/lib/scanStore.js
const store = new Map();

export function createScan(data) {
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  const scan = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.set(id, scan);
  return scan;
}

export function getScan(id) {
  return store.get(id) || null;
}

export function updateScan(id, data) {
  const existing = store.get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  store.set(id, updated);
  return updated;
}