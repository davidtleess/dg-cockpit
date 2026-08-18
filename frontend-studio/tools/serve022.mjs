// no-store static server for proposal 022 — the last cut.
// Rooted at the STUDIO so /kit/studio-kit.tokens.css is served from its generated
// source rather than transcribed into the page. Index: /proposals/022-the-last-cut/
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const PORT = Number(process.argv[2] || 8792);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".png": "image/png" };

createServer(async (req, res) => {
  try {
    let path = normalize(new URL(req.url, "http://x").pathname).replace(/^\/+/, "");
    if (path === "" || path.endsWith("/")) path += "index.html";
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": MIME[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "cache-control": "no-store" });
    res.end("not found");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`022 on http://127.0.0.1:${PORT}/proposals/022-the-last-cut/`));
