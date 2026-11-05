# Array Studio

Local Electron app for testing Array embedded web components and running bulk user deletion.

## Run locally

```bash
npm install
npm start
```

## Modes

- **Library** — component workspace with preview canvas and Issues / Console / Network diagnostics
- **Delete** — bulk delete users from a CSV via `DELETE /api/user/v4?permanent=true`

## Session setup

Open **Session setup** from the components panel (or the header session pill), choose Sandbox or Production, paste `appKey` + `userToken`, then **Create session**. Credentials are not saved between sessions.

## Bulk delete

1. Choose Sandbox or Production
2. Paste `x-credmo-client-token` (`ARRAY_CLIENT_TOKEN` prefills if set)
3. Browse a CSV of userIds and confirm the column
4. Start with **Dry run**, then switch to **Live**
5. Live asks twice and requires typing `DELETE`

Results:

- Sandbox → `<file>_delete_results_sandbox.csv`
- Production → `<file>_delete_results_prod.csv`

## Updates (no new app install)

Builds keep a stable Windows identity (`com.componentstudio.app` / **Array Studio**). Bump `version` in `package.json` before each release.

| Distribute | How people update |
|---|---|
| **NSIS setup** (`ArrayStudio-Setup-x.y.z.exe`) | Run the new installer over the existing install. Same Add/Remove Programs entry — it upgrades in place and keeps preferences. |
| **Portable** (`ArrayStudio-Portable.exe`) | Replace the existing portable `.exe` with the new one (same filename/path). No installer; best when IT blocks new installs. |

```bash
# bump "version" in package.json first, then:
npm run build:win:nsis      # in-place upgrade installer
npm run build:win:portable  # overwrite portable exe
```

## Notes

- Your IP must be whitelisted for the client used in bulk delete.
- Preferences and theme are stored in localStorage on this machine.
- Auto-update over the network is not wired yet; updates are redistributed builds as above.
