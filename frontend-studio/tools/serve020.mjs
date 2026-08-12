// Static server for studio prototypes that CANNOT serve a stale file.
// python3 -m http.server sends Last-Modified and no Cache-Control, so a browser
// heuristically caches — which is how 017 went blank on David: a cached data.js
// against a fresh index.html throws on the first field the old file lacks.
//
// The type table is the second half of that lesson. On 2026-08-09 a page went blank with
// no fault message because the server returned the wrong MIME type for a `.mjs` file and
// a module that fails to LOAD never reaches the error boundary inside it. Every extension
// this tree serves is listed here, and an unknown one is refused loudly rather than sent
// as octet-stream.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.argv[2], PORT = Number(process.argv[3] || 8782);
const TYPES = {
  '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8',
  '.mjs': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};
http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end('no'); }
  const ext = path.extname(f);
  if (!TYPES[ext]) {
    res.writeHead(415, { 'content-type': 'text/plain' });
    return res.end(`415 unlisted extension "${ext}" — add it to serve020.mjs rather than
guessing a type. A module served as the wrong type fails silently.`);
  }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404 ' + rel); }
    res.writeHead(200, {
      'content-type': TYPES[ext],
      'cache-control': 'no-store, no-cache, must-revalidate',
      'pragma': 'no-cache',
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1',
  () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT} (no-store)`));
