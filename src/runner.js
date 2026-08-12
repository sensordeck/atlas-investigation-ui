import { spawn } from "node:child_process";
const MAX_BYTES = 1024 * 1024;

export class CanaryRunner {
  constructor({ command, args, timeoutMs = 120000, cwd } = {}) {
    this.config = { command, args: Object.freeze([...(args ?? [])]), timeoutMs, cwd };
    this.running = false;
  }
  async run() {
    if (this.running) throw Object.assign(new Error("A canary run is already in progress"), { code: "ALREADY_RUNNING" });
    if (!this.config.command) throw new Error("Local Live Mode is not configured; set ATLAS_CLI and the reviewed ATLAS_BASELINE_ARGS");
    this.running = true;
    const started = Date.now();
    try {
      return await new Promise((resolve, reject) => {
        const child = spawn(this.config.command, this.config.args, { cwd: this.config.cwd, shell: false, env: process.env });
        let stdout = "", stderr = "", timedOut = false;
        const append = (old, chunk) => (old + chunk).slice(-MAX_BYTES);
        child.stdout.on("data", (d) => stdout = append(stdout, d));
        child.stderr.on("data", (d) => stderr = append(stderr, d));
        child.on("error", reject);
        const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, this.config.timeoutMs);
        child.on("close", (exitCode, signal) => {
          clearTimeout(timer);
          resolve({ status: !timedOut && exitCode === 0 ? "PASS" : "FAIL", exitCode, signal, timedOut,
            durationMs: Date.now() - started, stdout, stderr, artifact: extractJson(stdout) });
        });
      });
    } finally { this.running = false; }
  }
}

export function extractJson(stdout) {
  const lines = stdout.trim().split(/\r?\n/).reverse();
  for (const line of lines) { try { const x = JSON.parse(line); if (x && typeof x === "object") return x; } catch {} }
  return null;
}
