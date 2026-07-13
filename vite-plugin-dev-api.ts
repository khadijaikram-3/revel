/**
 * Vite plugin that serves /api/* routes during local development.
 * In production (Vercel), these routes are handled by Vercel's serverless functions.
 *
 * This plugin loads each API route as an ESM module, wraps it to accept
 * Express-like (req, res) arguments, and routes requests to the correct handler.
 */

import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const apiDir = resolve(process.cwd(), 'api');

const routes = [
  { pattern: /^\/api\/scan\/?$/, handler: 'scan.js', method: 'POST' },
  { pattern: /^\/api\/scan-status\/?$/, handler: 'scan-status.js', method: 'GET' },
  { pattern: /^\/api\/report\/?$/, handler: 'report.js', method: 'POST' },
];

// Simple in-memory module cache (reloaded when source changes)
const moduleCache = new Map();

async function loadHandler(handlerFile) {
  const filePath = join(apiDir, handlerFile);
  if (!existsSync(filePath)) {
    throw new Error(`API handler not found: ${filePath}`);
  }

  // Check if file was modified since last load
  const fileUrl = pathToFileURL(filePath).href + `?t=${Date.now()}`;
  const mod = await import(fileUrl);
  return mod.default;
}

export default function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle /api/* paths
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse URL and query string
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = urlObj.pathname;
        const query = Object.fromEntries(urlObj.searchParams.entries());

        // Find matching route
        const route = routes.find((r) => r.pattern.test(pathname));
        if (!route) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
          return;
        }

        // Check method
        if (req.method !== route.method) {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const handler = await loadHandler(route.handler);

          // Build Express-like req object
          const expressReq = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            query,
            body: {},
          };

          // Parse body for POST/PUT
          if (req.method === 'POST' || req.method === 'PUT') {
            await new Promise((resolvePromise) => {
              let raw = '';
              req.on('data', (chunk) => { raw += chunk; });
              req.on('end', () => {
                try {
                  expressReq.body = raw ? JSON.parse(raw) : {};
                } catch {
                  expressReq.body = {};
                }
                resolvePromise();
              });
              req.on('error', resolvePromise);
            });
          }

          // Build Express-like res object
          const expressRes = {
            statusCode: 200,
            _headers: {},
            setHeader(name, value) { this._headers[name] = value; },
            getHeader(name) { return this._headers[name]; },
            status(code) { this.statusCode = code; return this; },
            json(data) {
              res.statusCode = this.statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
          };

          await handler(expressReq, expressRes);
        } catch (error) {
          console.error(`[dev-api] Error in ${route.handler}:`, error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error', detail: error.message }));
        }
      });
    },
  };
}
