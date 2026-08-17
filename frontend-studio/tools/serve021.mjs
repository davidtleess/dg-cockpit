// no-store static server for proposal 021 — the trade ledger
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("../proposals/021-trade-retrospective/", import.meta.url).pathname;
const PORT = Number(process.argv[2] || 8791);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };

createServer(async (req, res) => {
  try {
    const path = normalize(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html";
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": MIME[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "cache-control": "no-store" });
    res.end("not found");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`021 on http://127.0.0.1:${PORT}/`));
