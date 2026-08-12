# Atlas Shared Investigation Workspace V2

Private, standalone, read-only web UI around the **public Atlas DSIL SDK surface**. This repository does not contain, modify, or reimplement the Atlas Investigation Engine. It does not write to Assist Vault or Closure.

## Current SDK verification status

On 2026-08-12 this build environment could not access `https://github.com/sensordeck/atlas-dsil-sdk` (the CONNECT proxy returned HTTP 403). Therefore the installation method, CLI entry point, baseline command, and real JSON schema could **not** be independently verified here. In particular, this repository does not claim that an invented fixture is a real baseline result and deliberately ships no fake PASS artifact.

Before using Local Live Mode, review the current public SDK [README](https://github.com/sensordeck/atlas-dsil-sdk) and `docs/ATLAS_SURFACE_INTEGRATION_SPEC.md`, execute `samples/rosbag2_runtime_observation_sample` exactly as documented, and configure the reviewed executable and fixed arguments below. Never paste private source, credentials, or investigation data here.

## Run

Requires Node.js 20+ and no third-party packages.

```bash
npm start
# open http://localhost:4173
```

## Vercel UI preview

The default static page is a professional shared-workspace preview for robot OEM/ODM support and sensor-partner FAE teams. It continuously labels itself **Preview Mode / Sanitized Demo Data** and **SANITIZED DEMO DATA — NOT A REAL BASELINE RESULT**. It never reports a Canary PASS, and the runner button is disabled with **Local Atlas Runner not connected**.

The UI includes three sanitized cases, OEM/Shared/Sensor prioritization, searchable case navigation, seven investigation tabs, the WINPOL-DEFAULT-001 timeline layout, workflow chain, RGA similarity boundary, nine-field partner exchange, guarded decisions, non-default raw details, and a Zendesk-style deterministic Copilot. Role selection changes presentation only and never mutates case facts. Demo values are UI fixtures—not Atlas evidence.

Import this repository into Vercel or run `vercel`. `vercel.json` executes `npm run build` and publishes `dist/`; the deployed page has no localhost or server API dependency. The existing Node API and controlled runner remain in `src/` for a future separately secured Local Live integration, but the Vercel preview does not connect to them.

```bash
npm run build
```

### A. Local Live Mode

For a machine with the required ROS 2/rosbag2 environment and public SDK installed:

```bash
ATLAS_CLI=/absolute/path/to/reviewed-atlas-entrypoint \
ATLAS_BASELINE_ARGS='["the","exact","documented","fixed","baseline","arguments"]' \
ATLAS_SDK_DIR=/absolute/path/to/atlas-dsil-sdk \
npm start
```

The browser supplies **no command or arguments**. The adapter uses `spawn` without a shell, accepts only the administrator-configured executable and immutable JSON string-array arguments, prevents concurrent runs, defaults to a 120-second timeout, retains the latest 1 MiB of stdout/stderr, and reports exit code and duration. It parses the last complete JSON line in stdout as the artifact. `ATLAS_TIMEOUT_MS` can set a deployment-specific timeout.

### B. Recorded Artifact Demo Mode

Run without `ATLAS_CLI`, then use **Load recorded JSON**. Only load a sanitized JSON artifact previously produced by the real public baseline. The file remains in server memory and is not committed or written to disk. Missing known fields render as **Not produced by this baseline**. Since the environment could not produce or authenticate a real artifact, none is bundled.

The parser currently recognizes exact snake-case fields and conservative camel-case aliases for `observed_topics`, topic eligibility/classification, `timing_relationships`, governance/evidence windows, and `classification_state`. Raw JSON is always available for audit. Alias handling is a UI compatibility layer, not an Atlas schema assertion.

## Offline Copilot

Five deterministic templates operate exclusively on parsed artifact values. Every response begins with **DRAFT / AI-assisted**, identifies omissions rather than filling them, avoids causal interpretation, and explicitly states that it does not confirm root cause. No network or external AI API is used.

## Tests

```bash
npm test
```

Tests cover conservative parsing/missing fields, deterministic Copilot guardrails, output and exit-code capture, JSON extraction, timeout, and concurrent-run prevention.

## Security and scope

- Do not expose this development server directly to untrusted networks; add authentication and TLS at the deployment boundary.
- Do not configure commands from browser input and do not use shell fragments in `ATLAS_BASELINE_ARGS`.
- The UI is read-only evidence presentation. PASS means only that the configured public baseline process exited successfully.
- Never load unsanitized private artifacts into a shared deployment.
