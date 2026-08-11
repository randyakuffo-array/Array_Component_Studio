# Array Component Studio

A local Electron app for testing Array embedded web components with direct `appKey` + `userToken` input — plus a **Playbooks** activity that hosts FlowTest API workflows in the same window.

## Run locally

```bash
npm install
npm run sync:flowtest   # build FlowTest into ./flowtest
npm start
```

Or while developing FlowTest with hot reload:

```bash
# terminal A — from Workflow Testing Tool
npm run dev

# terminal B — from Array Component Studio
npm run dev:flowtest
```

## Modes

- **Components** (☰) — existing embedded component studio
- **Playbooks** (◎) — FlowTest playbooks / workflow runner (separate UI, same app)
- **HTTP Issues** (⚡) — jumps to the Issues/devtools tab in Components mode

## Notes

- This app does not call the client key/client token auth endpoints.
- Paste `appKey` and `userToken` directly.
- Refresh or extend tokens manually, then use **Replace token + reload**.
- The filtered diagnostics console is collapsible and only shows relevant issues by default.
- Preferences are stored in localStorage on your Mac.
- Playbooks and Components keep independent state (FlowTest uses its own localStorage keys).
