// Static server for studio prototypes that CANNOT serve a stale file.
// python3 -m http.server sends Last-Modified and no Cache-Control, so a browser
// heuristically caches — which is how 017 went blank on David: a cached data.js
// against a fresh index.html throws on the first field the old file lacks.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.argv[2], PORT = Number(process.argv[3] || 8781);
const TYPES = {'.html':'text/html;charset=utf-8', '.js':'text/javascript;charset=utf-8',
               '.css':'text/css;charset=utf-8', '.png':'image/png', '.json':'application/json'};
http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end('no'); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, {'content-type':'text/plain'}); return res.end('404 ' + rel); }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(f)] || 'application/octet-stream',
      'cache-control': 'no-store, no-cache, must-revalidate',
      'pragma': 'no-cache',
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT} (no-store)`));
