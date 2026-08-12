import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { CanaryRunner } from "./runner.js";
import { parseArtifact } from "./parser.js";
import { answerCopilot } from "./copilot.js";
const root = fileURLToPath(new URL("../public/", import.meta.url));
const args = process.env.ATLAS_BASELINE_ARGS ? JSON.parse(process.env.ATLAS_BASELINE_ARGS) : [];
if (!Array.isArray(args) || args.some((x) => typeof x !== "string")) throw new Error("ATLAS_BASELINE_ARGS must be a JSON string array");
const runner = new CanaryRunner({ command: process.env.ATLAS_CLI, args, cwd: process.env.ATLAS_SDK_DIR, timeoutMs: +(process.env.ATLAS_TIMEOUT_MS ?? 120000) });
let lastRun = null, artifact = null;
const json = (res, code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
const body = async (req) => { let s = ""; for await (const c of req) { s += c; if (s.length > 2e6) throw new Error("Request too large"); } return s ? JSON.parse(s) : {}; };
const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/state") return json(res, 200, { mode: process.env.ATLAS_CLI ? "Local Live Mode" : "Recorded Artifact Demo Mode", configured: !!process.env.ATLAS_CLI, running: runner.running, run: lastRun, artifact: artifact && parseArtifact(artifact) });
    if (req.method === "POST" && req.url === "/api/run") { const result = await runner.run(); lastRun = result; if (result.artifact) artifact = result.artifact; return json(res, 200, { ...result, artifact: artifact && parseArtifact(artifact) }); }
    if (req.method === "POST" && req.url === "/api/artifact") { artifact = (await body(req)).artifact; const parsed = parseArtifact(artifact); lastRun = { status: "RECORDED", exitCode: null, durationMs: null, stdout: "Loaded user-supplied artifact", stderr: "" }; return json(res, 200, parsed); }
    if (req.method === "POST" && req.url === "/api/copilot") { const { action } = await body(req); if (!artifact) return json(res, 409, { error: "Load a real artifact first" }); return json(res, 200, { answer: answerCopilot(action, parseArtifact(artifact), lastRun) }); }
    const path = req.url === "/" ? "index.html" : normalize(req.url).replace(/^(\.\.[/\\])+/, "").slice(1);
    const data = await readFile(join(root, path)); const types = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript" }; res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }); res.end(data);
  } catch (e) { json(res, e.code === "ALREADY_RUNNING" ? 409 : 400, { error: e.message }); }
});
server.listen(process.env.PORT ?? 4173, "0.0.0.0", () => console.log(`Atlas Investigation UI: http://localhost:${process.env.PORT ?? 4173}`));
