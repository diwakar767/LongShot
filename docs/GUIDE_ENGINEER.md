# Engineer / CLI agent guide

## Prerequisites (agent host)

- **Node.js 18+** only (Docker **not** required on the agent)
- Network reachability to the AlertOn API (`url` in config)
- A **Server** already created by an admin in the UI
- That server’s unique **agent API key**

## Config

```bash
cd alerton-cli
cp config.example.yaml config.yaml   # or config.local.yaml
npm install
```

```yaml
url: "http://YOUR_API_HOST:5000/alert"
api_key: "<paste Agent key from Admin → Servers>"
server_name: "exact-server-name-from-ui"
resolve_after_seconds: 300
heartbeat_interval_seconds: 900
group_name: "techops"
app_name: "monitor"
country_name: "United States"
```

`api_key` is **per server**. Using another server’s key will bind traffic to *that* server.

## Commands

```bash
# One-shot alert (open / reassert)
node cli.js --message "Disk > 90%" --severity major

# Dry run
node cli.js --dry-run --message "test"

# One heartbeat
node cli.js --heartbeat

# Long-lived agent: heartbeat loop + quiet-alert resolve flush
node cli.js --agent

# Only flush quiet fingerprints from local alert-state.json
node cli.js --flush-resolves
```

Local state file: `alert-state.json` next to `cli.js` (dedupe / resolve tracking).

## Always-on on Windows (recommended)

Run the agent as a background service so it survives logoff and restarts.

### Option A — NSSM (simple)

1. Download [NSSM](https://nssm.cc/).
2. From an elevated PowerShell:

```powershell
cd E:\path\to\alerton-cli
.\scripts\install-windows-service.ps1 -NssmPath "C:\tools\nssm\nssm.exe"
```

Or manually:

```powershell
nssm install AlertOnAgent "C:\Program Files\nodejs\node.exe" "E:\path\to\alerton-cli\cli.js" --agent
nssm set AlertOnAgent AppDirectory "E:\path\to\alerton-cli"
nssm set AlertOnAgent Start SERVICE_AUTO_START
nssm start AlertOnAgent
```

Control:

```powershell
nssm restart AlertOnAgent
nssm stop AlertOnAgent
nssm remove AlertOnAgent confirm
```

NSSM restarts the process on crash (**auto-heal**).

### Option B — Task Scheduler

```powershell
.\scripts\register-windows-task.ps1
```

Creates a task that runs `node cli.js --agent` at startup and on failure retries.

### Logs

Redirect stdout/stderr via NSSM `AppStdout` / `AppStderr`, or wrap:

```powershell
node cli.js --agent >> agent.log 2>&1
```

## Linux (systemd sketch)

```ini
# /etc/systemd/system/alerton-agent.service
[Service]
WorkingDirectory=/opt/alerton-cli
ExecStart=/usr/bin/node cli.js --agent
Restart=always
RestartSec=5
```

```bash
sudo systemctl enable --now alerton-agent
```

## Auth reminder

Alerts, resolve, and heartbeat all send `X-API-Key: <server key>`. There is no shared global ingest secret anymore.
