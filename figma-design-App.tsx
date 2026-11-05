import { useMemo, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Columns3,
  Component,
  Copy,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FolderOpen,
  Gauge,
  KeyRound,
  LayoutPanelLeft,
  Maximize2,
  Monitor,
  Moon,
  MoreHorizontal,
  Network,
  Play,
  Pause,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SquareStack,
  Sun,
  TerminalSquare,
  TestTube2,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
  X,
  Zap,
  ZoomIn,
} from "lucide-react"

const groups = [
  {
    name: "Enrollment & auth",
    items: ["Account Enroll", "Authentication KBA", "Account Login"],
  },
  {
    name: "Credit",
    items: [
      "Credit Overview",
      "Credit Report v1 1B",
      "Credit Report v1 3B",
      "Credit Score Details",
      "Credit Protection",
      "Debt Analysis",
      "Score Insights",
      "Score Simulator",
      "Score Coach",
    ],
  },
  {
    name: "Identity",
    items: ["Identity Protect", "Identity Monitoring", "Dark Web Scan"],
  },
]

const tabs = [
  { name: "Issues", icon: CircleHelp, count: 2 },
  { name: "Console", icon: TerminalSquare },
  { name: "Network", icon: Network, count: 4 },
  { name: "Events", icon: Zap },
  { name: "Lifecycle", icon: Activity },
]

function BulkDeletePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const runTimerRef = useRef<number | null>(null)
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    "sandbox",
  )
  const [mode, setMode] = useState<"dry" | "live">("dry")
  const [fileName, setFileName] = useState("")
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const runDelete = () => {
    if (running) {
      if (runTimerRef.current) window.clearTimeout(runTimerRef.current)
      setRunning(false)
      return
    }
    if (!fileName) return
    setRunning(true)
    setFinished(false)
    runTimerRef.current = window.setTimeout(() => {
      setRunning(false)
      setFinished(true)
    }, 900)
  }

  return (
    <section className="delete-workspace">
      <aside className="delete-config">
        <div className="delete-config-header">
          <div className="delete-title-icon">
            <Trash2 size={18} />
          </div>
          <div>
            <span className="eyebrow">Data utility</span>
            <h1>Bulk delete</h1>
          </div>
        </div>
        <p className="delete-description">
          Delete user records in bulk using a validated CSV file.
        </p>

        <div className="danger-notice">
          <AlertTriangle size={17} />
          <div>
            <strong>IP allowlisting required</strong>
            <p>Your current IP must be allowlisted for the selected client.</p>
          </div>
        </div>

        <div className="delete-form">
          <label className="delete-field">
            <span>Environment</span>
            <div className="wide-segmented">
              <button
                className={environment === "sandbox" ? "active" : ""}
                onClick={() => setEnvironment("sandbox")}
              >
                Sandbox
              </button>
              <button
                className={environment === "production" ? "active danger" : ""}
                onClick={() => setEnvironment("production")}
              >
                Production
              </button>
            </div>
            <small>
              {environment === "sandbox"
                ? "https://sandbox.array.io"
                : "https://api.array.io"}
            </small>
          </label>

          <label className="delete-field">
            <span>Client token</span>
            <div className="delete-input">
              <KeyRound size={15} />
              <input type="password" placeholder="Enter client token" />
              <Eye size={15} />
            </div>
          </label>

          <div className="delete-field">
            <span>CSV of user IDs</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(event) =>
                setFileName(event.target.files?.[0]?.name ?? "")
              }
            />
            {fileName ? (
              <div className="file-selected">
                <div className="file-selected-icon">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <strong>{fileName}</strong>
                  <span>Ready to validate</span>
                </div>
                <button
                  onClick={() => {
                    setFileName("")
                    setFinished(false)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                  aria-label="Remove CSV"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                className="file-drop"
                onClick={() => inputRef.current?.click()}
              >
                <div>
                  <Upload size={18} />
                </div>
                <strong>Choose a CSV file</strong>
                <span>One user ID per row · up to 10 MB</span>
              </button>
            )}
          </div>

          <label className="delete-field">
            <span>User ID column</span>
            <div className="delete-select disabled">
              {fileName ? "userId" : "Upload a CSV first"}
              <ChevronDown size={15} />
            </div>
          </label>

          <label className="delete-field">
            <span>Results folder</span>
            <button className="folder-picker">
              <FolderOpen size={15} />
              <span>Same folder as CSV</span>
              <ChevronRight size={14} />
            </button>
          </label>

          <div className="delete-field">
            <span>Run mode</span>
            <div className="wide-segmented mode-picker">
              <button
                className={mode === "dry" ? "active" : ""}
                onClick={() => setMode("dry")}
              >
                Dry run
                <small>Validate only</small>
              </button>
              <button
                className={mode === "live" ? "active danger" : ""}
                onClick={() => setMode("live")}
              >
                Live
                <small>Delete records</small>
              </button>
            </div>
          </div>
        </div>

        <div className="delete-footer">
          {mode === "live" && (
            <div className="live-warning">
              <AlertTriangle size={14} />
              Live deletions cannot be undone.
            </div>
          )}
          <button
            className={`run-delete ${mode === "live" ? "live" : ""}`}
            disabled={!fileName}
            onClick={runDelete}
          >
            {running ? (
              <>
                <Pause size={16} />
                Stop run
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                {mode === "dry" ? "Start dry run" : "Start live deletion"}
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="run-area">
        <div className="run-header">
          <div>
            <span className="eyebrow">Execution</span>
            <h2>Run log</h2>
            <p>
              {mode === "dry"
                ? "Dry runs validate every row without sending delete requests."
                : "Live mode writes a results CSV and can resume unfinished rows."}
            </p>
          </div>
          <div className={`run-status ${running ? "running" : ""}`}>
            <span />
            {running ? "Running" : finished ? "Complete" : "Ready"}
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">
              <span className="metric-dot queued" />
              Queued
            </div>
            <strong>{fileName ? "2,426" : "0"}</strong>
            <span>{fileName ? "Rows detected" : "Waiting for CSV"}</span>
          </div>
          <div className="metric-card">
            <div className="metric-label">
              <span className="metric-dot done" />
              Processed
            </div>
            <strong>{finished ? "2,426" : running ? "1,284" : "0"}</strong>
            <span>{running ? "53% complete" : "No rows processed"}</span>
          </div>
          <div className="metric-card">
            <div className="metric-label">
              <span className="metric-dot deleted" />
              {mode === "dry" ? "Valid" : "Deleted"}
            </div>
            <strong>{finished ? "2,419" : running ? "1,280" : "0"}</strong>
            <span>
              {mode === "dry" ? "Ready for live run" : "Records deleted"}
            </span>
          </div>
          <div className="metric-card">
            <div className="metric-label">
              <span className="metric-dot errors" />
              Errors
            </div>
            <strong>{finished ? "7" : running ? "4" : "0"}</strong>
            <span>{finished ? "Review required" : "No errors"}</span>
          </div>
        </div>

        <div className="run-progress">
          <div
            style={{
              width: finished ? "100%" : running ? "53%" : "0%",
            }}
          />
        </div>

        <div className="log-panel">
          <div className="log-toolbar">
            <div>
              <TerminalSquare size={15} />
              Activity log
            </div>
            <button>
              <Copy size={14} />
              Copy log
            </button>
          </div>
          <div className="log-content">
            {!fileName && (
              <div className="log-empty">
                <div>
                  <FileSpreadsheet size={23} />
                </div>
                <strong>No run started</strong>
                <p>Choose a CSV file and start with a dry run.</p>
              </div>
            )}
            {fileName && !running && !finished && (
              <>
                <p>
                  <time>09:41:02</time>
                  <span className="log-info">INFO</span>
                  Loaded <b>{fileName}</b>
                </p>
                <p>
                  <time>09:41:02</time>
                  <span className="log-success">READY</span>
                  Found 2,426 rows in column <b>userId</b>
                </p>
                <p>
                  <time>09:41:03</time>
                  <span className="log-info">INFO</span>
                  Ready to start {mode === "dry" ? "dry run" : "live deletion"}
                </p>
              </>
            )}
            {running && (
              <>
                <p>
                  <time>09:42:11</time>
                  <span className="log-info">START</span>
                  Validating 2,426 user IDs in {environment}
                </p>
                <p>
                  <time>09:42:12</time>
                  <span className="log-success">OK</span>
                  Batch 12 of 23 completed successfully
                </p>
                <p>
                  <time>09:42:13</time>
                  <span className="log-warn">WARN</span>4 rows contain invalid
                  user IDs and will be skipped
                </p>
                <p className="log-cursor">Processing batch 13…</p>
              </>
            )}
            {finished && (
              <>
                <p>
                  <time>09:42:15</time>
                  <span className="log-success">DONE</span>
                  All 2,426 rows processed
                </p>
                <p>
                  <time>09:42:15</time>
                  <span className="log-success">SAVED</span>
                  Results written to <b>bulk-delete-results.csv</b>
                </p>
                <div className="run-complete-card">
                  <Check size={17} />
                  <div>
                    <strong>
                      {mode === "dry"
                        ? "Dry run complete"
                        : "Deletion complete"}
                    </strong>
                    <span>2,419 successful · 7 require review</span>
                  </div>
                  <button>View results</button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="run-footer">
          <span>Environment: {environment}</span>
          <span>Mode: {mode === "dry" ? "Dry run" : "Live"}</span>
          <span>Requests are sent in throttled batches</span>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState<"library" | "delete">("library")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("Identity Protect")
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("Issues")
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [darkPreview, setDarkPreview] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [loading, setLoading] = useState(false)

  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length),
    [search],
  )

  const toggleGroup = (name: string) => {
    setCollapsed((current) =>
      current.includes(name)
        ? current.filter((group) => group !== name)
        : [...current, name],
    )
  }

  const reload = () => {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 650)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <SquareStack size={19} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">Array Studio</div>
            <div className="brand-context">Component workspace</div>
          </div>
        </div>

        <div className="topbar-divider" />
        <div className="breadcrumb">
          <span>{activePage === "library" ? "Components" : "Utilities"}</span>
          <ChevronRight size={13} />
          <strong>{activePage === "library" ? selected : "Bulk delete"}</strong>
        </div>

        <div className="topbar-actions">
          <div className="status-pill">
            <span className="status-dot" />
            Production
          </div>
          <button className="session-chip" onClick={() => setSessionOpen(true)}>
            <KeyRound size={14} />
            No active session
          </button>
          <button className="icon-button" aria-label="Help">
            <CircleHelp size={17} />
          </button>
          <button className="avatar-button" aria-label="User menu">
            AS
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="nav-rail">
          <div className="rail-primary">
            <button
              className={`rail-item ${
                activePage === "library" ? "active" : ""
              }`}
              aria-label="Components"
              onClick={() => setActivePage("library")}
            >
              <Component size={19} />
              <span>Library</span>
            </button>
            <button
              className={`rail-item danger ${
                activePage === "delete" ? "active" : ""
              }`}
              aria-label="Bulk delete"
              onClick={() => {
                setActivePage("delete")
                setSessionOpen(false)
              }}
            >
              <Trash2 size={19} />
              <span>Delete</span>
            </button>
            <button className="rail-item" aria-label="Playground">
              <TestTube2 size={19} />
              <span>Tests</span>
            </button>
            <button className="rail-item" aria-label="Activity">
              <Gauge size={19} />
              <span>Activity</span>
            </button>
          </div>
          <div className="rail-secondary">
            <button className="rail-item" aria-label="Settings">
              <Settings2 size={19} />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {activePage === "library" ? (
          <>
            <aside
              className={`library-panel ${railOpen ? "" : "is-collapsed"}`}
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Workspace</span>
                  <h1>Components</h1>
                </div>
                <button
                  className="icon-button subtle"
                  onClick={() => setRailOpen(false)}
                  aria-label="Collapse library"
                >
                  <LayoutPanelLeft size={17} />
                </button>
              </div>

              <div className="search-box">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search components"
                  aria-label="Search components"
                />
                <kbd>⌘ K</kbd>
              </div>

              <div className="library-meta">
                <span>24 components</span>
                <button>
                  <Settings2 size={13} />
                  Filter
                </button>
              </div>

              <div className="component-list">
                {filteredGroups.map((group) => {
                  const isCollapsed = collapsed.includes(group.name)
                  return (
                    <section className="component-group" key={group.name}>
                      <button
                        className="group-heading"
                        onClick={() => toggleGroup(group.name)}
                      >
                        {isCollapsed ? (
                          <ChevronRight size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                        <span>{group.name}</span>
                        <b>{group.items.length}</b>
                      </button>
                      {!isCollapsed && (
                        <div className="group-items">
                          {group.items.map((item) => (
                            <button
                              key={item}
                              className={`component-item ${
                                selected === item ? "selected" : ""
                              }`}
                              onClick={() => setSelected(item)}
                            >
                              <FileCode2 size={15} />
                              <span>{item}</span>
                              {selected === item && <ChevronRight size={14} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </section>
                  )
                })}
                {filteredGroups.length === 0 && (
                  <div className="no-results">
                    <Search size={20} />
                    <p>No components found</p>
                    <button onClick={() => setSearch("")}>Clear search</button>
                  </div>
                )}
              </div>

              <button
                className="session-card"
                onClick={() => setSessionOpen(true)}
              >
                <div className="session-card-icon">
                  <KeyRound size={17} />
                </div>
                <div>
                  <span>Session setup</span>
                  <strong>Connect to test live data</strong>
                </div>
                <ChevronRight size={16} />
              </button>
            </aside>

            <section className="main-stage">
              <div className="preview-toolbar">
                {!railOpen && (
                  <button
                    className="icon-button toolbar-button"
                    onClick={() => setRailOpen(true)}
                    aria-label="Open library"
                  >
                    <LayoutPanelLeft size={17} />
                  </button>
                )}
                <div className="component-title">
                  <div className="title-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong>{selected}</strong>
                    <span>
                      acs/{selected.toLowerCase().replaceAll(" ", "-")}
                    </span>
                  </div>
                </div>

                <div className="toolbar-center">
                  <div className="segmented-control">
                    <button
                      className={device === "desktop" ? "active" : ""}
                      onClick={() => setDevice("desktop")}
                      aria-label="Desktop preview"
                    >
                      <Monitor size={15} />
                    </button>
                    <button
                      className={device === "mobile" ? "active" : ""}
                      onClick={() => setDevice("mobile")}
                      aria-label="Mobile preview"
                    >
                      <Smartphone size={15} />
                    </button>
                  </div>
                  <button className="zoom-control">
                    <ZoomIn size={14} />
                    100%
                    <ChevronDown size={12} />
                  </button>
                </div>

                <div className="toolbar-actions">
                  <button
                    className="icon-button toolbar-button"
                    onClick={() => setDarkPreview((value) => !value)}
                    aria-label="Toggle preview theme"
                  >
                    {darkPreview ? <Sun size={17} /> : <Moon size={17} />}
                  </button>
                  <button
                    className="icon-button toolbar-button"
                    onClick={reload}
                    aria-label="Reload preview"
                  >
                    <RefreshCw size={17} className={loading ? "spin" : ""} />
                  </button>
                  <button className="button secondary">
                    <Code2 size={15} />
                    View code
                  </button>
                  <button className="button primary">
                    <Play size={15} fill="currentColor" />
                    Run test
                  </button>
                </div>
              </div>

              <div className={`canvas ${darkPreview ? "dark-canvas" : ""}`}>
                <div className="canvas-grid" />
                <div
                  className={`preview-window ${
                    device === "mobile" ? "mobile" : ""
                  }`}
                >
                  <div className="preview-window-bar">
                    <div className="window-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="preview-url">
                      <ShieldCheck size={12} />
                      preview.array.local
                    </div>
                    <MoreHorizontal size={16} />
                  </div>
                  <div className="preview-content">
                    <div className="demo-card">
                      <div className="demo-topline">
                        <div className="demo-brand">
                          <div className="demo-logo">
                            <ShieldCheck size={21} />
                          </div>
                          <span>Identity Protect</span>
                        </div>
                        <button aria-label="More options">
                          <MoreHorizontal size={19} />
                        </button>
                      </div>
                      <div className="protection-score">
                        <div className="score-ring">
                          <svg viewBox="0 0 100 100" aria-hidden="true">
                            <circle
                              className="score-bg"
                              cx="50"
                              cy="50"
                              r="43"
                            />
                            <circle
                              className="score-value"
                              cx="50"
                              cy="50"
                              r="43"
                            />
                          </svg>
                          <div>
                            <strong>82</strong>
                            <span>Strong</span>
                          </div>
                        </div>
                        <div className="score-copy">
                          <span className="healthy-label">
                            <Check size={13} />
                            You’re protected
                          </span>
                          <h2>Your identity health looks strong.</h2>
                          <p>
                            We’re monitoring your personal information around
                            the clock.
                          </p>
                        </div>
                      </div>
                      <div className="monitor-grid">
                        <div className="monitor-item">
                          <div className="monitor-icon purple">
                            <Eye size={17} />
                          </div>
                          <div>
                            <strong>Dark web</strong>
                            <span>No exposure found</span>
                          </div>
                          <Check className="check" size={17} />
                        </div>
                        <div className="monitor-item">
                          <div className="monitor-icon blue">
                            <Activity size={17} />
                          </div>
                          <div>
                            <strong>Credit activity</strong>
                            <span>No new alerts</span>
                          </div>
                          <Check className="check" size={17} />
                        </div>
                        <div className="monitor-item">
                          <div className="monitor-icon gold">
                            <UserRound size={17} />
                          </div>
                          <div>
                            <strong>Personal info</strong>
                            <span>4 items monitored</span>
                          </div>
                          <ChevronRight size={17} />
                        </div>
                        <div className="monitor-item">
                          <div className="monitor-icon mint">
                            <ShieldCheck size={17} />
                          </div>
                          <div>
                            <strong>Insurance</strong>
                            <span>Up to $1M coverage</span>
                          </div>
                          <ChevronRight size={17} />
                        </div>
                      </div>
                      <button className="demo-action">
                        View protection details
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`inspector ${inspectorOpen ? "open" : ""}`}>
                <div className="inspector-tabs">
                  <div className="tabs-scroll">
                    {tabs.map((tab) => (
                      <button
                        key={tab.name}
                        className={activeTab === tab.name ? "active" : ""}
                        onClick={() => {
                          setActiveTab(tab.name)
                          setInspectorOpen(true)
                        }}
                      >
                        <tab.icon size={14} />
                        {tab.name}
                        {tab.count && <span>{tab.count}</span>}
                      </button>
                    ))}
                  </div>
                  <div className="inspector-actions">
                    <button>Clear</button>
                    <button
                      className="icon-button"
                      onClick={() => setInspectorOpen((value) => !value)}
                      aria-label={
                        inspectorOpen ? "Collapse inspector" : "Open inspector"
                      }
                    >
                      {inspectorOpen ? (
                        <X size={15} />
                      ) : (
                        <Maximize2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
                {inspectorOpen && (
                  <div className="inspector-content">
                    <div className="issue success">
                      <div className="issue-icon">
                        <Check size={14} />
                      </div>
                      <div>
                        <strong>Accessibility checks passed</strong>
                        <span>
                          All interactive elements have accessible names.
                        </span>
                      </div>
                      <time>Just now</time>
                    </div>
                    <div className="issue warning">
                      <div className="issue-icon">!</div>
                      <div>
                        <strong>Session data unavailable</strong>
                        <span>
                          Start a session to test this component with live data.
                        </span>
                      </div>
                      <button onClick={() => setSessionOpen(true)}>
                        Set up session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <BulkDeletePage />
        )}
      </div>

      {activePage === "library" && sessionOpen && (
        <>
          <button
            className="drawer-backdrop"
            onClick={() => setSessionOpen(false)}
            aria-label="Close session panel"
          />
          <aside className="session-drawer">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Connection</span>
                <h2>Session setup</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSessionOpen(false)}
                aria-label="Close session panel"
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-intro">
              <div className="intro-icon">
                <WandSparkles size={20} />
              </div>
              <div>
                <strong>Test with real scenarios</strong>
                <p>
                  Connect a secure session to populate components with live
                  data.
                </p>
              </div>
            </div>
            <div className="form-stack">
              <label>
                <span>Environment</span>
                <div className="select-field">
                  <span className="env-dot" />
                  Production
                  <ChevronDown size={15} />
                </div>
              </label>
              <label>
                <span>Token lifetime</span>
                <div className="select-field">
                  60 minutes
                  <ChevronDown size={15} />
                </div>
              </label>
              <label>
                <span>App key</span>
                <div className="text-field">
                  <input type="password" placeholder="Paste app key" />
                  <Copy size={15} />
                </div>
              </label>
              <label>
                <span>
                  User token <b>Optional</b>
                </span>
                <div className="textarea-field">
                  <textarea placeholder="Paste user token" />
                  <Eye size={15} />
                </div>
              </label>
            </div>
            <div className="security-note">
              <ShieldCheck size={17} />
              <p>
                Credentials are kept in memory and cleared when this workspace
                closes.
              </p>
            </div>
            <button className="drawer-submit">
              <Sparkles size={16} />
              Create session
            </button>
          </aside>
        </>
      )}
    </main>
  )
}
