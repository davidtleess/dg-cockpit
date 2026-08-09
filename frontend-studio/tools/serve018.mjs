// Serve proposal 018 with no-store, so a regenerated data.js can never pair with a cached
// index.html. That pair is what put a blank page in front of the client on 2026-08-07.
//   node /Users/davidleess/frontend-studio/tools/serve018.mjs [port]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = '/Users/davidleess/frontend-studio/proposals/018-what-repeats';
const PORT = Number(process.argv[2] || 8782);
const TYPES = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8',
                '.css': 'text/css;charset=utf-8', '.png': 'image/png' };
http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end('no'); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404 ' + rel); }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(f)] || 'application/octet-stream',
      'cache-control': 'no-store, no-cache, must-revalidate', pragma: 'no-cache',
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`018 on http://127.0.0.1:${PORT} (no-store)`));
