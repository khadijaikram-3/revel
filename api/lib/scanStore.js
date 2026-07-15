// api/lib/scanStore.js — Redis with in-memory fallback
import { createClient } from 'redis';

// In-memory fallback store (used if Redis is unavailable)
const memoryStore = new Map();

let redisClient = null;
let redisConnected = false;

async function getRedisClient() {
  if (redisConnected && redisClient) return redisClient;
  
  try {
    const url = process.env.REDIS_URL || process.env.KV_URL;
    if (!url) {
      console.log('[scanStore] No Redis URL found — using memory only');
      return null;
    }
    
    redisClient = createClient({ url });
    await redisClient.connect();
    redisConnected = true;
    console.log('[scanStore] Connected to Redis successfully');
    return redisClient;
  } catch (err) {
    console.log('[scanStore] Redis connection failed — using memory fallback');
    redisConnected = false;
    return null;
  }
}

const SCAN_PREFIX = 'scan:';

export async function createScan(data) {
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  const scan = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Always save to memory first (guaranteed to work)
  memoryStore.set(id, scan);
  console.log('[scanStore] Saved to memory:', id);
  
  // Try to save to Redis as well
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`${SCAN_PREFIX}${id}`, JSON.stringify(scan));
      console.log('[scanStore] Saved to Redis:', id);
    } catch (err) {
      console.log('[scanStore] Redis save failed — memory copy exists');
    }
  }
  
  return scan;
}

export async function getScan(id) {
  // Check memory first (fastest)
  if (memoryStore.has(id)) {
    console.log('[scanStore] Found in memory:', id);
    return memoryStore.get(id);
  }
  
  // Try Redis if memory doesn't have it
  const redis = await getRedisClient();
  if (redis) {
    try {
      const data = await redis.get(`${SCAN_PREFIX}${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        // Cache back to memory for faster access
        memoryStore.set(id, parsed);
        console.log('[scanStore] Found in Redis:', id);
        return parsed;
      }
    } catch (err) {
      console.log('[scanStore] Redis read failed');
    }
  }
  
  console.log('[scanStore] Not found anywhere:', id);
  return null;
}

export async function updateScan(id, data) {
  const existing = await getScan(id);
  if (!existing) return null;
  
  const updated = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  // Always update memory
  memoryStore.set(id, updated);
  
  // Try to update Redis
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`${SCAN_PREFIX}${id}`, JSON.stringify(updated));
      console.log('[scanStore] Updated in Redis:', id);
    } catch (err) {
      console.log('[scanStore] Redis update failed — memory has latest');
    }
  }
  
  return updated;
}
