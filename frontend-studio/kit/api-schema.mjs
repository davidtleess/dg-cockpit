#!/usr/bin/env node
/**
 * api-schema — read the product's OWN OpenAPI spec instead of guessing shapes.
 *
 *   node kit/api-schema.mjs                        list every endpoint
 *   node kit/api-schema.mjs /api/league/pulse      the exact response shape
 *   node kit/api-schema.mjs --grep posture         find a field across 110 schemas
 *
 * WHY THIS EXISTS.
 * On 2026-07-28 Studio spent an evening discovering API shapes by curling an
 * endpoint and printing `list(d.keys())` — three times — and still guessed
 * `team_posture` when the field is `team_postures`, then patched it. The whole
 * time the backend was serving a complete OpenAPI 3.1 document at /openapi.json:
 * 20 paths, 110 named schemas, every field typed. The product's own frontend
 * generates its types from exactly this file (`npm run openapi-gen`).
 *
 * David found this in a basic search of how to work well with an AI agent, which
 * is the uncomfortable part: it was not obscure, and Studio had read the briefing
 * line that mentions it. **Reading the schema is not optional and is not slower.**
 */

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE = resolve(HERE, 'api-schema.cache.json');
const URL_ = 'http://127.0.0.1:8000/openapi.json';

async function load() {
  try {
    const r = await fetch(URL_, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const spec = await r.json();
    writeFileSync(CACHE, JSON.stringify(spec));
    return { spec, live: true };
  } catch (e) {
    if (existsSync(CACHE)) return { spec: JSON.parse(readFileSync(CACHE, 'utf8')), live: false };
    console.error(`cannot reach ${URL_} and no cache: ${e.message}`);
    console.error('start the app, or run this once while it is up.');
    process.exit(2);
  }
}

const { spec, live } = await load();
const schemas = spec.components?.schemas ?? {};
const arg = process.argv[2];

/** Expand a $ref one level so a shape is readable without chasing pointers. */
function shape(node, depth = 0, seen = new Set()) {
  if (!node) return 'unknown';
  if (node.$ref) {
    const name = node.$ref.split('/').pop();
    if (seen.has(name) || depth > 2) return `${name} (…)`;
    return shape(schemas[name], depth, new Set([...seen, name]));
  }
  if (node.anyOf) return node.anyOf.map((n) => shape(n, depth + 1, seen)).join(' | ');
  if (node.type === 'array') return `${shape(node.items, depth + 1, seen)}[]`;
  if (node.type === 'object' || node.properties) {
    const props = Object.entries(node.properties ?? {});
    if (!props.length) return 'object';
    const req = new Set(node.required ?? []);
    return props
      .map(([k, v]) => `${'  '.repeat(depth + 1)}${k}${req.has(k) ? '' : '?'}: ${shape(v, depth + 1, seen)}`)
      .join('\n');
  }
  return node.type ?? 'any';
}

if (!arg) {
  console.log(`Dynasty Genius ${spec.info.version} — ${Object.keys(spec.paths).length} paths, ` +
              `${Object.keys(schemas).length} schemas  ${live ? '(live)' : '(cached)'}\n`);
  for (const [p, ops] of Object.entries(spec.paths)) {
    for (const [m, op] of Object.entries(ops)) {
      const ref = op.responses?.['200']?.content?.['application/json']?.schema?.$ref;
      console.log(`  ${m.toUpperCase().padEnd(5)} ${p.padEnd(42)} → ${ref?.split('/').pop() ?? 'inline'}`);
    }
  }
  console.log('\nnode kit/api-schema.mjs <path>   for the exact response shape');
} else if (arg === '--grep') {
  const needle = (process.argv[3] || '').toLowerCase();
  let hits = 0;
  for (const [name, s] of Object.entries(schemas)) {
    for (const field of Object.keys(s.properties ?? {})) {
      if (field.toLowerCase().includes(needle)) { console.log(`  ${name}.${field}`); hits++; }
    }
  }
  console.log(`\n${hits} field(s) matching "${needle}" across ${Object.keys(schemas).length} schemas`);
} else {
  const ops = spec.paths[arg];
  if (!ops) {
    console.error(`no such path: ${arg}`);
    const near = Object.keys(spec.paths).filter((p) => p.includes(arg.replace(/^\/+/, '')));
    if (near.length) console.error('did you mean:\n  ' + near.join('\n  '));
    process.exit(1);
  }
  for (const [m, op] of Object.entries(ops)) {
    console.log(`${m.toUpperCase()} ${arg}   ${op.summary ?? ''}`);
    const params = op.parameters ?? [];
    if (params.length) console.log('  params: ' + params.map((p) => `${p.name}${p.required ? '' : '?'}`).join(', '));
    const s = op.responses?.['200']?.content?.['application/json']?.schema;
    console.log('  200 →');
    console.log(shape(s, 1));
  }
}
